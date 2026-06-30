import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin, AdminRole } from './entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { TenantService } from '../tenant/tenant.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AdminAuthService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        private jwtService: JwtService,
        private tenantService: TenantService,
        private emailService: EmailService,
    ) { }

    async checkEmailExists(email: string): Promise<boolean> {
        const admin = await this.adminRepository.findOne({ where: { email } });
        return !!admin;
    }

    async register(data: { name: string; email: string; password: string; role?: string; phone?: string; storeName?: string; planCategory?: 'page_builder' | 'ecommerce' }) {
        const existingEmail = await this.adminRepository.findOne({ where: { email: data.email } });
        if (existingEmail) throw new BadRequestException('Admin with this email already exists');

        const adminCount = await this.adminRepository.count();
        const isFirstAdmin = adminCount === 0;

        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        // 1. Create and Save Admin FIRST (to get ID for owner_id)
        const admin = this.adminRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: isFirstAdmin ? AdminRole.ADMIN : (data.role as AdminRole) || AdminRole.ADMIN,
            phone: data.phone,
            adminType: data.storeName || data.role === AdminRole.ADMIN ? 'store_owner' : undefined,
        });

        const savedAdmin = await this.adminRepository.save(admin);

        // 2. Bootstrap default store settings/theme via TenantService
        if (data.storeName) {
            await this.tenantService.createStore(savedAdmin.id, data.storeName, data.planCategory);
        }

        const token = this.jwtService.sign({
            sub: savedAdmin.id,
            email: savedAdmin.email,
            role: savedAdmin.role,
        });

        return {
            message: 'Admin registered successfully',
            token,
            admin: {
                id: savedAdmin.id,
                name: savedAdmin.name,
                email: savedAdmin.email,
                role: savedAdmin.role,
                permissions: savedAdmin.permissions,
                adminType: savedAdmin.adminType || null,
            },
        };
    }

    async login(email: string, password: string) {
        const admin = await this.adminRepository.findOne({ where: { email } });
        if (!admin) throw new UnauthorizedException('Invalid credentials');

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) throw new UnauthorizedException('Invalid credentials');

        const planCategory = 'ecommerce';
        const allowedPages: string[] = [];

        const token = this.jwtService.sign({
            sub: admin.id,
            email: admin.email,
            role: admin.role,
        });

        return {
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                storeName: null,
                permissions: admin.permissions,
                adminType: admin.adminType || null,
                planCategory,
                allowedPages,
            },
        };
    }

    async forgotPassword(email: string) {
        const admin = await this.adminRepository.findOne({ where: { email } });
        if (!admin) return { message: 'If the email exists, a password reset OTP has been sent' };

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        admin.passwordResetToken = hashedOtp;
        admin.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        admin.passwordResetAttempts = 0;
        await this.adminRepository.save(admin);

        // Send OTP via email (global SMTP)
        await this.emailService.sendOtpEmail(email, otp, admin.name);

        return { message: 'If the email exists, a password reset OTP has been sent' };
    }

    async verifyOtp(email: string, otp: string) {
        const admin = await this.adminRepository.findOne({ where: { email } });
        if (!admin || !admin.passwordResetToken || !admin.passwordResetExpires) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Check expiry
        if (new Date() > admin.passwordResetExpires) {
            admin.passwordResetToken = null;
            admin.passwordResetExpires = null;
            admin.passwordResetAttempts = 0;
            await this.adminRepository.save(admin);
            throw new BadRequestException('OTP has expired. Please request a new one.');
        }

        // Check max attempts
        if (admin.passwordResetAttempts >= 5) {
            admin.passwordResetToken = null;
            admin.passwordResetExpires = null;
            admin.passwordResetAttempts = 0;
            await this.adminRepository.save(admin);
            throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
        }

        // Verify OTP
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        if (hashedOtp !== admin.passwordResetToken) {
            admin.passwordResetAttempts += 1;
            await this.adminRepository.save(admin);
            const remaining = 5 - admin.passwordResetAttempts;
            throw new BadRequestException(`Invalid OTP. ${remaining} attempt(s) remaining.`);
        }

        // OTP verified — clear OTP fields and issue a short-lived reset JWT
        admin.passwordResetToken = null;
        admin.passwordResetExpires = null;
        admin.passwordResetAttempts = 0;
        await this.adminRepository.save(admin);

        const resetToken = this.jwtService.sign(
            { sub: admin.id, email: admin.email, purpose: 'password_reset' },
            { expiresIn: '10m' },
        );

        return { message: 'OTP verified successfully', resetToken };
    }

    async resetPassword(token: string, password: string) {
        if (password.length < 6) throw new BadRequestException('Password must be at least 6 characters');

        // Verify the reset JWT
        let payload: any;
        try {
            payload = this.jwtService.verify(token);
        } catch {
            throw new BadRequestException('Invalid or expired reset token. Please verify OTP again.');
        }

        if (payload.purpose !== 'password_reset') {
            throw new BadRequestException('Invalid reset token');
        }

        const admin = await this.adminRepository.findOne({ where: { id: payload.sub } });
        if (!admin) throw new BadRequestException('Admin not found');

        admin.password = await bcrypt.hash(password, 10);
        admin.passwordResetToken = null;
        admin.passwordResetExpires = null;
        admin.passwordResetAttempts = 0;
        await this.adminRepository.save(admin);

        return { message: 'Password reset successfully' };
    }

    async getMe(adminId: string) {
        const admin = await this.adminRepository.findOne({ where: { id: adminId } });
        if (!admin) throw new NotFoundException('Admin not found');

        const planCategory = 'ecommerce';
        const allowedPages: string[] = [];

        return {
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone,
                avatar: admin.avatar,
                storeName: null,
                permissions: admin.permissions,
                adminType: admin.adminType || null,
                planCategory,
                allowedPages,
                createdAt: admin.createdAt,
                preferences: admin.preferences,
            }
        };
    }

    // ── Admin User Management ────────────────────────────────────────
    async getAllAdmins(role?: any, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (role) where.role = role;

        const [admins, total] = await this.adminRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take: limit,
            skip,
        });

        return { admins, total };
    }

    async getAdminById(id: string) {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) throw new NotFoundException('Admin not found');
        return admin;
    }

    async validateUserCreation(currentUser: Admin, newUserRole: AdminRole) {
        // Only an admin can create users; they may create admin or sub_admin.
        if (currentUser.role === AdminRole.ADMIN) {
            if (newUserRole !== AdminRole.ADMIN && newUserRole !== AdminRole.SUB_ADMIN) {
                throw new BadRequestException('Invalid role. Allowed: admin or sub_admin');
            }
        } else {
            throw new BadRequestException('You do not have permission to add users');
        }
    }

    async createAdmin(data: any, currentUser?: Admin): Promise<Admin> {
        if (currentUser) {
            await this.validateUserCreation(currentUser, data.role as AdminRole);

            // Set parentId
            data.parentId = currentUser.id;
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        if (data.role === AdminRole.ADMIN && (!data.permissions || data.permissions.length === 0)) {
            data.permissions = ['*'];
        }

        const newAdmin = this.adminRepository.create({
            ...data,
            password: hashedPassword,
        } as Partial<Admin>);

        const savedAdmin = await this.adminRepository.save(newAdmin);
        return savedAdmin;
    }

    async updateAdmin(id: string, data: any): Promise<Admin> {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) throw new NotFoundException('Admin not found');
        if (data.password) data.password = await bcrypt.hash(data.password, 10);
        Object.assign(admin, data);
        return this.adminRepository.save(admin);
    }

    async deleteAdmin(id: string) {
        await this.adminRepository.delete(id);
        return { success: true, message: 'Admin deleted' };
    }

    async updateProfile(adminId: string, data: any) {
        const admin = await this.adminRepository.findOne({ where: { id: adminId } });
        if (!admin) throw new NotFoundException('Admin not found');
        Object.assign(admin, data);
        return this.adminRepository.save(admin);
    }

    async changePassword(adminId: string, currentPassword: string, newPassword: string) {
        const admin = await this.adminRepository.findOne({ where: { id: adminId } });
        if (!admin) throw new NotFoundException('Admin not found');

        const isValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isValid) throw new BadRequestException('Current password is incorrect');

        admin.password = await bcrypt.hash(newPassword, 10);
        await this.adminRepository.save(admin);
        return { message: 'Password changed successfully' };
    }
}
