import { Injectable, ConflictException } from '@nestjs/common';
import { getS3KeyFromUrl, getFullS3Url } from '../common/utils/s3-url.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralSettings } from './entities/general-settings.entity';
import { SeoSettings } from './entities/seo-settings.entity';
import { Store } from '../stores/entities/store.entity';
import { StoreDomain } from '../stores/entities/store-domain.entity';
import { Page } from '../cms/entities/page.entity';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(GeneralSettings)
        private generalSettingsRepository: Repository<GeneralSettings>,
        @InjectRepository(SeoSettings)
        private seoSettingsRepository: Repository<SeoSettings>,
        @InjectRepository(StoreDomain)
        private storeDomainRepository: Repository<StoreDomain>,
        @InjectRepository(Page)
        private pageRepository: Repository<Page>,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        private readonly planLimitsService: PlanLimitsService,
    ) { }

    async getSeoSettings(storeId?: string) {
        if (!storeId) return { seo: {}, customScripts: {} };

        let settings = await this.seoSettingsRepository.findOne({ where: { storeId } });
        const general = await this.getGeneralSettings(storeId);

        const seoBase = {
            keywords: settings?.keywords || [],
            googleAnalyticsId: settings?.googleAnalyticsId || '',
            googleTagManagerId: settings?.googleTagManagerId || '',
            facebookPixelId: settings?.facebookPixelId || '',
            metaImage: getFullS3Url(settings?.metaImage) || '',
            siteName: general.siteName || '',
            siteDescription: general.siteDescription || ''
        };

        return {
            seo: seoBase,
            customScripts: settings?.customScripts || { headerScripts: '', footerScripts: '' },
            siteFavicon: getFullS3Url(general.siteFavicon),
            // Maintain top-level for some admin uses if needed, but seo object is primary for web
            siteName: general.siteName || '',
            siteDescription: general.siteDescription || ''
        };
    }

    async getPublicSettings(storeId?: string) {
        const general = await this.getGeneralSettings(storeId);
        const seoData = await this.getSeoSettings(storeId);

        if (!general.id) {
            return {
                seo: {}, customScripts: {},
                topBar: { isEnabled: true, content: '', links: [] },
                popupSettings: { isEnabled: false },
                whatsappButton: { isEnabled: false },
                siteName: '', siteDescription: '',
            };
        }

        const config = general.currencyConfig || { rates: {}, autoSync: false };
        return {
            seo: seoData.seo || {},
            customScripts: seoData.customScripts || {},
            topBar: general.topBar || {},
            popupSettings: general.popupSettings || {},
            whatsappButton: general.whatsappButton || {},
            siteName: general.siteName,
            siteDescription: general.siteDescription,
            siteLogo: getFullS3Url(general.siteLogo),
            siteFavicon: getFullS3Url(general.siteFavicon),
            contactEmail: general.contactEmail,
            contactPhone: general.contactPhone,
            defaultCurrency: general.defaultCurrency || 'INR',
            supportedCurrencies: general.supportedCurrencies || ['INR'],
            currencyConfig: config,
        };
    }

    async getGeneralSettings(storeId?: string) {
        if (!storeId) return {} as GeneralSettings;
        let settings = await this.generalSettingsRepository.findOne({ where: { storeId } });

        // Migration check removed
        return settings || {} as GeneralSettings;
    }

    async getSettings(storeId?: string) {
        return this.getGeneralSettings(storeId);
    }

    async updateSettings(data: Partial<GeneralSettings> & { emailSettings?: any }, storeId?: string) {
        if (!storeId) return null;

        // 0. Ensure emailSettings is NOT saved here as it has its own table
        if (data.emailSettings) {
            delete data.emailSettings;
        }

        // Extract keys instead of full URLs
        if (data.siteLogo) {
            data.siteLogo = getS3KeyFromUrl(typeof data.siteLogo === 'string' ? data.siteLogo : (data.siteLogo as any).url || (data.siteLogo as any).key);
        }
        if (data.siteFavicon) {
            data.siteFavicon = getS3KeyFromUrl(typeof data.siteFavicon === 'string' ? data.siteFavicon : (data.siteFavicon as any).url || (data.siteFavicon as any).key);
        }

        // 2. Sync showInMarketplace to Store entity if present
        if (data.showInMarketplace !== undefined && storeId) {
            await this.storeRepository.update(storeId, { showInMarketplace: data.showInMarketplace });
        }

        let existing = await this.generalSettingsRepository.findOne({ where: { storeId } });
        if (existing) {
            Object.assign(existing, data);
            return this.generalSettingsRepository.save(existing);
        }

        const newSettings = this.generalSettingsRepository.create({ ...data, storeId });
        return this.generalSettingsRepository.save(newSettings);
    }

    async updateSeoSettings(data: { seo?: any, customScripts?: any }, storeId: string) {
        let settings = await this.seoSettingsRepository.findOne({ where: { storeId } });

        const seoData = data.seo || {};
        const updateData = {
            keywords: seoData.keywords,
            googleAnalyticsId: seoData.googleAnalyticsId,
            googleTagManagerId: seoData.googleTagManagerId,
            facebookPixelId: seoData.facebookPixelId,
            metaImage: seoData.metaImage ? getS3KeyFromUrl(seoData.metaImage) : undefined,
            customScripts: data.customScripts,
        };

        if (settings) {
            Object.assign(settings, updateData);
            return this.seoSettingsRepository.save(settings);
        }

        const newSettings = this.seoSettingsRepository.create({ ...updateData, storeId });
        return this.seoSettingsRepository.save(newSettings);
    }

    async getDomains(storeId: string) {
        return this.storeDomainRepository.find({
            where: { store_id: storeId },
            order: { created_at: 'ASC' }
        });
    }

    async addDomain(storeId: string, domain: string) {
        // Check if domain already exists
        const existing = await this.storeDomainRepository.findOne({ where: { domain } });
        if (existing) {
            throw new ConflictException('Domain already exists');
        }

        const baseDomain = process.env.BASE_DOMAIN || 'localhost';
        const isSubdomainOfBase = domain.endsWith(`.${baseDomain}`);

        if (!isSubdomainOfBase) {
            await this.planLimitsService.checkLimit(storeId, 'custom_domains');
        }

        const newDomain = this.storeDomainRepository.create({
            store_id: storeId,
            domain,
            type: isSubdomainOfBase ? 'subdomain' : 'custom',
            is_primary: false,
            is_verified: isSubdomainOfBase,
            status: isSubdomainOfBase ? 'active' : 'pending',
            ssl_status: isSubdomainOfBase ? 'active' : 'none'
        });
        return this.storeDomainRepository.save(newDomain);
    }
}
