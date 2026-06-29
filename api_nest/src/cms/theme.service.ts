import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from './entities/theme.entity';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { Section } from './entities/section.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { HeaderSection } from './entities/header-section.entity';
import { FooterSection } from './entities/footer-section.entity';

@Injectable()
export class ThemeService {
    constructor(
        @InjectRepository(Theme)
        private themeRepository: Repository<Theme>,
        @InjectRepository(Page)
        private pageRepository: Repository<Page>,
        @InjectRepository(PageSection)
        private pageSectionRepository: Repository<PageSection>,
        @InjectRepository(Section)
        private sectionRepository: Repository<Section>,
        @InjectRepository(GeneralSettings)
        private generalSettingsRepository: Repository<GeneralSettings>,
        @InjectRepository(HeaderSection)
        private headerSectionRepository: Repository<HeaderSection>,
        @InjectRepository(FooterSection)
        private footerSectionRepository: Repository<FooterSection>,
    ) {}

    async findAll(includeInactive = false, storeId?: string) {
        const whereClause: any = {};
        if (!includeInactive) {
            whereClause.isActive = true;
        }

        return this.themeRepository.find({ where: whereClause });
    }

    async findOne(id: string) {
        const theme = await this.themeRepository.findOne({ where: { id } });
        if (!theme) throw new NotFoundException('Theme not found');
        return theme;
    }

    async update(id: string, data: any) {
        await this.findOne(id);
        await this.themeRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string) {
        const theme = await this.findOne(id);
        await this.themeRepository.remove(theme);
        return { success: true };
    }

    async applyTheme(storeId: string, themeId: string) {
        const theme = await this.findOne(themeId);

        // 1. Process Homepage (Legacy or direct)
        let homePage = await this.pageRepository.findOne({ 
            where: { storeId, is_homepage: true } 
        });

        if (!homePage) {
            homePage = this.pageRepository.create({
                storeId,
                title: 'Home',
                slug: 'home',
                is_homepage: true,
                isPublished: true,
            });
            homePage = await this.pageRepository.save(homePage);
        }

        // 2. Clear Existing Homepage Sections (if we are replacing it)
        await this.pageSectionRepository.delete({ pageId: homePage.id });

        // 3. Clone Pages/Sections from Theme
        // Handle pages array if exists
        const pagesToClone = theme.content.pages || [];
        
        if (pagesToClone.length > 0) {
            for (const pageData of pagesToClone) {
                // 1. Try to find an existing page with this slug
                let targetPage = await this.pageRepository.findOne({ 
                    where: { storeId, slug: pageData.slug } 
                });

                if (pageData.is_homepage) {
                    if (targetPage) {
                        // If the found page is not the current homepage, swap flags
                        if (targetPage.id !== homePage.id) {
                            homePage.is_homepage = false;
                            await this.pageRepository.save(homePage);
                            
                            targetPage.is_homepage = true;
                            homePage = targetPage; // Update current homePage reference
                        }
                    } else {
                        // No page with this slug exists, update current homepage
                        targetPage = homePage;
                        targetPage.slug = pageData.slug;
                    }
                } else {
                    // Non-homepage: create if not found
                    if (!targetPage) {
                        targetPage = this.pageRepository.create({
                            storeId,
                            title: pageData.title,
                            slug: pageData.slug,
                            isPublished: true,
                        });
                    }
                }

                // Sync title and save
                targetPage.title = pageData.title;
                await this.pageRepository.save(targetPage);

                // Clear sections for this page
                await this.pageSectionRepository.delete({ pageId: targetPage.id });

                // Clone sections
                const sections = pageData.sections || [];
                for (let i = 0; i < sections.length; i++) {
                    const s = sections[i];
                    const sectionBlueprint = await this.sectionRepository.findOne({ 
                        where: { type: s.type } 
                    });

                    if (sectionBlueprint) {
                        const newPageSection = this.pageSectionRepository.create({
                            pageId: targetPage.id,
                            sectionId: sectionBlueprint.id,
                            position: i,
                            settings: s.settings || sectionBlueprint.data || {},
                        });
                        await this.pageSectionRepository.save(newPageSection);
                    }
                }
            }
        } else if (theme.content.sections) {
            // Fallback to legacy single-page (homepage) format
            const sectionsData = theme.content.sections || [];
            for (let i = 0; i < sectionsData.length; i++) {
                const data = sectionsData[i];
                const sectionBlueprint = await this.sectionRepository.findOne({ 
                    where: { type: data.type } 
                });

                if (sectionBlueprint) {
                    const newPageSection = this.pageSectionRepository.create({
                        pageId: homePage.id,
                        sectionId: sectionBlueprint.id,
                        position: i,
                        settings: data.settings || sectionBlueprint.data || {},
                    });
                    await this.pageSectionRepository.save(newPageSection);
                }
            }
        }

        // 4. Update Header/Footer if provided
        if (theme.content.header) {
            await this.headerSectionRepository.delete({ storeId });
            const headers = Array.isArray(theme.content.header) ? theme.content.header : [theme.content.header];
            for (let i = 0; i < headers.length; i++) {
                const s = headers[i];
                const newHeader = this.headerSectionRepository.create({
                    storeId,
                    type: s.type,
                    position: i,
                    contentJson: s.settings || s.data || s.contentJson || s,
                });
                await this.headerSectionRepository.save(newHeader);
            }
        }

        if (theme.content.footer) {
            await this.footerSectionRepository.delete({ storeId });
            const footers = Array.isArray(theme.content.footer) ? theme.content.footer : [theme.content.footer];
            for (let i = 0; i < footers.length; i++) {
                const s = footers[i];
                const newFooter = this.footerSectionRepository.create({
                    storeId,
                    type: s.type,
                    position: i,
                    contentJson: s.settings || s.data || s.contentJson || s,
                });
                await this.footerSectionRepository.save(newFooter);
            }
        }

        // 5. Update Theme Settings (Colors, etc.)
        if (theme.content.settings) {
            let settings = await this.generalSettingsRepository.findOne({ where: { storeId } });
            if (settings) {
                if (theme.content.settings.themeColors) {
                    settings.themeColors = theme.content.settings.themeColors;
                }
                await this.generalSettingsRepository.save(settings);
            }
        }

        return { success: true, message: `Theme "${theme.name}" applied successfully` };
    }

    async applyDefaultThemeForCategory(storeId: string, category: 'page_builder' | 'ecommerce') {
        const theme = await this.themeRepository.findOne({
            where: { category, isActive: true },
            order: { createdAt: 'ASC' }
        });
        if (theme) {
            await this.applyTheme(storeId, theme.id);
            console.log(`Successfully applied default theme "${theme.name}" for category "${category}" to store ${storeId}`);
        } else {
            console.warn(`No active default theme found for category: ${category}`);
        }
    }

    // Utility to create a theme (for seeding)
    async create(data: any) {
        const theme = this.themeRepository.create(data);
        return this.themeRepository.save(theme);
    }
}
