const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  type: "manual" | "automatic";
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  productInfo?: {
    title: string;
    brand?: string;
    rating?: {
      stars: number;
    };
  };
  manualCurrencyPrices?: Record<string, number>;
  slug: string;
  productType?: string;
  purchaseType?: "online" | "quote" | "both";
  icon?: {
    url: string;
    alt?: string;
    type?: "image" | "video";
  };
  images?: Array<{
    url: string;
    alt?: string;
    position?: number;
    type?: "image" | "video";
  }>;
  simplePricing?: {
    basePrice?: number;
    discountedPrice?: number;
    currency?: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  status?: string;
  productStructureType?: "single" | "bundle";

  variants?: Array<{
    name: string;
    price: number;

  }>;
  pricingTiers?: Array<{
    userType: "Business" | "Home" | "Enterprise" | "Nonprofit";
    displayName: string;
    plans: Array<{
      planName: string;
      planSlug: string;
      description?: string;
      features: string[];
      pricing: {
        monthly: number;
        yearly: number;
        savings?: string;
      };
      isPopular: boolean;
      maxUsers?: number;
      storage?: string;
      displayOrder: number;
    }>;
  }>;
  productDetails?: {
    features?: { checklist: string[] };
    bundleFeatures?: { points: string[] };
    overview?: { content: string };
    [key: string]: unknown;
  };
}

export interface CollectionWithProducts extends Collection {
  products: Product[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GetCollectionsParams extends PaginationParams {
  type?: "manual" | "automatic";
  search?: string;
}

export interface GetCollectionsResponse {
  success: boolean;
  collections: Collection[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface GetCollectionResponse {
  success: boolean;
  collection: CollectionWithProducts;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Fetch collections for filter sidebar (showInSearchBar=true)
 */
export async function getFilterCollections(): Promise<{
  success: boolean;
  collections: Collection[];
}> {
  const url = `${API_URL}/collections/filters`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch filter collections: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch all collections
 */
export async function getAllCollections(
  params?: GetCollectionsParams
): Promise<GetCollectionsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.type) queryParams.append("type", params.type);
  if (params?.search) queryParams.append("search", params.search);

  const url = `${API_URL}/collections${queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Disable caching for dynamic content
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single collection by slug with products
 */
export async function getCollectionBySlug(
  slug: string,
  params?: PaginationParams
): Promise<GetCollectionResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const url = `${API_URL}/collections/slug/${slug}${queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collection: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single collection by ID with products
 */
export async function getCollectionById(
  id: string,
  params?: PaginationParams
): Promise<GetCollectionResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const url = `${API_URL}/collections/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collection: ${response.statusText}`);
  }

  return response.json();
}
