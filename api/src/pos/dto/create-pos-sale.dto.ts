import { IsArray, IsEnum, IsOptional, IsString, IsIn, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SaleChannel } from '../../sales/entities/order.entity';

export class PosSaleItemDto {
    @IsString()
    productId: string;

    @IsOptional()
    @IsString()
    variantId?: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    // price/tax are recomputed server-side; these are accepted but not trusted.
    @IsOptional()
    @IsNumber()
    price?: number;

    // Flat discount (₹) applied to this line's subtotal (UI resolves ₹/% to a ₹ amount).
    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;
}

export class PosCustomerDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    email?: string;
}

export class CreatePosSaleDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PosSaleItemDto)
    items: PosSaleItemDto[];

    @IsEnum(SaleChannel)
    saleChannel: SaleChannel;

    @IsString()
    @IsIn(['cash', 'card', 'upi'])
    paymentMethod: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PosCustomerDto)
    customer?: PosCustomerDto;

    @IsOptional()
    @IsString()
    courierId?: string;

    // Flat discount (₹) applied to the whole bill, on top of any line discounts.
    @IsOptional()
    @IsNumber()
    @Min(0)
    billDiscount?: number;

    // Cash handed over by the customer (cash payments only) — used to record change given.
    @IsOptional()
    @IsNumber()
    @Min(0)
    cashTendered?: number;
}
