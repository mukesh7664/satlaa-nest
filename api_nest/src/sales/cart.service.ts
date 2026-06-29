import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Cart, CartStatus } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { DiscountType } from './entities/discount.entity';
import { DiscountService } from './discount.service';
import { GeneralSettings } from '../admin/entities/general-settings.entity';

@Injectable()
export class CartService implements OnModuleInit {
    constructor(
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,
        @InjectRepository(GeneralSettings)
        private settingsRepository: Repository<GeneralSettings>,
        private discountService: DiscountService,
        private dataSource: DataSource,
    ) { }

    async onModuleInit() {
        try {
            console.log('CartService initialized, running DB cleanup...');
            const columns = [
                'productName',
                'productImage',
                'productType',
                'brandId',
                'brandName'
            ];

            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();

            for (const col of columns) {
                await queryRunner.query(`ALTER TABLE cart_items DROP COLUMN IF EXISTS "${col}"`);
            }

            await queryRunner.release();
            console.log('Cart Items DB cleanup successful.');
        } catch (error) {
            console.error('Cart Items DB cleanup failed:', error);
        }
    }
    
    /**
     * Merges a guest cart (identified by sessionId) into a user's cart (identified by customerId).
     * Follows Path A (Promotion) or Path B (Item Merge) logic.
     */
    async mergeCarts(storeId: string, customerId: string, sessionId: string) {
        if (!sessionId) return this.findOrCreateCart(storeId, customerId);

        return await this.dataSource.transaction(async (manager) => {
            const cartRepo = manager.getRepository(Cart);
            const itemRepo = manager.getRepository(CartItem);

            // 1. Find the guest cart
            const guestCart = await cartRepo.findOne({
                where: { storeId, sessionId, status: CartStatus.ACTIVE },
                relations: ['items'],
            });

            // If no guest cart or it's empty, just find/create user cart
            if (!guestCart || guestCart.items.length === 0) {
                const userCart = await this.findOrCreateCart(storeId, customerId);
                if (guestCart) await cartRepo.remove(guestCart);
                return userCart;
            }

            // 2. Find the user cart
            const userCart = await cartRepo.findOne({
                where: { storeId, customerId, status: CartStatus.ACTIVE },
                relations: ['items'],
            });

            // PATH A: If user cart does not exist, promote the guest cart to user cart
            if (!userCart) {
                guestCart.customerId = customerId;
                guestCart.sessionId = null; // Strictly separate
                await cartRepo.save(guestCart);
                return this.recalculateCart(guestCart, manager);
            }

            // PATH B: If user cart exists, merge items
            for (const guestItem of guestCart.items) {
                const existingUserItem = userCart.items.find(
                    item => item.productId === guestItem.productId && item.variantId === guestItem.variantId
                );

                if (existingUserItem) {
                    existingUserItem.quantity += guestItem.quantity;
                    existingUserItem.subtotal = Number(existingUserItem.price) * existingUserItem.quantity;
                    await itemRepo.save(existingUserItem);
                    await itemRepo.remove(guestItem);
                } else {
                    guestItem.cartId = userCart.id;
                    await itemRepo.save(guestItem);
                }
            }

            // Transfer discount if user cart has none
            if (!userCart.discountCode && guestCart.discountCode) {
                userCart.discountCode = guestCart.discountCode;
            }

            // Delete guest cart after items are moved
            await cartRepo.delete(guestCart.id);

            // Reload user cart with fresh item list
            const updatedUserCart = await cartRepo.findOne({
                where: { id: userCart.id },
                relations: ['items'],
            });
            return this.recalculateCart(updatedUserCart, manager);
        });
    }

