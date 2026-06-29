import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'prefyn-saas';
        const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

        // Ensure credentials exist or use default AWS profile behavior
        this.s3Client = new S3Client({
            region,
            // If explicit keys are provided in .env, use them. Otherwise rely on IAM/Node defaults.
            ...(accessKeyId && secretAccessKey && {
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            }),
        });
    }

    async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
        return this.uploadBuffer(file.buffer, key, file.mimetype);
    }

    async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
        const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
        this.logger.log(`Attempting S3 buffer upload to bucket: ${this.bucketName} in region: ${region}. Key: ${key}`);
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            });

            await this.s3Client.send(command);
            return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
        } catch (error) {
            this.logger.error(`Error uploading buffer to S3 [Bucket: ${this.bucketName}, Region: ${region}]: ${error.message}`);
            throw error;
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Error deleting from S3: ${error.message}`);
            throw error;
        }
    }
}
