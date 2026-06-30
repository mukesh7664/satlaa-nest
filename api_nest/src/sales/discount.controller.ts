import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Query, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiscountService } from './discount.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Discount } from './entities/discount.entity';

@ApiTags('discounts')
@Controller('')
export class DiscountController {
    constructor(
        private readonly discountService: DiscountService,
        @InjectRepository(Discount)
        private discountRepository: Repository<Discount>,
    ) { }

    // ── Public ──────────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Validate a discount code (public)' })
    @ApiParam({ name: 'code' })
    @Get('discount/validate/:code')
    async validateDiscount(@Param('code') code: string, @Query('subtotal') subtotal = 0, @Request() req: any) {
        const customerId = req.user?.userId;
        const discount = await this.discountService.validateDiscount(code, customerId, Number(subtotal));
        return { valid: true, discount };
    }

    // ── Admin ───────────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: Get all discounts' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/discounts')
    async getAllDiscounts(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('is_active') is_active?: string,
        @Request() req?: any
    ) {
        const baseWhere: any = {};

        const query: any = {
            order: { createdAt: 'DESC' },
            take: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
            where: baseWhere,
        };

        if (search) {
            query.where = [
                { ...baseWhere, code: Like(`%${search}%`) },
                { ...baseWhere, name: Like(`%${search}%`) },
            ];
        }

        if (type && type !== 'all') {
            if (Array.isArray(query.where)) {
                query.where.forEach(w => w.type = type);
            } else {
                query.where.type = type;
            }
        }

        if (is_active && is_active !== 'all') {
            const active = is_active === 'true';
            if (Array.isArray(query.where)) {
                query.where.forEach(w => w.is_active = active);
            } else {
                query.where.is_active = active;
            }
        }

        const [items, total] = await this.discountRepository.findAndCount(query);

        return {
            discounts: items,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            totalDiscounts: total,
        };
    }

    @ApiOperation({ summary: 'Admin: Get discount by ID' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/discounts/:id')
    async getDiscountById(@Param('id') id: string, @Request() req: any) {
        const whereCond: any = { id };

        const discount = await this.discountRepository.findOne({ where: whereCond });
        if (!discount) throw new NotFoundException('Discount not found');
        return discount;
    }

    @ApiOperation({ summary: 'Admin: Create discount' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/discounts')
    async createDiscount(@Body() body: any, @Request() req: any) {
        return this.discountService.create(body);
    }

    @ApiOperation({ summary: 'Admin: Update discount' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/discounts/:id')
    async updateDiscount(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.discountService.update(id, body);
    }

    @ApiOperation({ summary: 'Admin: Delete discount' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/discounts/:id')
    async deleteDiscount(@Param('id') id: string, @Request() req: any) {
        await this.discountService.remove(id);
        return { success: true, message: 'Discount deleted' };
    }

    @ApiOperation({ summary: 'Admin: Toggle discount active/inactive' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('admin/discounts/:id/toggle')
    async toggleDiscountStatus(@Param('id') id: string, @Request() req: any) {
        const discount = await this.discountService.findOne(id);
        if (!discount) throw new NotFoundException('Discount not found');

        return this.discountService.update(id, { is_active: !discount.is_active });
    }
}
