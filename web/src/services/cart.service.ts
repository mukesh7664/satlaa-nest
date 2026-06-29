import axios from "axios";

const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    product: {
        title: string;
        media: Array<{ url: string; is_main: boolean }>;
        is_variant: boolean;
        parent?: {
            title: string;
            media: Array<{ url: string; is_main: boolean }>;
        };
        manualCurrencyPrices?: Record<string, number>;
    };
    price: number;
    quantity: number;
    subtotal: number;
    selectedVariant?: any;
    purchaseType?: "online" | "quote" | "both";
    notes?: string;
}

export interface Cart {
    id: string;
    storeId: string;
    customerId?: string;
    sessionId?: string;
    items: CartItem[];
    totals: {
        subtotal: number;
        discount: number;
        discountAmount: number;
        tax: number;
        shippingCharges: number;
        total: number;
        currency: string;
    };
    discountCode?: string;
    expiresAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const cartService = {
    getCart: async (sessionId?: string) => {
        const response = await axios.get<Cart>(`${API_URL}/cart`, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    addToCart: async (item: any, sessionId?: string) => {
        const response = await axios.post<Cart>(`${API_URL}/cart/items`, item, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    removeItem: async (cartItemId: string, sessionId?: string) => {
        const response = await axios.delete<Cart>(`${API_URL}/cart/items/${cartItemId}`, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    clearCart: async (sessionId?: string) => {
        const response = await axios.delete<Cart>(`${API_URL}/cart`, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateItemQuantity: async (cartItemId: string, quantity: number, sessionId?: string) => {
        const response = await axios.post<Cart>(`${API_URL}/cart/items/${cartItemId}`, { quantity }, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    applyDiscount: async (code: string, sessionId?: string) => {
        const response = await axios.post<Cart>(`${API_URL}/cart/discount`, { code }, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    removeDiscount: async (sessionId?: string) => {
        const response = await axios.delete<Cart>(`${API_URL}/cart/discount`, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    mergeCarts: async (sessionId: string) => {
        const response = await axios.post<Cart>(`${API_URL}/cart/merge`, {}, {
            params: { sessionId },
            headers: getAuthHeader(),
        });
        return response.data;
    },
};
