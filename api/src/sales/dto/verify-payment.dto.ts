import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPaymentDto {
    @ApiProperty({ description: 'Internal Order ID' })
    @IsString()
    @IsOptional()
    orderId?: string;

    @ApiProperty({ description: 'Razorpay Payment ID' })
    @IsString()
    @IsOptional()
    razorpayPaymentId?: string;

    @ApiProperty({ description: 'Razorpay Order ID' })
    @IsString()
    @IsOptional()
    razorpayOrderId?: string;

    @ApiProperty({ description: 'Razorpay Signature' })
    @IsString()
    @IsOptional()
    razorpaySignature?: string;

    // Also accept snake_case from Razorpay callbacks
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    razorpay_payment_id?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    razorpay_order_id?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    razorpay_signature?: string;
}

export class UploadPaymentProofDto {
    @ApiProperty({ description: 'Order ID' })
    @IsString()
    orderId: string;

    @ApiPropertyOptional({ description: 'Payment proof URL or base64' })
    @IsString()
    @IsOptional()
    paymentProof?: string;

    @ApiPropertyOptional({ description: 'Transaction details / notes' })
    @IsString()
    @IsOptional()
    transactionDetails?: string;
}

export class UpdatePaymentStatusDto {
    @ApiProperty({ description: 'Payment status', enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'] })
    @IsString()
    paymentStatus: string;

    @ApiPropertyOptional({ description: 'Order status override' })
    @IsString()
    @IsOptional()
    orderStatus?: string;

    @ApiPropertyOptional({ description: 'Admin notes' })
    @IsString()
    @IsOptional()
    adminNotes?: string;
}

export class InitiateRefundDto {
    @ApiPropertyOptional({ description: 'Partial refund amount (omit for full refund)' })
    @IsOptional()
    amount?: number;

    @ApiPropertyOptional({ description: 'Refund reason' })
    @IsString()
    @IsOptional()
    reason?: string;
}
