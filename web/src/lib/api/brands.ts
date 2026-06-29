const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  legalName?: string;
  logo?: {
    url?: string;
    publicId?: string;
  };
  banner?: {
    url?: string;
    publicId?: string;
  };
  description?: string;
  shortDescription?: string;
  foundedYear?: number;
  headquarters?: string;
  companySize?: string;
  industryType?: string;
  email?: string;
  phone?: string;
  supportEmail?: string;
  supportPhone?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  brandType: "software" | "hardware" | "service" | "saas" | "hybrid";
  isVerified: boolean;
  isFeatured: boolean;
  trustScore: number;
  rating: {
    average: number;
    count: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalSales: number;
    totalReviews: number;
    viewCount: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections?:
  | Array<{
    id: string;
    type: string;
    isEnabled: boolean;
    data: any;
  }>
  | {
    banner?: {
      show: boolean;
      imageUrl?: string;
      linkUrl?: string;
    };
    unlockPotential?: {
      show: boolean;
      title?: string;
      description?: string;
      image?: string;
      floatingProducts?: Array<{
        title: string;
        subtitle: string;
        icon: string;
      }>;
      buttonText?: string;
      buttonLink?: string;
    };
    banner2?: {
      show: boolean;
      imageUrl?: string;
      linkUrl?: string;
    };
    teamTools?: {
      show: boolean;
      title?: string;
      description?: string;
      tools?: Array<{
        name: string;
        icon?: string;
        description?: string;
      }>;
      videoUrl?: string;
      points?: string[];
    };
    softwareCollection?: {
      show: boolean;
      title?: string;
      description?: string;
      collectionSlugs?: string[];
    };
    dualBanner?: {
      show: boolean;
      banner1?: { imageUrl?: string; linkUrl?: string };
      banner2?: { imageUrl?: string; linkUrl?: string };
    };
    dlpFeatures?: {
      show: boolean;
      title?: string;
      description?: string;
      features?: Array<{
        icon?: string;
        title: string;
        description: string;
        isFeatured?: boolean;
      }>;
    };
    powerfulFeatures?: {
      show: boolean;
      title?: string;
      image?: string;
      features?: Array<{
        title: string;
        description: string;
        image?: string;
      }>;
    };
    reviews?: {
      show: boolean;
      title?: string;
      description?: string;
      image?: string;
      ratingCategories?: Array<{
        label: string;
        rating: number;
        count: string;
      }>;
      testimonials?: Array<{
        rating: number;
        text: string;
        authorName: string;
        authorRole?: string;
        authorAvatar?: string;
      }>;
    };
    faq?: {
      show: boolean;
      title?: string;
      image?: string;
      faqs?: Array<{ question: string; answer: string }>;
    };
    topBundles?: {
      show: boolean;
      title?: string;
      description?: string;
    };
  };
  pageSections?: Array<{
    section: any;
    isEnabled: boolean;
    sortOrder: number;
    customData?: any;
    _id?: string;
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GetBrandsParams extends PaginationParams {
  search?: string;
  brandType?: "software" | "hardware" | "service" | "saas" | "hybrid";
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface GetBrandsResponse {
  brands: Brand[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface GetBrandResponse {
  _id: string;
  name: string;
  slug: string;
  legalName?: string;
  logo?: {
    url?: string;
    publicId?: string;
  };
  banner?: {
    url?: string;
    publicId?: string;
  };
  description?: string;
  shortDescription?: string;
  foundedYear?: number;
  headquarters?: string;
  companySize?: string;
  industryType?: string;
  email?: string;
  phone?: string;
  supportEmail?: string;
  supportPhone?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  brandType: "software" | "hardware" | "service" | "saas" | "hybrid";
  isVerified: boolean;
  isFeatured: boolean;
  trustScore: number;
  rating: {
    average: number;
    count: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalSales: number;
    totalReviews: number;
    viewCount: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections?:
  | Array<{
    id: string;
    type: string;
    isEnabled: boolean;
    data: any;
  }>
  | {
    banner?: {
      show: boolean;
      imageUrl?: string;
      linkUrl?: string;
    };
    unlockPotential?: {
      show: boolean;
      title?: string;
      description?: string;
      image?: string;
      floatingProducts?: Array<{
        title: string;
        subtitle: string;
        icon: string;
      }>;
      buttonText?: string;
      buttonLink?: string;
    };
    banner2?: {
      show: boolean;
      imageUrl?: string;
      linkUrl?: string;
    };
    teamTools?: {
      show: boolean;
      title?: string;
      description?: string;
      tools?: Array<{
        name: string;
        icon?: string;
        description?: string;
      }>;
      videoUrl?: string;
      points?: string[];
    };
    softwareCollection?: {
      show: boolean;
      title?: string;
      description?: string;
      collectionSlugs?: string[];
    };
    dualBanner?: {
      show: boolean;
      banner1?: { imageUrl?: string; linkUrl?: string };
      banner2?: { imageUrl?: string; linkUrl?: string };
    };
    dlpFeatures?: {
      show: boolean;
      title?: string;
      description?: string;
      features?: Array<{
        icon?: string;
        title: string;
        description: string;
        isFeatured?: boolean;
      }>;
    };
    powerfulFeatures?: {
      show: boolean;
      title?: string;
      image?: string;
      features?: Array<{
        title: string;
        description: string;
        image?: string;
      }>;
    };
    reviews?: {
      show: boolean;
      title?: string;
      description?: string;
      image?: string;
      ratingCategories?: Array<{
        label: string;
        rating: number;
        count: string;
      }>;
      testimonials?: Array<{
        rating: number;
        text: string;
        authorName: string;
        authorRole?: string;
        authorAvatar?: string;
      }>;
    };
    faq?: {
      show: boolean;
      title?: string;
      image?: string;
      faqs?: Array<{ question: string; answer: string }>;
    };
    topBundles?: {
      show: boolean;
      title?: string;
      description?: string;
    };
  };
  pageSections?: Array<{
    section: any;
    isEnabled: boolean;
    sortOrder: number;
    customData?: any;
    _id?: string;
  }>;
}

/**
 * Fetch all brands
 */
export async function getAllBrands(
  params?: GetBrandsParams
): Promise<GetBrandsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.brandType) queryParams.append("brandType", params.brandType);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());
  if (params?.isFeatured !== undefined)
    queryParams.append("isFeatured", params.isFeatured.toString());

  const url = `${API_URL}/brands${queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Disable caching for dynamic content
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brands: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch featured brands
 */
export async function getFeaturedBrands(limit: number = 10): Promise<Brand[]> {
  const url = `${API_URL}/brands/featured?limit=${limit}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch featured brands: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single brand by slug
 */
export async function getBrandBySlug(slug: string): Promise<GetBrandResponse> {
  const url = `${API_URL}/brands/slug/${slug}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brand: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single brand by ID
 */
export async function getBrandById(id: string): Promise<GetBrandResponse> {
  const url = `${API_URL}/brands/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brand: ${response.statusText}`);
  }

  return response.json();
}
