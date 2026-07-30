import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private auditLogService: AuditLogService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const admin = req.user;
    if (!admin) return next.handle();

    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Improved resource detection
    const path = req.route?.path || '';
    const pathParts = path.split('/').filter(p => p && p !== 'api' && p !== 'v1');
    
    // Usually: /admin/resource-name/:id
    let resourceType = 'admin';
    if (pathParts.length > 1) {
      resourceType = pathParts[1]; // index 0 is 'admin'
    }

    // Singularize common resource types
    if (resourceType.endsWith('s')) {
      resourceType = resourceType.slice(0, -1);
    }
    // Capitalize
    resourceType = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);

    const resourceId = req.params?.id || req.body?.id;
    let action = 'UPDATE';
    if (method === 'POST') action = 'CREATE';
    if (method === 'DELETE') action = 'DELETE';

    let beforeState = null;
    if (action !== 'CREATE' && resourceId) {
      beforeState = await this.auditLogService.fetchBeforeState(resourceType, resourceId);
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const afterState = action === 'DELETE' ? null : (response || req.body);
          
          await this.auditLogService.createLog({
            admin,
            action,
            resourceType,
            resourceId: resourceId || response?.id,
            before: beforeState,
            after: afterState,
            ipAddress,
            userAgent,
          });
        } catch (error) {
          console.error('Failed to save audit log:', error);
        }
      }),
    );
  }
}
