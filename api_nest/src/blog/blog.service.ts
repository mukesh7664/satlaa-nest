import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogTag } from './entities/blog-tag.entity';

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(BlogPost)
        private postRepository: Repository<BlogPost>,
        @InjectRepository(BlogCategory)
        private categoryRepository: Repository<BlogCategory>,
        @InjectRepository(BlogTag)
        private tagRepository: Repository<BlogTag>,
    ) { }

    // ─── Slug helpers ─────────────────────────────────────────────────────────

    private async uniqueSlug<T extends { id: string; slug: string }>(
        repo: Repository<T>,
        base: string,
        storeId: string,
        excludeId?: string,
    ): Promise<string> {
        let candidate = base || 'item';
        let attempt = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const existing = await repo.findOne({ where: { slug: candidate, storeId } as any });
            if (!existing || (excludeId && existing.id === excludeId)) return candidate;
            attempt++;
            candidate = `${base}-${attempt}`;
        }
    }

    // ─── Admin: Posts ─────────────────────────────────────────────────────────

    async findAllPosts(storeId: string, opts: { page?: number; limit?: number; search?: string; status?: string } = {}) {
        const page = Number(opts.page) || 1;
        const limit = Number(opts.limit) || 20;

        const qb = this.postRepository.createQueryBuilder('post')
            .leftJoinAndSelect('post.categories', 'category')
            .leftJoinAndSelect('post.tags', 'tag')
            .where('post.storeId = :storeId', { storeId });

        if (opts.search) {
            qb.andWhere('(post.title ILIKE :search OR post.slug ILIKE :search)', { search: `%${opts.search}%` });
        }
        if (opts.status) {
            qb.andWhere('post.status = :status', { status: opts.status });
        }

        const [items, total] = await qb
            .orderBy('post.createdAt', 'DESC')
            .take(limit)
            .skip((page - 1) * limit)
            .getManyAndCount();

        return {
            posts: items,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        };
    }

    async findPostById(id: string, storeId: string) {
        const post = await this.postRepository.findOne({
            where: { id, storeId },
            relations: ['categories', 'tags'],
        });
        if (!post) throw new NotFoundException('Blog post not found');
        return post;
    }

    async createPost(data: any, storeId: string) {
        const base = slugify(data.slug || data.title);
        const slug = await this.uniqueSlug(this.postRepository, base, storeId);

        const post = this.postRepository.create({
            title: data.title,
            slug,
            excerpt: data.excerpt ?? null,
            content: data.content ?? null,
            coverImage: data.coverImage ?? null,
            coverImageAlt: data.coverImageAlt ?? null,
            authorName: data.authorName ?? null,
            status: data.status === 'published' ? 'published' : 'draft',
            publishedAt: this.resolvePublishedAt(data),
            seo: data.seo ?? null,
            storeId,
        });

        post.categories = await this.resolveCategories(data.categoryIds, storeId);
        post.tags = await this.resolveTags(data.tagIds, storeId);

        return this.postRepository.save(post);
    }

    async updatePost(id: string, data: any, storeId: string) {
        const post = await this.findPostById(id, storeId);

        if ((data.slug && data.slug !== post.slug) || (data.title && data.title !== post.title)) {
            const base = slugify(data.slug || data.title);
            post.slug = await this.uniqueSlug(this.postRepository, base, storeId, id);
        }

        if (data.title !== undefined) post.title = data.title;
        if (data.excerpt !== undefined) post.excerpt = data.excerpt;
        if (data.content !== undefined) post.content = data.content;
        if (data.coverImage !== undefined) post.coverImage = data.coverImage;
        if (data.coverImageAlt !== undefined) post.coverImageAlt = data.coverImageAlt;
        if (data.authorName !== undefined) post.authorName = data.authorName;
        if (data.seo !== undefined) post.seo = data.seo;
        if (data.status !== undefined) post.status = data.status === 'published' ? 'published' : 'draft';
        if (data.status !== undefined || data.publishedAt !== undefined) {
            post.publishedAt = this.resolvePublishedAt(data, post);
        }
        if (data.categoryIds !== undefined) post.categories = await this.resolveCategories(data.categoryIds, storeId);
        if (data.tagIds !== undefined) post.tags = await this.resolveTags(data.tagIds, storeId);

        return this.postRepository.save(post);
    }

    async toggleStatus(id: string, storeId: string) {
        const post = await this.findPostById(id, storeId);
        post.status = post.status === 'published' ? 'draft' : 'published';
        if (post.status === 'published' && !post.publishedAt) {
            post.publishedAt = new Date();
        }
        await this.postRepository.save(post);
        return { success: true, status: post.status };
    }

    async removePost(id: string, storeId: string) {
        const post = await this.findPostById(id, storeId);
        await this.postRepository.remove(post);
        return { success: true, message: 'Blog post deleted' };
    }

    // When publishing without an explicit date, default to now so the post is
    // immediately visible. A future publishedAt schedules it.
    private resolvePublishedAt(data: any, existing?: BlogPost): Date | null {
        if (data.publishedAt) return new Date(data.publishedAt);
        if (existing?.publishedAt) return existing.publishedAt;
        if (data.status === 'published') return new Date();
        return existing ? existing.publishedAt : null;
    }

    private async resolveCategories(ids: string[] | undefined, storeId: string): Promise<BlogCategory[]> {
        if (!ids || ids.length === 0) return [];
        return this.categoryRepository.findBy({ id: In(ids), storeId });
    }

    private async resolveTags(ids: string[] | undefined, storeId: string): Promise<BlogTag[]> {
        if (!ids || ids.length === 0) return [];
        return this.tagRepository.findBy({ id: In(ids), storeId });
    }

    // ─── Admin: Categories ────────────────────────────────────────────────────

    async findCategories(storeId: string) {
        return this.categoryRepository.find({ where: { storeId }, order: { name: 'ASC' } });
    }

    async createCategory(data: any, storeId: string) {
        const base = slugify(data.slug || data.name);
        const slug = await this.uniqueSlug(this.categoryRepository, base, storeId);
        const category = this.categoryRepository.create({
            name: data.name,
            slug,
            description: data.description ?? null,
            storeId,
        });
        return this.categoryRepository.save(category);
    }

    async updateCategory(id: string, data: any, storeId: string) {
        const category = await this.categoryRepository.findOne({ where: { id, storeId } });
        if (!category) throw new NotFoundException('Blog category not found');
        if (data.name !== undefined) category.name = data.name;
        if (data.description !== undefined) category.description = data.description;
        if (data.slug && data.slug !== category.slug) {
            category.slug = await this.uniqueSlug(this.categoryRepository, slugify(data.slug), storeId, id);
        }
        return this.categoryRepository.save(category);
    }

    async removeCategory(id: string, storeId: string) {
        const category = await this.categoryRepository.findOne({ where: { id, storeId } });
        if (!category) throw new NotFoundException('Blog category not found');
        await this.categoryRepository.remove(category);
        return { success: true, message: 'Blog category deleted' };
    }

    // ─── Admin: Tags ──────────────────────────────────────────────────────────

    async findTags(storeId: string) {
        return this.tagRepository.find({ where: { storeId }, order: { name: 'ASC' } });
    }

    async createTag(data: any, storeId: string) {
        const base = slugify(data.slug || data.name);
        const slug = await this.uniqueSlug(this.tagRepository, base, storeId);
        const tag = this.tagRepository.create({ name: data.name, slug, storeId });
        return this.tagRepository.save(tag);
    }

    async removeTag(id: string, storeId: string) {
        const tag = await this.tagRepository.findOne({ where: { id, storeId } });
        if (!tag) throw new NotFoundException('Blog tag not found');
        await this.tagRepository.remove(tag);
        return { success: true, message: 'Blog tag deleted' };
    }

    // ─── Public (storefront) ──────────────────────────────────────────────────

    private publishedQuery(storeId: string) {
        return this.postRepository.createQueryBuilder('post')
            .leftJoinAndSelect('post.categories', 'category')
            .leftJoinAndSelect('post.tags', 'tag')
            .where('post.storeId = :storeId', { storeId })
            .andWhere('post.status = :status', { status: 'published' })
            .andWhere('(post.publishedAt IS NULL OR post.publishedAt <= :now)', { now: new Date() });
    }

    async findPublicPosts(storeId: string, page = 1, perPage = 9, categorySlug?: string) {
        const qb = this.publishedQuery(storeId);

        if (categorySlug) {
            // Restrict to posts that have the requested category, but still load
            // all of each post's categories via a subquery membership check.
            qb.andWhere(
                'post.id IN ' +
                qb.subQuery()
                    .select('p.id')
                    .from(BlogPost, 'p')
                    .leftJoin('p.categories', 'c')
                    .where('c.slug = :categorySlug')
                    .getQuery(),
            ).setParameter('categorySlug', categorySlug);
        }

        const [items, total] = await qb
            .orderBy('post.publishedAt', 'DESC')
            .addOrderBy('post.createdAt', 'DESC')
            .take(perPage)
            .skip((page - 1) * perPage)
            .getManyAndCount();

        return {
            posts: items,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / perPage),
                totalPosts: total,
                perPage,
            },
        };
    }

    async findPublicPostBySlug(storeId: string, slug: string) {
        const post = await this.publishedQuery(storeId)
            .andWhere('post.slug = :slug', { slug })
            .getOne();
        if (!post) throw new NotFoundException('Blog post not found');
        return post;
    }

    async findPublicSlugs(storeId: string, limit = 1000) {
        const posts = await this.publishedQuery(storeId)
            .select(['post.slug'])
            .take(limit)
            .getMany();
        return posts.map(p => p.slug);
    }

    async findRelatedPosts(storeId: string, slug: string, limit = 3) {
        const post = await this.postRepository.findOne({
            where: { storeId, slug },
            relations: ['categories'],
        });
        if (!post || post.categories.length === 0) return [];

        const categoryIds = post.categories.map(c => c.id);
        const related = await this.publishedQuery(storeId)
            .andWhere('post.id != :id', { id: post.id })
            .andWhere(
                'post.id IN ' +
                this.postRepository.createQueryBuilder('p2')
                    .subQuery()
                    .select('p.id')
                    .from(BlogPost, 'p')
                    .leftJoin('p.categories', 'c')
                    .where('c.id IN (:...categoryIds)')
                    .getQuery(),
            )
            .setParameter('categoryIds', categoryIds)
            .take(limit)
            .getMany();
        return related;
    }

    async findPublicCategories(storeId: string) {
        // Categories with their published post counts.
        const categories = await this.categoryRepository.find({ where: { storeId }, order: { name: 'ASC' } });
        const counts = await this.postRepository.createQueryBuilder('post')
            .leftJoin('post.categories', 'category')
            .select('category.id', 'categoryId')
            .addSelect('COUNT(post.id)', 'count')
            .where('post.storeId = :storeId', { storeId })
            .andWhere('post.status = :status', { status: 'published' })
            .andWhere('(post.publishedAt IS NULL OR post.publishedAt <= :now)', { now: new Date() })
            .groupBy('category.id')
            .getRawMany();

        const countMap = new Map(counts.map(c => [c.categoryId, Number(c.count)]));
        return categories.map(c => ({ ...c, count: countMap.get(c.id) || 0 }));
    }

    async findPublicCategoryBySlug(storeId: string, slug: string) {
        const category = await this.categoryRepository.findOne({ where: { storeId, slug } });
        if (!category) throw new NotFoundException('Blog category not found');
        const count = await this.publishedQuery(storeId)
            .andWhere('category.slug = :slug', { slug })
            .getCount();
        return { ...category, count };
    }
}
