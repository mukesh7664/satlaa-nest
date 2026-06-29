import { IsString, IsInt, Min, IsOptional, IsNumber, IsObject } from 'class-validator';

export class AddCartItemDto {
    @IsString()
    productId: string;
    
    @IsString()
    @IsOptional()
    variantId?: string;

    @IsNumber()
    price: number;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsString()
    @IsOptional()
    quantityLabel?: string;

    @IsString()
    @IsOptional()
    purchaseType?: string;

    @IsObject()
    @IsOptional()
    selectedVariant?: {
        userType?: string;
        planName?: string;
        planSlug?: string;
        billingCycle?: 'monthly' | 'yearly';
        pricePerUnit: number;
        numberOfUsers?: number;
        numberOfLicenses?: number;
    };

    @IsString()
    @IsOptional()
    notes?: string;

    @IsObject()
    @IsOptional()
    bundleSelections?: Record<string, string>;
}
