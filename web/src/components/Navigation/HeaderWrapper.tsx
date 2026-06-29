"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Navigation/Header";
import { usePreview } from "@/contexts/PreviewContext";
import { SectionRenderer } from "@/components/SectionRenderer";

interface HeaderWrapperProps {
  globalSections?: any[];
}

export const HeaderWrapper = ({ globalSections = [] }: HeaderWrapperProps) => {
  const pathname = usePathname();
  const { headerSettings, isPreview, hasSectionHeader } = usePreview();

  // Determine if this is a CMS-managed page (Hompage, CMS Page, or Preview)
  const isCmsPage =
    pathname === "/" ||
    pathname?.startsWith("/pages/") ||
    pathname?.startsWith("/preview");

  // In Admin Preview, we ONLY render the header via the Page Builder's internal sections to avoid duplication.
  if (isPreview) {
    return null;
  }

  return (
    <div id="main-header" className="relative z-50">
      {globalSections.length > 0 ? (
        globalSections.map((section, index) => (
          <SectionRenderer 
            key={`global-header-${index}`} 
            pageSection={section} 
            index={index} 
          />
        ))
      ) : (
        <Header />
      )}
    </div>
  );
};
