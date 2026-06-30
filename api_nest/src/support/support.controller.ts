import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { HelpResourceType } from './entities/help-resource.entity';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) {}

    // ---- Help Center Content ----

    @ApiOperation({ summary: 'Get published FAQ and Video resources' })
    @Get('help-resources')
    async getHelpResources(
        @Query('type') type?: HelpResourceType,
        @Query('category') category?: string,
    ) {
        return this.supportService.findAllHelpResources(type, category, true);
    }

    // ---- Support Tickets ----

    @ApiOperation({ summary: 'Create a new support ticket' })
    @Post('tickets')
    async createTicket(@Req() req: any, @Body() createTicketDto: CreateTicketDto) {
        const adminId = req.user.userId;
        return this.supportService.createTicket(adminId, createTicketDto);
    }

    @ApiOperation({ summary: 'List all support tickets raised by this store' })
    @Get('tickets')
    async getStoreTickets(@Query('status') status?: any) {
        return this.supportService.findStoreTickets(status);
    }

    @ApiOperation({ summary: 'Get details of a specific ticket' })
    @Get('tickets/:id')
    async getTicketDetails(@Param('id') id: string) {
        return this.supportService.findTicketDetails(id);
    }

    @ApiOperation({ summary: 'Close a ticket' })
    @Patch('tickets/:id/close')
    async closeTicket(@Param('id') id: string) {
        return this.supportService.closeTicket(id);
    }

    // ---- Ticket Messages (Chat) ----

    @ApiOperation({ summary: 'Get all messages of a ticket' })
    @Get('tickets/:id/messages')
    async getTicketMessages(@Param('id') id: string) {
        return this.supportService.findTicketMessages(id);
    }

    @ApiOperation({ summary: 'Send a reply message in the ticket chat thread' })
    @Post('tickets/:id/messages')
    async createTicketMessage(
        @Req() req: any,
        @Param('id') id: string,
        @Body() createMessageDto: CreateMessageDto,
    ) {
        const senderId = req.user.userId;
        const senderRole = req.user.role; // e.g. 'store_admin'
        return this.supportService.createMessage(id, senderId, senderRole, createMessageDto);
    }
}
