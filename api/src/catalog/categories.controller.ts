import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('admin/categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @ApiOperation({ summary: 'Get all categories' })
    @Get()
    findAll(@Request() req: any) {
        return this.categoriesService.findAll();
    }

    @ApiOperation({ summary: 'Get category by ID' })
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.categoriesService.findOne(id);
    }

    @ApiOperation({ summary: 'Create category' })
    @Post()
    create(@Body() data: any, @Request() req: any) {
        return this.categoriesService.create(data, req.user);
    }

    @ApiOperation({ summary: 'Update category' })
    @Put(':id')
    update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
        return this.categoriesService.update(id, data, req.user);
    }

    @ApiOperation({ summary: 'Delete category' })
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.categoriesService.remove(id, req.user);
    }
}
