import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, NotFoundException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstimateService } from './estimate.service';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('estimates')
@Controller('')
export class EstimateController {
    constructor(private readonly estimateService: EstimateService) { }

    // ── Public ──────────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get estimate by ID (public view)' })
    @ApiParam({ name: 'id' })
    @Get('estimates/:id')
    async getEstimateById(@Param('id') id: string) {
        return this.estimateService.getEstimateById(id);
    }

    @ApiOperation({ summary: 'Mark estimate as viewed' })
    @ApiParam({ name: 'id' })
    @Post('estimates/:id/viewed')
    async markAsViewed(@Param('id') id: string) {
        return this.estimateService.markAsViewed(id);
    }

    // ── Admin ───────────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: Get all estimates' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/estimates')
    async findAll(@Query() query: any, @Req() req: any, @CurrentTenant('id') storeId: string) {
        return this.estimateService.findAll({ ...query, storeId });
    }

    @ApiOperation({ summary: 'Admin: Get estimate by ID' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/estimates/:id')
    async findOne(@Param('id') id: string, @CurrentTenant('id') storeId: string) {
        const estimate = await this.estimateService.findOneAdmin(id, storeId);
        return { data: estimate };
    }

    @ApiOperation({ summary: 'Admin: Create estimate' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/estimates')
    async create(@Body() body: any, @Req() req: any) {
        const storeId = req.user?.storeId;
        return this.estimateService.create({ ...body, storeId });
    }

    @ApiOperation({ summary: 'Admin: Update estimate' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/estimates/:id')
    async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const storeId = req.user?.storeId;
        return this.estimateService.update(id, body, storeId);
    }

    @ApiOperation({ summary: 'Admin: Send estimate' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/estimates/:id/send')
    async send(@Param('id') id: string, @Req() req: any) {
        const storeId = req.user?.storeId;
        return this.estimateService.send(id, storeId);
    }

    @ApiOperation({ summary: 'Admin: Delete estimate' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/estimates/:id')
    async delete(@Param('id') id: string, @Req() req: any) {
        if (!id || id === 'undefined' || id === 'null') {
            throw new NotFoundException('Invalid Estimate ID');
        }
        const storeId = req.user?.storeId;
        return this.estimateService.delete(id, storeId);
    }

    @ApiOperation({ summary: 'Admin: Generate PDF' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/estimates/:id/generate-pdf')
    async generatePdf(@Param('id') id: string, @Req() req: any) {
        const storeId = req.user?.storeId;
        const url = await this.estimateService.generateAndStorePdf(id, storeId);
        return { success: true, message: 'PDF generated and stored', data: { pdfUrl: url } };
    }
}
