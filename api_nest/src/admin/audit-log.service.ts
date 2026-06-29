
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { sanitize, optimize, getChanges } from './audit-log.utils';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private dataSource: DataSource,
  ) {}

  async createLog(params: {
    admin: any;
    action: string;
    resourceType: string;
    resourceId?: string;
    resourceName?: string;
    before?: any;
    after?: any;
    status?: string;
    ipAddress?: string;
    userAgent?: string;
    storeId?: string;
  }) {
    const {
      admin,
      action,
      resourceType,
      resourceId: initialResourceId,
      resourceName: initialResourceName,
      before,
      after,
      status = 'success',
      ipAddress,
      userAgent,
      storeId,
    } = params;

    const changes = getChanges(before, after);

    // Extract data if nested for mapping
    const cleanAfter = (after && typeof after === 'object' && 'data' in after && Object.keys(after).length === 1) ? after.data : after;
    const cleanBefore = (before && typeof before === 'object' && 'data' in before && Object.keys(before).length === 1) ? before.data : before;

    // 1. Fix resourceId: after.id OR after._id OR initialResourceId
    const resourceId = (cleanAfter?.id || cleanAfter?._id || cleanBefore?.id || cleanBefore?._id || initialResourceId);

    // 2. Improve resourceName: after.name OR after.email OR before.name
    let resourceName = initialResourceName;
    if (!resourceName) {
      resourceName = cleanAfter?.name || cleanAfter?.fullName || cleanAfter?.title || cleanAfter?.email || 
                     cleanBefore?.name || cleanBefore?.fullName || cleanBefore?.title || cleanBefore?.email;
    }

    // 3. Improve actionDescription: "Admin {actor} {action} {resourceType} {target}"
    const actorName = admin?.fullName || admin?.name || admin?.email || 'Admin';
    const targetName = resourceName || resourceId || 'a record';
    
    let actionVerb = 'updated';
    if (action === 'CREATE') actionVerb = 'created';
    if (action === 'DELETE') actionVerb = 'deleted';
    
    const actionDescription = `Admin ${actorName} ${actionVerb} ${resourceType.toLowerCase()} ${targetName}`;

    const auditLog = this.auditLogRepository.create({
      adminId: admin?.id || admin?.userId,
      adminName: actorName,
      storeId,
      action,
      resourceType,
      resourceId: resourceId?.toString(),
      resourceName,
      actionDescription,
      status,
      changes: changes,
      ipAddress,
      userAgent,
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Fetches a record by ID and resource type (table name or entity name)
   */
  async fetchBeforeState(resourceType: string, id: string): Promise<any> {
    if (!id || !resourceType) return null;
    
    try {
      const type = resourceType.toLowerCase();
      const entityMetadata = this.dataSource.entityMetadatas.find(
        (m) => 
          m.name.toLowerCase() === type || 
          m.tableName.toLowerCase() === type ||
          m.name.toLowerCase() === type + 's' ||
          m.tableName.toLowerCase() === type + 's' ||
          (type.endsWith('s') && m.name.toLowerCase() === type.slice(0, -1)) ||
          (type.endsWith('es') && m.name.toLowerCase() === type.slice(0, -2))
      );
      
      if (!entityMetadata) return null;
      
      const repository = this.dataSource.getRepository(entityMetadata.target);
      return repository.findOne({ where: { id } as any });
    } catch (error) {
      console.error(`Failed to fetch before state for ${resourceType}:${id}`, error);
      return null;
    }
  }
}
