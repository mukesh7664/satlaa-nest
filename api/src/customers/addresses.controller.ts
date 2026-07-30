import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Address } from './entities/address.entity';

@ApiTags('addresses')
@Controller('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @ApiOperation({ summary: 'Get all addresses for the current customer' })
    @Get()
    async findAll(@Request() req): Promise<{ addresses: Address[] }> {
        const customerId = req.user.sub || req.user.customerId;
        const addresses = await this.addressesService.findAll(customerId);
        return { addresses };
    }

    @ApiOperation({ summary: 'Get a specific address' })
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req): Promise<Address> {
        const customerId = req.user.sub || req.user.customerId;
        return this.addressesService.findOne(id, customerId);
    }

    @ApiOperation({ summary: 'Create a new address' })
    @Post()
    async create(@Request() req, @Body() data: Partial<Address>): Promise<Address> {
        const customerId = req.user.sub || req.user.customerId;
        return this.addressesService.create(customerId, data);
    }

    @ApiOperation({ summary: 'Update an existing address' })
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Request() req,
        @Body() data: Partial<Address>,
    ): Promise<Address> {
        const customerId = req.user.sub || req.user.customerId;
        return this.addressesService.update(id, customerId, data);
    }

    @ApiOperation({ summary: 'Delete an address' })
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req): Promise<void> {
        const customerId = req.user.sub || req.user.customerId;
        await this.addressesService.delete(id, customerId);
    }

    @ApiOperation({ summary: 'Set an address as default' })
    @Patch(':id/default')
    async setDefault(@Param('id') id: string, @Request() req): Promise<Address> {
        const customerId = req.user.sub || req.user.customerId;
        return this.addressesService.setDefault(id, customerId);
    }
}
