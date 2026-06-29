import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api/v1';

export const marketplaceApi = {
    getStores: async () => {
        const response = await axios.get(`${API_URL}/global/stores`);
        return response.data;
    },
    getProducts: async (limit = 20, offset = 0) => {
        const response = await axios.get(`${API_URL}/global/products`, {
            params: { limit, offset }
        });
        return response.data;
    },
    getStoreDetails: async (slug: string) => {
        const response = await axios.get(`${API_URL}/global/stores/${slug}`);
        return response.data;
    },
    getProductDetails: async (id: string) => {
        const response = await axios.get(`${API_URL}/global/products/${id}`);
        return response.data;
    }
};
