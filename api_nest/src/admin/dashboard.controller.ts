
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
        return this.dashboardService.getDashboardSummary(req.user?.storeId);
    }

    @Get('saas-summary')
    async getSaaSSummary() {
        return this.dashboardService.getSaaSSummary();
    }

    @Get('dashboard-summary')
    async getDashboardSummaryLegacy(@Req() req: any) {
        return this.dashboardService.getDashboardSummary(req.user?.storeId);
    }

    @Get('recent-orders')
    // @UseGuards(AdminAuthGuard)
    async getRecentOrders(@Req() req: any) {
        return this.dashboardService.getRecentOrders(req.user?.storeId);
    }
}
