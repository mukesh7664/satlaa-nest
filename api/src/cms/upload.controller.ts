import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, Logger, Req } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../admin/audit-log.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../cms/entities/media.entity';
import { AdminRole } from '../admin/entities/admin.entity';
import { S3Service } from './s3.service';

@ApiTags('admin/uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/upload')
export class UploadController {
    private readonly logger = new Logger(UploadController.name);

    constructor(
        @InjectRepository(Media)
        private mediaRepository: Repository<Media>,
        private s3Service: S3Service,
    ) { }

    @ApiOperation({ summary: 'Upload menu icon' })
    @Post('menu-icon')
    @UseInterceptors(FileInterceptor('image', {
        storage: memoryStorage(),
    }))
    async uploadMenuIcon(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
        if (!file) throw new BadRequestException('Image file is required');

        const role = req.user?.role;
        const isGlobal = role === AdminRole.ADMIN;
        const folder = body.folder || 'icons';

        const basePath = isGlobal ? `global-assets/${folder}` : folder;
        const uniqueName = `${basePath}/${uuidv4()}${extname(file.originalname)}`;

        const s3Url = await this.s3Service.uploadFile(file, uniqueName);

        this.logger.log(`Created media: folder=${folder}, isGlobal=${isGlobal}, url=${s3Url}`);

        const media = this.mediaRepository.create({
            name: body.name || file.originalname,
            alt: body.alt || '',
            type: 'menu-icon',
            size: file.size,
            mimeType: file.mimetype,
            key: uniqueName,
            isGlobal: isGlobal,
            folder: folder,
        });
        const savedMedia = await this.mediaRepository.save(media);
        return {
            ...savedMedia,
            url: s3Url
        };
    }

    @ApiOperation({ summary: 'Upload image' })
    @Post('image')
    @UseInterceptors(FileInterceptor('image', {
        storage: memoryStorage(),
    }))
    async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
        if (!file) throw new BadRequestException('Image file is required');

        const role = req.user?.role;
        // Only super_admin can set isGlobal to true
        const isGlobal = role === AdminRole.ADMIN && (body.isGlobal === 'true' || body.isGlobal === true);
        const folder = body.folder || 'uploads';

        const basePath = isGlobal ? `global-assets/${folder}` : folder;
        const uniqueName = `${basePath}/${uuidv4()}${extname(file.originalname)}`;

        const s3Url = await this.s3Service.uploadFile(file, uniqueName);

        this.logger.log(`Created image: folder=${folder}, isGlobal=${isGlobal}, url=${s3Url}`);

