import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Request, NotFoundException, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ProductFlag } from './entities/product-flag.entity';
import { AuditLogInterceptor } from './audit-log.interceptor';

@ApiTags('admin/flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/flags')
export class ProductFlagController {
    constructor(
        @InjectRepository(ProductFlag)
        private flagRepository: Repository<ProductFlag>,
    ) { }

    @ApiOperation({ summary: 'Search product flags' })
    @ApiQuery({ name: 'q', required: false })
    @Get('search')
    async searchFlags(@Query('q') q: string, @Request() req: any) {
        const whereCond: any = {};

        if (!q) {
            const items = await this.flagRepository.find({ where: whereCond });
            return { flags: items, count: items.length, success: true };
        }
        whereCond.name = Like(`%${q}%`);
        const items = await this.flagRepository.find({ where: whereCond });
        return { flags: items, count: items.length, success: true };
    }

    @ApiOperation({ summary: 'Get all product flags' })
    @Get()
    async getAllFlags(@Query() query: any, @Request() req: any) {
        const whereCond: any = {};

        const items = await this.flagRepository.find({ where: whereCond, order: { name: 'ASC' } });
        return { flags: items, count: items.length, success: true };
    }

    @ApiOperation({ summary: 'Get product flag by ID' })
    @ApiParam({ name: 'id' })
    @Get(':id')
    async getFlagById(@Param('id') id: string, @Request() req: any) {
        const whereCond: any = { id };

        return this.flagRepository.findOne({ where: whereCond });
    }

    @ApiOperation({ summary: 'Create product flag' })
    @Post()
    async createFlag(@Body() body: any, @Request() req: any) {
        const flagData = {
            ...body,
            slug: body.name.toLowerCase().replace(/ /g, '-'),
        };

        const flag = this.flagRepository.create(flagData);
        const saved = await this.flagRepository.save(flag);
        return { flag: saved, success: true, message: 'Flag created' };
    }

    @ApiOperation({ summary: 'Update product flag' })
    @ApiParam({ name: 'id' })
    @Put(':id')
    async updateFlag(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const whereCond: any = { id };

        const flag = await this.flagRepository.findOne({ where: whereCond });
        if (!flag) throw new NotFoundException('Flag not found');

        if (body.name) {
            body.slug = body.name.toLowerCase().replace(/ /g, '-');
        }
        Object.assign(flag, body);
        const updated = await this.flagRepository.save(flag);
        return { flag: updated, success: true, message: 'Flag updated' };
    }

    @ApiOperation({ summary: 'Delete product flag' })
    @ApiParam({ name: 'id' })
    @Delete(':id')
    async deleteFlag(@Param('id') id: string, @Request() req: any) {
        const whereCond: any = { id };

        const flag = await this.flagRepository.findOne({ where: whereCond });
        if (!flag) throw new NotFoundException('Flag not found');

        await this.flagRepository.delete(id);
        return { success: true, message: 'Flag deleted' };
    }
}
