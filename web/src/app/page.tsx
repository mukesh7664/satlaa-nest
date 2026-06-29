import { SectionRenderer } from "@/components/SectionRenderer";
import { SectionVisibilityManager } from "@/components/SectionVisibilityManager";
import type { Metadata } from "next";
import { getGlobalSEO, generatePageMetadata } from "@/lib/seo";
import { fetchServer } from "@/lib/api/server-fetch";

export const dynamic = "force-dynamic";

async function getGenericHomepage() {
  try {
    const res = await fetchServer("/homepage/pages/homepage");

    if (!res.ok) {
      return null; // Page not found
    }
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error: any) {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  // Try to specific 'homepage' page first (New System)
  const genericHomepage = await getGenericHomepage();

  // Get global SEO settings for fallback
  const seoData = await getGlobalSEO();

  return generatePageMetadata(
    genericHomepage?.metaTitle || "Home",
    genericHomepage?.metaDescription,
    genericHomepage?.metaKeywords,
    genericHomepage?.metaImage,
    seoData.seo
  );
}

export default async function Home() {
  // Try to specific 'homepage' page first (New System)
  const genericHomepage = await getGenericHomepage();

  // Strictly for SECTIONS:
  let finalSections: any[] = [];

  if (
    genericHomepage &&
    genericHomepage.sections &&
    genericHomepage.sections.length > 0
  ) {
    finalSections = genericHomepage.sections;
  }

  const templateSections = finalSections.filter((s: any) =>
    s.group === "template" || (!s.group && s.group !== "header" && s.group !== "footer" && s.group !== "top" && s.group !== "bottom")
  );

  if (templateSections.length === 0) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <SectionVisibilityManager sections={finalSections} />
      {/* Middle sections */}
      <div id="middle-sections" className="relative z-0">
        {templateSections.map((section: any) => {
          const index = finalSections.indexOf(section);
          return (
            <SectionRenderer
              key={`section-${index}`}
              pageSection={section}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
