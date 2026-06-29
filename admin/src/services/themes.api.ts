import { apiService as api } from './api';

export const themesApi = {
  getAll: async (all = false) => {
    const response = await api.get('/admin/themes', { params: { all } });
    return response; // Usually response is already the data in this apiService
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/admin/themes/${id}`);
    return response;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/themes', data);
    return response;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/admin/themes/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admin/themes/${id}`);
    return response;
  },
  
  install: async (id: string) => {
    const response = await api.post(`/admin/themes/${id}/install`, {});
    return response;
  },

  // Developer utility to seed initial themes
  seedInitial: async () => {
    const response = await api.post('/admin/themes/seed-initial', {});
    return response;
  }
};
