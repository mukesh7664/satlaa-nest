import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";

import { HeaderWrapper } from "@/components/Navigation/HeaderWrapper";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { IntroWrapper } from "@/components/IntroWrapper";
import StoreProvider from "./StoreProvider";
import { Toaster } from "sonner";
import { Footer } from "@/components/Navigation/Footer";
import { FooterWrapper } from "@/components/Navigation/FooterWrapper";
import { AnalyticsScripts } from "@/components/Analytics";
import { getGlobalSEO, type SEOData } from "@/lib/seo";
import { ContactPopup } from "@/components/modals/ContactPopup";
import { FloatingButtons } from "@/components/FloatingButtons";
import { getPublicSettings } from "@/lib/settings";
import { PreviewProvider } from "@/contexts/PreviewContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { getGlobalSections } from "@/lib/sections";
import { validateTenant } from "@/lib/tenant";
import { RootDomainPortal } from "@/components/Navigation/RootDomainPortal";
import { StoreNotFound } from "@/components/Navigation/StoreNotFound";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getGlobalSEO();

  const siteName = seoData?.seo?.siteName || "EPxWEB";
  const siteDescription = seoData?.seo?.siteDescription || "Your B2B Software Marketplace";
  const favicon = seoData?.siteFavicon || "/favicon.ico";

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: siteDescription,
    openGraph: {
      title: siteName,
      description: siteDescription,
      images: seoData?.seo?.metaImage
        ? [{ url: seoData.seo.metaImage }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: seoData?.seo?.metaImage ? [seoData.seo.metaImage] : undefined,
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Perform tenant validation
  const tenant = await validateTenant();

  if (tenant.isRootDomain) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${poppins.variable} font-sans antialiased bg-slate-950`} suppressHydrationWarning>
          <RootDomainPortal cleanHost={tenant.cleanHost} />
        </body>
      </html>
    );
  }

  if (!tenant.isValid) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${poppins.variable} font-sans antialiased bg-slate-950`} suppressHydrationWarning>
          <StoreNotFound cleanHost={tenant.cleanHost} />
        </body>
      </html>
    );
  }

  // Parallel fetching of layout requirements
  const [globalSectionsResult, seoDataResult, publicSettingsResult] = await Promise.allSettled([
    getGlobalSections(),
    getGlobalSEO(),
    getPublicSettings()
  ]);

  const sections = globalSectionsResult.status === 'fulfilled' ? globalSectionsResult.value : { headers: [], footers: [] };
  const seoData = (seoDataResult.status === 'fulfilled' ? seoDataResult.value : {
    seo: { siteName: "EPxWEB", siteDescription: "", keywords: [] },
    customScripts: {}
  }) as SEOData;
  const publicSettings = publicSettingsResult.status === 'fulfilled' ? publicSettingsResult.value : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Custom Header Scripts */}
        {seoData?.customScripts?.headerScripts && (
          <div
            dangerouslySetInnerHTML={{
              __html: seoData.customScripts.headerScripts,
            }}
          />
        )}
        {/* Google Tag Manager noscript */}
        {seoData?.seo?.googleTagManagerId && seoData.seo.googleTagManagerId.startsWith("GTM-") && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${seoData.seo.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <StoreProvider>
          <PreviewProvider>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>
                  <Toaster position="top-right" richColors closeButton />
                  <HeaderWrapper globalSections={sections.headers} />
                  <div className=" mx-auto">{children}</div>
                  <ContactPopup />
                  <FloatingButtons
                    whatsappConfig={publicSettings?.whatsappButton}
                  />
                  <FooterWrapper globalSections={sections.footers}>
                    <Footer />
                  </FooterWrapper>
                </CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </PreviewProvider>
        </StoreProvider>
        {/* Analytics Scripts */}
        <AnalyticsScripts
          googleAnalyticsId={seoData.seo?.googleAnalyticsId}
          googleTagManagerId={seoData.seo?.googleTagManagerId}
          facebookPixelId={seoData.seo?.facebookPixelId}
        />
        {/* Custom Footer Scripts */}
        {seoData?.customScripts?.footerScripts && (
          <div
            dangerouslySetInnerHTML={{
              __html: seoData.customScripts.footerScripts,
            }}
          />
        )}
      </body>
    </html >
  );
}
