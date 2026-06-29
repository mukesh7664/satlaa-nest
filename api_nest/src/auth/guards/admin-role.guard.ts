import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminRole } from '../../admin/entities/admin.entity';

@Injectable()
export class AdminRoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const adminRoles = [AdminRole.SUPER_ADMIN, AdminRole.SUPER_SUB_ADMIN, AdminRole.STORE_ADMIN, AdminRole.STORE_SUB_ADMIN];
        if (!user || !adminRoles.includes(user.role)) {
            throw new ForbiddenException('Admin access required');
        }

        return true;
    }
}
