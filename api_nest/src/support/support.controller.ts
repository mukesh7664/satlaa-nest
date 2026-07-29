import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { HelpResourceType } from './entities/help-resource.entity';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

    @ApiOperation({ summary: 'Customer: create a new support ticket / complaint' })
    @Post('tickets')
    async createTicket(@Req() req: any, @Body() createTicketDto: CreateTicketDto) {
        const customerId = req.user.customerId || req.user.sub;
        return this.supportService.createTicket(customerId, createTicketDto);
    }

    @ApiOperation({ summary: 'Customer: list my support tickets' })
    @Get('tickets')
    async getMyTickets(@Req() req: any, @Query('status') status?: any) {
        const customerId = req.user.customerId || req.user.sub;
        return this.supportService.findMyTickets(customerId, status);
    }

    @ApiOperation({ summary: 'Customer: get details of my ticket' })
    @Get('tickets/:id')
    async getTicketDetails(@Req() req: any, @Param('id') id: string) {
        const customerId = req.user.customerId || req.user.sub;
        return this.supportService.findTicketDetails(id, customerId);
    }

    @ApiOperation({ summary: 'Customer: close my ticket' })
    @Patch('tickets/:id/close')
    async closeTicket(@Req() req: any, @Param('id') id: string) {
        const customerId = req.user.customerId || req.user.sub;
        return this.supportService.closeTicket(id, customerId);
    }

    // ---- Ticket Messages (Chat) ----

    @ApiOperation({ summary: 'Customer: get all messages of my ticket' })
    @Get('tickets/:id/messages')
    async getTicketMessages(@Req() req: any, @Param('id') id: string) {
        const customerId = req.user.customerId || req.user.sub;
        // Enforce ownership before returning the thread
        await this.supportService.findTicketDetails(id, customerId);
        return this.supportService.findTicketMessages(id);
    }

    @ApiOperation({ summary: 'Customer: send a reply in my ticket thread' })
    @Post('tickets/:id/messages')
    async createTicketMessage(
        @Req() req: any,
        @Param('id') id: string,
        @Body() createMessageDto: CreateMessageDto,
    ) {
        const customerId = req.user.customerId || req.user.sub;
        // Enforce ownership before allowing a reply
        await this.supportService.findTicketDetails(id, customerId);
        return this.supportService.createMessage(id, customerId, 'customer', createMessageDto);
    }
}
