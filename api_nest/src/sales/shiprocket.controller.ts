import { Controller, Post, Get, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin/shiprocket')
@ApiBearerAuth()
@Controller('admin/shiprocket')
export class ShiprocketController {
  constructor(private readonly shiprocketService: ShiprocketService) {}

  @ApiOperation({ summary: 'Get Shiprocket config' })
  @UseGuards(JwtAuthGuard)
  @Get('config')
  async getConfig(@Request() req: any) {
    return await this.shiprocketService.getShippingConfig(req.user.storeId);
  }

  @ApiOperation({ summary: 'Save Shiprocket config' })
  @UseGuards(JwtAuthGuard)
  @Post('config')
  async saveConfig(@Request() req: any, @Body() body: any) {
    return await this.shiprocketService.saveShippingConfig(req.user.storeId, body);
  }

  @ApiOperation({ summary: 'Test Shiprocket credentials validity' })
  @UseGuards(JwtAuthGuard)
  @Post('test-connection')
  async testConnection(@Body() body: any) {
    const { email, password } = body;
    return await this.shiprocketService.testCredentials(email, password);
  }

  @ApiOperation({ summary: 'Push order to Shiprocket' })
  @UseGuards(JwtAuthGuard)
  @Post('create-order/:orderId')
  async createOrder(@Param('orderId') orderId: string, @Request() req: any) {
    return await this.shiprocketService.createOrder(orderId, req.body);
  }

  @ApiOperation({ summary: 'Get Shiprocket pickup locations' })
  @UseGuards(JwtAuthGuard)
  @Get('pickup-locations')
  async getPickupLocations(@Request() req: any) {
    return await this.shiprocketService.getPickupLocations(req.user.storeId);
  }

  @ApiOperation({ summary: 'Get suggested shipping details' })
  @UseGuards(JwtAuthGuard)
  @Get('suggestions/:orderId')
  async getSuggestions(@Param('orderId') orderId: string) {
    return await this.shiprocketService.getSuggestions(orderId);
  }

  @ApiOperation({ summary: 'Add Shiprocket pickup location' })
  @UseGuards(JwtAuthGuard)
  @Post('add-pickup-location')
  async addPickupLocation(@Request() req: any) {
    return await this.shiprocketService.addPickupLocation(req.user.storeId, req.body);
  }

  @ApiOperation({ summary: 'Generate Shiprocket label' })
  @UseGuards(JwtAuthGuard)
  @Post('generate-label/:shipmentId')
  async generateLabel(@Param('shipmentId') shipmentId: string, @Request() req: any) {
    return await this.shiprocketService.generateLabel(req.user.storeId, shipmentId);
  }

  @ApiOperation({ summary: 'Assign Courier/AWB (Ship Now)' })
  @UseGuards(JwtAuthGuard)
  @Post('assign-courier/:shipmentId')
  async assignAwb(@Param('shipmentId') shipmentId: string, @Request() req: any) {
    const { courier_id } = req.body;
    return await this.shiprocketService.assignAwb(req.user.storeId, shipmentId, courier_id);
  }

  @ApiOperation({ summary: 'Get Courier Serviceability' })
  @UseGuards(JwtAuthGuard)
  @Get('serviceability/:shiprocketOrderId')
  async getServiceability(@Param('shiprocketOrderId') shiprocketOrderId: string, @Request() req: any) {
    return await this.shiprocketService.getServiceability(req.user.storeId, shiprocketOrderId);
  }

  @ApiOperation({ summary: 'Shiprocket Webhook (Public)' })
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return await this.shiprocketService.handleWebhook(payload);
  }
}
