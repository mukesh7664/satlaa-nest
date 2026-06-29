import React from "react";
import HeroSection from "./Hero";
import { RichTextSection } from "@/components/sections/RichTextSection";
import CategoriesSection from "./TopCategories";
import TopSellingSection from "./TopSelling";
import TopTrending from "./TopTrending";
import BannerSection from "./Banner";
import DualBannerSection from "./DualBanner";
import SoftwareForGraphicDesign from "./SoftwareFor";
import FeedbackSection from "./Reviews";
import TestimonialsSection from "./Testimonials";
import TrustedBrandsSection from "./TrustedBrands";
import ArticlesSectionClient from "./Articles/Client"; // Use Client Version
import BlogHero from "./BlogHero";
import BlogRecent from "./BlogRecent";
import EmpoweringSection from "./Empowering";
import UnlockPotential from "./UnlockPotential";
import Banner2 from "./Banner2";
import TeamTools from "./TeamTools";

import DlpFeatures from "./DlpFeatures";
import PowerfulFeatures from "./PowerfulFeatures";

import BrandFAQ from "./BrandFAQ";

import CategoryGridSection from "./CategoryGrid";
import ProductHighlightSection from "./ProductHighlight";
import BulkOrderSection from "./BulkOrder";

import DualBannerWithSection from "./DualBannerWithSection";
import EventHeroSection from "./EventHero";
import FeaturedArtistsSection from "./FeaturedArtists";
import WhatWeOfferSection from "./WhatWeOffer";
import PartnersSection from "./Partners";
import AboutEventSection from "./AboutEvent";
import PreviousEditionsSection from "./PreviousEditions";
import SponsorshipSection from "./Sponsorship";
import EventHeaderSection from "./EventHeader";
import EventFooterSection from "./EventFooter";
import SamajAboutSection from "./SamajAbout";
import SamajHeroBanner from "./SamajHeroBanner";
import SamajRecentEvents from "./SamajRecentEvents";
import SamajGallery from "./SamajGallery";
import SamajHeader from "./SamajHeader";
import HeaderMain from "./HeaderMain";
import FooterMain from "./FooterMain";
import AyojakMembers from "./AyojakMembers";
import SamajHelp from "./SamajHelp";
import SamajAboutHero from "./SamajAboutHero";
import QuickAbout from "./QuickAbout";
import SamajContactInfo from "./SamajContactInfo";
import WhyChooseSamaj from "./WhyChooseSamaj";
import SamajEventSlider from "./SamajEventSlider";
import SamajCommittee from "./SamajCommittee";
import AboutUsHero from "./AboutUsHero";
import SportHero from "./Sport/Hero";
import SportAbout from "./Sport/About";
import SportAmenities from "./Sport/Amenities";
import SportCoaching from "./Sport/Coaching";
import SportGallery from "./Sport/Gallery";
import SportStats from "./Sport/Stats";
import SportPricing from "./Sport/Pricing";
import SportAppPromo from "./Sport/AppPromo";
import SportTestimonials from "./Sport/Testimonials";
import AutoServicesHero from "./AutoServices/Hero";
import AutoServicesCategoryGrid from "./AutoServices/CategoryGrid";
import AutoServicesPromotionBanner from "./AutoServices/PromotionBanner";
import AutoServicesServiceFeatures from "./AutoServices/ServiceFeatures";
import AutoServicesBrandMarquee from "./AutoServices/BrandMarquee";
import AutoServicesNewsletter from "./AutoServices/Newsletter";
import AutoServicesProductTabs from "./AutoServices/ProductTabs";
import AutoServicesPartFinder from "./AutoServices/PartFinder";
import AutoServicesReviews from "./AutoServices/Reviews";
import AutoServicesBigBanner from "./AutoServices/BigBanner";

// Cloth Template Sections
import ClothHero from "./Cloth/Hero";
import ClothExploreCollections from "./Cloth/ExploreCollections";
import ClothTabbedPromo from "./Cloth/TabbedPromo";
import ClothTopPicks from "./Cloth/TopPicks";
import ClothCollectionBanners from "./Cloth/CollectionBanners";
import ClothTrustFeatures from "./Cloth/TrustFeatures";
import ClothTestimonials from "./Cloth/Testimonials";
import ClothInstagram from "./Cloth/Instagram";

