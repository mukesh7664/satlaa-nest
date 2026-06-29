import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @ApiOperation({ summary: 'Get current customer profile' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req, @CurrentTenant('id') storeId: string) {
        // Here req.user will contain the customer's jwt payload
        return this.customersService.findOneById(req.user.sub ?? req.user.userId, storeId);
    }

    @ApiOperation({ summary: 'Get all customers for the store (Store Admin)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getStoreCustomers(@CurrentTenant('id') storeId: string) {
        return this.customersService.findAllForStore(storeId);
    }
}
