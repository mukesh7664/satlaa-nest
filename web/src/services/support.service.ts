import axios from "axios";

const getAuthHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
    id: string;
    customerId: string;
    subject: string;
    description: string;
    category: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    updatedAt: string;
    creator?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderRole: string;
    message: string;
    attachments?: string[];
    createdAt: string;
    senderName?: string;
    senderAvatar?: string;
}

export interface HelpResource {
    id: string;
    type: "faq" | "video";
    title: string;
    content: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    category: string;
    isPublished: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTicketPayload {
    subject: string;
    description: string;
    category: string;
    priority?: TicketPriority;
}

export const supportService = {
    getMyTickets: async (status?: TicketStatus): Promise<SupportTicket[]> => {
        const res = await axios.get<SupportTicket[]>(`${API_URL}/support/tickets`, {
            params: status ? { status } : {},
            headers: getAuthHeader(),
        });
        return res.data;
    },

    createTicket: async (payload: CreateTicketPayload): Promise<SupportTicket> => {
        const res = await axios.post<SupportTicket>(`${API_URL}/support/tickets`, payload, {
            headers: getAuthHeader(),
        });
        return res.data;
    },

    getTicketDetails: async (id: string): Promise<SupportTicket> => {
        const res = await axios.get<SupportTicket>(`${API_URL}/support/tickets/${id}`, {
            headers: getAuthHeader(),
        });
        return res.data;
    },

    getTicketMessages: async (id: string): Promise<TicketMessage[]> => {
        const res = await axios.get<TicketMessage[]>(`${API_URL}/support/tickets/${id}/messages`, {
            headers: getAuthHeader(),
        });
        return res.data;
    },

    sendMessage: async (id: string, message: string, attachments?: string[]): Promise<TicketMessage> => {
        const res = await axios.post<TicketMessage>(
            `${API_URL}/support/tickets/${id}/messages`,
            { message, attachments },
            { headers: getAuthHeader() },
        );
        return res.data;
    },

    closeTicket: async (id: string): Promise<SupportTicket> => {
        const res = await axios.patch<SupportTicket>(
            `${API_URL}/support/tickets/${id}/close`,
            {},
            { headers: getAuthHeader() },
        );
        return res.data;
    },

    getHelpResources: async (type?: "faq" | "video", category?: string): Promise<HelpResource[]> => {
        const params: Record<string, string> = {};
        if (type) params.type = type;
        if (category) params.category = category;
        const res = await axios.get<HelpResource[]>(`${API_URL}/support/help-resources`, {
            params,
            headers: getAuthHeader(),
        });
        return res.data;
    },
};
