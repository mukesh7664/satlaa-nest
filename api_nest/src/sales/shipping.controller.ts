import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shiprocketService: ShiprocketService) {}

  @ApiOperation({ summary: 'Check shipping serviceability and get ETD' })
  @ApiResponse({ status: 200, description: 'Serviceability details.' })
  @ApiQuery({ name: 'pincode', required: true, description: 'Delivery pincode' })
  @ApiQuery({ name: 'productId', required: false, description: 'Product ID to check weight' })
  @Get('serviceability')
  async checkServiceability(
    @Query('pincode') pincode: string,
    @Query('productId') productId: string,
  ) {
    if (!pincode) throw new BadRequestException('Pincode is required');

    const result = await this.shiprocketService.checkServiceability(pincode, productId);
    return { success: true, data: result };
  }
}
