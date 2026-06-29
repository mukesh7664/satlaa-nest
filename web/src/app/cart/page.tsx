import { SectionRenderer } from "@/components/SectionRenderer";
import { headers } from "next/headers";
import { CartMain } from "@/components/sections/CartMain";

async function getPage(slug: string, host: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/homepage/pages/${slug}`,
      {
        headers: {
          "x-tenant-domain": host,
        },
        next: { revalidate: 10 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export default async function CartPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  
  // Try to fetch the 'cart' template page
  const page = await getPage('cart', host);

  const sections = page?.sections?.filter((s: any) =>
    s.group === "template" || (!s.group && s.group !== "header" && s.group !== "footer" && s.group !== "top" && s.group !== "bottom")
  ) || [];

  // If we have dynamic sections, render them
  if (sections.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full flex flex-col">
          <div id="middle-sections" className="relative z-0">
            {sections.map((section: any, index: number) => (
              <SectionRenderer
                key={section.id || `cart-${index}`}
                pageSection={section}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to the hardcoded CartMain section if no dynamic sections are found
  return <CartMain />;
}
