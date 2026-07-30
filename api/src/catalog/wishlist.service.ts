import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistService {
    constructor(
        @InjectRepository(Wishlist)
        private wishlistRepository: Repository<Wishlist>,
    ) { }

    async getWishlist(userId: string) {
        return this.wishlistRepository.find({
            where: { userId },
            relations: ['product', 'product.media', 'product.category', 'product.children'],
            order: { createdAt: 'DESC' },
        });
    }

    async addToWishlist(userId: string, productId: string) {
        const existing = await this.wishlistRepository.findOne({
            where: { userId, productId },
        });
        if (existing) {
            throw new ConflictException('Product already in wishlist');
        }
        const item = this.wishlistRepository.create({ userId, productId });
        return this.wishlistRepository.save(item);
    }

    async removeFromWishlist(userId: string, productId: string) {
        const item = await this.wishlistRepository.findOne({
            where: { userId, productId },
        });
        if (!item) {
            throw new NotFoundException('Product not in wishlist');
        }
        await this.wishlistRepository.remove(item);
        return { success: true, message: 'Removed from wishlist' };
    }
}

