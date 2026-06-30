import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentationService } from './documentation.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRole } from '../admin/entities/admin.entity';

@ApiTags('documentation')
@Controller()
export class DocumentationController {
    constructor(private readonly documentationService: DocumentationService) {}

    // ---- Public Routes ----
    @ApiOperation({ summary: 'Get all published documentation grouped/sorted for the landing page' })
    @Get('documentation')
    async findAllPublic() {
        return this.documentationService.findAllPublic();
    }

    @ApiOperation({ summary: 'Get a specific documentation by slug' })
    @Get('documentation/:slug')
    async findBySlug(@Param('slug') slug: string) {
        return this.documentationService.findBySlug(slug);
    }

    // ---- Admin Routes ----
    @ApiOperation({ summary: 'Admin: Get all documentation' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/documentation')
    async findAllAdmin(@Req() req: any) {
        if (![AdminRole.ADMIN, AdminRole.SUB_ADMIN].includes(req.user?.role)) {
            throw new UnauthorizedException('Insufficient permissions');
        }
        return this.documentationService.findAllAdmin();
    }

    @ApiOperation({ summary: 'Admin: Get documentation by ID' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/documentation/:id')
    async findOneAdmin(@Param('id') id: string, @Req() req: any) {
        if (![AdminRole.ADMIN, AdminRole.SUB_ADMIN].includes(req.user?.role)) {
            throw new UnauthorizedException('Insufficient permissions');
        }
        return this.documentationService.findOne(id);
    }

    @ApiOperation({ summary: 'Admin: Create documentation' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/documentation')
    async create(@Body() createDto: CreateDocumentationDto, @Req() req: any) {
        if (req.user?.role !== AdminRole.ADMIN) {
            throw new UnauthorizedException('Super admin access required');
        }
        return this.documentationService.create(createDto);
    }

    @ApiOperation({ summary: 'Admin: Update documentation' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('admin/documentation/:id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateDocumentationDto, @Req() req: any) {
        if (req.user?.role !== AdminRole.ADMIN) {
            throw new UnauthorizedException('Super admin access required');
        }
        return this.documentationService.update(id, updateDto);
    }

    @ApiOperation({ summary: 'Admin: Delete documentation' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/documentation/:id')
    async remove(@Param('id') id: string, @Req() req: any) {
        if (req.user?.role !== AdminRole.ADMIN) {
            throw new UnauthorizedException('Super admin access required');
        }
        await this.documentationService.remove(id);
        return { success: true, message: 'Documentation removed successfully' };
    }
}
