"use client";
import { usePathname } from "next/navigation";
import { usePreview } from "@/contexts/PreviewContext";
import { SectionRenderer } from "@/components/SectionRenderer";

interface FooterWrapperProps {
  children: React.ReactNode;
  globalSections?: any[];
}

export const FooterWrapper = ({ children, globalSections = [] }: FooterWrapperProps) => {
  const pathname = usePathname();
  const { footerSettings, isPreview, hasSectionFooter } = usePreview();

  // Determine if this is a CMS-managed page (Hompage, CMS Page, or Preview)
  const isCmsPage =
    pathname === "/" ||
    pathname?.startsWith("/pages/") ||
    pathname?.startsWith("/preview");

  // In Admin Preview, we ONLY render the footer via the Page Builder's internal sections to avoid duplication.
  if (isPreview) {
    return null;
  }

  return (
    <div className="footer-wrapper">
      {globalSections.length > 0 ? (
        globalSections.map((section, index) => (
          <SectionRenderer 
            key={`global-footer-${index}`} 
            pageSection={section} 
            index={index} 
          />
        ))
      ) : (
        children
      )}
    </div>
  );
};
