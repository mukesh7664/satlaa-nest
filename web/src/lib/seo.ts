import { fetchServer } from "./api/server-fetch";

export interface GlobalSEO {
  siteName: string;
  siteDescription: string;
  keywords: string[];
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  metaImage?: string;
}

export interface CustomScripts {
  headerScripts?: string;
  footerScripts?: string;
}

export interface SEOData {
  seo: GlobalSEO;
  customScripts: CustomScripts;
  siteFavicon?: string;
}

/**
 * Fetch global SEO settings from the backend
 */
export async function getGlobalSEO(): Promise<SEOData> {
  try {
    const res = await fetchServer("/settings/seo");
    if (!res.ok) {
      throw new Error(`Failed to fetch SEO settings: ${res.status}`);
    }
    const result = await res.json();
    return {
      seo: {
        ...(result.data?.seo || {}),
        siteName: result.data?.siteName || result.data?.seo?.siteName || "EPxWEB",
        siteDescription: result.data?.siteDescription || result.data?.seo?.siteDescription || "Your B2B Software Marketplace",
      },
      customScripts: result.data?.customScripts || {},
      siteFavicon: typeof result.data?.siteFavicon === 'string' ? result.data.siteFavicon : result.data?.siteFavicon?.url,
    };
  } catch (error: unknown) {
    console.error("Error fetching global SEO settings:", error);
    // Return default values on error
    return {
      seo: {
        siteName: "EPxWEB",
        siteDescription: "Your B2B Software Marketplace",
        keywords: [],
      },
      customScripts: {},
      siteFavicon: undefined,
    };
  }
}

/**
 * Generate metadata for a specific page
 * Merges page-specific SEO with global SEO settings
 */
export function generatePageMetadata(
  pageTitle?: string,
  pageDescription?: string,
  pageKeywords?: string[],
  pageImage?: string,
  globalSEO?: GlobalSEO
) {
  // Use page-specific title if provided, otherwise let layout template handle it
  // We return undefined for title if pageTitle is missing to use layout default
  const title = pageTitle || undefined;
  
  const description =
    pageDescription ||
    globalSEO?.siteDescription ||
    "Your B2B Software Marketplace";
  const keywords = pageKeywords?.length
    ? pageKeywords
    : globalSEO?.keywords || [];
  const image = pageImage || globalSEO?.metaImage;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      title,
      description,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

/**
 * Generate Google Analytics script
 */
export function getGoogleAnalyticsScript(gaId: string) {
  return `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
  `;
}

/**
 * Generate Google Tag Manager script (head)
 */
export function getGTMHeadScript(gtmId: string) {
  return `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');</script>
    <!-- End Google Tag Manager -->
  `;
}

/**
 * Generate Google Tag Manager noscript (body)
 */
export function getGTMBodyScript(gtmId: string) {
  return `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
  `;
}

/**
 * Generate Facebook Pixel script
 */
export function getFacebookPixelScript(pixelId: string) {
  return `
    <!-- Facebook Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Facebook Pixel Code -->
  `;
}

