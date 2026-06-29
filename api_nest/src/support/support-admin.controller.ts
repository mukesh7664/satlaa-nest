import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CreateHelpResourceDto } from './dto/create-help-resource.dto';
import { UpdateHelpResourceDto } from './dto/update-help-resource.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { HelpResourceType } from './entities/help-resource.entity';
import { TicketStatus, TicketPriority } from './entities/support-ticket.entity';

@ApiTags('support-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/support')
export class SupportAdminController {
    constructor(private readonly supportService: SupportService) {}

    // ==========================================
    // Help Center Content CMS (FAQs & Videos)
    // ==========================================

    @ApiOperation({ summary: 'Admin: Get all help center resources' })
    @Get('help-resources')
    async getHelpResources(
        @Query('type') type?: HelpResourceType,
        @Query('category') category?: string,
    ) {
        return this.supportService.findAllHelpResources(type, category);
    }

    @ApiOperation({ summary: 'Admin: Create a new help center resource' })
    @Post('help-resources')
    async createHelpResource(@Body() createDto: CreateHelpResourceDto) {
        return this.supportService.createHelpResource(createDto);
    }

    @ApiOperation({ summary: 'Admin: Update a help center resource' })
    @Patch('help-resources/:id')
    async updateHelpResource(@Param('id') id: string, @Body() updateDto: UpdateHelpResourceDto) {
        return this.supportService.updateHelpResource(id, updateDto);
    }

    @ApiOperation({ summary: 'Admin: Delete a help center resource' })
    @Delete('help-resources/:id')
    async deleteHelpResource(@Param('id') id: string) {
        await this.supportService.deleteHelpResource(id);
        return { success: true, message: 'Help resource deleted successfully' };
    }

    // ==========================================
    // Support Tickets Inbox
    // ==========================================

    @ApiOperation({ summary: 'Admin: Get all support tickets with filters (Queue)' })
    @Get('tickets')
    async getAdminTickets(
        @Query('status') status?: TicketStatus,
        @Query('priority') priority?: TicketPriority,
        @Query('storeId') storeId?: string,
        @Query('search') search?: string,
    ) {
        return this.supportService.findAdminTickets(status, priority, storeId, search);
    }

    @ApiOperation({ summary: 'Admin: Get details of a specific ticket' })
    @Get('tickets/:id')
    async getTicketDetails(@Param('id') id: string) {
        return this.supportService.findTicketDetails(id);
    }

    @ApiOperation({ summary: 'Admin: Get messages in a support ticket thread' })
    @Get('tickets/:id/messages')
    async getTicketMessages(@Param('id') id: string) {
        return this.supportService.findTicketMessages(id);
    }

    @ApiOperation({ summary: 'Admin: Send a reply message to the merchant' })
    @Post('tickets/:id/messages')
    async createTicketMessage(
        @Req() req: any,
        @Param('id') id: string,
        @Body() createMessageDto: CreateMessageDto,
    ) {
        const senderId = req.user.userId;
        const senderRole = req.user.role; // e.g. 'super_admin'
        return this.supportService.createMessage(id, senderId, senderRole, createMessageDto);
    }

    @ApiOperation({ summary: 'Admin: Update ticket status' })
    @Patch('tickets/:id/status')
    async updateTicketStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
        return this.supportService.updateTicketStatus(id, status);
    }

    @ApiOperation({ summary: 'Admin: Update ticket priority' })
    @Patch('tickets/:id/priority')
    async updateTicketPriority(@Param('id') id: string, @Body('priority') priority: TicketPriority) {
        return this.supportService.updateTicketPriority(id, priority);
    }
}
