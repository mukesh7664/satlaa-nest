const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface TopBarLink {
  label: string;
  url: string;
  isOpenInNewTab: boolean;
}

export interface TopBarSettings {
  isEnabled: boolean;
  content: string;
  backgroundColor: string;
  textColor: string;

  links: TopBarLink[];
  contactEmail?: string;
  contactPhone?: string;
  scrollingText?: string;
  enableScrolling?: boolean;
}

export interface PublicSettingsResponse {
  seo: {
    siteName?: string;
    siteDescription?: string;
    keywords?: string[];
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    metaImage?: string;
  };
  customScripts: {
    headerScripts?: string;
    footerScripts?: string;
  };
  topBar: TopBarSettings;
  searchHighlights?: {
    topCollection?: {
      _id: string;
      name: string;
      slug: string;
      image?: { url: string };
    };
    topProduct?: {
      _id: string;
      name: string;
      slug: string;
      images?: { url: string }[];
      price?: number;
      salePrice?: number;
    };
  };
  siteName: string;
  siteDescription: string;
  siteLogo?: {
    url?: string;
    publicId?: string;
  };
  siteFavicon?: {
    url?: string;
    publicId?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  menuAlignment?: 'left' | 'center' | 'right';
  menus?: any[];
  headerLogo?: any;
  sideImage1?: any;
  sideImage2?: any;
}

export async function getPublicSettings(): Promise<PublicSettingsResponse> {
  const url = `${API_URL}/settings/public?t=${Date.now()}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}
