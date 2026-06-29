import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreDomain } from '../stores/entities/store-domain.entity';
import * as dns from 'dns/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class DomainVerificationService {
    private readonly logger = new Logger(DomainVerificationService.name);

    constructor(
        @InjectRepository(StoreDomain)
        private storeDomainRepository: Repository<StoreDomain>,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async verifyPendingDomains() {
        this.logger.log('Starting custom domain DNS verification cron job...');
        
        // Find all pending custom domains
        const pendingDomains = await this.storeDomainRepository.find({
            where: { status: 'pending', type: 'custom' },
        });

        if (pendingDomains.length === 0) {
            this.logger.log('No pending custom domains found to verify.');
            return;
        }

        this.logger.log(`Found ${pendingDomains.length} pending domains. Verifying...`);

        // Production expected DNS values
        const EXPECTED_CNAME = process.env.EXPECTED_DNS_CNAME || 'webs.prefyn.com';
        const EXPECTED_A_RECORD = process.env.EXPECTED_DNS_A_RECORD || '13.204.121.129';

        for (const domainRecord of pendingDomains) {
            const domainName = domainRecord.domain.trim();
            let dnsVerified = false;

            try {
                // 1. Check A record (Root domain or sub-domain)
                try {
                    const aRecords = await dns.resolve4(domainName);
                    if (aRecords.includes(EXPECTED_A_RECORD)) {
                        dnsVerified = true;
                        this.logger.log(`[Verified - A Record] ${domainName} -> ${EXPECTED_A_RECORD}`);
                    } else {
                        this.logger.debug(`A record mismatch for ${domainName}. Found: ${aRecords.join(', ')}. Expected: ${EXPECTED_A_RECORD}`);
                    }
                } catch (error) {
                    this.logger.debug(`A record check failed for ${domainName}: ${error.message}`);
                }

                // 2. Check CNAME record (usually for subdomains)
                if (!dnsVerified) {
                    try {
                        const cnames = await dns.resolveCname(domainName);
                        if (cnames.includes(EXPECTED_CNAME)) {
                            dnsVerified = true;
                            this.logger.log(`[Verified - CNAME] ${domainName} -> ${EXPECTED_CNAME}`);
                        } else {
                            this.logger.debug(`CNAME record mismatch for ${domainName}. Found: ${cnames.join(', ')}. Expected: ${EXPECTED_CNAME}`);
                        }
                    } catch (error) {
                        this.logger.debug(`CNAME record check failed for ${domainName}: ${error.message}`);
                    }
                }

                if (dnsVerified) {
                    this.logger.log(`DNS Verified for ${domainName}. Proceeding with SSL generation...`);
                    
                    domainRecord.is_verified = true;
                    domainRecord.status = 'verifying_ssl'; // Temporary status
                    await this.storeDomainRepository.save(domainRecord);

                    // Start SSL Generation
                    await this.generateSsl(domainRecord);
                } else {
                    this.logger.debug(`Verification failed for ${domainName}. DNS records do not match yet.`);
                }

            } catch (error) {
                this.logger.error(`Error processing domain ${domainName}: ${error.message}`);
            }
        }
    }

    async generateSsl(domainRecord: StoreDomain) {
        const domainName = domainRecord.domain.trim();
        this.logger.log(`Generating SSL for ${domainName}...`);

        try {
            domainRecord.ssl_status = 'pending';
            await this.storeDomainRepository.save(domainRecord);

            // Certbot command
            // Only add www if it's not a subdomain and if it resolves
            let domainsToCertify = `-d ${domainName}`;
            
            // Logic to check if we should add www
            // 1. Only add www if it's potentially a root domain (count dots)
            // 2. Check if www.{domain} actually resolves to avoid certbot failure
            const dotCount = (domainName.match(/\./g) || []).length;
            if (dotCount === 1) { // Likely root domain like example.com
                try {
                    await dns.resolve( `www.${domainName}`);
                    domainsToCertify += ` -d www.${domainName}`;
                    this.logger.log(`Including www.${domainName} in SSL certificate.`);
                } catch (e) {
                    this.logger.warn(`www.${domainName} does not resolve, skipping in SSL generation.`);
                }
            }

            const command = `sudo certbot --nginx ${domainsToCertify} --non-interactive --agree-tos -m admin@prefyn.com`;
            
            this.logger.log(`Executing command: ${command}`);
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('Congratulations')) {
                this.logger.warn(`Certbot stderr: ${stderr}`);
            }
            
            this.logger.log(`Certbot stdout: ${stdout}`);

            // Update database on success
            domainRecord.ssl_status = 'active';
            domainRecord.status = 'active';
            await this.storeDomainRepository.save(domainRecord);
            
            this.logger.log(`SSL successfully generated and domain activated for: ${domainName}`);

        } catch (error) {
            this.logger.error(`SSL Generation failed for ${domainName}: ${error.message}`);
            domainRecord.ssl_status = 'failed';
            domainRecord.status = 'pending'; // Reset to pending so it can be retried
            await this.storeDomainRepository.save(domainRecord);
        }
    }
}
