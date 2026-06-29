import {
    Controller, Get, Post, Put, Delete, Patch, Param, Query, Body,
    UseGuards, BadRequestException, NotFoundException, HttpCode, HttpStatus, Request, UseInterceptors
} from '@nestjs/common';
import { getS3KeyFromUrl } from '../common/utils/s3-url.util';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../admin/audit-log.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductReview } from './entities/product-review.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductBundleItem } from './entities/product-bundle-item.entity';
import { Tag } from '../admin/entities/tag.entity';
import { ProductFlag } from '../admin/entities/product-flag.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { ProductBulkService } from './product-bulk.service';
import { CatalogService } from './catalog.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Res, UploadedFile } from '@nestjs/common';
import * as QRCode from 'qrcode';

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function safeParse(value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
    }
    return value;
}

const NON_ATTRIBUTE_KEYS = [
    'productDetails', 'productPricingType', 'banner', 'icon', 
    'collections', 'adminNotes', 
    'offers', 'plans', 'images', 'brand',
    'whyChoose', 'features', 'specifications', 'pricingPlans', 'faqs', 'video'
];

/**
 * Map the rich frontend form payload → flat Product entity fields.
 */
function mapBodyToProduct(body: Record<string, any>, existing?: Product): Partial<Product> {
    const parse = (key: string) => {
        const val = safeParse(body[key]);
        return val === undefined || val === null ? undefined : val;
    };

    const productInfo = parse('productInfo');
    const simplePricing = parse('simplePricing');
    const seo = parse('seo') || body.seo;
    const variants = parse('variants');

    const attrInput = parse('attributes') || body.attributes || {};

    // ── Consolidate All Extra Data into Attributes ──────────────────────────
    // 1. Attributes: ONLY dynamic variables (size, color, etc.)
    let cleanAttributesSet = { ...(existing?.attributes || {}), ...attrInput };
    if (body.brand) cleanAttributesSet.brand = body.brand;
    NON_ATTRIBUTE_KEYS.forEach(key => delete cleanAttributesSet[key]);

    const finalAttributes: Record<string, any> = {
        ...cleanAttributesSet,
        ...(parse('dynamicAttributes') || body.dynamicAttributes || {}),
        ...(parse('variantAttributeSelections') || body.variantAttributeSelections || {}),
    };

    // ── SEO Settings ──────────────────────────────────────────────────────
    const seo_settings = seo || existing?.seo_settings || {};
    
    // ── Product Details Section Mapping ─────────────────────────────────────
    let product_details = body.productDetails || existing?.product_details || {};
    // Map flat form fields into structured product_details JSON if provided
    if (body.whyChoose) product_details.whyChoose = body.whyChoose;
    if (body.features) product_details.features = body.features;
    if (body.specifications) product_details.specifications = body.specifications;
    if (body.pricingPlans) product_details.pricingPlans = body.pricingPlans;
    if (body.faqs) product_details.faqs = body.faqs;

    // ── Flat columns ──────────────────────────────────────────────────────
    const title: string = (body.title || productInfo?.title || productInfo?.name || body.name || existing?.title || '').trim();
    const description: string = body.description || productInfo?.description || existing?.description || '';

    let price: number | null = existing?.price !== undefined ? Number(existing.price) : null;
    if (simplePricing?.basePrice !== undefined) price = Number(simplePricing.basePrice);
    else if (body.price !== undefined) price = Number(body.price);

    let costPrice: number = existing?.costPrice !== undefined ? Number(existing.costPrice) : 0;
    if (simplePricing?.costPrice !== undefined && simplePricing?.costPrice !== null) costPrice = Number(simplePricing.costPrice);
    else if (body.costPrice !== undefined && body.costPrice !== null) costPrice = Number(body.costPrice);

    const sku: string = body.sku || productInfo?.sku || existing?.sku || '';
    const hsn_code: string = body.hsn_code || productInfo?.hsn_code || existing?.hsn_code || '';
    const tax_rate: number = Number(body.tax_rate || productInfo?.tax_rate || existing?.tax_rate || 0);

    const categoryId: string | undefined = body.categoryId || existing?.categoryId || undefined;

    const isActive: boolean = body.isActive !== undefined
        ? Boolean(safeParse(body.isActive))
        : (existing?.isActive !== undefined ? existing.isActive : true);

    const isFeatured: boolean = body.isFeatured !== undefined
        ? Boolean(safeParse(body.isFeatured))
        : (existing?.isFeatured !== undefined ? existing.isFeatured : false);

    const isBundle: boolean = body.isBundle !== undefined
        ? Boolean(safeParse(body.isBundle))
        : (existing?.isBundle !== undefined ? existing.isBundle : false);

    const is_returnable: boolean = body.is_returnable !== undefined
        ? Boolean(safeParse(body.is_returnable))
        : (existing?.is_returnable !== undefined ? existing.is_returnable : false);

    const is_replaceable: boolean = body.is_replaceable !== undefined
        ? Boolean(safeParse(body.is_replaceable))
        : (existing?.is_replaceable !== undefined ? existing.is_replaceable : false);

    const return_window_days: number = body.return_window_days !== undefined
        ? Number(safeParse(body.return_window_days))
        : (existing?.return_window_days !== undefined ? existing.return_window_days : 7);

    let stock: number | null = existing?.stock !== undefined ? Number(existing.stock) : null;
    if (simplePricing?.stockQuantity !== undefined) stock = Number(simplePricing.stockQuantity);
    else if (body.stock !== undefined) stock = Number(body.stock);
    
    const showInMarketplace: boolean = body.showInMarketplace !== undefined
        ? Boolean(safeParse(body.showInMarketplace))
        : (existing?.showInMarketplace !== undefined ? existing.showInMarketplace : false);

    const purchaseType: string = body.purchaseType !== undefined
        ? String(safeParse(body.purchaseType))
        : (existing?.purchaseType !== undefined ? existing.purchaseType : 'online');

    // If variants exist, Parent price/stock usually treated as NULL in variable products
    if (variants && Array.isArray(variants) && variants.length > 0) {
        price = null;
        stock = null;
    }

    return {
        title,
        description,
        price,
        costPrice,
        sku: sku || undefined,
        isActive,
        isFeatured,
        categoryId,
        stock,
        hsn_code,
        tax_rate,
        is_variant: body.is_variant || existing?.is_variant || false,
        tags: parse('tags') || parse('seo')?.keywords || existing?.tags || [],
        flags: body.flags || existing?.flags || [],
        attributes: finalAttributes,
        product_details,
        seo_settings,
        isBundle,
        is_returnable,
        is_replaceable,
        return_window_days,
        showInMarketplace,
        purchaseType,
        manualCurrencyPrices: parse('manualCurrencyPrices') || body.manualCurrencyPrices || existing?.manualCurrencyPrices || {},
    };
}

