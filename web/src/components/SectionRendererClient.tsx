"use client";
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
import { CLIENT_SECTIONS } from "@/sections/client-index";
import { CartMain } from "@/components/sections/CartMain";
import { CheckoutMain } from "@/components/sections/CheckoutMain";

// --- Wrapper Components ---

/**
 * Unified section component registry for client-side rendering (SectionRendererClient).
 *
 * Rules:
 * - Every key must exactly match the `type` stored in the database.
 * - No Proxy, no fuzzy matching, no includes() guessing.
 * - Tag-based overrides below are explicit conditional logic, not dynamic guessing.
 */
export const CLIENT_SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // ── Standard section registry (from @/sections/client-index) ─────────────
  ...CLIENT_SECTIONS,

  // ── About Us (page-specific components, override generic ones) ────────────
  AboutUsHero: SmartSolutionsBanner,
  AboutPlatform: AboutPlatformSection,
  StatsBanner: StatsBanner,
  AboutTrustedBrands: AboutTrustedBrandsSection,
  TrustedPartners: TrustedPartners,
  Collaborations: CollaborationsComponent,

  // ── Generic Overrides ─────────────────────────────────────────────────────
  ClickableBanner: ClickableBanner,

  // ── Legacy Brand Aliases ──────────────────────────────────────────────────
  BrandHero: CLIENT_SECTIONS.UnlockPotential,
  BrandProducts: CLIENT_SECTIONS.SoftwareCollection,
  BrandContent: CLIENT_SECTIONS.DlpFeatures,

  // ── System Sections ───────────────────────────────────────────────────────
  CartMain: CartMain,
  CheckoutMain: CheckoutMain,
};

interface SectionRendererProps {
  pageSection: any;
  index: number;
  extraProps?: Record<string, any>;
}

export const SectionRendererClient: React.FC<SectionRendererProps> = ({
  pageSection,
  index,
  extraProps = {},
}) => {
  if (!pageSection || pageSection.isEnabled === false) {
    return null;
  }

  let type = "";
  let data: any = {};
  let key = "";
  let tags: string[] = [];

  if (pageSection.section) {
    type = pageSection.section.type;
    data = {
      ...(pageSection.section.data || {}),
      ...(pageSection.settings || {}),
      ...(pageSection.customData || {}),
      ...extraProps,
    };
    key = `global-${pageSection._id || index}`;
    tags = pageSection.section.tags || [];
  } else if (pageSection.type) {
    type = pageSection.type;
    data = {
      ...pageSection,
      ...extraProps,
    };
    key = `global-${pageSection.id || index}`;
    tags = pageSection.tags || [];
  } else {
    return null;
  }

  // Start with the exact-match lookup — no fuzzy guessing
  let FinalComponent: React.ComponentType<any> | undefined =
    CLIENT_SECTION_COMPONENTS[type];

  // ── Explicit tag-based overrides (deterministic, not fuzzy) ──────────────
  if (type === "TrustedBrands" && tags.includes("about-us")) {
    FinalComponent = AboutTrustedBrandsSection;
  }

  if (type === "Reviews") {
    // FeedbackReviewsComponent handles reviews, but was removed as it was listed as dead code.
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
    console.warn(`No component found for section type: "${type}"`);
    return null;
  }

  const content = <FinalComponent key={key} data={data} sectionIndex={index} />;

  if (typeof window !== "undefined" && window.location.pathname === "/preview") {
    return (
      <div 
        className="group"
        style={{ position: "relative", width: "100%", cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: "SECTION_CLICKED", index }, "*");
        }}
      >
        <div 
          className="absolute inset-0 z-50 pointer-events-none transition-all duration-200 border-2 border-transparent group-hover:border-blue-500 group-hover:bg-blue-500/10"
        />
        {content}
      </div>
    );
  }

  return content;
};

