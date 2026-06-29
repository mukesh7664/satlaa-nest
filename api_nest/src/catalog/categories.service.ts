import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async findAll(storeId?: string, isSuperAdmin: boolean = false) {
        if (isSuperAdmin && !storeId) {
            return this.categoryRepository.find({
                relations: ['parent'],
                order: { name: 'ASC' }
            });
        }

        // For non-super admins or when storeId is explicitly provided (storefront)
        // Return Global categories (storeId null) OR categories belonging to the store
        const where: any[] = [{ storeId: IsNull() }];
        if (storeId) {
            where.push({ storeId: storeId });
        }

        return this.categoryRepository.find({
            where,
            relations: ['parent', 'children'],
            order: { name: 'ASC' }
        });
    }

    async findOne(id: string, storeId?: string, isSuperAdmin: boolean = false) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children']
        });

        if (!category) throw new NotFoundException('Category not found');

        // Protection: If not super admin and it's not global and doesn't match storeId
        if (!isSuperAdmin && category.storeId !== null && category.storeId !== storeId) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async findBySlug(slug: string, storeId?: string) {
        const where: any = { slug };
        if (storeId) {
            // Logic for storefront: slugs can be duplicate across stores, but we want the global one or the store's one
            // This is trickier with findOne. Better to find where (slug and storeId) OR (slug and storeId is null)
        }

        const category = await this.categoryRepository.findOne({
            where: storeId ? [
                { slug, storeId: null },
                { slug, storeId }
            ] : { slug },
            relations: ['parent', 'children']
        });

        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async create(data: any, user: any) {
        if (data.parentId === "") data.parentId = null;
        
        const categoryData = { ...data };
        // If not super admin, force storeId
        if (user.role !== 'super_admin') {
            categoryData.storeId = user.storeId;
        } else {
            // Super admins create global categories if not specified
            categoryData.storeId = data.storeId || null;
        }

        const category = this.categoryRepository.create(categoryData);
        return this.categoryRepository.save(category);
    }

    async update(id: string, data: any, user: any) {
        if (data.parentId === "") data.parentId = null;
        const category = await this.findOne(id, user.storeId, user.role === 'super_admin');

        // Protection: Cannot update global category if not super admin
        if (user.role !== 'super_admin' && category.storeId === null) {
            throw new ForbiddenException('Cannot update global categories');
        }
        
        // Protection: Cannot update other store's category
        if (user.role !== 'super_admin' && category.storeId !== user.storeId) {
            throw new ForbiddenException('Access denied');
        }

        Object.assign(category, data);
        return this.categoryRepository.save(category);
    }

    async remove(id: string, user: any) {
        const category = await this.findOne(id, user.storeId, user.role === 'super_admin');

        if (user.role !== 'super_admin' && category.storeId === null) {
            throw new ForbiddenException('Cannot delete global categories');
        }
        
        if (user.role !== 'super_admin' && category.storeId !== user.storeId) {
            throw new ForbiddenException('Access denied');
        }

        return this.categoryRepository.remove(category);
    }
}
