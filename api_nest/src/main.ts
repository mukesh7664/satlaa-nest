import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
});

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { TenantService } from './tenant/tenant.service';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const tenantService = app.get(TenantService);

    app.enableCors({
        origin: async (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) {
                return callback(null, true);
            }

            const allowedStaticOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002',
                'http://localhost:3003',
                'http://localhost:3004',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001',
                'http://127.0.0.1:3002',
                'http://127.0.0.1:3003',
                'http://127.0.0.1:3004',
                'https://admins.prefyn.com',
                'http://admins.prefyn.com',
                'https://apis.prefyn.com',
                'http://apis.prefyn.com',
                'https://webs.prefyn.com',
                'http://webs.prefyn.com',
                'https://epxweb.satlaa.in',
                'http://epxweb.satlaa.in',
                'https://epxweb.nirdesham.com',
                'http://epxweb.nirdesham.com',
                'https://marketplace.nirdesham.com',
                'http://marketplace.nirdesham.com',
            ];

            // 1. Check static whitelist or localhost subdomains
            if (
                allowedStaticOrigins.includes(origin) ||
                origin.match(/^https?:\/\/.*\.localhost(:\d+)?$/)
            ) {
                return callback(null, true);
            }

            // 2. Dynamic check from Database
            try {
                // Remove protocol (http:// or https://) for lookup
                const host = origin.replace(/^https?:\/\//, '');
                const store = await tenantService.getStoreByHost(host);

                if (store) {
                    return callback(null, true);
                }
            } catch (error) {
                // Tenant not found or error querying DB
            }

            // 3. Reject
            console.error(`CORS Error: Origin not allowed -> ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-tenant-domain'],
    });

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    const config = new DocumentBuilder()
        .setTitle('E-commerce SaaS API')
        .setDescription('The E-commerce SaaS API description')
        .setVersion('1.0')
        // .addTag('auth') // Tags are automatically picked up from controllers if decorated
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 5003;
    await app.listen(port);
    Logger.log(`Server running on http://localhost:${port}/api/v1`, 'Bootstrap');
    Logger.log(`Swagger docs available at http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
