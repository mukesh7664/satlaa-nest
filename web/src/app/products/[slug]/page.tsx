import type { Metadata } from "next";
import ProductClient from "./ProductClient";
import { getProductBySlug } from "@/lib/api/products";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { success, data } = await getProductBySlug(slug);

  if (success && data) {
    const product = data;
    const seo = product.seo || {};
    const productInfo = product.productInfo || {};

    const title = seo.metaTitle || productInfo.title || "EPxWEB Product";
    const description =
      seo.metaDescription ||
      `Buy ${title} at the best price on EPxWEB. Guaranteed authentic products.`;

    // Determine the best image for OG
    let ogImage = "/images/og-image.jpg"; // Default
    if (product.images && product.images.length > 0) {
      ogImage = product.images[0].url;
    } else if (product.icon?.url) {
      ogImage = product.icon.url;
    }

    return {
      title: title,
      description: description,
      keywords: seo.keywords || [],
      openGraph: {
        title: title,
        description: description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
        images: [ogImage],
      },
      alternates: {
        canonical:
          seo.canonicalUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL}/products/${slug}`,
      },
    };
  }

  return {
    title: "Product Not Found | EPxWEB",
    description: "The requested product information could not be found.",
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const { success, data } = await getProductBySlug(slug);

  if (!success || !data) {
    notFound();
  }

  // Pre-process functionality that might be needed
  // (Logic like generating sections is duplicated in client for now or happens in client)
  // Ideally, backend returns pre-calculated sections, but we pass raw data for now.

  // Note: ProductClient duplicates some logic like generateSections. 
  // For strict SSR we should ideally run that logic here too, but client handles it from raw data.
  // The important part is data is already here.

  return <ProductClient initialProductData={data} />;
}
