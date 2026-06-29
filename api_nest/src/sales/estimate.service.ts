import { Injectable, NotFoundException } from '@nestjs/common';
import { Estimate } from './entities/estimate.entity';
import { Store } from '../stores/entities/store.entity';
import { EmailService } from '../notifications/email.service';
import { PdfService } from './pdf.service';
import { S3Service } from '../cms/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getFullS3Url } from '../common/utils/s3-url.util';
import { GeneralSettings } from '../admin/entities/general-settings.entity';

@Injectable()
export class EstimateService {
    constructor(
        @InjectRepository(Estimate)
        private estimateRepository: Repository<Estimate>,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        @InjectRepository(GeneralSettings)
        private settingsRepository: Repository<GeneralSettings>,
        private readonly emailService: EmailService,
        private readonly pdfService: PdfService,
        private readonly s3Service: S3Service,
    ) { }

    async getEstimateById(id: string) {
        const estimate = await this.estimateRepository.findOne({ where: { id } });
        if (!estimate) throw new NotFoundException('Estimate not found');
        return estimate;
    }

    async markAsViewed(id: string) {
        const estimate = await this.estimateRepository.findOne({ where: { id } });
        if (!estimate) throw new NotFoundException('Estimate not found');

        if (!estimate.viewedAt) {
            estimate.viewedAt = new Date();
            if (estimate.status === 'sent') {
                estimate.status = 'viewed';
            }
            await this.estimateRepository.save(estimate);
        }
        return { success: true, message: 'Marked as viewed' };
    }

    async findOneAdmin(id: string, storeId?: string) {
        if (!id || id === 'undefined' || id === 'null') {
            throw new NotFoundException('Invalid Estimate ID');
        }

        const estimate = await this.estimateRepository.findOne({
            where: storeId ? { id, storeId } : { id },
            relations: ['convertedToOrder', 'createdBy']
        });

        if (!estimate) {
            throw new NotFoundException('Estimate not found');
        }

        return estimate;
    }

    // Admin methods
    async findAll(query: any = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const qb = this.estimateRepository.createQueryBuilder('estimate');

        if (query.storeId) {
            qb.andWhere('estimate.storeId = :storeId', { storeId: query.storeId });
        }

        if (query.status && query.status !== 'all') {
            qb.andWhere('estimate.status = :status', { status: query.status });
        }

        if (query.search) {
            qb.andWhere(
                '(estimate.estimateNumber ILike :search OR estimate.customer->>\'name\' ILike :search OR estimate.customer->>\'email\' ILike :search)',
                { search: `%${query.search}%` }
            );
        }

        if (query.startDate) {
            qb.andWhere('estimate.createdAt >= :startDate', {
                startDate: new Date(query.startDate)
            });
        }

        if (query.endDate) {
            const endDate = new Date(query.endDate);
            endDate.setDate(endDate.getDate() + 1);
            qb.andWhere('estimate.createdAt < :endDate', { endDate });
        }

        qb.orderBy('estimate.createdAt', 'DESC')
          .take(limit)
          .skip(skip);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async create(data: any) {
        const estimateNumber = `EST-${Date.now()}`;
        const estimate = this.estimateRepository.create({ ...data, estimateNumber });
        const savedEstimate = (await this.estimateRepository.save(estimate)) as any;
        // Generate and store PDF
        await this.generateAndStorePdf(savedEstimate.id, savedEstimate.storeId);
        return savedEstimate;
    }

    async update(id: string, data: any, storeId?: string) {
        const estimate = await this.estimateRepository.findOne({ where: storeId ? { id, storeId } : { id } });
        if (!estimate) throw new NotFoundException('Estimate not found');
        Object.assign(estimate, data);
        return this.estimateRepository.save(estimate);
    }

    async send(id: string, storeId?: string) {
        const estimate = await this.estimateRepository.findOne({ where: storeId ? { id, storeId } : { id } });
        if (!estimate) throw new NotFoundException('Estimate not found');
        const store = estimate.storeId ? await this.storeRepository.findOne({ where: { id: estimate.storeId } }) : null;

        // Ensure PDF is generated before sending email
        if (!estimate.pdfUrl) {
            await this.generateAndStorePdf(id, storeId);
            const updated = await this.estimateRepository.findOne({ where: { id } });
            await this.emailService.sendEstimateEmail(updated, store);
        } else {
            await this.emailService.sendEstimateEmail(estimate, store);
        }

        estimate.status = 'sent';
        return this.estimateRepository.save(estimate);
    }

    async delete(id: string, storeId?: string) {
        const estimate = await this.estimateRepository.findOne({ where: storeId ? { id, storeId } : { id } });
        if (!estimate) throw new NotFoundException('Estimate not found');
        await this.estimateRepository.remove(estimate);
        return { success: true, message: 'Estimate deleted' };
    }

    async generateAndStorePdf(id: string, storeId?: string): Promise<string> {
        const estimate = await this.estimateRepository.findOne({ where: { id } });
        if (!estimate) throw new NotFoundException('Estimate not found');

        const settings = await this.settingsRepository.findOne({ where: { storeId: estimate.storeId } });
        const pdfBuffer = await this.pdfService.generateEstimatePdf(estimate, settings);

        const key = `stores/${estimate.storeId}/estimate/${estimate.id}.pdf`;
        await this.s3Service.uploadBuffer(pdfBuffer, key, 'application/pdf');

        estimate.pdfUrl = key;
        await this.estimateRepository.save(estimate);

        return getFullS3Url(key);
    }
}
