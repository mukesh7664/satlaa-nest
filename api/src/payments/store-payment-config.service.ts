import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { StorePaymentConfig } from './entities/store-payment-config.entity';
import { UpsertStorePaymentConfigDto } from './dto/upsert-store-payment-config.dto';
import { CryptoService } from '../common/crypto.service';
import { AuditLogService } from '../admin/audit-log.service';

@Injectable()
export class StorePaymentConfigService {
    constructor(
        @InjectRepository(StorePaymentConfig)
        private readonly configRepository: Repository<StorePaymentConfig>,
        private readonly cryptoService: CryptoService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async upsert(dto: UpsertStorePaymentConfigDto, admin: any, ipAddress?: string, userAgent?: string) {
        const before = await this.configRepository.findOne({
            where: { provider: dto.provider },
        });

        let config = before;
        if (!config) {
            config = this.configRepository.create({
                provider: dto.provider,
            });
        }
// ... existing sensitive fields logic
        if (dto.keyId !== undefined) config.keyId = dto.keyId;
        
        if (dto.keySecret !== undefined) {
             // Only update if provided and not masked
             if (dto.keySecret && !dto.keySecret.startsWith('********')) {
                 config.keySecret = this.cryptoService.encrypt(dto.keySecret);
             } else if (dto.keySecret === null || dto.keySecret === '') {
                 config.keySecret = null;
             }
        }

        if (dto.webhookSecret !== undefined) {
             // Only update if provided and not masked
             if (dto.webhookSecret && !dto.webhookSecret.startsWith('********')) {
                 config.webhookSecret = this.cryptoService.encrypt(dto.webhookSecret);
             } else if (dto.webhookSecret === null || dto.webhookSecret === '') {
                 config.webhookSecret = null;
             }
        }

        if (dto.isActive !== undefined) config.isActive = dto.isActive;
        if (dto.isTestMode !== undefined) config.isTestMode = dto.isTestMode;

        // If this provider is being activated, deactivate others
        if (config.isActive) {
            await this.configRepository.update(
                { provider: Not(config.provider) },
                { isActive: false }
            );
        }

        const saved = await this.configRepository.save(config);

        // Audit Logging
        await this.auditLogService.createLog({
            admin,
            action: before ? 'UPDATE' : 'CREATE',
            resourceType: 'PaymentConfig',
            resourceId: saved.id,
            resourceName: saved.provider,
            before,
            after: saved,
            ipAddress,
            userAgent,
        });

        return saved;
    }

    async findByStore() {
// ... existing masked logic
        const configs = await this.configRepository.find();

        return configs.map(c => {
            const result: any = { ...c };

            if (c.keySecret) {
                const dec = this.cryptoService.decrypt(c.keySecret);
                result.keySecret = dec.length > 4 ? `********${dec.slice(-4)}` : '********';
            }

            if (c.webhookSecret) {
                const dec = this.cryptoService.decrypt(c.webhookSecret);
                result.webhookSecret = dec.length > 4 ? `********${dec.slice(-4)}` : '********';
            }

            result.isTestMode = c.isTestMode;
            return result;
        });
    }

    async getDecryptedByStore(admin: any, ipAddress?: string, userAgent?: string) {
        const configs = await this.configRepository.find();

        // Audit Logging for viewing secrets
        for (const config of configs) {
            await this.auditLogService.createLog({
                admin,
                action: 'VIEW_SECRET',
                resourceType: 'PaymentConfig',
                resourceId: config.id,
                resourceName: config.provider,
                ipAddress,
                userAgent,
            });
        }

        return configs.map(c => {
            const result: any = { ...c };
            if (c.keySecret) result.keySecret = this.cryptoService.decrypt(c.keySecret);
            if (c.webhookSecret) result.webhookSecret = this.cryptoService.decrypt(c.webhookSecret);
            result.isTestMode = c.isTestMode;
            return result;
        });
    }

    async getRawConfig(provider: string) {
        const config = await this.configRepository.findOne({
            where: { provider },
        });

        if (!config) return null;

        if (!config.isActive) {
            console.warn(`[PaymentConfig] Configuration for "${provider}" found but it is marked as INACTIVE.`);
            return null;
        }

        return {
            ...config,
            keySecret: config.keySecret ? this.cryptoService.decrypt(config.keySecret) : null,
            webhookSecret: config.webhookSecret ? this.cryptoService.decrypt(config.webhookSecret) : null,
        };
    }

    async delete(provider: string, admin: any, ipAddress?: string, userAgent?: string) {
        const config = await this.configRepository.findOne({
            where: { provider },
        });

        if (!config) return;

        await this.configRepository.remove(config);

        // Audit Logging
        await this.auditLogService.createLog({
            admin,
            action: 'DELETE',
            resourceType: 'PaymentConfig',
            resourceId: config.id,
            resourceName: config.provider,
            before: config,
            after: null,
            ipAddress,
            userAgent,
        });
    }
}
