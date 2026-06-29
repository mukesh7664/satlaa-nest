import { fetchServer } from "./server-fetch";
import { Product } from "./collections";

export interface ProductFilters {
    brand?: string;
    category?: string;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    search?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
    [key: string]: any; // Allow for dynamic attr_ attributes
}

export interface GetProductsResponse {
    success: boolean;
    data: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export async function getProducts(filters: ProductFilters): Promise<GetProductsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.set(key, String(value));
        }
    });

    const endpoint = `/products?${params.toString()}`;

    try {
        const res = await fetchServer(endpoint);
        if (!res.ok) {
            // Return empty structure on error to prevent page crash
            return { success: false, data: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 1 } };
        }
        return await res.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, data: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 1 } };
    }
}

export async function getFilters(category?: string): Promise<{ success: boolean; filters: any }> {
    try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);

        const res = await fetchServer(`/filters?${params.toString()}`);
        if (!res.ok) {
            console.error(`Failed to fetch filters: ${res.status} ${res.statusText}`);
            return { success: false, filters: null };
        }
        return await res.json();
    } catch (error) {
        console.error("Error fetching filters:", error);
        return { success: false, filters: null };
    }
}

export interface Brand {
    _id: string;
    name: string;
    slug: string;
}

export async function getBrands(): Promise<{ brands: Brand[] }> {
    try {

        const res = await fetchServer("/brands?isActive=true");
        if (!res.ok) {
            console.error(`Failed to fetch brands: ${res.status} ${res.statusText}`);
            return { brands: [] };
        }
        const data = await res.json();

        // internal API returns array, wrapper returns { brands: [] }?
        // Let's check format. curl said JSON array.
        // If array, wrap it.
        if (Array.isArray(data)) return { brands: data };
        return data; // assumes { brands: [...] }
    } catch (error) {
        console.error("Error fetching brands:", error);
        return { brands: [] };
    }
}

export async function getProductBySlug(slug: string): Promise<{ success: boolean; data: any }> {
    try {
        const res = await fetchServer(`/products/${slug}`);
        if (!res.ok) {
            if (res.status === 404) return { success: false, data: null };
            throw new Error(`Failed to fetch product: ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        console.error(`Error fetching product ${slug}:`, error);
        return { success: false, data: null };
    }
}

export async function getCategoryBySlug(slug: string): Promise<{ success: boolean; category: any }> {
    try {
        const res = await fetchServer(`/categories/slug/${slug}`);
        if (!res.ok) {
            if (res.status === 404) return { success: false, category: null };
            throw new Error(`Failed to fetch category: ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        console.error(`Error fetching category ${slug}:`, error);
        return { success: false, category: null };
    }
}

export async function getAllCategories(): Promise<{ success: boolean; categories: any[] }> {
    try {
        const res = await fetchServer('/categories');
        if (!res.ok) {
            throw new Error(`Failed to fetch categories: ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        console.error(`Error fetching categories:`, error);
        return { success: false, categories: [] };
    }
}