// Dental Template Sections
import DentalHero from "./Dental/Hero";
import DentalExplore from "./Dental/Explore";
import DentalPromoBanners from "./Dental/PromoBanners";
import DentalTopPicks from "./Dental/TopPicks";
import DentalMostPurchased from "./Dental/MostPurchased";
import DentalBrands from "./Dental/Brands";
import DentalTestimonials from "./Dental/Testimonials";
import DentalNewsletter from "./Dental/Newsletter";
import DentalHeader from "./DentalHeader";

// Shoes Template Sections
import ShoesHeader from "./ShoesHeader";
import ShoesHeroSlider from "./Shoes/HeroSlider";
import ShoesBrandCarousel from "./Shoes/BrandCarousel";
import ShoesDualSplitBanners from "./Shoes/DualSplitBanners";
import ShoesProductGrid from "./Shoes/ProductGrid";
import ShoesRunningSplitBlock from "./Shoes/RunningSplitBlock";
import ShoesBasketballSplitBlock from "./Shoes/BasketballSplitBlock";
import ShoesArtisticShowcase from "./Shoes/ArtisticShowcase";
import ShoesBlogCarousel from "./Shoes/BlogCarousel";
import ShoesFeaturesRow from "./Shoes/FeaturesRow";
import ShoesFooter from "./ShoesFooter";

import LandingHero from "./LandingHero";
import LandingServices from "./LandingServices";
import LandingContactInfo from "./LandingContactInfo";
import LandingFAQ from "./LandingFAQ";
import EcommerceFeaturedProducts from "./EcommerceFeaturedProducts";
import EcommercePromoBanner from "./EcommercePromoBanner";
import EcommerceCategoriesGrid from "./EcommerceCategoriesGrid";
import EcommerceTrustBadges from "./EcommerceTrustBadges";
import EcommerceBrandShowcase from "./EcommerceBrandShowcase";

/**
 * Explicit section component registry (Client-side, used by SectionRendererClient).
 * Articles uses its Client variant to avoid SSR issues.
 *
 * Rules:
 * - Every key must exactly match the `type` stored in the database.
 * - No Proxy, no fuzzy matching, no includes() guessing.
 * - Add a new entry here whenever a new section type is created.
 */
