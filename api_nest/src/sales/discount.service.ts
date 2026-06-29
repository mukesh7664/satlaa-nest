import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount, DiscountType, ApplyTo } from './entities/discount.entity';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async findAll(storeId: string) {
    return this.discountRepository.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, storeId: string) {
    return this.discountRepository.findOne({
      where: { id, storeId },
    });
  }

  async create(storeId: string, data: Partial<Discount>) {
    const discount = this.discountRepository.create({
      ...data,
      storeId,
    });
    return this.discountRepository.save(discount);
  }

  async update(id: string, storeId: string, data: Partial<Discount>) {
    await this.discountRepository.update({ id, storeId }, data);
    return this.findOne(id, storeId);
  }

  async remove(id: string, storeId: string) {
    return this.discountRepository.delete({ id, storeId });
  }

  // Logic for validation and calculation
  async validateDiscount(code: string, customerId: string | undefined, subtotal: number, storeId: string, context: { 
    items?: any[], 
    gateway?: string, 
    orderCount?: number,
    tags?: string[],
    isFirstOrder?: boolean 
  } = {}) {
    const discount = await this.discountRepository.findOne({
      where: [
        { code: code?.toUpperCase(), storeId, is_active: true },
        { code: null, storeId, is_active: true } // Handle automatic discounts if code is not provided
      ]
    });

    if (!discount && code) {
      throw new Error('Invalid discount code');
    }

    if (!discount) return null;

    const now = new Date();
    if (now < discount.starts_at || now > discount.ends_at) {
      if (code) throw new Error('Discount has expired or is not yet active');
      return null;
    }

    if (discount.usage_limit && discount.current_usage_count >= discount.usage_limit) {
      if (code) throw new Error('Discount usage limit reached');
      return null;
    }

    if (subtotal < Number(discount.min_order_value)) {
      if (code) throw new Error(`Minimum order value of ${discount.min_order_value} required`);
      return null;
    }

    // Custom Triggers / Logic
    if (discount.apply_to === ApplyTo.CUSTOMER_LOYALTY) {
      if (!customerId || !context.tags?.includes('loyal')) {
        if (code) throw new Error('This discount is for loyal customers only');
        return null;
      }
    }

    // First Order Logic
    if (context.isFirstOrder && discount.name.toLowerCase().includes('first purchase')) {
        // Handled via context
    }

    return discount;
  }

  async calculateDiscount(discount: Discount, subtotal: number, items: any[] = [], context: { gateway?: string } = {}) {
    let amount = 0;

    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        amount = (subtotal * Number(discount.value)) / 100;
        if (discount.max_discount_cap && amount > Number(discount.max_discount_cap)) {
          amount = Number(discount.max_discount_cap);
        }
        break;

      case DiscountType.FIXED_AMOUNT:
        amount = Number(discount.value);
        break;

      case DiscountType.FREE_SHIPPING:
        amount = 0; // Handled in CartService by setting shipping to 0 if this discount is applied
        break;

      case DiscountType.BOGO:
        // logic: Buy X Get Y Free.
        // For every (X+Y) items, Y cheapest items are free.
        if (discount.buy_qty && discount.get_qty) {
            const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
            const numSets = Math.floor(totalQty / (discount.buy_qty + Number(discount.get_qty)));
            
            if (numSets > 0) {
                let freeQty = numSets * Math.abs(Number(discount.get_qty));
                const sortedItems = [...items].sort((a, b) => Number(a.price) - Number(b.price));
                for (const item of sortedItems) {
                    const canTake = Math.min(item.quantity, freeQty);
                    amount += canTake * Number(item.price);
                    freeQty -= canTake;
                    if (freeQty <= 0) break;
                }
            }
        }
        break;

      case DiscountType.BUY_X_GET_Y_PERCENT:
        // Buy X Get Y% off on Zth item
        if (discount.buy_qty && discount.get_qty) {
            const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
            const numSets = Math.floor(totalQty / (discount.buy_qty + Number(discount.get_qty)));

            if (numSets > 0) {
                let discountedQty = numSets * Math.abs(Number(discount.get_qty));
                const sortedItems = [...items].sort((a, b) => Number(a.price) - Number(b.price));
                for (const item of sortedItems) {
                    const canTake = Math.min(item.quantity, discountedQty);
                    amount += canTake * (Number(item.price) * Number(discount.value) / 100);
                    discountedQty -= canTake;
                    if (discountedQty <= 0) break;
                }
            }
        }
        break;

      default:
        break;
    }

    if (amount > subtotal) amount = subtotal;
    return amount;
  }

  async incrementUsage(id: string) {
    await this.discountRepository.increment({ id }, 'current_usage_count', 1);
  }
}
