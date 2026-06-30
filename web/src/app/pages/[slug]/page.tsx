import { SectionRenderer } from "@/components/SectionRenderer";
import { SectionVisibilityManager } from "@/components/SectionVisibilityManager";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGlobalSEO, generatePageMetadata } from "@/lib/seo";
import {
  getCollectionBySlug,
  type CollectionWithProducts,
} from "@/lib/api/collections";

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  template: string;
  createdAt: string;
  updatedAt: string;
  sections?: Array<{
    id?: string;
    clientId?: string;
    type?: string;
    isEnabled: boolean;
    sortOrder: number;
    customData?: any;
    section?: any; // Populated section or ID
    data?: any;
  }>;
}

interface PageResponse {
  success: boolean;
  data: Page;
}

async function getPage(slug: string): Promise<Page | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/homepage/pages/${slug}`,
      {
        next: { revalidate: 10 }, // Revalidate every 10 seconds
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: PageResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

// Removed local getGlobalSections in favor of layout.tsx implementation

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist.",
    };
  }

  // Get global SEO settings for fallback
  const seoData = await getGlobalSEO();

  // Generate metadata using page-specific SEO or fallback to global
  return generatePageMetadata(
    page.metaTitle || page.title,
    page.metaDescription,
    page.metaKeywords,
    undefined,
    seoData.seo
  );
}

export default async function PageDisplay({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);



  if (!page) {
    notFound();
  }

  // --- Fetch Collections Logic (Ported from BrandDetails) ---
  let collections: CollectionWithProducts[] = [];
  if (page.sections && page.sections.length > 0) {
    let collectionSlugs: string[] = [];
    page.sections.forEach((ps: any) => {
      // Handle both flattened (new) and nested (legacy/direct) styles
      const secData = {
        ...(ps.section?.data || {}),
        ...(ps.customData || {}),
        ...ps // Flattened properties (settings spread at top level)
      };
      if (secData.collectionSlugs && Array.isArray(secData.collectionSlugs)) {
        collectionSlugs.push(...secData.collectionSlugs);
      }
      if (secData.collectionSlug && typeof secData.collectionSlug === "string") {
        collectionSlugs.push(secData.collectionSlug);
      }
    });

    if (collectionSlugs.length > 0) {
      try {
        const uniqueSlugs = Array.from(new Set(collectionSlugs));
        const collectionPromises = uniqueSlugs.map((slug) =>
          getCollectionBySlug(slug, { limit: 100 })
            .then((res) => res.collection)
            .catch((err) => {
              console.error(`Error fetching collection ${slug}:`, err);
              return null;
            })
        );
        const results = await Promise.all(collectionPromises);
        collections = results.filter(
          (c): c is CollectionWithProducts => c !== null
        );
      } catch (err) {
        console.error("Error fetching collections for page:", err);
      }
    }
  }

  const templateSections = page.sections?.filter((s: any) =>
    s.group === "template" || (!s.group && s.group !== "header" && s.group !== "footer" && s.group !== "top" && s.group !== "bottom")
  ) || [];

  if (templateSections.length === 0) {
    return <div className="min-h-screen bg-white" />;
  }

  // Combined sections for the visibility manager (now just template sections as global are in layout)
  const combinedSections = [...templateSections];

  return (
    <div className="min-h-screen bg-white">
      <SectionVisibilityManager sections={combinedSections} />
      {/* Dynamic Sections */}
      <div className="w-full flex flex-col">
        {/* Middle sections */}
        <div id="middle-sections" className="relative z-0">
          {templateSections.map((section: any, index: number) => {
            return (
              <SectionRenderer
                key={section.id || `template-${index}`}
                pageSection={section}
                index={index}
                extraProps={{ collections }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
