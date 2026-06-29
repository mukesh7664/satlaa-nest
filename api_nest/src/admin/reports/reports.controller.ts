import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@ApiTags('admin/reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get available columns for a report type' })
  @Get('columns/:type')
  async getColumns(@Param('type') type: string) {
    return this.reportsService.getAvailableColumns(type);
  }

  @ApiOperation({ summary: 'Export report' })
  @Post('export/:type')
  async exportReport(
    @Param('type') type: string,
    @Body() body: { columns: string[]; format: string; startDate?: string; endDate?: string },
    @Request() req: any,
    @Res() res: Response,
  ) {
    const storeId = req.user?.storeId;
    const { columns, format, startDate, endDate } = body;
    
    return this.reportsService.exportReport(
      type,
      format,
      columns,
      { startDate, endDate },
      storeId,
      res,
    );
  }
}
