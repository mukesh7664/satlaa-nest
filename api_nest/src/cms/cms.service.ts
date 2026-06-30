import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, IsNull, Not } from 'typeorm';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { Section } from './entities/section.entity';
import { HeaderSection } from './entities/header-section.entity';
import { FooterSection } from './entities/footer-section.entity';

@Injectable()
export class CmsService {
    constructor(
        @InjectRepository(Page)
        private pageRepository: Repository<Page>,
        @InjectRepository(PageSection)
        private pageSectionRepository: Repository<PageSection>,
        @InjectRepository(Section)
        private sectionRepository: Repository<Section>,
        @InjectRepository(HeaderSection)
        private headerSectionRepository: Repository<HeaderSection>,
        @InjectRepository(FooterSection)
        private footerSectionRepository: Repository<FooterSection>,
    ) { }

    // ── Pages ───────────────────────────────────────────────────────────
    async getAllPages() {
        return this.pageRepository.find({ order: { createdAt: 'DESC' } });
    }

    async getPageById(id: string) {
        const page = await this.pageRepository.findOne({
            where: { id },
            relations: ['pageSections', 'pageSections.section']
        });
        if (!page) throw new NotFoundException('Page not found');

        // Hydrate sections for frontend compatibility
        const hydratedSections = (page.pageSections || [])
            .sort((a, b) => a.position - b.position)
            .map(ps => ({
                id: ps.id,
                sectionId: ps.sectionId,
                type: ps.section?.type,
                ...ps.settings,
                isEnabled: ps.settings?.isEnabled ?? true, // Respect settings value
                sortOrder: ps.position,
            }))
            .filter(s => s.group !== 'header' && s.group !== 'top' && s.group !== 'footer' && s.group !== 'bottom');

        return { success: true, data: { ...page, sections: hydratedSections } };
    }

    async getPageBySlug(slug: string) {
        let page;

        // Special handling for the generic "homepage" slug override via is_homepage flag
        if (slug === 'homepage') {
            page = await this.pageRepository.findOne({
                where: { is_homepage: true, isPublished: true },
                relations: ['pageSections', 'pageSections.section']
            });
        } else {
            page = await this.pageRepository.findOne({
                where: { slug },
                relations: ['pageSections', 'pageSections.section']
            });
        }

        if (
            !page &&
            (/^[0-9a-fA-F]{24}$/.test(slug) ||
                /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                    slug,
                ))
        ) {
            page = await this.pageRepository.findOne({
                where: { id: slug, isPublished: true },
                relations: ['pageSections', 'pageSections.section']
            });
        }

        if (!page) throw new NotFoundException(`Page with slug '${slug}' not found`);

        // Hydrate sections
        const hydratedSections = (page.pageSections || [])
            .sort((a, b) => a.position - b.position)
            .map(ps => ({
                id: ps.id,
                sectionId: ps.sectionId,
                type: ps.section?.type,
                ...ps.settings,
                isEnabled: ps.settings?.isEnabled ?? true,
                sortOrder: ps.position,
            }))
            .filter(s => s.group !== 'header' && s.group !== 'top' && s.group !== 'footer' && s.group !== 'bottom');

