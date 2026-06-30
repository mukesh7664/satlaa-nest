import { SectionRenderer } from "@/components/SectionRenderer";
import { CheckoutMain } from "@/components/sections/CheckoutMain";

async function getPage(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/homepage/pages/${slug}`,
      {
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

export default async function CheckoutPage() {
  // Try to fetch the 'checkout' template page
  const page = await getPage('checkout');

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
                key={section.id || `checkout-${index}`}
                pageSection={section}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to the hardcoded CheckoutMain section if no dynamic sections are found
  return <CheckoutMain />;
}
