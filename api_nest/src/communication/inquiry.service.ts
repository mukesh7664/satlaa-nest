import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus, InquiryType } from './entities/inquiry.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { AdminNotification } from '../admin/entities/admin-notification.entity';

@Injectable()
export class InquiryService {
    constructor(
        @InjectRepository(Inquiry)
        private inquiryRepository: Repository<Inquiry>,
        @InjectRepository(AdminNotification)
        private adminNotificationRepository: Repository<AdminNotification>,
    ) { }

    async createInquiry(data: CreateInquiryDto): Promise<Inquiry> {
        let subject = data.subject;
        if (!subject || subject.trim() === '') {
            if (data.type === InquiryType.QUOTE) {
                const prodTitle = data.metadata?.productTitle || 'Product';
                subject = `Quote Request: ${prodTitle}`;
            } else if (data.type === InquiryType.CONTACT_US) {
                subject = 'Contact Form Inquiry';
            } else {
                subject = 'General Inquiry';
            }
        }

        const inquiry = this.inquiryRepository.create({
            ...data,
            subject,
            status: data.status || InquiryStatus.PENDING,
            storeId: data.storeId || null,
        });

        const savedInquiry = await this.inquiryRepository.save(inquiry);

        // Trigger notification for store admin if storeId exists
        if (savedInquiry.storeId) {
            try {
                const notification = this.adminNotificationRepository.create({
                    type: 'inquiry',
                    title: 'New Inquiry Received',
                    message: `New ${savedInquiry.type} from ${savedInquiry.name}: ${savedInquiry.subject || 'No Subject'}`,
                    storeId: savedInquiry.storeId,
                    actionUrl: `/inquiries/${savedInquiry.id}`,
                    priority: 'medium',
                } as any);
                await this.adminNotificationRepository.save(notification);
            } catch (error) {
                console.error('Failed to create admin notification for inquiry:', error);
            }
        }

        return savedInquiry;
    }

    async findAll(query: any = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const qb = this.inquiryRepository.createQueryBuilder('inquiry');

        if (query.storeId) {
            qb.andWhere('inquiry.storeId = :storeId', { storeId: query.storeId });
        }

        if (query.status && query.status !== 'all') {
            qb.andWhere('inquiry.status = :status', { status: query.status });
        }

        if (query.type && query.type !== 'all') {
            qb.andWhere('inquiry.type = :type', { type: query.type });
        }

        if (query.search) {
            qb.andWhere(
                '(inquiry.name ILike :search OR inquiry.email ILike :search OR inquiry.phone ILike :search OR inquiry.subject ILike :search)',
                { search: `%${query.search}%` }
            );
        }

        if (query.startDate) {
            qb.andWhere('inquiry.createdAt >= :startDate', {
                startDate: new Date(query.startDate)
            });
        }

        if (query.endDate) {
            const endDate = new Date(query.endDate);
            endDate.setDate(endDate.getDate() + 1);
            qb.andWhere('inquiry.createdAt < :endDate', { endDate });
        }

        qb.orderBy('inquiry.createdAt', 'DESC')
          .take(limit)
          .skip(skip);

        const [data, total] = await qb.getManyAndCount();

        // Map id to _id for frontend compatibility if needed
        const mappedData = data.map(inquiry => ({
            ...inquiry,
            _id: inquiry.id,
        }));

        return {
            data: mappedData,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        if (!id || id === 'undefined' || id === 'null') {
            throw new NotFoundException('Invalid inquiry ID');
        }
        const inquiry = await this.inquiryRepository.findOne({
            where: { id },
            relations: ['store']
        });
        if (!inquiry) throw new NotFoundException('Inquiry not found');
        return { data: { ...inquiry, _id: inquiry.id } };
    }

    async updateStatus(id: string, status: InquiryStatus) {
        const inquiry = await this.inquiryRepository.findOne({ where: { id } });
        if (!inquiry) throw new NotFoundException('Inquiry not found');

        inquiry.status = status;
        return this.inquiryRepository.save(inquiry);
    }

    async deleteInquiry(id: string): Promise<void> {
        const inquiry = await this.inquiryRepository.findOne({ where: { id } });
        if (!inquiry) throw new NotFoundException('Inquiry not found');
        await this.inquiryRepository.remove(inquiry);
    }
}
