import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async findAll() {
        return this.categoryRepository.find({
            relations: ['parent', 'children'],
            order: { name: 'ASC' }
        });
    }

    async findOne(id: string) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children']
        });

        if (!category) throw new NotFoundException('Category not found');

        return category;
    }

    async findBySlug(slug: string) {
        const category = await this.categoryRepository.findOne({
            where: { slug },
            relations: ['parent', 'children']
        });

        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async create(data: any, user: any) {
        if (data.parentId === "") data.parentId = null;

        const categoryData = { ...data };

        const category = this.categoryRepository.create(categoryData);
        return this.categoryRepository.save(category);
    }

    async update(id: string, data: any, user: any) {
        if (data.parentId === "") data.parentId = null;
        const category = await this.findOne(id);

        Object.assign(category, data);
        return this.categoryRepository.save(category);
    }

    async remove(id: string, user: any) {
        const category = await this.findOne(id);

        return this.categoryRepository.remove(category);
    }
}
