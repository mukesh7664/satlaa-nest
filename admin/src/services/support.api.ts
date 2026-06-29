import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1';

export interface HelpResource {
    id: string;
    type: 'faq' | 'video';
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

export interface SupportTicket {
    id: string;
    storeId?: string;
    adminId: string;
    subject: string;
    description: string;
    category: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
    creatorName?: string;
    creatorEmail?: string;
    storeName?: string;
    creator?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    store?: {
        id: string;
        name: string;
        slug: string;
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

export const supportApi = {
    // ==========================================
    // Store Admin Endpoints
    // ==========================================

    getHelpResources: async (type?: 'faq' | 'video', category?: string): Promise<HelpResource[]> => {
        const token = localStorage.getItem('token');
        const params: any = {};
        if (type) params.type = type;
        if (category) params.category = category;

        const res = await axios.get(`${API_URL}/support/help-resources`, {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    createTicket: async (data: { subject: string; description: string; category: string; priority?: string }): Promise<SupportTicket> => {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/support/tickets`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getStoreTickets: async (status?: string): Promise<SupportTicket[]> => {
        const token = localStorage.getItem('token');
        const params: any = {};
        if (status) params.status = status;

        const res = await axios.get(`${API_URL}/support/tickets`, {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getTicketDetails: async (id: string): Promise<SupportTicket> => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/support/tickets/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    closeTicket: async (id: string): Promise<SupportTicket> => {
        const token = localStorage.getItem('token');
        const res = await axios.patch(`${API_URL}/support/tickets/${id}/close`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getTicketMessages: async (id: string): Promise<TicketMessage[]> => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/support/tickets/${id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    sendTicketMessage: async (id: string, message: string, attachments?: string[]): Promise<TicketMessage> => {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/support/tickets/${id}/messages`, { message, attachments }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // ==========================================
    // Super Admin Endpoints
    // ==========================================

    getAdminHelpResources: async (type?: 'faq' | 'video', category?: string): Promise<HelpResource[]> => {
        const token = localStorage.getItem('token');
        const params: any = {};
        if (type) params.type = type;
        if (category) params.category = category;

        const res = await axios.get(`${API_URL}/admin/support/help-resources`, {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    createHelpResource: async (data: Partial<HelpResource>): Promise<HelpResource> => {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/admin/support/help-resources`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    updateHelpResource: async (id: string, data: Partial<HelpResource>): Promise<HelpResource> => {
        const token = localStorage.getItem('token');
        const res = await axios.patch(`${API_URL}/admin/support/help-resources/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    deleteHelpResource: async (id: string): Promise<{ success: boolean; message: string }> => {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`${API_URL}/admin/support/help-resources/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getAdminTickets: async (filters?: { status?: string; priority?: string; storeId?: string; search?: string }): Promise<SupportTicket[]> => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/support/tickets`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getAdminTicketDetails: async (id: string): Promise<SupportTicket> => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/support/tickets/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getAdminTicketMessages: async (id: string): Promise<TicketMessage[]> => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/support/tickets/${id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    sendAdminTicketMessage: async (id: string, message: string, attachments?: string[]): Promise<TicketMessage> => {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/admin/support/tickets/${id}/messages`, { message, attachments }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    updateTicketStatus: async (id: string, status: string): Promise<SupportTicket> => {
        const token = localStorage.getItem('token');
        const res = await axios.patch(`${API_URL}/admin/support/tickets/${id}/status`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    updateTicketPriority: async (id: string, priority: string): Promise<SupportTicket> => {
        const token = localStorage.getItem('token');
        const res = await axios.patch(`${API_URL}/admin/support/tickets/${id}/priority`, { priority }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
};
