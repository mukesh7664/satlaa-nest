import { Injectable } from '@nestjs/common';
import { getS3KeyFromUrl, getFullS3Url } from '../common/utils/s3-url.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralSettings } from './entities/general-settings.entity';
import { SeoSettings } from './entities/seo-settings.entity';
import { Page } from '../cms/entities/page.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(GeneralSettings)
        private generalSettingsRepository: Repository<GeneralSettings>,
        @InjectRepository(SeoSettings)
        private seoSettingsRepository: Repository<SeoSettings>,
        @InjectRepository(Page)
        private pageRepository: Repository<Page>,
    ) { }

    async getSeoSettings() {
        let settings = await this.seoSettingsRepository.findOne({ where: {} });
        const general = await this.getGeneralSettings();

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

    async getPublicSettings() {
        const general = await this.getGeneralSettings();
        const seoData = await this.getSeoSettings();

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

    async getGeneralSettings() {
        let settings = await this.generalSettingsRepository.findOne({ where: {} });

        // Migration check removed
        return settings || {} as GeneralSettings;
    }

    async getSettings() {
        return this.getGeneralSettings();
    }

    async updateSettings(data: Partial<GeneralSettings> & { emailSettings?: any }) {
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

        let existing = await this.generalSettingsRepository.findOne({ where: {} });
        if (existing) {
            Object.assign(existing, data);
            return this.generalSettingsRepository.save(existing);
        }

        const newSettings = this.generalSettingsRepository.create({ ...data });
        return this.generalSettingsRepository.save(newSettings);
    }

    async updateSeoSettings(data: { seo?: any, customScripts?: any }) {
        let settings = await this.seoSettingsRepository.findOne({ where: {} });

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

        const newSettings = this.seoSettingsRepository.create({ ...updateData });
        return this.seoSettingsRepository.save(newSettings);
    }
}
