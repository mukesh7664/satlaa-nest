import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { Store } from '../stores/entities/store.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { SeoSettings } from '../admin/entities/seo-settings.entity';
import { EmailTemplate } from '../admin/entities/email-template.entity';
import { EmailSettings } from '../admin/entities/email-settings.entity';
import { Page } from '../cms/entities/page.entity';
import { PageSection } from '../cms/entities/page-section.entity';
import { Section } from '../cms/entities/section.entity';
import { DEFAULT_EMAIL_TEMPLATES } from '../common/default-email-templates';
import { DEFAULT_POLICY_PAGES } from '../common/default-policy-pages';
import { generateSlug } from '../common/utils/domain.utils';
import { ThemeService } from '../cms/theme.service';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
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

    async getStoreByHost(_host?: string): Promise<Store> {
        // Single-store mode: always resolve to the one (first) store, ignoring host/domain.
        const store = await this.storeRepository.createQueryBuilder('store')
            .orderBy('store.createdAt', 'ASC')
            .getOne();

        if (store) return store;

        throw new NotFoundException('No store found');
    }

    async createStore(ownerId: string, name: string, planCategory: 'page_builder' | 'ecommerce' = 'ecommerce'): Promise<Store> {
        // Generate a unique slug/subdomain base
        const baseSlug = generateSlug(name);
        let slug = baseSlug;

        // Check Store registration for slug uniqueness (since Store now has slug field)
        let existingStore = await this.storeRepository.findOne({
            where: { slug }
        });

        let counter = 1;
        while (existingStore) {
            slug = `${baseSlug}-${counter}`;
            existingStore = await this.storeRepository.findOne({
                where: { slug }
            });
            counter++;
        }

        // Create the store metadata
        const savedStore = await this.storeRepository.save(
            this.storeRepository.create({
                name,
                owner_id: ownerId,
                slug,
            })
        );

        // Initialize default settings for the store
        await this.generalSettingsRepository.save(
            this.generalSettingsRepository.create({
                storeId: savedStore.id,
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
                storeId: savedStore.id,
                keywords: [],
                googleAnalyticsId: '',
                googleTagManagerId: '',
                facebookPixelId: '',
                metaImage: '',
                customScripts: { headerScripts: '', footerScripts: '' },
            })
        );
        
        // Step 2: Create default email templates
        await this.createDefaultTemplates(savedStore.id);

        // Step 3: Create default email settings
        await this.createDefaultEmailSettings(savedStore.id);

        // Step 4: Create default policy pages
        await this.createDefaultPolicyPages(savedStore.id, name);

        // Step 5: Apply default theme based on plan category
        try {
            const themeService = this.moduleRef.get(ThemeService, { strict: false });
            if (themeService) {
                await themeService.applyDefaultThemeForCategory(savedStore.id, planCategory);
            }
        } catch (err) {
            console.error(`Failed to apply default theme for ${planCategory} store:`, err);
        }

        return savedStore;
    }

    public async createDefaultTemplates(storeId: string) {
        for (const t of DEFAULT_EMAIL_TEMPLATES) {
            const exists = await this.emailTemplateRepository.findOne({
                where: { storeId, key: t.key }
            });

            if (!exists) {
                await this.emailTemplateRepository.save(
                    this.emailTemplateRepository.create({
                        storeId,
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

    public async createDefaultEmailSettings(storeId: string) {
        const exists = await this.emailSettingsRepository.findOne({ where: { storeId } });
        if (!exists) {
            await this.emailSettingsRepository.save(
                this.emailSettingsRepository.create({
                    storeId,
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

    public async createDefaultPolicyPages(storeId: string, storeName: string) {
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
                // Skip if page already exists for this store
                const existing = await this.pageRepository.findOne({
                    where: { slug: template.slug, storeId },
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
                        storeId,
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

                console.log(`Created policy page: ${template.title} (${template.slug}) for store ${storeId}`);
            }
        } catch (err) {
            console.error('Failed to create default policy pages:', err);
        }
    }
}
