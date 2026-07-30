import { IsString, IsOptional, IsBoolean, IsIn, IsNotEmpty } from 'class-validator';

export class UpsertStorePaymentConfigDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['razorpay', 'stripe'])
    provider: string;

    @IsString()
    @IsOptional()
    keyId?: string;

    @IsString()
    @IsOptional()
    keySecret?: string;

    @IsString()
    @IsOptional()
    webhookSecret?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsBoolean()
    @IsOptional()
    isTestMode?: boolean;
}
