import { Controller, Request, Post, UseGuards, Get, Body, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// CreateUserDto removed as it belonged to legacy users module
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 409, description: 'User already exists.' })
    @Post('register')
    async register(@Body() createCustomerDto: any) {
        return this.authService.register(createCustomerDto);
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
        return this.authService.updateProfile(userId, body);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change customer password' })
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Request() req, @Body() body: any) {
        const userId = req.user.customerId || req.user.sub;
        return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
    }
}