        return { success: true, data: { ...page, sections: hydratedSections } };
    }

    async createPage(data: any) {
        // Handle is_homepage exclusivity
        if (data.is_homepage) {
            await this.pageRepository.update({ is_homepage: true }, { is_homepage: false });
        }

        // Check for duplicate slug
        if (data.slug) {
            const existing = await this.pageRepository.findOne({ where: { slug: data.slug } });
            if (existing) {
                throw new ConflictException(`A page with the slug "${data.slug}" already exists.`);
            }
        }

        const sections = data.sections;
        delete data.sections;

        const page = this.pageRepository.create(data as Partial<Page>);
        const savedPage = (await this.pageRepository.save(page)) as Page;

        if (Array.isArray(sections)) {
            await this.updatePageSections(savedPage.id, sections);
        }

        return { success: true, data: savedPage };
    }

    async updatePage(id: string, data: any) {
        const page = await this.pageRepository.findOne({ where: { id } });
        if (!page) throw new NotFoundException('Page not found');

        // Handle is_homepage exclusivity
        if (data.is_homepage) {
            await this.pageRepository.update({ is_homepage: true }, { is_homepage: false });
        }

        // Check for duplicate slug when updating
        if (data.slug && data.slug !== page.slug) {
            const existing = await this.pageRepository.findOne({ where: { slug: data.slug, id: Not(id) } });
            if (existing) {
                throw new ConflictException(`A page with the slug "${data.slug}" already exists.`);
            }
        }

        const sections = data.sections;
        delete data.sections;

        Object.assign(page, data);
        const savedPage = (await this.pageRepository.save(page)) as Page;

        // ONLY update sections if they are explicitly provided (not undefined)
        // This prevents wipes when sending partial updates like { isPublished: true }
        if (sections !== undefined && Array.isArray(sections)) {
            await this.updatePageSections(savedPage.id, sections);
        }

        return { success: true, data: savedPage };
    }

    private async updatePageSections(pageId: string, sections: any[]) {
        // Simple strategy: Clear and re-insert for now
        await this.pageSectionRepository.delete({ pageId });

        // Filter out header and footer sections, they should be global now
        const templateSections = sections.filter(s => s.group !== 'header' && s.group !== 'top' && s.group !== 'footer' && s.group !== 'bottom');

        for (let i = 0; i < templateSections.length; i++) {
            const sectionData = templateSections[i];
            const sectionTypeDiscriminator = sectionData.type;
            const section = await this.sectionRepository.findOne({
                where: sectionData.sectionId ? { id: sectionData.sectionId } : { type: sectionTypeDiscriminator }
            });

            if (section) {
                // Determine best source for settings
                // Priority: Explicit settings > Provided root data > Section default data
                const settings = {
                    ...(section.data || {}),
                    ...(sectionData.data || {}),
                    ...(sectionData.settings || {}),
                    ...sectionData, // Final fallback to root object
                };

                // Clean up non-setting fields
                delete settings.id;
                delete settings.sectionId;
                delete settings.pageId;
                delete settings.type;
                delete settings.sortOrder;
                delete settings.isEnabled;
                delete settings.dndId;
                delete settings.position;
                delete settings.section;
                delete settings.customData;
                delete settings.data;
                delete settings.settings;
                delete settings.group;

                const pageSection = this.pageSectionRepository.create({
                    pageId,
                    sectionId: section.id,
                    position: i,
                    settings: settings,
                });
                await this.pageSectionRepository.save(pageSection);
            }
        }
    }

    async deletePage(id: string) {
        const page = await this.pageRepository.findOne({ where: { id } });
        if (!page) throw new NotFoundException('Page not found');
        await this.pageRepository.remove(page);
        return { success: true, message: 'Page deleted' };
    }

    // ── Global Sections (Header/Footer) ───────────────────────────────

    async getGlobalHeaderSections() {
        const sections = await this.headerSectionRepository.find({
            order: { position: 'ASC' }
        });

        // Transform to match the frontend shape requirement
        return sections.map(s => ({
            id: s.id,
            type: s.type,
            group: 'header',
            sortOrder: s.position,
            ...s.contentJson,
        }));
    }

    async updateGlobalHeaderSections(sectionsData: any[]) {
        // simple strategy: delete and recreate
        await this.headerSectionRepository.createQueryBuilder().delete().execute();

        const newSections = sectionsData.map((s, index) => {
            const type = s.type || s.section?.type || 'Unknown';
            const settings = {
                ...(s.section?.data || {}),
                ...(s.data || {}),
                ...(s.settings || {}),
                ...s,
            };

            // cleanup
            delete settings.id;
            delete settings.sectionId;
            delete settings.type;
            delete settings.sortOrder;
            delete settings.dndId;
            delete settings.position;
            delete settings.section;
            delete settings.customData;
            delete settings.data;
            delete settings.settings;
            delete settings.group;

            return this.headerSectionRepository.create({
                type,
                position: index,
                contentJson: settings
            });
        });

        if (newSections.length > 0) {
            await this.headerSectionRepository.save(newSections);
        }

        return { success: true, message: 'Header sections updated' };
    }

    async getGlobalFooterSections() {
        const sections = await this.footerSectionRepository.find({
            order: { position: 'ASC' }
        });

        return sections.map(s => ({
            id: s.id,
            type: s.type,
            group: 'footer',
            sortOrder: s.position,
            ...s.contentJson,
        }));
    }

    async updateGlobalFooterSections(sectionsData: any[]) {
        // simple strategy: delete and recreate
        await this.footerSectionRepository.createQueryBuilder().delete().execute();
        
        const newSections = sectionsData.map((s, index) => {
            const type = s.type || s.section?.type || 'Unknown';
            const settings = {
                ...(s.section?.data || {}),
                ...(s.data || {}),
                ...(s.settings || {}),
                ...s,
            };
            
            // cleanup
            delete settings.id;
            delete settings.sectionId;
            delete settings.type;
            delete settings.sortOrder;
            delete settings.dndId;
            delete settings.position;
            delete settings.section;
            delete settings.customData;
            delete settings.data;
            delete settings.settings;
            delete settings.group;
            
            return this.footerSectionRepository.create({
                type,
                position: index,
                contentJson: settings
            });
        });
        
        if (newSections.length > 0) {
            await this.footerSectionRepository.save(newSections);
        }
        
        return { success: true, message: 'Footer sections updated' };
    }

    // ── Section Types (The Library) ────────────────────────────────────

    async getAllSectionTypes(query: any = {}) {
        const { search, type, category, isActive, includeInactive, scope, exact, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.name = ILike(`%${search}%`);
        }

        if (type && type !== 'All') {
            where.type = type;
        }

        if (category && category !== 'All') {
            where.category = category;
        }

        // Single-store: use the requested scope directly (no subscription-based scoping)
        let effectiveScope = scope;

        if (effectiveScope && effectiveScope !== 'All') {
            if (exact === 'true' || exact === true) {
                where.scope = effectiveScope;
            } else {
                where.scope = In([effectiveScope, 'both']);
            }
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true' || isActive === true;
        } else if (includeInactive !== 'true' && includeInactive !== true) {
            // Default to only active unless includeInactive is explicitly passed
            where.isActive = true;
        }

        const [sections, total] = await this.sectionRepository.findAndCount({
            where,
            order: { name: 'ASC' },
            take: Number(limit),
            skip: Number(skip),
        });

        return {
            data: sections,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        };
    }

    async getSectionTypeTags() {
        // Since tags is not a nested relation but a property of Section, 
        // we can use raw query or find to extract unique tags.
        const sections = await this.sectionRepository.find({
            select: ['tags']
        });

        const allTags = sections.reduce((acc, section) => {
            if (section.tags && Array.isArray(section.tags)) {
                return [...acc, ...section.tags];
            }
            return acc;
        }, [] as string[]);

        return [...new Set(allTags)].sort();
    }

    async getSectionTypeById(id: string) {
        const section = await this.sectionRepository.findOne({ where: { id } });
        if (!section) throw new NotFoundException('Section type not found');
        return section;
    }

    async createSectionType(data: any) {
        const { type } = data;
        const existing = await this.sectionRepository.findOne({ where: { type } });
        if (existing) {
            throw new Error(`Section with type "${type}" already exists.`);
        }
        const section = this.sectionRepository.create(data);
        return this.sectionRepository.save(section);
    }

    async updateSectionType(id: string, data: any) {
        const section = await this.sectionRepository.findOne({ where: { id } });
        if (!section) throw new NotFoundException('Section blueprint not found');

        if (data.type) {
            const type = data.type;

            const existing = await this.sectionRepository.findOne({
                where: {
                    id: Not(id),
                    type,
                }
            });
            if (existing) {
                throw new Error(`Another section with type "${type}" already exists.`);
            }
        }

        Object.assign(section, data);
        return this.sectionRepository.save(section);
    }

    async deleteSectionType(id: string) {
        const section = await this.sectionRepository.findOne({ where: { id } });
        if (!section) throw new NotFoundException('Section blueprint not found');
        return this.sectionRepository.remove(section);
    }
}
