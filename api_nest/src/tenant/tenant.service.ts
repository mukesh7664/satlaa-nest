import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { SeoSettings } from '../admin/entities/seo-settings.entity';
import { EmailTemplate } from '../admin/entities/email-template.entity';
import { EmailSettings } from '../admin/entities/email-settings.entity';
import { Page } from '../cms/entities/page.entity';
import { PageSection } from '../cms/entities/page-section.entity';
import { Section } from '../cms/entities/section.entity';
import { DEFAULT_EMAIL_TEMPLATES } from '../common/default-email-templates';
import { DEFAULT_POLICY_PAGES } from '../common/default-policy-pages';
import { ThemeService } from '../cms/theme.service';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(GeneralSettings)
        private generalSettingsRepository: Repository<GeneralSettings>,
        @InjectRepository(SeoSettings)
        private seoSettingsRepository: Repository<SeoSettings>,
        @InjectRepository(EmailTemplate)
        private emailTemplateRepository: Repository<EmailTemplate>,
        @InjectRepository(EmailSettings)
        private emailSettingsRepository: Repository<EmailSettings>,
        @InjectRepository(Page)
        private pageRepository: Repository<Page>,
        @InjectRepository(PageSection)
        private pageSectionRepository: Repository<PageSection>,
        @InjectRepository(Section)
        private sectionRepository: Repository<Section>,
        private moduleRef: ModuleRef,
    ) { }

    /**
     * Single-store mode: bootstrap the default settings/SEO/email/policy pages/theme
     * the first time an owner registers. There is no Store row anymore — store-level
     * metadata lives in GeneralSettings (siteName etc.).
     */
    async createStore(_ownerId: string, name: string, _planCategory: 'page_builder' | 'ecommerce' = 'ecommerce'): Promise<void> {
        // Skip if defaults already initialized
        const existingSettings = await this.generalSettingsRepository.findOne({ where: {} });
        if (existingSettings) return;

        // Initialize default general settings
        await this.generalSettingsRepository.save(
            this.generalSettingsRepository.create({
                siteName: name,
                contactEmail: '',
                contactPhone: '',
                address: '',
                socialLinks: {},
                taxSettings: {},
                features: {},
                topBar: { isEnabled: true, content: '', links: [] },
                popupSettings: { isEnabled: false },
                whatsappButton: { isEnabled: false },
                invoiceSettings: {},
                maintenanceMode: { isEnabled: false },
                security: {},
                notificationSettings: {},
                policies: {},
            })
        );

        // Initialize default SEO settings
        await this.seoSettingsRepository.save(
            this.seoSettingsRepository.create({
                keywords: [],
                googleAnalyticsId: '',
                googleTagManagerId: '',
                facebookPixelId: '',
                metaImage: '',
                customScripts: { headerScripts: '', footerScripts: '' },
            })
        );

        // Create default email templates
        await this.createDefaultTemplates();

        // Create default email settings
        await this.createDefaultEmailSettings();

        // Create default policy pages
        await this.createDefaultPolicyPages(name);

        // Apply default theme (single ecommerce category)
        try {
            const themeService = this.moduleRef.get(ThemeService, { strict: false });
            if (themeService) {
                await themeService.applyDefaultThemeForCategory('ecommerce');
            }
        } catch (err) {
            console.error('Failed to apply default theme for store:', err);
        }
    }

    public async createDefaultTemplates() {
        for (const t of DEFAULT_EMAIL_TEMPLATES) {
            const exists = await this.emailTemplateRepository.findOne({
                where: { key: t.key }
            });

            if (!exists) {
                await this.emailTemplateRepository.save(
                    this.emailTemplateRepository.create({
                        key: t.key,
                        name: t.name,
                        subject: t.subject,
                        htmlContent: t.htmlContent,
                        variables: t.variables,
                        isActive: true,
                    })
                );
            }
        }
    }

    public async createDefaultEmailSettings() {
        const exists = await this.emailSettingsRepository.findOne({ where: {} });
        if (!exists) {
            await this.emailSettingsRepository.save(
                this.emailSettingsRepository.create({
                    smtpHost: null,
                    smtpPort: null,
                    smtpUser: null,
                    smtpPassword: null,
                    fromEmail: null,
                    fromName: null,
                    isActive: false,
                })
            );
        }
    }

    public async createDefaultPolicyPages(storeName: string) {
        try {
            // Find the RichText section blueprint (seeded globally)
            const richTextSection = await this.sectionRepository.findOne({
                where: { type: 'RichText' },
            });

            if (!richTextSection) {
                console.warn('RichText section not found — skipping policy page creation.');
                return;
            }

            const currentYear = new Date().getFullYear();
            const contactEmail = 'support@' + (storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'store') + '.com';
            const ctx = { brandName: storeName, currentYear, contactEmail };

            for (const template of DEFAULT_POLICY_PAGES) {
                // Skip if page already exists
                const existing = await this.pageRepository.findOne({
                    where: { slug: template.slug },
                });
                if (existing) continue;

                // Create the Page
                const page = await this.pageRepository.save(
                    this.pageRepository.create({
                        title: template.title,
                        slug: template.slug,
                        description: template.description,
                        isPublished: true,
                        showInFooter: template.showInFooter,
                        sortOrder: template.sortOrder,
                        template: 'custom',
                    })
                );

                // Create the RichText PageSection with formatted content
                const htmlContent = template.richTextContent(ctx);
                await this.pageSectionRepository.save(
                    this.pageSectionRepository.create({
                        pageId: page.id,
                        sectionId: richTextSection.id,
                        position: 0,
                        settings: {
                            title: '',
                            content: htmlContent,
                            isEnabled: true,
                        },
                    })
                );

                console.log(`Created policy page: ${template.title} (${template.slug})`);
            }
        } catch (err) {
            console.error('Failed to create default policy pages:', err);
        }
    }
}
