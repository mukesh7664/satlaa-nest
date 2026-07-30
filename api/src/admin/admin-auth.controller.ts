import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthService } from './admin-auth.service';

@ApiTags('admin-auth')
@Controller('admin')
export class AdminAuthController {
    constructor(private readonly adminAuthService: AdminAuthService) { }

    @ApiOperation({ summary: 'Admin Login' })
    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        return this.adminAuthService.login(body.email, body.password);
    }

    @ApiOperation({ summary: 'Forgot Password - Send OTP' })
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.adminAuthService.forgotPassword(email);
    }

    @ApiOperation({ summary: 'Verify OTP' })
    @Post('verify-otp')
    async verifyOtp(@Body() body: { email: string; otp: string }) {
        return this.adminAuthService.verifyOtp(body.email, body.otp);
    }

    @ApiOperation({ summary: 'Reset Password' })
    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; password: string }) {
        return this.adminAuthService.resetPassword(body.token, body.password);
    }

    @ApiOperation({ summary: 'Get current admin' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req) {
        return this.adminAuthService.getMe(req.user.userId);
    }
}