    /**
     * Finds an existing active cart or creates a new one.
     * Strictly separates customerId and sessionId.
     */
    async findOrCreateCart(storeId: string, customerId?: string, sessionId?: string, manager?: EntityManager): Promise<Cart> {
        const cartRepo = manager ? manager.getRepository(Cart) : this.cartRepository;
        const whereCondition: any = { storeId, status: CartStatus.ACTIVE };
        if (customerId) {
            whereCondition.customerId = customerId;
        } else {
            whereCondition.sessionId = sessionId;
        }

        let cart = await cartRepo.findOne({
            where: whereCondition,
            relations: [
                'items', 
                'items.product', 
                'items.product.media', 
                'items.product.parent', 
                'items.product.parent.media',
                'items.product.bundleItems',
                'items.product.bundleItems.product'
            ],
        });

        // Cleanup orphaned items (products that no longer exist)
        if (cart && cart.items && cart.items.length > 0) {
            const validItems = cart.items.filter(item => !!item.product);
            if (validItems.length !== cart.items.length) {
                const orphanedItems = cart.items.filter(item => !item.product);
                if (manager) {
                    await manager.remove(orphanedItems);
                } else {
                    await this.cartItemRepository.remove(orphanedItems);
                }
                cart.items = validItems;
                // Trigger recalculation if items were removed
                return this.recalculateCart(cart, manager);
            }
        }
        if (!cart) {
            const settings = await this.settingsRepository.findOne({ where: { storeId } });
            const defaultCurrency = settings?.defaultCurrency || 'INR';

            cart = cartRepo.create({
                storeId,
                customerId,
                sessionId: customerId ? null : sessionId,
                items: [],
                totals: {
                    subtotal: 0,
                    discount: 0,
                    discountAmount: 0,
                    tax: 0,
                    shippingCharges: 0,
                    total: 0,
                    currency: defaultCurrency,
                },
            });
            await cartRepo.save(cart);
        } else {
            // Ensure strict separation for found cart
            if (customerId && cart.sessionId !== null) {
                cart.sessionId = null;
                await cartRepo.save(cart);
            }
        }
        return cart;
    }
    async addToCart(storeId: string, customerId: string | undefined, sessionId: string | undefined, itemDto: AddCartItemDto) {
        return await this.dataSource.transaction(async (manager) => {
            const cart = await this.findOrCreateCart(storeId, customerId, sessionId, manager);

            let cartItem = cart.items.find(
                item => 
                    item.productId === itemDto.productId && 
                    item.variantId === (itemDto.variantId || null) &&
                    JSON.stringify(item.bundleSelections || {}) === JSON.stringify(itemDto.bundleSelections || {})
            );

            if (cartItem) {
                cartItem.quantity += itemDto.quantity;
                cartItem.subtotal = Number(cartItem.price) * cartItem.quantity;
                await manager.save(cartItem);
            } else {
                cartItem = manager.getRepository(CartItem).create({
                    cartId: cart.id,
                    productId: itemDto.productId,
                    variantId: itemDto.variantId,
                    price: itemDto.price,
                    quantity: itemDto.quantity,
                    selectedVariant: itemDto.selectedVariant,
                    bundleSelections: itemDto.bundleSelections,
                    subtotal: Number(itemDto.price) * itemDto.quantity,
                    notes: itemDto.notes,
                });
                await manager.save(cartItem);
                cart.items.push(cartItem);
            }

            return this.recalculateCart(cart, manager);
        });
    }

    async removeItem(storeId: string, customerId: string | undefined, sessionId: string | undefined, cartItemId: string) {
        return await this.dataSource.transaction(async (manager) => {
            const cart = await this.findOrCreateCart(storeId, customerId, sessionId, manager);

            const itemToRemove = cart.items.find(item => item.id === cartItemId);
            if (itemToRemove) {
                await manager.remove(itemToRemove);
                cart.items = cart.items.filter(item => item.id !== itemToRemove.id);
            }

            return this.recalculateCart(cart, manager);
        });
    }

