import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documentation } from './entities/documentation.entity';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';

@Injectable()
export class DocumentationService {
    constructor(
        @InjectRepository(Documentation)
        private documentationRepository: Repository<Documentation>,
    ) {}

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async create(createDto: CreateDocumentationDto): Promise<Documentation> {
        let slug = this.generateSlug(createDto.title);
        
        // Ensure slug is unique
        let existing = await this.documentationRepository.findOne({ where: { slug } });
        let counter = 1;
        const originalSlug = slug;
        while (existing) {
            slug = `${originalSlug}-${counter}`;
            existing = await this.documentationRepository.findOne({ where: { slug } });
            counter++;
        }

        const doc = this.documentationRepository.create({
            ...createDto,
            slug,
        });
        return this.documentationRepository.save(doc);
    }

    async findAllAdmin(): Promise<Documentation[]> {
        return this.documentationRepository.find({
            order: { category: 'ASC', order: 'ASC', createdAt: 'DESC' }
        });
    }

    async findAllPublic(): Promise<Documentation[]> {
        return this.documentationRepository.find({
            where: { isPublished: true },
            order: { category: 'ASC', order: 'ASC', createdAt: 'DESC' }
        });
    }

    async findOne(id: string): Promise<Documentation> {
        const doc = await this.documentationRepository.findOne({ where: { id } });
        if (!doc) {
            throw new NotFoundException(`Documentation with ID "${id}" not found`);
        }
        return doc;
    }

    async findBySlug(slug: string): Promise<Documentation> {
        const doc = await this.documentationRepository.findOne({ 
            where: { slug, isPublished: true } 
        });
        if (!doc) {
            throw new NotFoundException(`Documentation not found`);
        }
        return doc;
    }

    async update(id: string, updateDto: UpdateDocumentationDto): Promise<Documentation> {
        const doc = await this.findOne(id);
        
        let newSlug = doc.slug;
        if (updateDto.title && updateDto.title !== doc.title) {
            newSlug = this.generateSlug(updateDto.title);
            let existing = await this.documentationRepository.findOne({ where: { slug: newSlug } });
            let counter = 1;
            const originalSlug = newSlug;
            while (existing && existing.id !== id) {
                newSlug = `${originalSlug}-${counter}`;
                existing = await this.documentationRepository.findOne({ where: { slug: newSlug } });
                counter++;
            }
        }

        Object.assign(doc, { ...updateDto, slug: newSlug });
        return this.documentationRepository.save(doc);
    }

    async remove(id: string): Promise<void> {
        const result = await this.documentationRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Documentation with ID "${id}" not found`);
        }
    }
}
