
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    // @UseGuards(AdminAuthGuard) // Will uncomment after verifying guard
    async getDashboardSummary(@Req() req: any) {
        return this.dashboardService.getDashboardSummary();
    }

    @Get('dashboard-summary')
    async getDashboardSummaryLegacy(@Req() req: any) {
        return this.dashboardService.getDashboardSummary();
    }

    @Get('recent-orders')
    // @UseGuards(AdminAuthGuard)
    async getRecentOrders(@Req() req: any) {
        return this.dashboardService.getRecentOrders();
    }
}
