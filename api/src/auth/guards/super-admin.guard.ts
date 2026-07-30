import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminRole } from '../../admin/entities/admin.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assuming JwtAuthGuard has already run

        const superRoles = [AdminRole.ADMIN];
        if (!user || !superRoles.includes(user.role)) {
            throw new ForbiddenException('Super Admin access required');
        }

        return true;
    }
}
