import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminRole } from '../../admin/entities/admin.entity';

@Injectable()
export class PosRoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // POS operators plus full admins may use POS endpoints.
        const posRoles = [AdminRole.POS_USER, AdminRole.ADMIN];
        if (!user || !posRoles.includes(user.role)) {
            throw new ForbiddenException('POS access required');
        }

        return true;
    }
}