export const CLIENT_SECTIONS: Record<string, React.FC<any>> = {
  LandingHero: LandingHero,
  LandingServices: LandingServices,
  LandingContactInfo: LandingContactInfo,
  LandingFAQ: LandingFAQ,
  EcommerceFeaturedProducts: EcommerceFeaturedProducts,
  EcommercePromoBanner: EcommercePromoBanner,
  EcommerceCategoriesGrid: EcommerceCategoriesGrid,
  EcommerceTrustBadges: EcommerceTrustBadges,
  EcommerceBrandShowcase: EcommerceBrandShowcase,

  // ── Core ──────────────────────────────────────────────────────────────────
  Hero: HeroSection,
  GlobalHero: HeroSection,
  AboutUsHero: AboutUsHero,
  TopCategories: CategoriesSection,
  TopSelling: TopSellingSection,
  TopTrending: TopTrending,
  Banner: BannerSection,
  DualBanner: DualBannerSection,
  SoftwareFor: SoftwareForGraphicDesign,
  Reviews: FeedbackSection,
  Testimonials: TestimonialsSection,
  TrustedBrands: TrustedBrandsSection,
  Articles: ArticlesSectionClient,
  BlogHero: BlogHero,
  BlogRecent: BlogRecent,
  Empowering: EmpoweringSection,

  // ── Brand / Shopping ──────────────────────────────────────────────────────
  UnlockPotential: UnlockPotential,
  Banner2: Banner2,
  TeamTools: TeamTools,

  DlpFeatures: DlpFeatures,
  PowerfulFeatures: PowerfulFeatures,

  BrandFAQ: BrandFAQ,
  FAQ: BrandFAQ,

  // ── Generic ───────────────────────────────────────────────────────────────
  RichText: RichTextSection,

  CategoryGrid: CategoryGridSection,
  ProductHighlight: ProductHighlightSection,
  BulkOrder: BulkOrderSection,

  DualBannerWithSection: DualBannerWithSection,

  // ── Event ─────────────────────────────────────────────────────────────────
  EventHero: EventHeroSection,
  FeaturedArtists: FeaturedArtistsSection,
  WhatWeOffer: WhatWeOfferSection,
  Partners: PartnersSection,
  AboutEvent: AboutEventSection,
  PreviousEditions: PreviousEditionsSection,
  Sponsorship: SponsorshipSection,
  EventHeader: EventHeaderSection,
  EventFooter: EventFooterSection,

  // ── Samaj ─────────────────────────────────────────────────────────────────
  SamajAbout: SamajAboutSection,
  SamajHeroBanner: SamajHeroBanner,
  SamajRecentEvents: SamajRecentEvents,
  SamajGallery: SamajGallery,
  SamajHeader: SamajHeader,
  HeaderMain: HeaderMain,
  FooterMain: FooterMain,
  AyojakMembers: AyojakMembers,
  SamajHelp: SamajHelp,
  SamajAboutHero: SamajAboutHero,
  QuickAbout: QuickAbout,
  SamajContactInfo: SamajContactInfo,
  WhyChooseSamaj: WhyChooseSamaj,
  SamajEventSlider: SamajEventSlider,
  SamajCommittee: SamajCommittee,

  // ── Sport Template ────────────────────────────────────────────────────────
  SportHero: SportHero,
  SportAbout: SportAbout,
  SportAmenities: SportAmenities,
  SportCoaching: SportCoaching,
  SportGallery: SportGallery,
  SportStats: SportStats,
  SportPricing: SportPricing,
  SportAppPromo: SportAppPromo,
  SportTestimonials: SportTestimonials,

  // ── Explicit Aliases (DB type → Section Component) ───────────────────────
  // These map the new "categorized" types to their respective React components
  reviews_review_section: FeedbackSection,
  reviews_reviews_with_testimonial: TestimonialsSection,
  banner_single_banner: BannerSection,
  banner_brand_template_banner: BannerSection,
  RoundCollection: CategoriesSection, // Fallback to TopCategories as RoundCollection is missing in web
  AutoServicesHero: AutoServicesHero,
  AutoServicesCategoryGrid: AutoServicesCategoryGrid,
  AutoServicesPromotionBanner: AutoServicesPromotionBanner,
  AutoServicesServiceFeatures: AutoServicesServiceFeatures,
  AutoServicesBrandMarquee: AutoServicesBrandMarquee,
  AutoServicesNewsletter: AutoServicesNewsletter,
  AutoServicesProductTabs: AutoServicesProductTabs,
  AutoServicesPartFinder: AutoServicesPartFinder,
  AutoServicesReviews: AutoServicesReviews,
  AutoServicesBigBanner: AutoServicesBigBanner,

  // Cloth Template Sections
  ClothHero: ClothHero,
  ClothExploreCollections: ClothExploreCollections,
  ClothTabbedPromo: ClothTabbedPromo,
  ClothTopPicks: ClothTopPicks,
  ClothCollectionBanners: ClothCollectionBanners,
  ClothTrustFeatures: ClothTrustFeatures,
  ClothTestimonials: ClothTestimonials,
  ClothInstagram: ClothInstagram,

  // Dental Template Sections
  DentalHero: DentalHero,
  DentalExplore: DentalExplore,
  DentalPromoBanners: DentalPromoBanners,
  DentalTopPicks: DentalTopPicks,
  DentalMostPurchased: DentalMostPurchased,
  DentalBrands: DentalBrands,
  DentalTestimonials: DentalTestimonials,
  DentalNewsletter: DentalNewsletter,
  DentalHeader: DentalHeader,

  // Shoes Template Sections
  ShoesHeader: ShoesHeader,
  ShoesHeroSlider: ShoesHeroSlider,
  ShoesBrandCarousel: ShoesBrandCarousel,
  ShoesDualSplitBanners: ShoesDualSplitBanners,
  ShoesProductGrid: ShoesProductGrid,
  ShoesRunningSplitBlock: ShoesRunningSplitBlock,
  ShoesBasketballSplitBlock: ShoesBasketballSplitBlock,
  ShoesArtisticShowcase: ShoesArtisticShowcase,
  ShoesBlogCarousel: ShoesBlogCarousel,
  ShoesFeaturesRow: ShoesFeaturesRow,
  ShoesFooter: ShoesFooter,
};
