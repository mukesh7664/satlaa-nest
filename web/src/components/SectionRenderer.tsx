import React from "react";

// About Us
import { SmartSolutionsBanner } from "@/components/Pages/aboutus/SmartSolutionsBanner";
import { StatsBanner } from "@/components/Pages/aboutus/StatsBanner";
import { AboutPlatformSection } from "@/components/Pages/aboutus/AboutPlatformSection";
import { TrustedBrandsSection as AboutTrustedBrandsSection } from "@/components/Pages/aboutus/TrustedBrandsSection";
import TrustedPartners from "@/components/Pages/aboutus/TrustedPartners";
import CollaborationsComponent from "@/components/Pages/aboutus/CollaborationsComponent";

import { FaqSection } from "@/components/FaqSection";

// Brand
import { ClickableBanner } from "@/components/Banner";
import { RichTextSection } from "@/components/sections/RichTextSection";

import { SECTIONS } from "@/sections";

// --- Wrapper Components ---

/**
 * Unified section component registry for SSR rendering (SectionRenderer).
 *
 * Rules:
 * - Every key must exactly match the `type` stored in the database.
 * - No Proxy, no fuzzy matching, no includes() guessing.
 * - Tag-based overrides below are explicit conditional logic, not dynamic guessing.
 */
export const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // ── Standard section registry (from @/sections) ───────────────────────────
  ...SECTIONS,

  // ── About Us (page-specific components, override generic ones) ────────────
  AboutUsHero: SmartSolutionsBanner,
  AboutPlatform: AboutPlatformSection,
  StatsBanner: StatsBanner,
  AboutTrustedBrands: AboutTrustedBrandsSection,
  TrustedPartners: TrustedPartners,
  Collaborations: CollaborationsComponent,

  // ── Generic Overrides ─────────────────────────────────────────────────────
  RichText: RichTextSection,
  ClickableBanner: ClickableBanner,

  // ── Legacy Brand Aliases ──────────────────────────────────────────────────
  BrandHero: SECTIONS.UnlockPotential,
  BrandProducts: SECTIONS.SoftwareCollection,
  BrandContent: SECTIONS.DlpFeatures,
};

interface SectionRendererProps {
  pageSection: any;
  index: number;
  extraProps?: Record<string, any>;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  pageSection,
  index,
  extraProps = {},
}) => {
  if (!pageSection || pageSection.isEnabled === false) {
    return null;
  }

  let type: string = "";
  let data: any = {};
  let key: string = "";
  let tags: string[] = [];

  if (pageSection.section) {
    // New API style (CMS Service based)
    type = pageSection.section.type;
    data = {
      ...pageSection.section.data,
      ...pageSection.settings,
      ...extraProps,
    };
    key = `section-${index},global-${pageSection.id || index}`;
    tags = pageSection.section.tags || [];
  } else if (pageSection.type) {
    // Flattened API style (for global sections like Header/Footer)
    type = pageSection.type;
    data = { 
      ...pageSection, 
      ...(pageSection.contentJson || pageSection.content_json || {}),
      ...extraProps 
    };
    key = `section-${index},global-${pageSection.id || index}`;
    tags = pageSection.tags || [];
  }

  if (!type) return null;

  // Start with the exact-match lookup — no fuzzy guessing
  let FinalComponent: React.ComponentType<any> | undefined = SECTION_COMPONENTS[type];

  // ── Explicit tag-based overrides (deterministic, not fuzzy) ──────────────
  if (type === "TrustedBrands" && tags.includes("about-us")) {
    FinalComponent = AboutTrustedBrandsSection;
  }

  if (type === "Reviews") {
    // FeedbackReviewsComponent handles reviews, but was removed as the file was dead code.
    // If needed again, restore commonComponents/ReviewComponet.tsx
  }

  if (tags.includes("brand-template") || tags.includes("template")) {
    if (type === "Banner") {
      FinalComponent = ClickableBanner;
      if (data.image && !data.imageUrl) data.imageUrl = data.image;
      if (data.linkUrl && !data.link) data.link = data.linkUrl;
    }
  }

  if (type === "FAQ" || type === "BrandFAQ") {
    FinalComponent = FaqSection;
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (!FinalComponent) {
    return null;
  }

  // Generate section ID from type (convert to kebab-case)
  const sectionId = type
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();

  return (
    <div id={sectionId} key={key}>
      <FinalComponent data={data} />
    </div>
  );
};
