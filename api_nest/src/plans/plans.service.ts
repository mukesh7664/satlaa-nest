import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Plan } from './plan.entity';

@Injectable()
export class PlansService {
    constructor(
        @InjectRepository(Plan)
        private planRepository: Repository<Plan>,
    ) { }

    async create(createPlanDto: Partial<Plan>): Promise<Plan> {
        const plan = this.planRepository.create(createPlanDto);
        return await this.planRepository.save(plan);
    }

    async findAll(isActive?: boolean, category?: string): Promise<Plan[]> {
        const where: any = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (category) {
            where.category = category;
        }
        return await this.planRepository.find({
            where,
            order: { monthlyPrice: 'ASC' }
        });
    }

    async findOne(id: string): Promise<Plan | null> {
        // Validate UUID format to prevent database errors
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return null;
        }
        return await this.planRepository.findOne({ where: { id } });
    }

    async update(id: string, updatePlanDto: Partial<Plan>): Promise<Plan> {
        await this.planRepository.update(id, updatePlanDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<{ message: string }> {
        try {
            await this.planRepository.delete(id);
            return { message: 'Plan deleted successfully' };
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes('foreign key constraint')) {
                throw new ConflictException('Cannot delete plan because it is associated with existing subscriptions. Please deactivate it instead.');
            }
            throw error;
        }
    }
}
