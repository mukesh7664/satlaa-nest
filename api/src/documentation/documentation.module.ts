import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentation } from './entities/documentation.entity';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Documentation])],
    controllers: [DocumentationController],
    providers: [DocumentationService],
    exports: [DocumentationService]
})
export class DocumentationModule {}
