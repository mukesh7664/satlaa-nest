import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductReview } from './entities/product-review.entity';
import { ProductMedia } from './entities/product-media.entity';
import { Collection } from './entities/collection.entity';
import { CollectionProduct } from './entities/collection-product.entity';
import { Wishlist } from './entities/wishlist.entity';
import { ProductBundleItem } from './entities/product-bundle-item.entity';
import { Category } from './entities/category.entity';
import { ProductFlag } from '../admin/entities/product-flag.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { Tag } from '../admin/entities/tag.entity';
import { CatalogService } from './catalog.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AdminModule } from '../admin/admin.module';
import { CatalogController } from './catalog.controller';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { AdminProductController } from './admin-product.controller';
import { AdminCollectionController } from './admin-collection.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ProductBulkService } from './product-bulk.service';
import { CmsModule } from '../cms/cms.module';
import { Media } from '../cms/entities/media.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product,
            ProductReview,
            ProductMedia,
            Collection,
            CollectionProduct,
            Wishlist,
            Category,
            Media,
            ProductFlag,
            ProductBundleItem,
            GeneralSettings,
            Tag,
        ]),
        SubscriptionsModule,
        AdminModule,
        CmsModule,
    ],
    providers: [CatalogService, WishlistService, CategoriesService, ProductBulkService],
    controllers: [
        CatalogController,
        WishlistController,
        AdminProductController,
        AdminCollectionController,
        CategoriesController,
    ],
    exports: [CatalogService, WishlistService, CategoriesService, ProductBulkService],
})
export class CatalogModule { }
