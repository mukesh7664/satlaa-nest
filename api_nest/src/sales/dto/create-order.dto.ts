import { IsObject, IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';

export class CreateOrderDto {
    @IsObject()
    shippingAddress: Record<string, any>;

    @IsObject()
    billingAddress: Record<string, any>;

    @IsOptional()
    @IsObject()
    paymentInfo?: Record<string, any>;

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    orderType?: string;

    @IsOptional()
    @IsBoolean()
    sameAsBilling?: boolean;

    @IsOptional()
    @IsArray()
    items?: any[];

    @IsOptional()
    @IsString()
    discountCode?: string;
}
