import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from './plan.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @ApiOperation({ summary: 'Create a new plan (Super Admin)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Post()
    create(@Body() createPlanDto: Partial<Plan>) {
        return this.plansService.create(createPlanDto);
    }

    @ApiOperation({ summary: 'Get all plans (Public - can filter by isActive)' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiQuery({ name: 'category', required: false, type: String })
    @Get()
    findAll(@Query('isActive') isActive?: string, @Query('category') category?: string) {
        const activeFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.plansService.findAll(activeFilter, category);
    }

    @ApiOperation({ summary: 'Get a plan by ID (Public)' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.plansService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a plan (Super Admin)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() updatePlanDto: Partial<Plan>) {
        return this.plansService.update(id, updatePlanDto);
    }

    @ApiOperation({ summary: 'Delete a plan (Super Admin)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.plansService.remove(id);
    }
}
