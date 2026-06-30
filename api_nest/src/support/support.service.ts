import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { HelpResource, HelpResourceType } from './entities/help-resource.entity';
import { SupportTicket, TicketStatus, TicketPriority } from './entities/support-ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Store } from '../stores/entities/store.entity';
import { CreateHelpResourceDto } from './dto/create-help-resource.dto';
import { UpdateHelpResourceDto } from './dto/update-help-resource.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(HelpResource)
        private helpResourceRepository: Repository<HelpResource>,

        @InjectRepository(SupportTicket)
        private ticketRepository: Repository<SupportTicket>,

        @InjectRepository(TicketMessage)
        private messageRepository: Repository<TicketMessage>,

        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,

        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
    ) {}

    // ==========================================
    // Help Center Content CMS (FAQs & Videos)
    // ==========================================

    async createHelpResource(createDto: CreateHelpResourceDto): Promise<HelpResource> {
        const resource = this.helpResourceRepository.create(createDto);
        return this.helpResourceRepository.save(resource);
    }

    async updateHelpResource(id: string, updateDto: UpdateHelpResourceDto): Promise<HelpResource> {
        const resource = await this.findOneHelpResource(id);
        Object.assign(resource, updateDto);
        return this.helpResourceRepository.save(resource);
    }

    async deleteHelpResource(id: string): Promise<void> {
        const result = await this.helpResourceRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Help resource with ID "${id}" not found`);
        }
    }

    async findOneHelpResource(id: string): Promise<HelpResource> {
        const resource = await this.helpResourceRepository.findOne({ where: { id } });
        if (!resource) {
            throw new NotFoundException(`Help resource with ID "${id}" not found`);
        }
        return resource;
    }

    async findAllHelpResources(
        type?: HelpResourceType,
        category?: string,
        isPublished?: boolean,
    ): Promise<HelpResource[]> {
        const query: any = {};
        if (type) query.type = type;
        if (category) query.category = category;
        if (isPublished !== undefined) query.isPublished = isPublished;

        return this.helpResourceRepository.find({
            where: query,
            order: { category: 'ASC', order: 'ASC', createdAt: 'DESC' },
        });
    }

    // ==========================================
    // Support Tickets (Store Admin Panel)
    // ==========================================

    async createTicket(storeId: string, adminId: string, createTicketDto: CreateTicketDto): Promise<SupportTicket> {
        const ticket = this.ticketRepository.create({
            ...createTicketDto,
            storeId,
            adminId,
            status: TicketStatus.OPEN,
        });
        return this.ticketRepository.save(ticket);
    }

    async findStoreTickets(storeId: string, status?: TicketStatus): Promise<SupportTicket[]> {
        const query: any = { storeId };
        if (status) query.status = status;

        return this.ticketRepository.find({
            where: query,
            order: { updatedAt: 'DESC' },
        });
    }

    async findTicketDetails(ticketId: string, storeId?: string): Promise<any> {
        const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
        }

        // Enforce store-level isolation for store admins
        if (storeId && ticket.storeId !== storeId) {
            throw new ForbiddenException('You do not have permission to view this ticket');
        }

        // Fetch creator details
        const creator = await this.adminRepository.findOne({
            where: { id: ticket.adminId },
            select: ['id', 'name', 'email', 'avatar'],
        });

        // Fetch store details
        let store = null;
        if (ticket.storeId) {
            store = await this.storeRepository.findOne({
                where: { id: ticket.storeId },
                select: ['id', 'name', 'slug'],
            });
        }

        return {
            ...ticket,
            creator,
            store,
        };
    }

    async closeTicket(ticketId: string, storeId?: string): Promise<SupportTicket> {
        const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
        }

        if (storeId && ticket.storeId !== storeId) {
            throw new ForbiddenException('You do not have permission to modify this ticket');
        }

        ticket.status = TicketStatus.CLOSED;
        return this.ticketRepository.save(ticket);
    }

    // ==========================================
    // Support Tickets (Super Admin Queue)
    // ==========================================

    async findAdminTickets(
        status?: TicketStatus,
        priority?: TicketPriority,
        storeId?: string,
        search?: string,
    ): Promise<any[]> {
        const query: any = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (storeId) query.storeId = storeId;
        if (search) query.subject = Like(`%${search}%`);

        const tickets = await this.ticketRepository.find({
            where: query,
            order: { createdAt: 'DESC' },
        });

        // Enrich tickets with Store and Creator info
        const enrichedTickets = await Promise.all(
            tickets.map(async (ticket) => {
                const creator = await this.adminRepository.findOne({
                    where: { id: ticket.adminId },
                    select: ['id', 'name', 'email', 'avatar'],
                });

                let store = null;
                if (ticket.storeId) {
                    store = await this.storeRepository.findOne({
                        where: { id: ticket.storeId },
                        select: ['id', 'name', 'slug'],
                    });
                }

                return {
                    ...ticket,
                    creatorName: creator?.name || 'Unknown',
                    creatorEmail: creator?.email || '',
                    storeName: store?.name || 'Platform / Super Admin',
                };
            }),
        );

        return enrichedTickets;
    }

    async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
        const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
        }

        ticket.status = status;
        return this.ticketRepository.save(ticket);
    }

    async updateTicketPriority(ticketId: string, priority: TicketPriority): Promise<SupportTicket> {
        const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
        }

        ticket.priority = priority;
        return this.ticketRepository.save(ticket);
    }

    // ==========================================
    // Ticket Messaging (REST Chat)
    // ==========================================

    async createMessage(
        ticketId: string,
        senderId: string,
        senderRole: string,
        createMessageDto: CreateMessageDto,
        storeId?: string,
    ): Promise<TicketMessage> {
        const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
        }

        if (storeId && ticket.storeId !== storeId) {
            throw new ForbiddenException('You do not have permission to reply to this ticket');
        }

        const message = this.messageRepository.create({
            ...createMessageDto,
            ticketId,
            senderId,
            senderRole,
        });

        const savedMessage = await this.messageRepository.save(message);

        // Update ticket's updatedAt timestamp to indicate activity
        ticket.updatedAt = new Date();
        // If a message is sent from admin, auto mark ticket as Open if it was resolved/closed
        if (senderRole === 'admin' && (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED)) {
            ticket.status = TicketStatus.OPEN;
        }
        await this.ticketRepository.save(ticket);

        return savedMessage;
    }

    async findTicketMessages(ticketId: string, storeId?: string): Promise<any[]> {
        const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
        }

        if (storeId && ticket.storeId !== storeId) {
            throw new ForbiddenException('You do not have permission to view messages for this ticket');
        }

        const messages = await this.messageRepository.find({
            where: { ticketId },
            order: { createdAt: 'ASC' },
        });

        // Enrich messages with sender name
        const enrichedMessages = await Promise.all(
            messages.map(async (msg) => {
                const sender = await this.adminRepository.findOne({
                    where: { id: msg.senderId },
                    select: ['id', 'name', 'avatar'],
                });
                return {
                    ...msg,
                    senderName: sender?.name || 'System',
                    senderAvatar: sender?.avatar || '',
                };
            }),
        );

        return enrichedMessages;
    }
}
