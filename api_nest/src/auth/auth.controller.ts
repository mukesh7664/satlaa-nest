import { Controller, Request, Post, UseGuards, Get, Body, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// CreateUserDto removed as it belonged to legacy users module
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 409, description: 'User already exists.' })
    @Post('register')
    async register(@Body() createCustomerDto: any, @CurrentTenant('id') storeId: string) {
        return this.authService.register(createCustomerDto, storeId);
    }

    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Return JWT access token.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update customer profile' })
    @UseGuards(JwtAuthGuard)
    @Put('profile')
    async updateProfile(@Request() req, @Body() body: any) {
        const userId = req.user.customerId || req.user.sub;
        const storeId = req.user.storeId;
        return this.authService.updateProfile(userId, storeId, body);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change customer password' })
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Request() req, @Body() body: any) {
        const userId = req.user.customerId || req.user.sub;
        const storeId = req.user.storeId;
        return this.authService.changePassword(userId, storeId, body.currentPassword, body.newPassword);
    }
}
