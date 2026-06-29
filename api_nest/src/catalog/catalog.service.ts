import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, IsNull } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductReview } from './entities/product-review.entity';
import { Collection } from './entities/collection.entity';
import { Category } from './entities/category.entity';
import { ProductFlag } from '../admin/entities/product-flag.entity';
import { Tag } from '../admin/entities/tag.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductReview)
        private reviewRepository: Repository<ProductReview>,
        @InjectRepository(Collection)
        private collectionRepository: Repository<Collection>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(ProductFlag)
        private flagRepository: Repository<ProductFlag>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
        @InjectRepository(GeneralSettings)
        private settingsRepository: Repository<GeneralSettings>,
    ) { }

    /**
     * Transform a PostgreSQL product entity into the legacy MongoDB format
     * that the frontend components expect.
     */
    async transformProduct(product: Product): Promise<any> {
        const settings = await this.settingsRepository.findOne({ where: { storeId: product.storeId } });
        const defaultCurrency = settings?.defaultCurrency || 'INR';

        const baseUrl = process.env.API_URL || 'http://localhost:5004';
        const getFullUrl = (url: string) => {
            if (!url) return '';
            return url.startsWith('http') ? url : `${baseUrl}/${url}`;
        };

        const iconMedia = product.media?.find(m => m.is_main) || product.media?.find(m => m.media_type === 'logo') || product.media?.[0];
        const attributes = { ...(product.attributes || {}) };
        delete attributes.costPrice;
        delete attributes.cost_price;
        delete attributes.cost;

        // Map Flags (Handle UUIDs, JSON strings, or objects to UI objects)
        let mappedFlags = [];
        if (product.flags && product.flags.length > 0) {
            const flagIds: string[] = [];
            const parsedFlags: any[] = [];
            for (const item of product.flags) {
                if (typeof item === 'string') {
                    if (item.length === 36) {
                        flagIds.push(item);
                    } else {
                        try {
                            const parsed = JSON.parse(item);
                            if (parsed && parsed.id) {
                                parsedFlags.push(parsed);
                            }
                        } catch (e) {
                            // Ignore
                        }
                    }
                } else if (item && typeof item === 'object') {
                    if ((item as any).id) {
                        parsedFlags.push(item);
                    }
                }
            }

            if (flagIds.length > 0) {
                const flags = await this.flagRepository.find({
                    where: { id: In(flagIds) }
                });
                mappedFlags = [
                    ...parsedFlags.map(f => ({ id: f.id, name: f.name, color: f.color })),
                    ...flags.map(f => ({ id: f.id, name: f.name, color: f.color }))
                ];
            } else {
                mappedFlags = parsedFlags.map(f => ({ id: f.id, name: f.name, color: f.color || '#000000' }));
            }
        }

        // Map Tags (Handle UUIDs, JSON strings, or objects to UI objects)
        let mappedTags = [];
        if (product.tags && product.tags.length > 0) {
            const tagIds: string[] = [];
            const parsedTags: any[] = [];
            for (const item of product.tags) {
                if (typeof item === 'string') {
                    if (item.length === 36) {
                        tagIds.push(item);
                    } else {
                        try {
                            const parsed = JSON.parse(item);
                            if (parsed && parsed.id) {
                                parsedTags.push(parsed);
                            }
                        } catch (e) {
                            // Ignore
                        }
                    }
                } else if (item && typeof item === 'object') {
                    if ((item as any).id) {
                        parsedTags.push(item);
                    }
                }
            }

            if (tagIds.length > 0) {
                const tags = await this.tagRepository.find({
                    where: { id: In(tagIds) }
                });
                mappedTags = [
                    ...parsedTags.map(t => ({ id: t.id, name: t.name })),
                    ...tags.map(t => ({ id: t.id, name: t.name }))
                ];
            } else {
                mappedTags = parsedTags.map(t => ({ id: t.id, name: t.name }));
            }
        }

        return {
            _id: product.id,
            parentId: product.parentId,
            slug: product.slug,
            productPricingType: product.children?.length > 0 ? 'variant' : 'simple',
            productInfo: {
                title: product.title,
                price: {
                    current: String(product.price || 0),
                    original: String(attributes.originalPrice || ''),
                    discount: attributes.discount || '',
                    per: attributes.pricePer || '',
                },
                rating: {
                    stars: attributes.ratingStars || 0,
                    reviews: attributes.ratingReviews || '0 reviews',
                },
                offers: attributes.offers || [],
            },
            icon: iconMedia ? { url: getFullUrl(iconMedia.url), alt: iconMedia.altText || product.title } : undefined,
            images: product.media?.filter(m => m.media_type === 'image' || m.media_type === 'logo' || (m.media_type === 'video' && m.sort_order !== -1)).map(img => ({
                url: getFullUrl(img.url),
                alt: img.altText || product.title,
                position: img.sort_order,
                variantId: img.variantId || null,
                type: img.media_type === 'video' ? 'video' : 'image',
            })) || [],
            video: product.media?.find(m => m.media_type === 'video' && m.sort_order === -1) ? {
                url: getFullUrl(product.media.find(m => m.media_type === 'video' && m.sort_order === -1).url),
                altText: product.media.find(m => m.media_type === 'video' && m.sort_order === -1).altText || product.title,
                type: 'video'
            } : null,
            simplePricing: {
                basePrice: Number(product.price) || 0,
                currency: defaultCurrency,
                discountedPrice: Number(product.price) || 0,
                inStock: (product.stock || 0) > 0,
                stockQuantity: product.stock,
            },
            flags: mappedFlags,
            tags: mappedTags,
            variants: product.children?.map(v => {
                const vAttr = { ...(v.attributes || {}) };
                delete vAttr.costPrice;
                delete vAttr.cost_price;
                delete vAttr.cost;
                return {
                    _id: v.id,
                    name: v.title,
                    price: Number(v.price),
                    stock: v.stock,
                    attributes: vAttr,
                    sku: v.sku,
                    isActive: v.isActive,
                    manualCurrencyPrices: v.manualCurrencyPrices || {},
                };
            }) || [],
            productDetails: this.normalizeProductDetails(product.product_details || {}),
            bundleProducts: await (async () => {
                const items = product.bundleItems || [];
                if (!items.length) return [];
                
                return items.map((item: any) => {
                    const p = item.product;
                    if (!p) return null;

                    return {
                        _id: item.id,
                        quantity: item.quantity,
                        product: {
                            _id: p.id,
                            slug: p.slug,
                            productInfo: {
                                title: p.title,
                                brand: p.attributes?.brand || ''
                            },
                            images: p.media?.filter(m => m.media_type === 'image' || m.media_type === 'logo').map(m => ({
                                url: getFullUrl(m.url),
                                alt: m.altText || p.title
                            })),
                            stock: p.children?.length > 0 ? p.children.reduce((acc, v) => acc + (v.stock || 0), 0) : p.stock,
                            inStock: p.children?.length > 0 ? p.children.some(v => v.stock === null || v.stock > 0) : (p.stock === null || (p.stock || 0) > 0),
                            price: p.price,
                            variants: p.children?.map(v => {
                                const vAttr = { ...(v.attributes || {}) };
                                delete vAttr.costPrice;
                                delete vAttr.cost_price;
                                delete vAttr.cost;
                                return {
                                    _id: v.id,
                                    name: v.title,
                                    price: Number(v.price),
                                    stock: v.stock,
                                    attributes: vAttr,
                                };
                            }) || []
                        }
                    };
                }).filter(Boolean);
            })(),
            hsn_code: product.hsn_code || '',
            is_returnable: product.is_variant ? (product.parent?.is_returnable ?? false) : (product.is_returnable ?? false),
            is_replaceable: product.is_variant ? (product.parent?.is_replaceable ?? false) : (product.is_replaceable ?? false),
            return_window_days: product.is_variant ? (product.parent?.return_window_days ?? 7) : (product.return_window_days ?? 7),
            manualCurrencyPrices: product.manualCurrencyPrices || {},
            attributes: attributes, // Pass all attributes for storefront display
            purchaseType: product.purchaseType || attributes.purchaseType || 'online',
        };
    }

    private normalizeProductDetails(details: any): any {
        if (!details) return {};
        const normalized = { ...details };
        delete normalized.costPrice;
        delete normalized.cost_price;
        delete normalized.cost;

        // Normalize whyChoose
        if (Array.isArray(normalized.whyChoose)) {
            normalized.whyChoose = {
                title: "Why Choose",
                enabled: true,
                points: normalized.whyChoose.map((p: any) => typeof p === 'string' ? { title: p, content: "" } : p)
            };
        }

        // Normalize features
        if (Array.isArray(normalized.features)) {
            normalized.features = {
                title: "Key Features",
                enabled: true,
                featurePoints: normalized.features.map((f: any) => typeof f === 'string' ? { title: f, content: "" } : f)
            };
        }

        // Normalize specifications
        if (Array.isArray(normalized.specifications)) {
            normalized.specifications = {
                title: "Specifications",
                enabled: true,
                columns: [
                    normalized.specifications.map((s: any) => 
                        (typeof s === 'object' && s.key) ? { title: s.key, value: s.value } : s
                    )
                ]
            };
        }

        // Normalize FAQ
        if (Array.isArray(normalized.faqs) || Array.isArray(normalized.faq)) {
            const questions = normalized.faqs || normalized.faq;
            normalized.faq = {
                title: "Frequently Asked Questions",
                enabled: true,
                questions: questions
            };
            delete normalized.faqs;
        }

        // Normalize Pricing
        if (Array.isArray(normalized.pricingPlans)) {
            normalized.pricing = {
                title: "Pricing Plans",
                enabled: true,
                plans: normalized.pricingPlans
            };
            delete normalized.pricingPlans;
        }

        return normalized;
    }

    async getFilters(storeId: string, categorySlugs?: string) {
        // Resolve category IDs if slugs are provided
        let targetCategoryIds: string[] = [];
        if (categorySlugs) {
            const slugs = categorySlugs.split(',').filter(Boolean);
            const foundCats = await this.categoryRepository.find({
                where: { slug: In(slugs) },
                select: ['id']
            });
            targetCategoryIds = foundCats.map(c => c.id);
        }

        // 1. Get IDs of all categories that HAVE products (for "Hide Empty" logic)
        // We also want to include those that have sub-categories with products.
        const activeCatIdsRaw = await this.productRepository.query(`
            WITH RECURSIVE category_tree AS (
                -- Base: Categories that have products
                SELECT DISTINCT "categoryId" as id
                FROM products
                WHERE "storeId" = $1 AND "isActive" = true AND "categoryId" IS NOT NULL
                
                UNION
                
                -- Recursive: Get parents of those categories
                SELECT c."parentId"
                FROM categories c
                INNER JOIN category_tree ct ON ct.id = c.id
                WHERE c."parentId" IS NOT NULL
            )
            SELECT DISTINCT id FROM category_tree
        `, [storeId]);
        const activeCategoryIds = activeCatIdsRaw.map(r => r.id);

        // 2. Fetch Category Tree (Filtering out empty branches)
        const categories = await this.categoryRepository.find({
            where: { id: In(activeCategoryIds), parentId: IsNull() },
            relations: ['children', 'children.children']
        });

        // Filter children in memory to ensure they are also "active"
        const filterTree = (cats: Category[]) => {
            return cats.filter(c => activeCategoryIds.includes(c.id)).map(c => {
                if (c.children) c.children = filterTree(c.children);
                return c;
            });
        };
        const finalCategories = filterTree(categories);

        // --- Context Clause for Attributes/Tags/Price ---
        // If a category is selected, we only want to show filters for products in that branch.
        let categoryContextQuery = '';
        const queryParams = [storeId];
        
        if (targetCategoryIds.length > 0) {
            // Get all sub-category IDs for the selected categories
            const allSubCatIdsRaw = await this.productRepository.query(`
                WITH RECURSIVE subcats AS (
                    SELECT id FROM categories WHERE id = ANY($1)
                    UNION
                    SELECT c.id FROM categories c INNER JOIN subcats sc ON c."parentId" = sc.id
                )
                SELECT id FROM subcats
            `, [targetCategoryIds]);
            const allSubCatIds = allSubCatIdsRaw.map(r => r.id);
            
            categoryContextQuery = ` AND "categoryId" = ANY($2)`;
            queryParams.push(allSubCatIds);
        }

        // 3. Price Range (Contextual)
        const priceRange = await this.productRepository.query(`
            SELECT MIN(price) as min, MAX(price) as max
            FROM products
            WHERE "storeId" = $1 AND "isActive" = true AND "parentId" IS NULL
            ${categoryContextQuery}
        `, queryParams);

        // 4. Attributes (Contextual)
        const attributesRaw = await this.productRepository.query(`
            SELECT key, json_agg(DISTINCT TRIM(v)) as values
            FROM (
                SELECT key, 
                       jsonb_array_elements_text(
                           CASE 
                               WHEN jsonb_typeof(value) = 'array' THEN value 
                               ELSE jsonb_build_array(value) 
                           END
                       ) as v
                FROM (
                    SELECT (jsonb_each(attributes)).*
                    FROM products
                    WHERE "storeId" = $1 AND "isActive" = true
                    ${categoryContextQuery}
                ) AS pairs
            ) AS flat_pairs
            WHERE v IS NOT NULL AND v != ''
            GROUP BY key
        `, queryParams);

        const attributes = attributesRaw.reduce((acc, curr) => {
            acc[curr.key] = curr.values;
            return acc;
        }, {});

        // 5. Tags (Contextual) - Handle both string UUIDs and JSON objects
        const tags = await this.productRepository.query(`
            SELECT DISTINCT t.name, t.slug, t.id
            FROM tags t
            WHERE t.id IN (
                SELECT DISTINCT (CASE 
                    WHEN jsonb_typeof(tag_elem) = 'object' THEN tag_elem->>'id'
                    ELSE tag_elem#>>'{}' 
                END)::uuid
                FROM (
                    SELECT jsonb_array_elements(tags) as tag_elem
                    FROM products
                    WHERE "storeId" = $1 AND "isActive" = true AND tags IS NOT NULL
                    ${categoryContextQuery}
                ) as elems
            )
        `, queryParams);

        // 6. Collections
        const collections = await this.collectionRepository.find({
            where: { storeId, isActive: true, showInFilterBar: true },
            order: { sortOrder: 'ASC' }
        });

        return {
            categories: finalCategories,
            priceRange: {
                min: Number(priceRange[0]?.min) || 0,
                max: Number(priceRange[0]?.max) || 0
            },
            attributes,
            tags,
            collections
        };
    }

    // ================= PRODUCTS =================

    async findAllProductsPaginated(params: any) {
        const { page = 1, limit = 12, brand, category, collection, minPrice, maxPrice, rating, search, sortBy = 'createdAt', sortOrder = 'DESC', storeId } = params;

        const queryBuilder = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.media', 'media')
            .leftJoinAndSelect('product.children', 'children')
            .leftJoinAndSelect('product.productCollections', 'collectionProducts')
            .leftJoinAndSelect('collectionProducts.collection', 'collections')
            .where('product.storeId = :storeId', { storeId })
            .andWhere('product.isActive = true')
            .andWhere('product.parentId IS NULL');

        if (brand) {
            // Brand filtering is now disabled or ignored
        }

        if (category) {
            const catSlugs = Array.isArray(category) ? category : category.split(',');
            const isUUID = catSlugs.every(s => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s));
            if (isUUID) {
                queryBuilder.andWhere('product.categoryId IN (:...catSlugs)', { catSlugs });
            } else {
                queryBuilder.leftJoin('product.category', 'cat')
                    .andWhere('cat.slug IN (:...catSlugs)', { catSlugs });
            }
        }

        if (collection) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(collection);
            if (isUUID) {
                queryBuilder.andWhere('collections.id = :collection', { collection });
            } else {
                queryBuilder.andWhere('collections.slug = :collection', { collection });
            }
        }

        if (minPrice !== undefined) {
            queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
        }

        if (maxPrice !== undefined) {
            queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
        }

        if (search) {
            queryBuilder.andWhere('(product.title ILIKE :search OR product.description ILIKE :search)', { search: `%${search}%` });
        }

        // Ratings Filter
        if (rating) {
            // This assumes product has a rating field or we calculate from reviews. 
            // For now, we'll use a placeholder or check attributes if stored there.
            // queryBuilder.andWhere('product.rating >= :rating', { rating });
        }

        // Tags Filter (Multi-select)
        if (params.tags) {
            const tagList = Array.isArray(params.tags) ? params.tags : params.tags.split(',');
            queryBuilder.andWhere('product.tags ?| ARRAY[:...tagList]', { tagList });
        }

        // Flags Filter (Multi-select)
        if (params.flags) {
            const flagList = Array.isArray(params.flags) ? params.flags : params.flags.split(',');
            queryBuilder.andWhere('product.flags ?| ARRAY[:...flagList]', { flagList });
        }

        // Dynamic Attributes Filter (JSONB)
        // Expected params format: { attr_color: 'Red,Blue', attr_size: 'XL' }
        Object.keys(params).forEach(key => {
            if (key.startsWith('attr_')) {
                const attrKey = key.replace('attr_', '');
                const attrValues = Array.isArray(params[key]) ? params[key] : params[key].split(',');
                
                // Use PostgreSQL JSONB operator to check if any of the values exist for that key
                // Note: This requires the values to be exactly as stored in JSONB
                queryBuilder.andWhere(`product.attributes->>:attrKey${key} IN (:...attrValues${key})`, { 
                    [`attrKey${key}`]: attrKey, 
                    [`attrValues${key}`]: attrValues 
                });
            }
        });

        // Map frontend sort fields to database columns
        let sortField = sortBy;
        if (sortBy === 'simplePricing.basePrice') {
            sortField = 'price';
        }

        const normalizedSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        queryBuilder.orderBy(`product.${sortField}`, normalizedSortOrder)
            .skip((page - 1) * limit)
            .take(limit);

        const [products, total] = await queryBuilder.getManyAndCount();

        const mappedProducts = await Promise.all(products.map(p => this.transformProduct(p)));

        return {
            products: mappedProducts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async findOneProduct(id: string, storeId: string) {
        return this.productRepository.findOne({
            where: { id, storeId, isActive: true },
            relations: ['productCollections', 'productCollections.collection', 'media', 'children', 'category', 'bundleItems', 'bundleItems.product', 'bundleItems.product.media', 'bundleItems.product.children'],
        });
    }

    async findProductBySlug(slug: string, storeId: string) {
        return this.productRepository.findOne({
            where: { slug, storeId, isActive: true },
            relations: ['productCollections', 'productCollections.collection', 'media', 'children', 'category', 'bundleItems', 'bundleItems.product', 'bundleItems.product.media', 'bundleItems.product.children'],
        });
    }

    async createProduct(dto: any, storeId: string) {
        const { variants, ...productData } = dto;

        // Generate slug if not provided
        if (!productData.slug) {
            const base = productData.sku || productData.title;
            if (base) {
                productData.slug = base
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);
            }
        }

        const product = this.productRepository.create({
            ...productData,
            storeId,
        });

        const savedProduct: any = await this.productRepository.save(product);

        // Save Variants as Child Products
        if (variants && Array.isArray(variants)) {
            for (const v of variants) {
                const variantData: any = {
                    ...v,
                    storeId,
                    parentId: savedProduct.id,
                    productStructureType: 'variant'
                };
                await this.productRepository.save(variantData);
            }
        }

        return savedProduct;
    }

    // ================= COLLECTIONS =================

    async findAllCollectionsPaginated(page: number, limit: number, type: string, search: string, storeId: string) {
        const where: any = { storeId, isActive: true };
        if (type) where.type = type;
        if (search) where.name = Like(`%${search}%`);

        const [collections, total] = await this.collectionRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { sortOrder: 'ASC' }
        });

        return {
            collections,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async findFilterCollections(storeId: string) {
        return this.collectionRepository.find({
            where: { storeId, isActive: true, showInFilterBar: true },
            order: { sortOrder: 'ASC' }
        });
    }

    async findCollectionBySlug(slug: string, page: number, limit: number, storeId: string) {
        const collection = await this.collectionRepository.findOne({
            where: { slug, storeId, isActive: true },
            relations: ['collectionProducts', 'collectionProducts.product', 'collectionProducts.product.media'],
        });

        if (!collection) throw new NotFoundException('Collection not found');

        const products = await Promise.all(
            collection.collectionProducts
                ?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map(cp => this.transformProduct(cp.product)) || []
        );

        // Sanitize collection products to avoid leaking raw product entities with costPrice
        if (collection.collectionProducts) {
            collection.collectionProducts = collection.collectionProducts.map(cp => {
                const { product, ...rest } = cp;
                return rest as any;
            });
        }

        const total = products.length;
        
        return {
            collection,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async findCollectionById(id: string, page: number, limit: number, storeId: string) {
        const collection = await this.collectionRepository.findOne({
            where: { id, storeId, isActive: true },
            relations: ['collectionProducts', 'collectionProducts.product', 'collectionProducts.product.media'],
        });

        if (!collection) throw new NotFoundException('Collection not found');

        const products = await Promise.all(
            collection.collectionProducts
                ?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map(cp => this.transformProduct(cp.product)) || []
        );

        // Sanitize collection products to avoid leaking raw product entities with costPrice
        if (collection.collectionProducts) {
            collection.collectionProducts = collection.collectionProducts.map(cp => {
                const { product, ...rest } = cp;
                return rest as any;
            });
        }

        const total = products.length;

        return {
            collection,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    // ================= INVENTORY MANAGEMENT =================

    async decrementStock(productId: string, quantity: number, storeId: string, bundleSelections?: Record<string, string>) {
        // We assume validation has been called before for multiple items, 
        // but we still check here for atomicity on single items.
        const product = await this.productRepository.findOne({
            where: { id: productId, storeId },
            relations: ['bundleItems', 'bundleItems.product']
        });

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        // 1. If it's a bundle, decrement each child item
        if (product.isBundle && product.bundleItems && product.bundleItems.length > 0) {
            for (const item of product.bundleItems) {
                const selectedVariantId = bundleSelections ? bundleSelections[item.id] : null;
                const targetId = selectedVariantId || item.productId;
                await this.decrementStock(targetId, item.quantity * quantity, storeId);
            }
        }

        // 2. Decrement the product itself
        if (product.stock !== null && product.stock !== undefined) {
            if (product.stock < quantity) {
                throw new Error(`Insufficient stock for product: ${product.title}. Available: ${product.stock}, Requested: ${quantity}`);
            }
            product.stock -= quantity;
            await this.productRepository.save(product);
        }
    }

    async validateStock(productId: string, quantity: number, storeId: string, bundleSelections?: Record<string, string>) {
        const product = await this.productRepository.findOne({
            where: { id: productId, storeId },
            relations: ['bundleItems', 'bundleItems.product']
        });

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        if (product.isBundle && product.bundleItems && product.bundleItems.length > 0) {
            for (const item of product.bundleItems) {
                const selectedVariantId = bundleSelections ? bundleSelections[item.id] : null;
                const targetId = selectedVariantId || item.productId;
                await this.validateStock(targetId, item.quantity * quantity, storeId);
            }
        }

        if (product.stock !== null && product.stock !== undefined) {
            if (product.stock < quantity) {
                throw new Error(`Insufficient stock for product: ${product.title}. Available: ${product.stock}, Requested: ${quantity}`);
            }
        }
        return true;
    }

    async incrementStock(productId: string, quantity: number, storeId: string, bundleSelections?: Record<string, string>) {
        const product = await this.productRepository.findOne({
            where: { id: productId, storeId },
            relations: ['bundleItems', 'bundleItems.product']
        });

        if (!product) return; // Silent return if product deleted

        // 1. If it's a bundle, increment each child item
        if (product.isBundle && product.bundleItems && product.bundleItems.length > 0) {
            for (const item of product.bundleItems) {
                const selectedVariantId = bundleSelections ? bundleSelections[item.id] : null;
                const targetId = selectedVariantId || item.productId;
                await this.incrementStock(targetId, item.quantity * quantity, storeId);
            }
        }

        // 2. Increment the product itself if it has stock tracking
        if (product.stock !== null && product.stock !== undefined) {
            product.stock += quantity;
            await this.productRepository.save(product);
        }
    }

    async findProductsByIds(ids: string[], storeId: string): Promise<Product[]> {
        return this.productRepository.find({
            where: { id: In(ids), storeId },
            relations: [
                'media', 
                'children', 
                'parent',
                'bundleItems', 
                'bundleItems.product', 
                'bundleItems.product.media', 
                'bundleItems.product.children'
            ]
        });
    }

    // ================= REVIEWS =================

    async findApprovedReviews(productId: string, storeId: string) {
        return this.reviewRepository.find({
            where: { productId, storeId, status: 'approved' },
            order: { createdAt: 'DESC' }
        });
    }

    async submitReview(productId: string, storeId: string, dto: { customerName: string; customerEmail?: string; rating: number; comment: string }) {
        if (dto.customerEmail) {
            const existing = await this.reviewRepository.findOne({
                where: { productId, storeId, customerEmail: dto.customerEmail }
            });
            if (existing) {
                throw new BadRequestException('You have already submitted a review for this product.');
            }
        }
        const review = this.reviewRepository.create({
            ...dto,
            productId,
            storeId,
            status: 'pending' // Moderation by default
        });
        return this.reviewRepository.save(review);
    }

    async findAdminReviews(productId: string, storeId: string) {
        return this.reviewRepository.find({
            where: { productId, storeId },
            order: { createdAt: 'DESC' }
        });
    }

    async createAdminReview(productId: string, storeId: string, dto: { customerName: string; customerEmail?: string; rating: number; comment: string }) {
        if (dto.customerEmail) {
            const existing = await this.reviewRepository.findOne({
                where: { productId, storeId, customerEmail: dto.customerEmail }
            });
            if (existing) {
                throw new BadRequestException('A review from this email address already exists for this product.');
            }
        }
        const review = this.reviewRepository.create({
            ...dto,
            productId,
            storeId,
            status: 'approved' // Automatically approved
        });
        return this.reviewRepository.save(review);
    }

    async updateReviewStatus(reviewId: string, storeId: string, status: string) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId, storeId } });
        if (!review) throw new NotFoundException('Review not found');
        review.status = status;
        return this.reviewRepository.save(review);
    }

    async deleteReview(reviewId: string, storeId: string) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId, storeId } });
        if (!review) throw new NotFoundException('Review not found');
        return this.reviewRepository.remove(review);
    }
}