        const media = this.mediaRepository.create({
            name: body.name || file.originalname,
            alt: body.alt || '',
            type: 'image',
            size: file.size,
            mimeType: file.mimetype,
            key: uniqueName,
            isGlobal: isGlobal,
            folder: folder,
            tags: body.tags ? (typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim()) : body.tags) : [],
            usageType: body.usageType || 'other',
        });
        const savedMedia = await this.mediaRepository.save(media);
        return {
            ...savedMedia,
            url: s3Url
        };
    }

    @ApiOperation({ summary: 'List uploaded images' })
    @Get('list')
    async listImages(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search: string = '',
        @Query('folder') folder: string = '',
        @Query('type') type: string = 'all',
        @Query('isGlobal') isGlobal: string = 'false',
        @Query('tags') tags: string = '',
        @Req() req: any,
    ) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const queryBuilder = this.mediaRepository.createQueryBuilder('media');

        // Show global assets IF requested, ELSE show non-global assets
        if (isGlobal === 'true') {
            queryBuilder.where('media.isGlobal = :isGlobal', { isGlobal: true });
        } else {
            // Strictly show store assets and EXCLUDE global assets
            queryBuilder.where('media.isGlobal = :isGlobal', { isGlobal: false });
        }

        if (folder) {
            queryBuilder.andWhere('media.folder = :folder', { folder });
        }

        if (search) {
            queryBuilder.andWhere('(media.name LIKE :search OR media.alt LIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (type && type !== 'all') {
            queryBuilder.andWhere('media.mimeType LIKE :type', {
                type: `${type}/%`,
            });
        }

        if (tags) {
            const tagList = tags.split(',').map(t => t.trim());
            tagList.forEach((tag, index) => {
                queryBuilder.andWhere(`media.tags LIKE :tag${index}`, {
                    [`tag${index}`]: `%${tag}%`,
                });
            });
        }

        queryBuilder.orderBy('media.createdAt', 'DESC');

        const [items, total] = await queryBuilder
            .skip(skip)
            .take(limitNum)
            .getManyAndCount();

        // Construct full S3 URLs from keys
        const S3_BUCKET = process.env.AWS_S3_BUCKET || 'inospire';
        const S3_REGION = process.env.AWS_REGION || 'ap-south-1';

        const images = items.map(item => {
            // Construct full S3 URL from key dynamically
            let fullUrl = item.key;

            if (fullUrl && !fullUrl.startsWith('http')) {
                fullUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fullUrl}`;
            }

            return {
                ...item,
                _id: item.id, // Add _id for frontend compatibility
                url: fullUrl,
            };
        });

        return {
            images,
            total,
            page: pageNum,
            limit: limitNum,
        };
    }

    @ApiOperation({ summary: 'Delete uploaded image' })
    @Delete('delete')
    async deleteImage(@Query('id') id: string, @Req() req: any) {
        if (!id) throw new BadRequestException('Image ID is required');

        const media = await this.mediaRepository.findOne({ where: { id } });
        if (!media) throw new NotFoundException('Image not found');

        const isAdmin = req.user?.role === AdminRole.ADMIN;

        // Security Check: Only super_admin can delete global assets
        if (media.isGlobal && !isAdmin) {
            throw new BadRequestException('Only super admins can delete global assets');
        }

        // Remove file from S3
        if (media.key) {
            try {
                await this.s3Service.deleteFile(media.key);
            } catch (error) {
                this.logger.error(`Error deleting from S3: ${error.message}`);
                // Proceed with db deletion anyway
            }
        }

        await this.mediaRepository.delete(id);
        return { success: true, message: 'Image deleted' };
    }

    @ApiOperation({ summary: 'Update media details' })
    @ApiParam({ name: 'id' })
    @Put(':id')
    async updateMedia(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const media = await this.mediaRepository.findOne({ where: { id } });
        if (!media) throw new NotFoundException('Media not found');

        const isAdmin = req.user?.role === AdminRole.ADMIN;

        // Security Check
        if (media.isGlobal && !isAdmin) {
            throw new BadRequestException('Only super admins can update global assets');
        }

        await this.mediaRepository.update(id, {
            name: body.name,
            alt: body.alt,
            folder: body.folder,
            tags: body.tags ? (typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim()) : body.tags) : undefined,
            usageType: body.usageType,
        });
        return this.mediaRepository.findOne({ where: { id } });
    }

    @ApiOperation({ summary: 'Get all unique tags' })
    @Get('tags')
    async getUniqueTags() {
        const queryBuilder = this.mediaRepository.createQueryBuilder('media');

        queryBuilder.select('media.tags');

        const results = await queryBuilder.getRawMany();
        
        // results will be an array of objects with a 'media_tags' property (due to simple-array)
        // We need to flatten and get unique values
        const allTags = new Set<string>();
        results.forEach(res => {
            if (res.media_tags) {
                // simple-array is stored as a comma-separated string in the DB by TypeORM when using getRawMany
                const tagsArray = typeof res.media_tags === 'string' ? res.media_tags.split(',') : res.media_tags;
                if (Array.isArray(tagsArray)) {
                    tagsArray.forEach(tag => {
                        if (tag.trim()) allTags.add(tag.trim());
                    });
                }
            }
        });

        return Array.from(allTags).sort();
    }
}
