import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemGatewayConfig } from './entities/system-gateway-config.entity';
import { CryptoService } from '../common/crypto.service';

@Injectable()
export class SystemGatewayConfigService {
    constructor(
        @InjectRepository(SystemGatewayConfig)
        private configRepository: Repository<SystemGatewayConfig>,
        private cryptoService: CryptoService,
    ) {}

    async findAll(): Promise<SystemGatewayConfig[]> {
        const configs = await this.configRepository.find({ order: { createdAt: 'DESC' } });
        return configs.map(c => this.maskConfig(c));
    }

    async findOne(id: string): Promise<SystemGatewayConfig> {
        const config = await this.configRepository.findOne({ where: { id } });
        if (!config) throw new NotFoundException(`Config with ID ${id} not found`);
        return this.maskConfig(config);
    }

    async getActiveConfig(provider: string = 'razorpay'): Promise<SystemGatewayConfig> {
        const config = await this.configRepository.findOne({ where: { provider, isActive: true } });
        if (config) {
            if (config.keySecret) config.keySecret = this.cryptoService.decrypt(config.keySecret);
            if (config.webhookSecret) config.webhookSecret = this.cryptoService.decrypt(config.webhookSecret);
        }
        return config;
    }

    async create(data: Partial<SystemGatewayConfig>): Promise<SystemGatewayConfig> {
        // If this one is being activated, deactivate others for the same provider
        if (data.isActive) {
            await this.configRepository.update({ provider: data.provider }, { isActive: false });
        }

        // Encrypt secret if provided
        if (data.keySecret) {
            data.keySecret = this.cryptoService.encrypt(data.keySecret);
        }
        if (data.webhookSecret) {
            data.webhookSecret = this.cryptoService.encrypt(data.webhookSecret);
        }

        const config = this.configRepository.create(data);
        const saved = await this.configRepository.save(config);
        return this.maskConfig(saved);
    }

    async update(id: string, data: Partial<SystemGatewayConfig>): Promise<SystemGatewayConfig> {
        const config = await this.configRepository.findOne({ where: { id } });
        if (!config) throw new NotFoundException(`Config with ID ${id} not found`);
        
        // If this one is being activated, deactivate others for the same provider
        if (data.isActive === true) {
            await this.configRepository.update({ provider: config.provider }, { isActive: false });
        }

        // Encrypt secret if provided AND not masked
        if (data.keySecret && !data.keySecret.startsWith('********')) {
            data.keySecret = this.cryptoService.encrypt(data.keySecret);
        } else if (data.keySecret && data.keySecret.startsWith('********')) {
            delete data.keySecret; // Don't overwrite with masked value
        }

        if (data.webhookSecret && !data.webhookSecret.startsWith('********')) {
            data.webhookSecret = this.cryptoService.encrypt(data.webhookSecret);
        } else if (data.webhookSecret && data.webhookSecret.startsWith('********')) {
            delete data.webhookSecret; // Don't overwrite with masked value
        }

        Object.assign(config, data);
        const saved = await this.configRepository.save(config);
        return this.maskConfig(saved);
    }

    private maskConfig(config: SystemGatewayConfig): SystemGatewayConfig {
        if (!config) return config;
        const result = { ...config };
        
        if (result.keySecret) {
            const dec = this.cryptoService.decrypt(result.keySecret);
            result.keySecret = dec.length > 4 ? `********${dec.slice(-4)}` : '********';
        }
        if (result.webhookSecret) {
            const dec = this.cryptoService.decrypt(result.webhookSecret);
            result.webhookSecret = dec.length > 4 ? `********${dec.slice(-4)}` : '********';
        }
        
        return result;
    }

    async getDecryptedConfig(id: string): Promise<SystemGatewayConfig> {
        const config = await this.configRepository.findOne({ where: { id } });
        if (!config) throw new NotFoundException(`Config with ID ${id} not found`);
        
        if (config.keySecret) config.keySecret = this.cryptoService.decrypt(config.keySecret);
        if (config.webhookSecret) config.webhookSecret = this.cryptoService.decrypt(config.webhookSecret);
        
        return config;
    }

    async remove(id: string): Promise<void> {
        const config = await this.findOne(id);
        await this.configRepository.remove(config);
    }
}
