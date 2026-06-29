import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../catalog/entities/product.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Store, Product])
    ],
    controllers: [MarketplaceController],
    providers: [MarketplaceService],
    exports: [MarketplaceService]
})
export class MarketplaceModule {}