    async updateItemQuantity(storeId: string, customerId: string | undefined, sessionId: string | undefined, cartItemId: string, quantity: number) {
        return await this.dataSource.transaction(async (manager) => {
            const cart = await this.findOrCreateCart(storeId, customerId, sessionId, manager);

            const item = cart.items.find(i => i.id === cartItemId);
            if (!item) throw new Error('Item not found in cart');

            if (quantity <= 0) {
                return this.removeItem(storeId, customerId, sessionId, cartItemId);
            }

            item.quantity = quantity;
            item.subtotal = Number(item.price) * item.quantity;
            await manager.save(item);

            return this.recalculateCart(cart, manager);
        });
    }

    async clearCart(storeId: string, customerId: string | undefined, sessionId: string | undefined) {
        const cart = await this.findOrCreateCart(storeId, customerId, sessionId);
        
        if (cart.items.length > 0) {
            await this.cartItemRepository.remove(cart.items);
            cart.items = [];
        }

        const settings = await this.settingsRepository.findOne({ where: { storeId } });
        const defaultCurrency = settings?.defaultCurrency || 'INR';

        cart.totals = {
            subtotal: 0,
            discount: 0,
            discountAmount: 0,
            tax: 0,
            shippingCharges: 0,
            total: 0,
            currency: defaultCurrency,
        };
        return this.cartRepository.save(cart);
    }

    async applyDiscount(storeId: string, customerId: string | undefined, sessionId: string | undefined, code: string) {
        const cart = await this.findOrCreateCart(storeId, customerId, sessionId);
        const subtotal = cart.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        
        await this.discountService.validateDiscount(code, customerId, subtotal, storeId);

        cart.discountCode = code;
        return this.recalculateCart(cart);
    }

    async removeDiscount(storeId: string, customerId: string | undefined, sessionId: string | undefined) {
        const cart = await this.findOrCreateCart(storeId, customerId, sessionId);
        cart.discountCode = null;
        cart.appliedDiscountId = null;
        return this.recalculateCart(cart);
    }

    /**
     * Recalculates cart totals and itemCount.
     * Supports EntityManager for transactions.
     */
    private async recalculateCart(cart: Cart, manager?: EntityManager): Promise<Cart> {
        const cartRepo = manager ? manager.getRepository(Cart) : this.cartRepository;
        const itemRepo = manager ? manager.getRepository(CartItem) : this.cartItemRepository;
        
        // RE-FETCH items from DB to ensure absolute fresh data before calculating
        const items = await itemRepo.find({ 
            where: { cartId: cart.id },
            relations: ['product', 'product.media', 'product.parent', 'product.parent.media']
        });
        cart.items = items;
        
        // Calculate subtotal
        cart.totals.subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

        cart.totals.tax = items.reduce((sum, item) => {
            const product = item.product || item.product?.parent;
            const rate = Number(product?.tax_rate || 0);
            return sum + (Number(item.subtotal) * rate / 100);
        }, 0);
        cart.totals.discountAmount = 0;

        // Apply Automatic & Manual Discounts
        try {
            const discount = await this.discountService.validateDiscount(
                cart.discountCode,
                cart.customerId,
                cart.totals.subtotal,
                cart.storeId,
                { items: cart.items }
            );

            if (discount) {
                cart.totals.discountAmount = await this.discountService.calculateDiscount(discount, cart.totals.subtotal, cart.items);
                cart.appliedDiscountId = discount.id;

                // Handle FREE_SHIPPING type
                if (discount.type === DiscountType.FREE_SHIPPING) {
                    cart.totals.shippingCharges = 0;
                }
            } else {
                cart.discountCode = null;
                cart.appliedDiscountId = null;
            }
        } catch (error) {
            cart.discountCode = null;
            cart.appliedDiscountId = null;
            cart.totals.discountAmount = 0;
        }

        cart.totals.shippingCharges = 0;
        cart.totals.discount = 0;
        cart.totals.total = cart.totals.subtotal + cart.totals.tax - (cart.totals.discount || 0) - (cart.totals.discountAmount || 0) + (cart.totals.shippingCharges || 0);

        if (cart.totals.total < 0) cart.totals.total = 0;

        return cartRepo.save(cart);
    }
}
