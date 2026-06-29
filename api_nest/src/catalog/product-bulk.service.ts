import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { Category } from './entities/category.entity';
import { ProductBundleItem } from './entities/product-bundle-item.entity';
import { Media } from '../cms/entities/media.entity';
import { S3Service } from '../cms/s3.service';
import * as Papa from 'papaparse';
import axios from 'axios';
import { Tag } from '../admin/entities/tag.entity';
import { ProductFlag } from '../admin/entities/product-flag.entity';
import { v4 as uuidv4 } from 'uuid';
import { getS3KeyFromUrl } from '../common/utils/s3-url.util';

@Injectable()
export class ProductBulkService {
    private readonly logger = new Logger(ProductBulkService.name);

    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(ProductMedia)
        private mediaRepository: Repository<ProductMedia>,
        @InjectRepository(Media)
        private libraryRepository: Repository<Media>,
        @InjectRepository(Tag)
        private tagRepo: Repository<Tag>,
        @InjectRepository(ProductFlag)
        private flagRepo: Repository<ProductFlag>,
        @InjectRepository(ProductBundleItem)
        private bundleItemRepository: Repository<ProductBundleItem>,
        private s3Service: S3Service,
    ) {}

    private async getCategoryHierarchy(category: Category): Promise<any[]> {
        if (!category) return [];
        const hierarchy = [{ name: category.name, fieldsConfig: category.fieldsConfig }];
        let current = category;
        
        while (current.parentId) {
            const parent = await this.categoryRepository.findOne({ 
                where: { id: current.parentId } 
            });
            if (!parent) break;
            hierarchy.unshift({ name: parent.name, fieldsConfig: parent.fieldsConfig });
            current = parent;
        }
        return hierarchy;
    }

    private async getOrCreateCategoryPath(pathOrHierarchy: string | any[], terminalFieldsConfig: any, storeId: string): Promise<string | null> {
        if (!pathOrHierarchy) return null;
        
        let hierarchy: any[] = [];
        if (typeof pathOrHierarchy === 'string') {
            const parts = pathOrHierarchy.split(' / ').map(p => p.trim()).filter(p => !!p);
            hierarchy = parts.map((name, i) => ({
                name,
                fieldsConfig: i === parts.length - 1 ? terminalFieldsConfig : null
            }));
        } else if (Array.isArray(pathOrHierarchy)) {
            hierarchy = pathOrHierarchy;
        }

        if (hierarchy.length === 0) return null;

        let lastParentId: string | null = null;
        let lastCategory: Category | null = null;

        for (const level of hierarchy) {
            const { name, fieldsConfig } = level;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // Try to find matching category at this level (Local or Global)
            let category = await this.categoryRepository.findOne({
                where: [
                    { name, storeId, parentId: lastParentId ? lastParentId : IsNull() },
                    { slug, storeId, parentId: lastParentId ? lastParentId : IsNull() },
                    { name, storeId: IsNull(), parentId: lastParentId ? lastParentId : IsNull() },
                    { slug, storeId: IsNull(), parentId: lastParentId ? lastParentId : IsNull() }
                ]
            });

            if (!category) {
                // Auto-create as private category for this store
                category = await this.categoryRepository.save(this.categoryRepository.create({
                    name,
                    slug: lastParentId ? `${slug}-${uuidv4().slice(0, 4)}` : slug, // Prevent global slug conflicts at root
                    storeId,
                    parentId: lastParentId,
                    fieldsConfig: fieldsConfig || null
                }));
            } else if (fieldsConfig) {
                // Sync fieldsConfig if it exists but has no config
                if (!category.fieldsConfig || Object.keys(category.fieldsConfig).length === 0) {
                    category.fieldsConfig = fieldsConfig;
                    await this.categoryRepository.save(category);
                }
            }

            lastParentId = category.id;
            lastCategory = category;
        }

        return lastCategory ? lastCategory.id : null;
    }

    async exportStoreProducts(storeId: string): Promise<string> {
        const products = await this.productRepository.find({
            where: { storeId, parentId: IsNull() },
            relations: ['media', 'children', 'children.media', 'category', 'bundleItems', 'bundleItems.product'],
        });

        const flatProducts = await Promise.all(products.map(async p => ({
            title: p.title,
            sku: p.sku || '',
            slug: p.slug,
            hsn_code: p.hsn_code || '',
            description: p.description || '',
            price: p.price,
            tax_rate: p.tax_rate,
            stock: p.stock,
            isActive: p.isActive,
            isFeatured: p.isFeatured,
            categoryName: p.category?.name || '',
            categorySlug: p.category?.slug || '',
            categoryHierarchyJson: p.category ? JSON.stringify(await this.getCategoryHierarchy(p.category)) : '',
            categoryFieldsConfigJson: p.category?.fieldsConfig ? JSON.stringify(p.category.fieldsConfig) : '',
            tags: (p.tags || []).join(','),
            flags: (p.flags || []).join(','),
            attributesJson: JSON.stringify(p.attributes || {}),
            seoSettingsJson: JSON.stringify(p.seo_settings || {}),
            productDetailsJson: JSON.stringify(p.product_details || {}),
            imageUrls: (p.media || []).filter(m => m.media_type === 'image').map(m => m.url).join(','),
            variantsJson: JSON.stringify(p.children?.map(v => ({
                title: v.title,
                sku: v.sku,
                price: v.price,
                stock: v.stock,
                imageUrls: (v.media || []).filter(m => m.media_type === 'image').map(m => m.url).join(','),
            })) || []),
            isBundle: p.isBundle,
            bundleItemsJson: JSON.stringify(p.bundleItems?.map(bi => ({
                sku: bi.product?.sku,
                slug: bi.product?.slug,
                title: bi.product?.title, // Added title fallback
                quantity: bi.quantity
            })) || []),
        })));

        return Papa.unparse(flatProducts);
    }

    async exportStoreProductsJson(storeId: string): Promise<any[]> {
        const products = await this.productRepository.find({
            where: { storeId, parentId: IsNull() },
            relations: ['media', 'children', 'children.media', 'category', 'bundleItems', 'bundleItems.product'],
        });

        // 1. Fetch all store tags and flags for hydration
        const [allTags, allFlags] = await Promise.all([
            this.tagRepo.find({ where: { storeId } }),
            this.flagRepo.find({ where: { storeId } })
        ]);

        const tagMap = new Map(allTags.map(t => [t.id, t]));
        const flagMap = new Map(allFlags.map(f => [f.id, f]));

        const hydrateTags = (ids: string[]) => {
            if (!ids || !Array.isArray(ids)) return [];
            return ids.map(id => {
                const t = tagMap.get(id);
                return t ? { name: t.name, slug: t.slug } : { name: id }; // Fallback to id if not found
            });
        };

        const hydrateFlags = (ids: string[]) => {
            if (!ids || !Array.isArray(ids)) return [];
            return ids.map(id => {
                const f = flagMap.get(id);
                return f ? { name: f.name, slug: f.slug, color: f.color } : { name: id };
            });
        };

        return Promise.all(products.map(async p => ({
            title: p.title,
            sku: p.sku || '',
            slug: p.slug,
            hsn_code: p.hsn_code || '',
            description: p.description || '',
            price: p.price,
            tax_rate: p.tax_rate,
            stock: p.stock,
            isActive: p.isActive,
            isFeatured: p.isFeatured,
            categoryName: p.category?.name || '',
            categorySlug: p.category?.slug || '',
            categoryHierarchy: p.category ? await this.getCategoryHierarchy(p.category) : [],
            categoryFieldsConfig: p.category?.fieldsConfig || null,
            tags: hydrateTags(p.tags),
            flags: hydrateFlags(p.flags),
            attributes: p.attributes || {},
            seo_settings: p.seo_settings || {},
            product_details: p.product_details || {},
            images: (p.media || []).map(m => ({
                url: m.url,
                media_type: m.media_type,
                is_main: m.is_main,
                sort_order: m.sort_order,
                altText: m.altText
            })),
            variants: (p.children || []).map(v => ({
                title: v.title,
                sku: v.sku,
                price: v.price,
                stock: v.stock,
                attributes: v.attributes,
                isActive: v.isActive,
                tags: hydrateTags(v.tags),
                flags: hydrateFlags(v.flags),
                images: (v.media || []).map(m => ({
                    url: m.url,
                    media_type: m.media_type,
                    is_main: m.is_main,
                    sort_order: m.sort_order,
                    altText: m.altText
                }))
            })),
            isBundle: p.isBundle,
            bundleItems: (p.bundleItems || []).map(bi => ({
                sku: bi.product?.sku,
                slug: bi.product?.slug,
                title: bi.product?.title, // Added title fallback
                quantity: bi.quantity
            }))
        })));
    }

    async importStoreProducts(storeId: string, csvData: string): Promise<{ success: number; created: number; updated: number; failed: number; errors: string[] }> {
        const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
        const rows = parsed.data as any[];
        let created = 0;
        let updated = 0;
        let failed = 0;
        const errors: string[] = [];
        const bundleDataMap = new Map<string, any[]>();

        for (const row of rows) {
            try {
                // 1. Resolve Category (Hierarchical Auto-Creation)
                let categoryId = null;
                const catHierarchyRaw = row.categoryHierarchyJson || row.categoryPath || row.categoryName;
                
                if (catHierarchyRaw) {
                    let hierarchyData = catHierarchyRaw;
                    try {
                        // Check if it's stringified JSON
                        if (catHierarchyRaw.startsWith('[') && catHierarchyRaw.endsWith(']')) {
                            hierarchyData = JSON.parse(catHierarchyRaw);
                        }
                    } catch (e) {
                         // Fallback to string path if JSON parse fails
                         hierarchyData = catHierarchyRaw;
                    }

                    let terminalFieldsConfig = null;
                    if (row.categoryFieldsConfigJson) {
                        try {
                            terminalFieldsConfig = JSON.parse(row.categoryFieldsConfigJson);
                        } catch (e) {
                            this.logger.warn(`Failed to parse terminal fieldsConfig: ${e.message}`);
                        }
                    }
                    categoryId = await this.getOrCreateCategoryPath(hierarchyData, terminalFieldsConfig, storeId);
                }

                // 2. Resolve Tags & Flags BEFORE saving product (to store their NEW IDs)
                const resolvedTagIds: string[] = [];
                const resolvedFlagIds: string[] = [];
                
                const rawTags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(t => !!t) : [];
                const rawFlags = row.flags ? row.flags.split(',').map(f => f.trim()).filter(f => !!f) : [];

                for (const tName of rawTags) {
                    let tag = await this.tagRepo.findOne({ where: { name: tName, storeId } });
                    if (!tag) {
                        tag = await this.tagRepo.save(this.tagRepo.create({ name: tName, storeId, usageCount: 1 }));
                    } else {
                        tag.usageCount = (tag.usageCount || 0) + 1;
                        await this.tagRepo.save(tag);
                    }
                    resolvedTagIds.push(tag.id);
                }

                for (const fName of rawFlags) {
                    let flag = await this.flagRepo.findOne({ where: { name: fName, storeId } });
                    if (!flag) {
                        flag = await this.flagRepo.save(this.flagRepo.create({ 
                            name: fName, 
                            storeId, 
                            slug: fName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            usageCount: 1 
                        }));
                    } else {
                        flag.usageCount = (flag.usageCount || 0) + 1;
                        await this.flagRepo.save(flag);
                    }
                    resolvedFlagIds.push(flag.id);
                }

                // 3. Prepare Product Data
                const productData: Partial<Product> = {
                    storeId,
                    title: row.title,
                    sku: row.sku || null,
                    description: row.description,
                    price: parseFloat(row.price) || 0,
                    tax_rate: parseFloat(row.tax_rate) || 0,
                    stock: row.stock && !isNaN(parseInt(row.stock)) ? parseInt(row.stock) : 0,
                    isActive: row.isActive === 'true' || row.isActive === true || row.isActive === 'TRUE',
                    isFeatured: row.isFeatured === 'true' || row.isFeatured === true || row.isFeatured === 'TRUE',
                    categoryId,
                    tags: resolvedTagIds,
                    flags: resolvedFlagIds,
                    attributes: JSON.parse(row.attributesJson || '{}'),
                    seo_settings: JSON.parse(row.seoSettingsJson || '{}'),
                    product_details: JSON.parse(row.productDetailsJson || '{}'),
                    isBundle: row.isBundle === 'true' || row.isBundle === true || row.isBundle === 'TRUE',
                };

                // Check for existing SKU in this store
                let product: Product;
                let isUpdate = false;
                if (productData.sku) {
                    const existing = await this.productRepository.findOne({ 
                        where: { sku: productData.sku, storeId } 
                    });
                    if (existing) {
                        product = Object.assign(existing, productData);
                        isUpdate = true;
                    }
                }

                if (!product) {
                    if (!productData.slug) {
                        productData.slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uuidv4().slice(0, 8);
                    }
                    product = this.productRepository.create(productData as Product);
                }

                product = await this.productRepository.save(product);
                if (isUpdate) updated++; else created++;

                // 3. Register Tags & Flags in the Master tables for the new store
                if (product.tags && product.tags.length > 0) {
                    for (const t of product.tags) {
                        const tName = typeof t === 'string' ? t.trim() : (t as any).name;
                        if (!tName) continue;
                        const existing = await this.tagRepo.findOne({ where: { name: tName, storeId } });
                        if (!existing) {
                            await this.tagRepo.save(this.tagRepo.create({ 
                                name: tName, 
                                storeId, 
                                slug: (t as any).slug || tName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                usageCount: 1 
                            }));
                        } else {
                            existing.usageCount = (existing.usageCount || 0) + 1;
                            await this.tagRepo.save(existing);
                        }
                    }
                }
                if (product.flags && product.flags.length > 0) {
                    for (const f of product.flags) {
                        const fName = typeof f === 'string' ? f.trim() : (f as any).name;
                        if (!fName) continue;
                        const existing = await this.flagRepo.findOne({ where: { name: fName, storeId } });
                        if (!existing) {
                            await this.flagRepo.save(this.flagRepo.create({ 
                                name: fName, 
                                storeId, 
                                color: (f as any).color || '#667eea',
                                slug: (f as any).slug || fName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
                                usageCount: 1 
                            }));
                        } else {
                            existing.usageCount = (existing.usageCount || 0) + 1;
                            await this.flagRepo.save(existing);
                        }
                    }
                }

                // 3. Handle Images - Download and Re-upload to S3 (Note: index updated to 4 in JSON, kept 3 here for continuity or updated to 4)
                // Let's re-number it to 4 for consistency across methods
                // 4. Handle Images - Download and Re-upload to S3
                if (row.imageUrls) {
                    const urls = row.imageUrls.split(',').map(u => u.trim()).filter(u => !!u);
                    
                    if (isUpdate && urls.length > 0) {
                        await this.mediaRepository.delete({ productId: product.id, variantId: IsNull() });
                    }

                    for (let i = 0; i < urls.length; i++) {
                        const url = urls[i];
                        try {
                            // Forced Deep Copy: Always try to re-upload to the new store's bucket
                            const response = await axios.get(url, { responseType: 'arraybuffer' });
                            const contentType = (response.headers['content-type'] as string) || 'image/png';
                            const extension = contentType.split('/')[1] || 'png';
                            const key = `stores/${storeId}/products/${uuidv4()}.${extension}`;
                            const uploadedUrl = await this.s3Service.uploadBuffer(Buffer.from(response.data), key, contentType);
                            let finalUrlForDb = uploadedUrl;
                            
                            if (finalUrlForDb) {
                                const s3Key = getS3KeyFromUrl(finalUrlForDb);
                                await this.mediaRepository.save({
                                    productId: product.id,
                                    key: s3Key,
                                    media_type: 'image',
                                    is_main: i === 0,
                                    sort_order: i,
                                });

                                // Register in Media Library
                                await this.libraryRepository.save({
                                    name: `${product.title} - Image ${i + 1}`,
                                    key: s3Key,
                                    type: 'image',
                                    mimeType: 'image/png', // Fallback
                                    size: 0, // Fallback
                                    storeId,
                                    folder: 'products',
                                    usageType: 'product_image',
                                }).catch(e => this.logger.error(`Failed to register in library: ${e.message}`));
                            }
                        } catch (imgError) {
                            this.logger.error(`Failed to migrate image ${url}: ${imgError.message}`);
                            errors.push(`Failed to migrate image for ${product.title}: ${url}`);
                            
                            // Fallback to original URL
                            try {
                                await this.mediaRepository.save({
                                    productId: product.id,
                                    key: getS3KeyFromUrl(url),
                                    media_type: 'image',
                                    is_main: i === 0,
                                    sort_order: i,
                                });
                            } catch (e) {
                                this.logger.error(`Fallback failed: ${e.message}`);
                            }
                        }
                    }
                }

                // 4. Handle Variants
                if (row.variantsJson) {
                    let variants = [];
                    try {
                        variants = JSON.parse(row.variantsJson);
                    } catch(e) {
                        this.logger.error("Failed to parse variantsJson");
                    }
                    
                    if (Array.isArray(variants)) {
                        for (const v of variants) {
                            const variantData: any = {
                                storeId,
                                parentId: product.id,
                                title: v.title,
                                sku: v.sku || null,
                                price: parseFloat(v.price) || 0,
                                stock: parseInt(v.stock) || 0,
                                attributes: v.attributes || {},
                                isActive: v.isActive !== false,
                                is_variant: true,
                            };

                            let variant: Product;
                            if (variantData.sku) {
                                variant = await this.productRepository.findOne({ 
                                    where: { sku: variantData.sku, storeId } 
                                });
                            }

                            if (variant) {
                                Object.assign(variant, variantData);
                            } else {
                                variantData.slug = (v.sku || v.title).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uuidv4().slice(0, 8);
                                variant = this.productRepository.create(variantData as Product);
                            }

                            variant = await this.productRepository.save(variant);

                            // Handle variant images
                            if (v.imageUrls) {
                                await this.mediaRepository.delete({ variantId: variant.id });
                                const vUrls = v.imageUrls.split(',').map(u => u.trim()).filter(u => !!u);
                                for (let j = 0; j < vUrls.length; j++) {
                                    const vUrl = vUrls[j];
                                    try {
                                        // Forced Deep Copy for variants
                                        const response = await axios.get(vUrl, { responseType: 'arraybuffer' });
                                        const contentType = (response.headers['content-type'] as string) || 'image/png';
                                        const key = `stores/${storeId}/products/variants/${uuidv4()}.${contentType.split('/')[1] || 'png'}`;
                                        const uploadedVUrl = await this.s3Service.uploadBuffer(Buffer.from(response.data), key, contentType);
                                        const finalVUrlForDb = uploadedVUrl;
                                        
                                        if (finalVUrlForDb) {
                                            const s3VKey = getS3KeyFromUrl(finalVUrlForDb);
                                            await this.mediaRepository.save({
                                                productId: product.id,
                                                variantId: variant.id,
                                                key: s3VKey,
                                                media_type: 'image',
                                                is_main: j === 0,
                                                sort_order: j,
                                            });

                                            // Register in library
                                            await this.libraryRepository.save({
                                                name: `${variant.title} - Image ${j + 1}`,
                                                key: s3VKey,
                                                type: 'image',
                                                mimeType: 'image/png',
                                                size: 0,
                                                storeId,
                                                folder: 'products/variants',
                                                usageType: 'product_image',
                                            }).catch(e => this.logger.error(`Failed variant lib register: ${e.message}`));
                                        }
                                    } catch (e) {
                                        this.logger.error(`Failed variant image migration: ${e.message}`);
                                        errors.push(`Failed variant image for ${variant.title}: ${vUrl}`);
                                        
                                        // Fallback to original S3 link if 403/Forbidden
                                        try {
                                            await this.mediaRepository.save({
                                                productId: product.id,
                                                variantId: variant.id,
                                                key: getS3KeyFromUrl(vUrl),
                                                media_type: 'image',
                                                is_main: j === 0,
                                                sort_order: j,
                                            });
                                        } catch (fallbackErr) {
                                            this.logger.error(`Variant image fallback failed: ${fallbackErr.message}`);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Collect bundle items for second pass
                if (product.isBundle && row.bundleItemsJson) {
                    try {
                        const items = JSON.parse(row.bundleItemsJson);
                        if (Array.isArray(items)) {
                            bundleDataMap.set(product.id, items); // Use ID as key
                        }
                    } catch (e) {
                        this.logger.error(`Failed to parse bundleItemsJson for ${product.sku}`);
                    }
                }

            } catch (err) {
                this.logger.error(`Failed to import product row: ${err.message}`);
                errors.push(`Row error (${row.title || 'Unknown'}): ${err.message}`);
                failed++;
            }
        }

        // Second Pass: Link Bundles - Resolve SKU based relationships
        if (bundleDataMap.size > 0) {
            await this.syncBundleRelationships(bundleDataMap, storeId);
        }

        return { success: created + updated, created, updated, failed, errors };
    }

    async importStoreProductsJson(storeId: string, data: any[]): Promise<{ success: number; created: number; updated: number; failed: number; errors: string[] }> {
        let created = 0;
        let updated = 0;
        let failed = 0;
        const errors: string[] = [];
        const bundleDataMap = new Map<string, any[]>();

        for (const row of data) {
            try {
                // 1. Resolve Category (Hierarchical Auto-Creation)
                let categoryId = null;
                const catHierarchy = row.categoryHierarchy || row.categoryPath || row.categoryName;
                
                if (catHierarchy) {
                    categoryId = await this.getOrCreateCategoryPath(
                        catHierarchy, 
                        row.categoryFieldsConfig || null, 
                        storeId
                    );
                }

                // 2. Resolve Tags & Flags BEFORE saving product (to store their NEW IDs)
                const resolvedTagIds: string[] = [];
                const resolvedFlagIds: string[] = [];

                const rawTags = Array.isArray(row.tags) ? row.tags : [];
                const rawFlags = Array.isArray(row.flags) ? row.flags : [];

                for (const t of rawTags) {
                    const tName = typeof t === 'string' ? t.trim() : t.name;
                    if (!tName) continue;
                    let tag = await this.tagRepo.findOne({ where: { name: tName, storeId } });
                    if (!tag) {
                        tag = await this.tagRepo.save(this.tagRepo.create({ 
                            name: tName, 
                            storeId, 
                            slug: (typeof t === 'object' && t.slug) ? t.slug : tName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            usageCount: 1 
                        }));
                    } else {
                        tag.usageCount = (tag.usageCount || 0) + 1;
                        await this.tagRepo.save(tag);
                    }
                    resolvedTagIds.push(tag.id);
                }

                for (const f of rawFlags) {
                    const fName = typeof f === 'string' ? f.trim() : f.name;
                    if (!fName) continue;
                    let flag = await this.flagRepo.findOne({ where: { name: fName, storeId } });
                    if (!flag) {
                        flag = await this.flagRepo.save(this.flagRepo.create({ 
                            name: fName, 
                            storeId, 
                            color: typeof f === 'object' ? f.color : '#667eea',
                            slug: (typeof f === 'object' && f.slug) ? f.slug : fName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            usageCount: 1 
                        }));
                    } else {
                        flag.usageCount = (flag.usageCount || 0) + 1;
                        await this.flagRepo.save(flag);
                    }
                    resolvedFlagIds.push(flag.id);
                }

                // 3. Prepare Product Data
                const productData: Partial<Product> = {
                    storeId,
                    title: row.title,
                    sku: row.sku || null,
                    hsn_code: row.hsn_code || null,
                    description: row.description,
                    price: parseFloat(row.price) || 0,
                    tax_rate: parseFloat(row.tax_rate) || 0,
                    stock: row.stock && !isNaN(parseInt(row.stock)) ? parseInt(row.stock) : 0,
                    isActive: row.isActive === true || row.isActive === 'true',
                    isFeatured: row.isFeatured === true || row.isFeatured === 'true',
                    categoryId,
                    tags: resolvedTagIds,
                    flags: resolvedFlagIds,
                    attributes: row.attributes || {},
                    seo_settings: row.seo_settings || {},
                    product_details: row.product_details || {},
                    isBundle: row.isBundle === true || row.isBundle === 'true',
                };

                // Check for existing SKU or Slug in this store
                let product: Product;
                let isUpdate = false;
                
                if (productData.sku) {
                    const existingBySku = await this.productRepository.findOne({ 
                        where: { sku: productData.sku, storeId } 
                    });
                    if (existingBySku) {
                        product = Object.assign(existingBySku, productData);
                        isUpdate = true;
                    }
                }

                if (!product) {
                    // Try by slug if SKU didn't match
                    const existingBySlug = await this.productRepository.findOne({
                        where: { slug: row.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), storeId }
                    });
                    
                    if (existingBySlug) {
                        product = Object.assign(existingBySlug, productData);
                        isUpdate = true;
                    } else {
                        if (!productData.slug) {
                            productData.slug = (row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + uuidv4().slice(0, 8);
                        } else {
                            productData.slug = row.slug;
                        }
                        product = this.productRepository.create(productData as Product);
                    }
                }

                product = await this.productRepository.save(product);
                if (isUpdate) updated++; else created++;

                // 4. Handle Images - Always re-upload to the new store's path for migration
                const images = row.images || (row.imageUrls ? row.imageUrls.split(',').map(u => ({ url: u.trim() })) : []);
                if (images && images.length > 0) {
                    if (isUpdate) {
                        await this.mediaRepository.delete({ productId: product.id, variantId: IsNull() });
                    }

                    for (let i = 0; i < images.length; i++) {
                        const img = images[i];
                        const url = typeof img === 'string' ? img : img.url;
                        if (!url) continue;

                            // Determine media type if not provided
                            let mediaType = img.media_type || 'image'; // Move outside try for scoping

                            try {
                                // Forced re-upload/migration to new store path - True Deep Copy
                                const response = await axios.get(url, { responseType: 'arraybuffer' });
                                const contentType = (response.headers['content-type'] as string) || 'image/png';
                                const extension = contentType.split('/')[1] || 'png';
                                
                                // Refine media type if possible
                                mediaType = img.media_type || (contentType.startsWith('video/') ? 'video' : 'image');
                            
                            const keyPrefix = mediaType === 'video' ? `stores/${storeId}/products/videos` : `stores/${storeId}/products`;
                            const key = `${keyPrefix}/${uuidv4()}.${extension}`;
                            const finalUrl = await this.s3Service.uploadBuffer(Buffer.from(response.data), key, contentType);
                            
                            if (finalUrl) {
                                const s3Key = getS3KeyFromUrl(finalUrl);
                                await this.mediaRepository.save({
                                    productId: product.id,
                                    key: s3Key,
                                    media_type: mediaType,
                                    is_main: img.is_main || i === 0,
                                    sort_order: img.sort_order !== undefined ? img.sort_order : i,
                                    altText: img.altText || `${product.title} - ${mediaType} ${i + 1}`,
                                });

                                // Register in Media Library
                                await this.libraryRepository.save({
                                    name: img.name || (img.altText || `${product.title} - ${mediaType} ${i + 1}`),
                                    alt: img.altText || '',
                                    key: s3Key,
                                    type: mediaType,
                                    mimeType: (response.headers['content-type'] as string) || (mediaType === 'video' ? 'video/mp4' : 'image/png'),
                                    size: parseInt((response.headers['content-length'] as string) || '0'),
                                    storeId,
                                    folder: 'products',
                                    usageType: mediaType === 'video' ? 'product_video' : 'product_image',
                                }).catch(e => this.logger.error(`Library reg failed: ${e.message}`));
                            }
                        } catch (imgError) {
                            this.logger.error(`Failed to migrate image ${url}: ${imgError.message}`);
                            errors.push(`Failed image for ${product.title}: ${url}`);
                            
                            // Robust Fallback: Still create the link to the original image
                            try {
                                const s3Key = getS3KeyFromUrl(url);
                                await this.mediaRepository.save({
                                    productId: product.id,
                                    key: s3Key,
                                    media_type: mediaType,
                                    is_main: img.is_main || i === 0,
                                    sort_order: img.sort_order !== undefined ? img.sort_order : i,
                                    altText: img.altText || `${product.title} - ${mediaType} fallback ${i + 1}`,
                                });
                            } catch (fallbackErr) {
                                this.logger.error(`Image fallback failed: ${fallbackErr.message}`);
                            }
                        }
                    }
                }

                // 4. Handle Variants
                if (row.variants && Array.isArray(row.variants)) {
                    for (const v of row.variants) {
                        const variantData: any = {
                            storeId,
                            parentId: product.id,
                            title: v.title,
                            sku: v.sku || null,
                            price: parseFloat(v.price) || 0,
                            stock: v.stock && !isNaN(parseInt(v.stock)) ? parseInt(v.stock) : 0,
                            attributes: v.attributes || {},
                            isActive: v.isActive !== false,
                            is_variant: true,
                            categoryId: categoryId, // Consistent with parent
                        };

                        // Register/Resolve Variant Tags & Flags BEFORE saving variant
                        const resolvedVTagIds: string[] = [];
                        const resolvedVFlagIds: string[] = [];
                        const vTags = Array.isArray(v.tags) ? v.tags : [];
                        const vFlags = Array.isArray(v.flags) ? v.flags : [];

                        for (const t of vTags) {
                            const tName = typeof t === 'string' ? t.trim() : t.name;
                            if (!tName) continue;
                            let tag = await this.tagRepo.findOne({ where: { name: tName, storeId } });
                            if (!tag) {
                                tag = await this.tagRepo.save(this.tagRepo.create({ 
                                    name: tName, 
                                    storeId, 
                                    slug: (typeof t === 'object' && t.slug) ? t.slug : tName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    usageCount: 1 
                                }));
                            }
                            resolvedVTagIds.push(tag.id);
                        }
                        for (const f of vFlags) {
                            const fName = typeof f === 'string' ? f.trim() : f.name;
                            if (!fName) continue;
                            let flag = await this.flagRepo.findOne({ where: { name: fName, storeId } });
                            if (!flag) {
                                flag = await this.flagRepo.save(this.flagRepo.create({ 
                                    name: fName, 
                                    storeId, 
                                    color: typeof f === 'object' ? f.color : '#667eea',
                                    slug: (typeof f === 'object' && f.slug) ? f.slug : fName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    usageCount: 1 
                                }));
                            }
                            resolvedVFlagIds.push(flag.id);
                        }

                        variantData.tags = resolvedVTagIds;
                        variantData.flags = resolvedVFlagIds;

                        let variant: Product;
                        if (variantData.sku) {
                            variant = await this.productRepository.findOne({ 
                                where: { sku: variantData.sku, storeId } 
                            });
                        }

                        if (variant) {
                            Object.assign(variant, variantData);
                        } else {
                            variantData.slug = (v.sku || v.title).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uuidv4().slice(0, 8);
                            variant = this.productRepository.create(variantData as Product);
                        }

                        variant = await this.productRepository.save(variant);

                        // Variant Images
                        const vImages = v.images || (v.imageUrls ? v.imageUrls.split(',').map(u => ({ url: u.trim() })) : []);
                        if (vImages && vImages.length > 0) {
                            await this.mediaRepository.delete({ variantId: variant.id });
                            for (let j = 0; j < vImages.length; j++) {
                                const vImg = vImages[j];
                                const vUrl = typeof vImg === 'string' ? vImg : vImg.url;
                                if (!vUrl) continue;

                                let vMediaType = vImg.media_type || 'image'; // Move outside try for scoping

                                try {
                                    // Migration to new store path for variant images - True Deep Copy
                                    const response = await axios.get(vUrl, { responseType: 'arraybuffer' });
                                    const contentType = (response.headers['content-type'] as string) || 'image/png';
                                    const extension = contentType.split('/')[1] || 'png';
                                    
                                    vMediaType = vImg.media_type || (contentType.startsWith('video/') ? 'video' : 'image');
                                    const vKeyPrefix = vMediaType === 'video' ? `stores/${storeId}/products/variants/videos` : `stores/${storeId}/products/variants`;
                                    
                                    const key = `${vKeyPrefix}/${uuidv4()}.${extension}`;
                                    const finalVUrl = await this.s3Service.uploadBuffer(Buffer.from(response.data), key, contentType);
                                    
                                    if (finalVUrl) {
                                        const s3VKey = getS3KeyFromUrl(finalVUrl);
                                        await this.mediaRepository.save({
                                            productId: product.id,
                                            variantId: variant.id,
                                            key: s3VKey,
                                            media_type: vMediaType,
                                            is_main: vImg.is_main || j === 0,
                                            sort_order: vImg.sort_order !== undefined ? vImg.sort_order : j,
                                            altText: vImg.altText || `${variant.title} - ${vMediaType} ${j + 1}`
                                        });

                                        // Register variant in library
                                        await this.libraryRepository.save({
                                            name: vImg.name || (vImg.altText || `${variant.title} - ${vMediaType} ${j + 1}`),
                                            alt: vImg.altText || '',
                                            key: s3VKey,
                                            type: vMediaType,
                                            mimeType: (response.headers['content-type'] as string) || (vMediaType === 'video' ? 'video/mp4' : 'image/png'),
                                            size: parseInt((response.headers['content-length'] as string) || '0'),
                                            storeId,
                                            folder: 'products/variants',
                                            usageType: vMediaType === 'video' ? 'product_video' : 'product_image',
                                        }).catch(e => this.logger.error(`Variant lib reg failed: ${e.message}`));
                                    }
                                } catch (e) {
                                    this.logger.error(`Failed variant image migration: ${e.message}`);
                                    errors.push(`Failed variant image for ${v.title}: ${vUrl}`);
                                    
                                    // Fallback to original
                                    try {
                                        await this.mediaRepository.save({
                                            productId: product.id,
                                            variantId: variant.id,
                                            key: getS3KeyFromUrl(vUrl),
                                            media_type: vMediaType || 'image',
                                            is_main: vImg.is_main || j === 0,
                                            sort_order: vImg.sort_order !== undefined ? vImg.sort_order : j,
                                            altText: vImg.altText || `${variant.title} fallback ${j + 1}`
                                        });
                                    } catch (fallbackErr) {
                                        this.logger.error(`Variant image fallback failed: ${fallbackErr.message}`);
                                    }
                                }
                            }
                        }
                    }
                }

                // Collect bundle items for second pass
                if (product.isBundle && row.bundleItems && Array.isArray(row.bundleItems)) {
                    bundleDataMap.set(product.id, row.bundleItems); // Use ID as key
                }
            } catch (err) {
                this.logger.error(`Product import row failed: ${err.message}`);
                errors.push(`Row error (${row.title || 'Unknown'}): ${err.message}`);
                failed++;
            }
        }

        // Second Pass: Link Bundles
        if (bundleDataMap.size > 0) {
            await this.syncBundleRelationships(bundleDataMap, storeId);
        }

        return { success: created + updated, created, updated, failed, errors };
    }

    private async syncBundleRelationships(bundleDataMap: Map<string, any[]>, storeId: string) {
        for (const [bundleId, items] of bundleDataMap.entries()) {
            try {
                const bundle = await this.productRepository.findOne({ 
                    where: { id: bundleId, storeId },
                    relations: ['bundleItems']
                });
                if (!bundle) continue;

                if (bundle.bundleItems?.length > 0) {
                    await this.bundleItemRepository.delete({ bundleId: bundle.id });
                }

                for (const item of items) {
                    const identifier = item.sku || item.slug;
                    if (!identifier) continue;

                    // Try finding by SKU then Slug then Title
                    let childProduct: Product | null = null;
                    if (item.sku) {
                        childProduct = await this.productRepository.findOne({ 
                            where: { sku: item.sku, storeId } 
                        });
                    }
                    
                    if (!childProduct && item.slug) {
                        childProduct = await this.productRepository.findOne({ 
                            where: { slug: item.slug, storeId } 
                        });
                    }

                    if (!childProduct && item.title) {
                        childProduct = await this.productRepository.findOne({ 
                            where: { title: item.title, storeId, parentId: IsNull() } 
                        });
                    }

                    if (childProduct) {
                        await this.bundleItemRepository.save(this.bundleItemRepository.create({
                            bundleId: bundle.id,
                            productId: childProduct.id,
                            quantity: parseInt(item.quantity) || 1,
                            storeId
                        }));
                    }
                }
            } catch (err) {
                this.logger.error(`Failed to sync bundle relationships for bundle ${bundleId}: ${err.message}`);
            }
        }
    }
}
