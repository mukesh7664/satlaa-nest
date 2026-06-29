import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ReturnRequest, ReturnRequestStatus, ReturnRequestType } from './entities/return-request.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class ReturnRequestService {
    private readonly logger = new Logger(ReturnRequestService.name);

    constructor(
        @InjectRepository(ReturnRequest)
        private returnRequestRepository: Repository<ReturnRequest>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        private orderService: OrderService,
        private paymentService: PaymentService,
        private catalogService: CatalogService,
    ) {}

    async createBulkRequest(
        customerId: string,
        storeId: string,
        data: {
            orderId: string;
            type: ReturnRequestType;
            reason: string;
            images?: string[];
            customerNotes?: string;
            itemIds?: string[];
            replacementVariantId?: string;
            replacementVariantInfo?: any;
        },
    ) {
        const order = await this.orderRepository.findOne({
            where: { id: data.orderId, customerId, storeId },
            relations: ['items'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.DELIVERED && (order as any).status !== 'completed') {
            throw new BadRequestException('Only delivered orders can be returned or replaced');
        }

        const itemsToProcess = data.itemIds 
            ? order.items.filter(item => data.itemIds.includes(item.id))
            : order.items;

        if (itemsToProcess.length === 0) {
            throw new BadRequestException('No items found to return/replace');
        }

        // Update order status: Partial or Full
        const isPartial = itemsToProcess.length < order.items.length;
        if (data.type === ReturnRequestType.RETURN) {
            order.status = isPartial ? OrderStatus.PARTIALLY_RETURNED : OrderStatus.RETURN_REQUESTED;
        } else {
            order.status = isPartial ? OrderStatus.PARTIALLY_REPLACED : OrderStatus.REPLACEMENT_REQUESTED;
        }
        await this.orderRepository.save(order);

        if (itemsToProcess.length === 0) {
            throw new BadRequestException('No items found to return/replace');
        }

        const results = [];
        for (const item of itemsToProcess) {
            // Check if already has a pending request
            const existing = await this.returnRequestRepository.findOne({
                where: { orderItemId: item.id, status: ReturnRequestStatus.PENDING },
            });

            if (existing) continue;

            const request = this.returnRequestRepository.create({
                orderId: data.orderId,
                orderItemId: item.id,
                type: data.type,
                reason: data.reason,
                images: data.images,
                customerNotes: data.customerNotes,
                customerId,
                storeId,
                status: ReturnRequestStatus.PENDING,
                replacementVariantId: data.replacementVariantId,
                replacementVariantInfo: data.replacementVariantInfo,
                refundAmount: data.type === ReturnRequestType.RETURN ? Number(item.totalPrice) : 0,
            });
            results.push(await this.returnRequestRepository.save(request));
        }

        return results;
    }

    async createRequest(
        customerId: string,
        storeId: string,
        data: {
            orderId: string;
            orderItemId: string;
            type: ReturnRequestType;
            reason: string;
            customerNotes?: string;
            replacementVariantId?: string;
            replacementVariantInfo?: any;
        },
    ) {
        const order = await this.orderRepository.findOne({
            where: { id: data.orderId, customerId, storeId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.DELIVERED) {
            throw new BadRequestException('Only delivered orders can be returned or replaced');
        }

        // Check 7-day window
        const deliveryDate = order.updatedAt;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - deliveryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            throw new BadRequestException('Return window (7 days) has expired');
        }

        // Update order status: For single item request, check if it's the only item
        const allItemsCount = await this.orderItemRepository.count({ where: { orderId: data.orderId } });
        const isPartial = allItemsCount > 1;

        if (data.type === ReturnRequestType.RETURN) {
            order.status = isPartial ? OrderStatus.PARTIALLY_RETURNED : OrderStatus.RETURN_REQUESTED;
        } else {
            order.status = isPartial ? OrderStatus.PARTIALLY_REPLACED : OrderStatus.REPLACEMENT_REQUESTED;
        }
        await this.orderRepository.save(order);

        const orderItem = await this.orderItemRepository.findOne({
            where: { id: data.orderItemId, orderId: data.orderId },
        });

        if (!orderItem) {
            throw new NotFoundException('Order item not found');
        }

        // Check if a request already exists for this item
        const existingRequest = await this.returnRequestRepository.findOne({
            where: { orderItemId: data.orderItemId, status: ReturnRequestStatus.PENDING },
        });

        if (existingRequest) {
            throw new BadRequestException('A return request is already pending for this item');
        }

        const request = this.returnRequestRepository.create({
            ...data,
            customerId,
            storeId,
            status: ReturnRequestStatus.PENDING,
            refundAmount: data.type === ReturnRequestType.RETURN ? Number(orderItem.totalPrice) : 0,
        });

        return this.returnRequestRepository.save(request);
    }

    async findAll(storeId: string, customerId?: string, startDate?: string, endDate?: string) {
        const where: any = { storeId };
        if (customerId) {
            where.customerId = customerId;
        }

        if (startDate || endDate) {
            if (startDate && endDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt = Between(start, end);
            } else if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                where.createdAt = MoreThanOrEqual(start);
            } else if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt = LessThanOrEqual(end);
            }
        }

        return this.returnRequestRepository.find({
            where,
            relations: ['order', 'orderItem'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, storeId: string) {
        const request = await this.returnRequestRepository.findOne({
            where: { id, storeId },
            relations: ['order', 'orderItem', 'customer'],
        });

        if (!request) {
            throw new NotFoundException('Return request not found');
        }

        return request;
    }

    async updateStatus(
        id: string,
        storeId: string,
        data: {
            status: ReturnRequestStatus;
            adminNotes?: string;
            refundAmount?: number;
            addToInventory?: boolean;
        },
    ) {
        const request = await this.findOne(id, storeId);

        if (request.status === ReturnRequestStatus.COMPLETED || request.status === ReturnRequestStatus.REJECTED) {
            throw new BadRequestException('Cannot update status of a completed or rejected request');
        }

        if (data.adminNotes) {
            request.adminNotes = data.adminNotes;
        }

        if (data.refundAmount !== undefined && request.type === ReturnRequestType.RETURN) {
            request.refundAmount = data.refundAmount;
        }

        const previousStatus = request.status;
        request.status = data.status;

        // Logic for QC_PASSED
        if (data.status === ReturnRequestStatus.QC_PASSED && previousStatus !== ReturnRequestStatus.QC_PASSED) {
            await this.handleQCPassed(request, data.addToInventory ?? true);
        }

        return this.returnRequestRepository.save(request);
    }

    private async handleQCPassed(request: ReturnRequest, addToInventory: boolean) {
        const storeId = request.storeId;

        // 1. Return Logic
        if (request.type === ReturnRequestType.RETURN) {
            try {
                await this.paymentService.initiateRefund(
                    request.orderId,
                    storeId,
                    request.refundAmount,
                    `Return Request approved: ${request.reason}`,
                );
            } catch (err) {
                this.logger.error(`Refund failed for return request ${request.id}: ${err.message}`);
                // We don't throw here to allow status update, but maybe we should?
                // For now, let's proceed and mark admin notes
                request.adminNotes = (request.adminNotes || '') + `\n[System] Refund failed: ${err.message}`;
            }

            if (addToInventory) {
                await this.catalogService.incrementStock(
                    request.orderItem.variantId || request.orderItem.productId,
                    request.orderItem.quantity,
                    storeId,
                    request.orderItem.bundleSelections,
                );
            }

            request.status = ReturnRequestStatus.COMPLETED;
        }

        // 2. Replacement Logic
        if (request.type === ReturnRequestType.REPLACEMENT) {
            if (addToInventory) {
                await this.catalogService.incrementStock(
                    request.orderItem.variantId || request.orderItem.productId,
                    request.orderItem.quantity,
                    storeId,
                    request.orderItem.bundleSelections,
                );
            }

            // Create a new order for replacement
            const newOrder = await this.createReplacementOrder(request);
            request.newOrderId = newOrder.id;
            request.status = ReturnRequestStatus.COMPLETED;
        }
    }

    private async createReplacementOrder(request: ReturnRequest) {
        const originalOrder = request.order;
        const originalItem = request.orderItem;

        // We'll use a simplified order creation logic for replacement
        // Creating an order with 0 total amount
        const newOrder = this.orderRepository.create({
            customerId: request.customerId,
            orderNumber: `REPL-${Date.now()}`,
            status: OrderStatus.CONFIRMED,
            paymentStatus: originalOrder.paymentStatus, // Usually PAID
            paymentMethod: 'Replacement',
            storeId: request.storeId,
            totalAmount: 0,
            subtotal: 0,
            taxAmount: 0,
            shippingCost: 0,
            discountAmount: 0,
            shippingAddress: originalOrder.shippingAddress,
            billingAddress: originalOrder.billingAddress,
            orderType: 'replacement',
            metadata: {
                originalOrderId: originalOrder.id,
                returnRequestId: request.id,
            },
        });

        const savedOrder = await this.orderRepository.save(newOrder);

        const newItem = this.orderItemRepository.create({
            orderId: savedOrder.id,
            productId: originalItem.productId,
            variantId: request.replacementVariantId || originalItem.variantId,
            productName: `[Replacement] ${originalItem.productName}`,
            sku: request.replacementVariantInfo?.sku || originalItem.sku,
            price: 0,
            tax_rate: 0,
            tax_amount: 0,
            quantity: originalItem.quantity,
            totalPrice: 0,
            variantInfo: request.replacementVariantInfo || originalItem.variantInfo,
            bundleSelections: originalItem.bundleSelections,
            paymentStatus: 'paid',
        });

        await this.orderItemRepository.save(newItem);

        // Decrement stock for the new item
        await this.catalogService.decrementStock(
            request.replacementVariantId || originalItem.variantId || originalItem.productId,
            originalItem.quantity,
            request.storeId,
            originalItem.bundleSelections,
        );

        return savedOrder;
    }
}