@ApiTags('admin/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller(['admin/products', 'admin/products-manage'])
export class AdminProductController {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
        @InjectRepository(ProductFlag)
        private flagRepository: Repository<ProductFlag>,
        @InjectRepository(GeneralSettings)
        private settingsRepository: Repository<GeneralSettings>,
        private bulkService: ProductBulkService,
        private catalogService: CatalogService,
    ) { }

    @ApiOperation({ summary: 'Admin: Get all products' })
    @Get()
    async getAllProducts(
        @Query('page') page = 1, 
        @Query('limit') limit = 20, 
        @Query('search') search: string,
        @Query('productStructureType') productStructureType: string,
        @Request() req: any
    ) {
        const storeId = req.user?.storeId;
        const settings = await this.settingsRepository.findOne({ where: { storeId } });
        const defaultCurrency = settings?.defaultCurrency || 'INR';

        const queryBuilder = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.media', 'media')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.children', 'children')
            .where('product.parentId IS NULL');

        if (storeId) {
            queryBuilder.andWhere('product.storeId = :storeId', { storeId });
        }

        if (search) {
            queryBuilder.andWhere('(product.title ILIKE :search OR product.sku ILIKE :search OR product.slug ILIKE :search)', { 
                search: `%${search}%` 
            });
        }

        if (productStructureType) {
            if (productStructureType === 'single') {
                // Products with no children and NOT a bundle
                queryBuilder.andWhere('product.isBundle = :isBundleSingle', { isBundleSingle: false });
                queryBuilder.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('1')
                        .from(Product, 'child')
                        .where('child.parentId = product.id')
                        .getQuery();
                    return `NOT EXISTS ${subQuery}`;
                });
            } else if (productStructureType === 'variable' || productStructureType === 'variant') {
                // Products with children and NOT a bundle
                queryBuilder.andWhere('product.isBundle = :isBundleVar', { isBundleVar: false });
                queryBuilder.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('1')
                        .from(Product, 'child')
                        .where('child.parentId = product.id')
                        .getQuery();
                    return `EXISTS ${subQuery}`;
                });
            } else if (productStructureType === 'bundle') {
                queryBuilder.andWhere('product.isBundle = :isBundleActive', { isBundleActive: true });
            } else if (productStructureType === 'bundle_item') {
                // Return everything except bundles
                queryBuilder.andWhere('product.isBundle = :isBundleItem', { isBundleItem: false });
            }
        }

        const [items, total] = await queryBuilder
            .orderBy('product.createdAt', 'DESC')
            .take(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .getManyAndCount();

        const mappedProducts = items.map(product => {
            // Price display logic: Min - Max or Single Price
            let displayPrice = '';
            let minPrice: number | null = product.price !== null ? Number(product.price) : null;
            let maxPrice: number | null = product.price !== null ? Number(product.price) : null;

            if (product.children && product.children.length > 0) {
                const prices = product.children.map(v => Number(v.price)).filter(p => !isNaN(p));
                if (prices.length > 0) {
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    minPrice = min;
                    maxPrice = max;
                    displayPrice = min === max ? `${min}` : `${min} - ${max}`;
                }
            } else if (product.price !== null) {
                displayPrice = `${product.price}`;
            }

            const mainImageUrl = product.media?.find(m => m.is_main)?.url || product.media?.find(m => m.media_type === 'image')?.url || '';

            return {
                _id: product.id,
                slug: product.slug,
                isActive: product.isActive,
                isFeatured: product.isFeatured,
                showInMarketplace: product.showInMarketplace,
                tags: product.tags || [],
                flags: product.flags || [],
                displayPrice: displayPrice || 'N/A',
                price: product.price,
                stock: product.stock,
                category: product.category ? {
                    id: product.category.id,
                    name: product.category.name,
                } : null,
                productInfo: {
                    name: product.title,
                    title: product.title,
                    category: product.category?.name || 'Unknown',
                    stock: product.stock,
                    sku: product.sku,
                    hsn_code: product.hsn_code || '',
                    tax_rate: product.tax_rate || 0,
                },
                simplePricing: {
                    basePrice: product.price,
                    stockQuantity: product.stock,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    currency: defaultCurrency
                },
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                media: {
                    mainImage: mainImageUrl,
                },
                images: mainImageUrl ? [{ url: mainImageUrl, is_main: true }] : [],
                isBundle: product.isBundle,
                productStructureType: (product.children && product.children.length > 0) ? 'variable' : (product.isBundle ? 'bundle' : 'single'),
            };
        });

        return {
            products: mappedProducts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        };
    }

    @ApiOperation({ summary: 'Admin: Toggle product status' })
    @Patch(':id/status')
    async toggleStatus(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const product = await this.productRepository.findOne({ where: { id, storeId } });
        if (!product) throw new NotFoundException('Product not found');
        product.isActive = !product.isActive;
        await this.productRepository.save(product);
        return { success: true, isActive: product.isActive };
    }

    @ApiOperation({ summary: 'Admin: Toggle product featured' })
    @Patch(':id/featured')
    async toggleFeatured(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const product = await this.productRepository.findOne({ where: { id, storeId } });
        if (!product) throw new NotFoundException('Product not found');
        product.isFeatured = !product.isFeatured;
        await this.productRepository.save(product);
        return { success: true, isFeatured: product.isFeatured };
    }

    @ApiOperation({ summary: 'Admin: Delete product' })
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteProduct(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const product = await this.productRepository.findOne({ where: { id, storeId } });
        if (!product) throw new NotFoundException('Product not found');

        try {
            await this.productRepository.delete(id);
            return { success: true, message: 'Product deleted' };
        } catch (error) {
            // Check for Postgres Foreign Key Constraint Violation (code 23503)
            if (error.code === '23503' || error.message?.includes('foreign key constraint')) {
                throw new BadRequestException('Product is currently in a customer\'s cart or has associated orders and cannot be deleted.');
            }
            throw error;
        }
    }

    @ApiOperation({ summary: 'Admin: Get unique tags' })
    @Get('tags/unique')
    async getUniqueTags(@Request() req: any) {
        const storeId = req.user?.storeId;
        if (!storeId) return { success: true, tags: [] };

        // Query unique tags from JSONB array
        const result = await this.productRepository
            .createQueryBuilder('product')
            .select('DISTINCT jsonb_array_elements_text(product.tags)', 'tag')
            .where('product.storeId = :storeId', { storeId })
            .getRawMany();

        return { success: true, tags: result.map(r => r.tag).filter(t => !!t) };
    }

    @ApiOperation({ summary: 'Admin: Get product by ID' })
    @Get(':id')
    async getProductById(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const settings = await this.settingsRepository.findOne({ where: { storeId } });
        const defaultCurrency = settings?.defaultCurrency || 'INR';

        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const product = await this.productRepository.findOne({
            where: whereCond,
            relations: ['media', 'children', 'category', 'productCollections', 'productCollections.collection', 'bundleItems', 'bundleItems.product', 'bundleItems.product.media'],
        });
        if (!product) throw new NotFoundException(`Product ${id} not found`);

        const attributes = product.attributes || {};
        
        // Extract images from media relation (database table)
        const images = product.media?.filter(img => img.sort_order !== -1).map(img => ({
            url: img.url,
            is_main: img.is_main,
            altText: img.altText || '',
            media_type: img.media_type || 'image',
            sort_order: img.sort_order || 0,
            variantId: img.variantId || null,
        })).sort((a, b) => a.sort_order - b.sort_order) || [];
        const pricingType = product.children?.length > 0 ? 'variable' : 'simple';
        // Resolve SEO data directly from column or fallback to keywords/tags
        let seo = product.seo_settings || { keywords: product.tags || [] };
        if (!seo.keywords || seo.keywords.length === 0) {
            seo.keywords = product.tags || [];
        }

        // Fetch Tag Names if IDs are stored
        let tagNames: any[] = product.tags || [];
        if (tagNames.length > 0 && typeof tagNames[0] === 'string' && tagNames[0].length === 36) { // UUID check
            const tags = await this.tagRepository.findBy({ id: In(tagNames as string[]) });
            tagNames = tags.map(t => ({ id: t.id, name: t.name }));
        }

        // Fetch Flag Names if IDs are stored
        let flags: any[] = product.flags || [];
        if (flags.length > 0 && typeof flags[0] === 'string' && flags[0].length === 36) { // UUID check
            const flagEntities = await this.flagRepository.findBy({ id: In(flags as string[]) });
            flags = flagEntities.map(f => ({ id: f.id, name: f.name, color: f.color }));
        }

        // Calculate total stock for variable products
        let totalStock = product.stock || 0;
        if (pricingType === 'variable' && product.children?.length > 0) {
            totalStock = product.children.reduce((acc, v) => acc + (v.stock || 0), 0);
        }

        const responseData = {
            id: product.id,
            slug: product.slug,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            showInMarketplace: product.showInMarketplace,
            sku: product.sku,
            price: product.price,
            costPrice: product.costPrice,
            stock: product.stock,
            productInfo: {
                title: product.title,
                name: product.title,
                sku: product.sku,
                description: product.description || '',
                brand: attributes.brand || '',
                hsn_code: product.hsn_code || '',
                tax_rate: product.tax_rate || 0,
                costPrice: product.costPrice || 0,
            },
            simplePricing: {
                basePrice: product.price,
                costPrice: product.costPrice || 0,
                stockQuantity: product.stock,
                currency: defaultCurrency,
                inStock: pricingType === 'variable' ? totalStock > 0 : (product.stock || 0) > 0
            },
            manualCurrencyPrices: product.manualCurrencyPrices || {},
            category: product.category ? { id: product.category.id, name: product.category.name } : null,
            categoryId: product.categoryId,
            attributes: attributes,
            productPricingType: pricingType,
            productStructureType: pricingType,
            images,
            productDetails: product.product_details || {},
            collections: product.productCollections?.map(pc => ({ id: pc.collection?.id, name: pc.collection?.name })) || [],
            tags: tagNames,
            flags: flags,
            variants: product.children?.map(v => ({
                id: v.id,
                name: v.title,
                title: v.title,
                price: Number(v.price),
                costPrice: Number(v.costPrice || 0),
                stock: v.stock,
                sku: v.sku,
                is_variant: true,
                attributes: v.attributes || {},
                isActive: v.isActive,
                manualCurrencyPrices: v.manualCurrencyPrices || {}
            })) || [],
            video: product.media?.find(m => m.media_type === 'video' && m.sort_order === -1) ? {
                url: product.media.find(m => m.media_type === 'video' && m.sort_order === -1).url,
                altText: product.media.find(m => m.media_type === 'video' && m.sort_order === -1).altText,
                type: 'video'
            } : null,
            seo: seo,
            isBundle: product.isBundle,
            bundleItems: product.bundleItems?.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                name: item.product?.title,
                price: item.product?.price,
                mainImage: item.product?.media?.find(m => m.is_main)?.url || item.product?.media?.find(m => m.media_type === 'image')?.url || '',
            })) || [],
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            is_returnable: product.is_returnable,
            is_replaceable: product.is_replaceable,
            return_window_days: product.return_window_days,
        };

        return responseData;
    }

    @ApiOperation({ summary: 'Admin: Create product' })
    @Post()
    async createProduct(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const mapped = mapBodyToProduct(body);

        if (!mapped.title) {
            throw new BadRequestException('Product title is required');
        }

        const baseSlug = mapped.sku ? slugify(mapped.sku) : slugify(mapped.title);
        const slug = await this.generateUniqueSlug(baseSlug, storeId);
        mapped.slug = slug;
        if (storeId) mapped.storeId = storeId;

        const product = this.productRepository.create(mapped);
        const savedProduct = await this.productRepository.save(product);

        // 1. Save Variants as Child Products (To get real IDs)
        const variants = safeParse(body.variants);
        const variantIdMap: Record<string, string> = {};

        if (variants && Array.isArray(variants)) {
            for (const v of variants) {
                const variantSlug = v.sku ? slugify(v.sku) : `${savedProduct.slug}-${slugify(v.name)}`;
                const uniqueVariantSlug = await this.generateUniqueSlug(variantSlug, storeId);
                
                const vData: any = {
                    storeId,
                    parentId: savedProduct.id,
                    title: v.name,
                    slug: uniqueVariantSlug,
                    price: Number(v.price || 0),
                    costPrice: Number(v.costPrice || 0),
                    stock: Number(v.stock || 0),
                    sku: v.sku,
                    isActive: v.isActive !== undefined ? v.isActive : true,
                    categoryId: savedProduct.categoryId,
                    is_variant: true,
                    is_returnable: null,
                    is_replaceable: null,
                    return_window_days: null,
                    tags: null,
                    flags: null,
                    seo_settings: null,
                    product_details: null,
                    manualCurrencyPrices: v.manualCurrencyPrices || {},
                };

                // Filter attributes column
                const vAttr = v.attributes || (v as any).metadata?.attributes || {};
                const vCleanAttr = { ...vAttr };
                NON_ATTRIBUTE_KEYS.forEach(key => delete vCleanAttr[key]);
                vData.attributes = vCleanAttr;

                const savedV = await this.productRepository.save(vData);
                // Map temp ID (body side) or sku to the new real UUID
                if (v.id) variantIdMap[v.id] = savedV.id;
                if (v.sku) variantIdMap[v.sku] = savedV.id;
            }
        }

        // 2. Save media (Using the variantIdMap)
        const media = safeParse(body.images || body.media);
        if (media && Array.isArray(media)) {
            const mediaEntities = media.map((m, index) => {
                let vId = m.variantId || null;
                // If it matches a temp ID in our map, replace it with the REAL UUID
                if (vId && variantIdMap[vId]) {
                    vId = variantIdMap[vId];
                }

                // Generate SEO friendly Alt Text if not provided
                let finalAlt = m.altText || m.alt || '';
                if (!finalAlt) {
                    const variantName = variants?.find(v => v.id === m.variantId || v.sku === m.variantId)?.name || '';
                    finalAlt = `${savedProduct.title}${variantName ? ` - ${variantName}` : ''} - Image ${index + 1}`;
                }

                return {
                    productId: savedProduct.id,
                    key: getS3KeyFromUrl(m.url || m.key),
                    media_type: m.media_type || m.type || 'image',
                    sort_order: m.sort_order !== undefined ? m.sort_order : (m.position !== undefined ? m.position : index),
                    is_main: !!(m.is_main || m.isPrimary),
                    altText: finalAlt,
                    variantId: vId,
                };
            });
            await this.productRepository.manager.getRepository(ProductMedia).save(mediaEntities);
        }

        // 3. Save special video if provided (represented by sort_order: -1)
        const video = safeParse(body.video);
        if (video && video.url) {
            await this.productRepository.manager.getRepository(ProductMedia).save({
                productId: savedProduct.id,
                key: getS3KeyFromUrl(video.url),
                media_type: 'video',
                sort_order: -1, // Special sort order for dedicated product video
                is_main: false,
                altText: video.altText || `${savedProduct.title} - Product Video`,
                variantId: null,
            });
        }
        
        // 4. Save Bundle Items if this is a bundle
        const bundleItems = safeParse(body.bundleItems);
        if (savedProduct.isBundle && bundleItems && Array.isArray(bundleItems)) {
            const items = bundleItems.map(item => ({
                bundleId: savedProduct.id,
                productId: item.productId,
                quantity: item.quantity,
                storeId: storeId,
            }));
            await this.productRepository.manager.getRepository(ProductBundleItem).save(items);
        }

        return savedProduct;
    }

    @ApiOperation({ summary: 'Admin: Update product' })
    @Put(':id')
    async updateProduct(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const existing = await this.productRepository.findOne({ where: { id, storeId } });
        if (!existing) throw new NotFoundException(`Product ${id} not found`);

        const mapped = mapBodyToProduct(body, existing);

        const skuChanged = mapped.sku && mapped.sku !== existing.sku;
        const titleChanged = (mapped.title && mapped.title !== existing.title);

        if (skuChanged || titleChanged) {
            const baseSlug = mapped.sku ? slugify(mapped.sku) : slugify(mapped.title || existing.title);
            mapped.slug = await this.generateUniqueSlug(baseSlug, storeId, id);
        }

        Object.assign(existing, mapped);
        const savedProduct = await this.productRepository.save(existing);

        // 1. Save Variants (To get real IDs)
        const variants = safeParse(body.variants);
        const variantIdMap: Record<string, string> = {};

        if (variants && Array.isArray(variants)) {
            await this.productRepository.delete({ parentId: id });
            for (const v of variants) {
                const variantSlug = v.sku ? slugify(v.sku) : `${savedProduct.slug}-${slugify(v.name)}`;
                const uniqueVariantSlug = await this.generateUniqueSlug(variantSlug, storeId);

                const vData: any = {
                    storeId,
                    parentId: savedProduct.id,
                    title: v.name,
                    slug: uniqueVariantSlug,
                    price: Number(v.price || 0),
                    costPrice: Number(v.costPrice || 0),
                    stock: Number(v.stock || 0),
                    sku: v.sku,
                    isActive: v.isActive !== undefined ? v.isActive : true,
                    categoryId: savedProduct.categoryId,
                    is_variant: true,
                    is_returnable: null,
                    is_replaceable: null,
                    return_window_days: null,
                    tags: null,
                    flags: null,
                    seo_settings: null,
                    product_details: null,
                    manualCurrencyPrices: v.manualCurrencyPrices || {},
                };

                // Filter attributes column
                const vAttr = v.attributes || (v as any).metadata?.attributes || {};
                const vCleanAttr = { ...vAttr };
                NON_ATTRIBUTE_KEYS.forEach(key => delete vCleanAttr[key]);
                vData.attributes = vCleanAttr;

                const savedV = await this.productRepository.save(vData);
                if (v.id) variantIdMap[v.id] = savedV.id;
                if (v.sku) variantIdMap[v.sku] = savedV.id;
            }
        }

        // 2. Update media (using variantIdMap)
        const media = safeParse(body.images || body.media);
        if (media && Array.isArray(media)) {
            await this.productRepository.manager.getRepository(ProductMedia).delete({ productId: id });
            const mediaEntities = media.map((m, index) => {
                let vId = m.variantId || null;
                if (vId && variantIdMap[vId]) {
                    vId = variantIdMap[vId];
                }

                // Generate SEO friendly Alt Text
                let finalAlt = m.altText || m.alt || '';
                if (!finalAlt) {
                    const variantName = variants?.find(v => v.id === m.variantId || v.sku === m.variantId)?.name || '';
                    finalAlt = `${savedProduct.title}${variantName ? ` - ${variantName}` : ''} - Image ${index + 1}`;
                }

                return {
                    productId: savedProduct.id,
                    key: getS3KeyFromUrl(m.url || m.key),
                    media_type: m.media_type || m.type || 'image',
                    sort_order: m.sort_order !== undefined ? m.sort_order : (m.position !== undefined ? m.position : index),
                    is_main: !!(m.is_main || m.isPrimary),
                    altText: finalAlt,
                    variantId: vId,
                };
            });
            await this.productRepository.manager.getRepository(ProductMedia).save(mediaEntities);
        }

        // 3. Update special video (represented by sort_order: -1)
        const video = safeParse(body.video);
        if (video) {
            // Delete existing special video
            await this.productRepository.manager.getRepository(ProductMedia).delete({ productId: id, sort_order: -1 });
            
            if (video.url) {
                await this.productRepository.manager.getRepository(ProductMedia).save({
                    productId: savedProduct.id,
                    key: getS3KeyFromUrl(video.url),
                    media_type: 'video',
                    sort_order: -1, // Special sort order for dedicated product video
                    is_main: false,
                    altText: video.altText || `${savedProduct.title} - Product Video`,
                variantId: null,
                });
            }
        }

        // 4. Update Bundle Items if this is a bundle
        const bundleItems = safeParse(body.bundleItems);
        if (savedProduct.isBundle && bundleItems && Array.isArray(bundleItems)) {
            await this.productRepository.manager.getRepository(ProductBundleItem).delete({ bundleId: id });
            const items = bundleItems.map(item => ({
                bundleId: savedProduct.id,
                productId: item.productId,
                quantity: item.quantity,
                storeId: storeId,
            }));
            await this.productRepository.manager.getRepository(ProductBundleItem).save(items);
        }

        return savedProduct;
    }



    @ApiOperation({ summary: 'Admin: Export products to CSV' })
    @Get('export/csv')
    async exportProducts(@Request() req: any, @Res() res: Response) {
        const storeId = req.user?.storeId;
        const csv = await this.bulkService.exportStoreProducts(storeId);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=products-export-${Date.now()}.csv`);
        return res.send(csv);
    }

    @ApiOperation({ summary: 'Admin: Export products to JSON' })
    @Get('export/json')
    async exportProductsJson(@Request() req: any) {
        const storeId = req.user?.storeId;
        return await this.bulkService.exportStoreProductsJson(storeId);
    }

    @ApiOperation({ summary: 'Admin: Import products from CSV (Deprecated - use JSON)' })
    @Post('import/csv')
    @UseInterceptors(FileInterceptor('file'))
    async importProducts(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any
    ) {
        throw new BadRequestException('CSV import is no longer supported. Please use JSON format for product imports.');
    }

    @ApiOperation({ summary: 'Admin: Import products from JSON' })
    @Post('import/json')
    @UseInterceptors(FileInterceptor('file'))
    async importProductsJson(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any
    ) {
        if (!file) throw new BadRequestException('No file uploaded');
        const storeId = req.user?.storeId;
        const jsonData = JSON.parse(file.buffer.toString('utf-8'));
        if (!Array.isArray(jsonData)) throw new BadRequestException('JSON data must be an array of products');
        return await this.bulkService.importStoreProductsJson(storeId, jsonData);
    }

    @ApiOperation({ summary: 'Admin: Get product QR code' })
    @Get(':id/qr-code')
    async getProductQrCode(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const product = await this.productRepository.findOne({
            where: { id, storeId },
            relations: ['store']
        });
        if (!product) throw new NotFoundException('Product not found');

        const store = product.store;
        const isProd = process.env.NODE_ENV === 'production';
        const baseDomain = process.env.BASE_DOMAIN || 'localhost';

        const frontendUrl = process.env.FRONTEND_URL || (isProd ? `https://${store.slug}.${baseDomain}` : `http://localhost:3000`);

        const productUrl = `${frontendUrl}/products/${product.slug}`;

        try {
            const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
                errorCorrectionLevel: 'H',
                margin: 4,
                width: 512,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            return {
                success: true,
                qrCode: qrCodeDataUrl,
                url: productUrl
            };
        } catch (error) {
            throw new BadRequestException('Failed to generate QR Code');
        }
    }

    private async generateUniqueSlug(baseSlug: string, storeId: string, excludeId?: string): Promise<string> {
        let candidate = baseSlug;
        let attempt = 0;
        while (true) {
            const whereCond: any = { slug: candidate };
            if (storeId) whereCond.storeId = storeId;
            const existing = await this.productRepository.findOne({ where: whereCond });
            if (!existing || (excludeId && existing.id === excludeId)) return candidate;
            attempt++;
            candidate = `${baseSlug}-${Date.now()}${attempt > 1 ? `-${attempt}` : ''}`;
        }
    }

    // ================= REVIEWS =================

    @ApiOperation({ summary: 'Admin: Get all reviews for a product' })
    @Get(':productId/reviews')
    async getAdminReviews(
        @Param('productId') productId: string,
        @Request() req: any
    ) {
        const storeId = req.user?.storeId;
        if (!storeId) throw new BadRequestException('Store ID not found in token');
        const reviews = await this.catalogService.findAdminReviews(productId, storeId);
        return { success: true, data: reviews };
    }

    @ApiOperation({ summary: 'Admin: Create manual review for a product' })
    @Post(':productId/reviews')
    async createAdminReview(
        @Param('productId') productId: string,
        @Body() dto: { customerName: string; customerEmail?: string; rating: number; comment: string },
        @Request() req: any
    ) {
        const storeId = req.user?.storeId;
        if (!storeId) throw new BadRequestException('Store ID not found in token');
        if (!dto.customerName || !dto.rating || !dto.comment) {
            throw new BadRequestException('Required fields: customerName, rating, comment');
        }
        if (dto.rating < 1 || dto.rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }
        const review = await this.catalogService.createAdminReview(productId, storeId, dto);
        return { success: true, data: review };
    }

    @ApiOperation({ summary: 'Admin: Approve/Reject a review' })
    @Patch('reviews/:id/status')
    async updateReviewStatus(
        @Param('id') id: string,
        @Body() body: { status: string },
        @Request() req: any
    ) {
        const storeId = req.user?.storeId;
        if (!storeId) throw new BadRequestException('Store ID not found in token');
        if (!body.status || !['approved', 'rejected', 'pending'].includes(body.status)) {
            throw new BadRequestException('Invalid status: must be approved, rejected, or pending');
        }
        const review = await this.catalogService.updateReviewStatus(id, storeId, body.status);
        return { success: true, data: review };
    }

    @ApiOperation({ summary: 'Admin: Delete a review' })
    @Delete('reviews/:id')
    async deleteReview(
        @Param('id') id: string,
        @Request() req: any
    ) {
        const storeId = req.user?.storeId;
        if (!storeId) throw new BadRequestException('Store ID not found in token');
        await this.catalogService.deleteReview(id, storeId);
        return { success: true, message: 'Review deleted successfully' };
    }
}
