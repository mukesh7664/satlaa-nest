import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../tenant/tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly tenantService: TenantService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        // Support custom header from Next.js server components
        const customHeader = req.headers['x-tenant-domain'];
        let host = Array.isArray(customHeader) ? customHeader[0] : customHeader;

        // Fallback for client-side requests using origin or referer
        if (!host) {
            const extra = (req.headers.origin || req.headers.referer) as string;
            if (extra) {
                try {
                    const url = new URL(extra);
                    host = url.hostname; // .hostname does not include port
                } catch (e) {
                    // Ignore URL parse error
                }
            }
        }

        // Final fallback to host header
        if (!host) {
            const h = req.headers.host;
            host = Array.isArray(h) ? h[0] : h;
            if (host) {
                host = host.split(':')[0]; // Remove port if present
            }
        }

        const cleanHost = host;

        if (!cleanHost) {
            return res.status(400).send({ message: 'Host or x-tenant-domain header is missing' });
        }

        try {
            const store = await this.tenantService.getStoreByHost(cleanHost);
            (req as any).tenant = store; // Attach store context
            next();
        } catch (error) {
            return res.status(404).send({ message: 'Tenant not found. Invalid domain.' });
        }
    }
}
