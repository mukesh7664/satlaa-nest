import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('admin/reports/analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/reports/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get Sales Analytics' })
  @Get('sales')
  async getSales(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    const storeId = req.user?.storeId;
    return this.analyticsService.getSalesAnalytics(storeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Get Product Analytics' })
  @Get('products')
  async getProducts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    const storeId = req.user?.storeId;
    return this.analyticsService.getProductAnalytics(storeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Get Customer Analytics' })
  @Get('customers')
  async getCustomers(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    const storeId = req.user?.storeId;
    return this.analyticsService.getCustomerAnalytics(storeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Get Financial Reports' })
  @Get('finance')
  async getFinance(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    const storeId = req.user?.storeId;
    return this.analyticsService.getFinancialReports(storeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Get Marketing & Discount Analytics' })
  @Get('marketing')
  async getMarketing(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    const storeId = req.user?.storeId;
    return this.analyticsService.getMarketingAnalytics(storeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Get Operations & Fulfillment Stats' })
  @Get('operations')
  async getOperations(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    const storeId = req.user?.storeId;
    return this.analyticsService.getOperationsAnalytics(storeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Get Inventory Snapshots' })
  @Get('inventory')
  async getInventory(@Request() req: any) {
    const storeId = req.user?.storeId;
    return this.analyticsService.getInventorySnapshot(storeId);
  }
}
