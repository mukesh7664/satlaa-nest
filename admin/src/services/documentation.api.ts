import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1';

export interface Documentation {
    id: string;
    title: string;
    slug: string;
    content: string;
    category: string;
    sectionTitle?: string;
    order: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export const documentationApi = {
    getAll: async (): Promise<Documentation[]> => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/documentation`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getById: async (id: string): Promise<Documentation> => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/documentation/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    create: async (data: Partial<Documentation>): Promise<Documentation> => {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/admin/documentation`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    update: async (id: string, data: Partial<Documentation>): Promise<Documentation> => {
        const token = localStorage.getItem('token');
        const res = await axios.patch(`${API_URL}/admin/documentation/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`${API_URL}/admin/documentation/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
