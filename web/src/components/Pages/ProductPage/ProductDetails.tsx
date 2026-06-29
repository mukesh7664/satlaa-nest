"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import clsx from "clsx";
import { motion } from "motion/react";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- Data for Navigation and Sections ---

export interface BundleProductItem {
  product: {
    _id: string;
    productInfo: {
      title: string;
      brand: string;
    };
    icon?: {
      url: string;
      alt: string;
    };
    images?: Array<{
      url: string;
      alt: string;
    }>;
    slug: string;
  };
  quantity: number;
}

interface Overview {
  title?: string;
  content?: string;
  enabled?: boolean;
}

interface FeaturePoint {
  title?: string;
  content?: string;
}

interface Features {
  title?: string;
  description?: string;
  featurePoints?: FeaturePoint[];
  checklist?: string[];
  enabled?: boolean;
}

interface Banner {
  image: string;
  alt: string;
  title: string;
  subtitle: string;
}

interface Specification {
  title?: string;
  value?: string;
}

interface Specifications {
  title?: string;
  columns?: Specification[][];
  enabled?: boolean;
}

interface Plan {
  name?: string;
  price?: string;
  description?: string;
}

interface Pricing {
  title?: string;
  plans?: Plan[];
  enabled?: boolean;
}

const placeholderAvatar = "/images/place.jpg";

const isValidImageSrc = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("data:")) {
    return true;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

interface FaqItem {
  question: string;
  answer: string;
}

interface Faq {
  title?: string;
  questions?: FaqItem[];
  enabled?: boolean;
}

interface WhyChoosePoint {
  title?: string;
  content?: string;
}

interface WhyChoose {
  title?: string;
  points?: WhyChoosePoint[];
  enabled?: boolean;
}

interface BundleOverview {
  title?: string;
  content?: string;
  enabled?: boolean;
}

interface BundleFeatures {
  title?: string;
  points?: string[];
  enabled?: boolean;
}

interface ProductPoints {
  title?: string;
  points?: string[];
  enabled?: boolean;
}

interface ProductDetails {
  sections?: {
    id: string;
    title: string;
  }[];
  bundleOverview?: BundleOverview;
  bundleFeatures?: BundleFeatures;
  overview?: Overview;
  whyChoose?: WhyChoose;
  banner?: Banner;
  features?: Features;
  productPoints?: ProductPoints;
  specifications?: Specifications;
  pricing?: Pricing;
  faq?: Faq;
}

interface SelectedVariant {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  description?: string;

  attributes?: Record<string, string>;
}

interface SectionProps {
  id: string;
  observerRef?: (node?: Element | null | undefined) => void;
  selectedVariant?: SelectedVariant | null;
}

interface OverviewSectionProps extends SectionProps {
  overview: Overview;
}

const OverviewSection = ({
  id,
  observerRef,
  overview,
}: OverviewSectionProps) => {
  if (!overview || !overview.content) return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {overview.title || "Overview"}
        </h2>
        <hr className="border-gray-200 mb-6" />
        <p className="text-gray-600 mb-6">{overview.content}</p>
      </div>
    </motion.section>
  );
};

interface FeaturesSectionProps extends SectionProps {
  features: Features;
}

const FeaturesSection = ({
  id,
  observerRef,
  features,
}: FeaturesSectionProps) => {
  if (
    !features ||
    (!features.featurePoints?.length && !features.checklist?.length)
  )
    return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {features.title || "Features"}
        </h2>
        <hr className="border-gray-200 mb-6" />

        {features.description && (
          <p className="text-gray-600 mb-6">{features.description}</p>
        )}

        {features.featurePoints && features.featurePoints.length > 0 && (
          <ul className="space-y-3 text-gray-600 mb-6">
            {features.featurePoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold">{point.title}</span>{" "}
                  {point.content}
                </div>
              </li>
            ))}
          </ul>
        )}

        {features.checklist && features.checklist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {Array.from({ length: 3 }).map((_, colIndex) => (
              <div key={colIndex} className="space-y-2">
                {features
                  .checklist!.slice(
                    colIndex * Math.ceil(features.checklist!.length / 3),
                    (colIndex + 1) * Math.ceil(features.checklist!.length / 3)
                  )
                  .map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      {item}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

interface BannerSectionProps {
  banner?: Banner;
}

const BannerSection = ({ banner }: BannerSectionProps) => {
  if (!banner || !banner.image) return null;

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative h-48 w-full">
          <Image
            src={banner.image}
            alt={banner.alt || "Banner image"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-2">{banner.title || ""}</h3>
              <p className="text-lg">{banner.subtitle || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SpecificationsSectionProps extends SectionProps {
  specifications: Specifications;
  selectedVariant?: SelectedVariant | null;
}

const SpecificationsSection = ({
  id,
  observerRef,
  specifications,
  selectedVariant,
}: SpecificationsSectionProps) => {
  if (
    !specifications ||
    !specifications.columns ||
    specifications.columns.length === 0
  )
    return null;

  // Combine variant attributes with main specs
  const variantAttrs = selectedVariant?.attributes || {};
  
  // Create a copy of columns to avoid mutation
  const displayColumns = specifications.columns.map(col => [...col]);

  // Convert attributes to specs
  Object.entries(variantAttrs).forEach(([key, val]) => {
    const newSpec = { 
      title: key.charAt(0).toUpperCase() + key.slice(1), 
      value: val as string
    };
    
    const exists = displayColumns.some((col: any) => 
      col.some((s: any) => s.title?.toLowerCase() === newSpec.title?.toLowerCase())
    );
    if (!exists) {
      displayColumns[0].push(newSpec);
    } else {
      // Update existing spec with variant value
      displayColumns.forEach((col: any) => {
        col.forEach((s: any) => {
          if (s.title?.toLowerCase() === newSpec.title?.toLowerCase()) {
            s.value = newSpec.value;
          }
        });
      });
    }
  });

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {specifications.title || "Specifications"}
        </h2>
        <hr className="border-gray-200 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayColumns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {column &&
                column.map((spec, specIndex) => (
                  <div key={specIndex} className="animate-in fade-in duration-500">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {spec.title}:
                    </h4>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                      {spec.value}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

interface PricingSectionProps extends SectionProps {
  pricing: Pricing;
  onPlanSelect?: (planName: string) => void;
}

const PricingSection = ({
  id,
  observerRef,
  pricing,
  onPlanSelect,
}: PricingSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!pricing || !pricing.plans || pricing.plans.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {pricing.title || "Pricing"}
        </h2>
        <hr className="border-gray-200 mb-6" />
        <div className="relative">
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .draggable {
              cursor: grab;
            }
            .draggable:active {
              cursor: grabbing;
            }
          `}</style>
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide draggable select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="flex gap-6 pb-4"
              style={{
                width: `calc(${
                  pricing.plans.length * 280 + (pricing.plans.length - 1) * 24
                }px)`,
              }}
            >
              {pricing.plans.map((plan, index) => (
                <div
                  key={index}
                  className="border border-blue-200 rounded-lg p-6 text-left hover:bg-blue-600 hover:text-white transition-all duration-300 group cursor-pointer flex-shrink-0"
                  style={{ width: "280px" }}
                >
                  <h3 className="text-lg font-semibold group-hover:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-4xl font-bold my-2 group-hover:text-yellow-300">
                    {plan.price}
                  </p>
                  <p className="text-sm text-gray-500 mb-4 group-hover:text-white">
                    {plan.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 group-hover:bg-white group-hover:text-blue-600 group-hover:border-white"
                    onClick={() => onPlanSelect?.(plan.name || "")}
                  >
                    View Plan
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

interface FaqSectionProps extends SectionProps {
  faq: Faq;
}

const FaqSection = ({ id, observerRef, faq }: FaqSectionProps) => {
  if (!faq || !faq.questions || faq.questions.length === 0) return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{faq.title || "FAQ"}</h2>
        <hr className="border-gray-200 mb-6" />

        <Accordion type="single" collapsible className="w-full">
          {faq.questions.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-gray-200 last:border-b-0"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 px-0">
                <span className="font-medium text-gray-900">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0 px-0">
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
};

interface WhyChooseSectionProps extends SectionProps {
  whyChoose: WhyChoose;
}

const WhyChooseSection = ({
  id,
  observerRef,
  whyChoose,
}: WhyChooseSectionProps) => {
  if (!whyChoose || !whyChoose.points || whyChoose.points.length === 0)
    return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">
          {whyChoose.title || "Why Choose"}
        </h3>
        <hr className="border-gray-200 mb-6" />
        <ul className="space-y-3 text-gray-600">
          {whyChoose.points.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold">{point.title}</span>{" "}
                {point.content}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
};

interface BundleOverviewSectionProps extends SectionProps {
  bundleOverview: BundleOverview;
}

const BundleOverviewSection = ({
  id,
  observerRef,
  bundleOverview,
}: BundleOverviewSectionProps) => {
  if (!bundleOverview || !bundleOverview.content) return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {bundleOverview.title || "Bundle Overview"}
        </h2>
        <hr className="border-gray-200 mb-6" />
        <p className="text-gray-600 mb-6">{bundleOverview.content}</p>
      </div>
    </motion.section>
  );
};

interface BundleFeaturesSectionProps extends SectionProps {
  bundleFeatures: BundleFeatures;
}

const BundleFeaturesSection = ({
  id,
  observerRef,
  bundleFeatures,
}: BundleFeaturesSectionProps) => {
  if (
    !bundleFeatures ||
    !bundleFeatures.points ||
    bundleFeatures.points.length === 0
  )
    return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">
          {bundleFeatures.title || "Bundle Features"}
        </h3>
        <hr className="border-gray-200 mb-6" />
        <ul className="space-y-3 text-gray-600">
          {bundleFeatures.points.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>{point}</div>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
};

interface BundleProductsSectionProps extends SectionProps {
  bundleProducts: BundleProductItem[];
  bundleOverview?: BundleOverview;
}

const BundleProductsSection = ({
  id,
  observerRef,
  bundleProducts,
  bundleOverview,
}: BundleProductsSectionProps) => {
  if (!bundleProducts || bundleProducts.length === 0) return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {bundleOverview?.title || "What's Included"}
        </h2>
        <hr className="border-gray-200 mb-6" />

        {bundleOverview?.content && (
          <p className="text-gray-600 mb-6">{bundleOverview.content}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundleProducts.map((item, index) => (
            <BundleProductCard key={index} item={item} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const BundleProductCard = ({ item }: { item: BundleProductItem }) => {
  const product = item.product;
  const imageUrl =
    product.icon?.url ||
    (product.images && product.images.length > 0
      ? product.images[0].url
      : placeholderAvatar);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center gap-3 group p-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="relative w-10 h-10 flex-shrink-0 bg-white rounded overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.productInfo.title}
          fill
          className="object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.productInfo.title}
        </h4>
        {item.quantity > 1 && (
          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
        )}
      </div>
    </Link>
  );
};

interface ProductPointsSectionProps extends SectionProps {
  productPoints: ProductPoints;
}

const ProductPointsSection = ({
  id,
  observerRef,
  productPoints,
}: ProductPointsSectionProps) => {
  if (
    !productPoints ||
    !productPoints.points ||
    productPoints.points.length === 0
  )
    return null;

  return (
    <motion.section
      id={id}
      ref={observerRef}
      className="mb-8 pt-16 -mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">
          {productPoints.title || "Product Points"}
        </h3>
        <hr className="border-gray-200 mb-6" />
        <ul className="space-y-3 text-gray-600">
          {productPoints.points.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>{point}</div>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
};

interface ProductInfoSectionProps {
  productDetails: ProductDetails;
  bundleProducts?: BundleProductItem[];
  selectedVariant?: SelectedVariant | null;
  onPlanSelect?: (planName: string) => void;
}

// --- Main Component with Scrollspy Logic ---
export function ProductInfoSection({
  productDetails,
  bundleProducts,
  selectedVariant,
  onPlanSelect,
}: ProductInfoSectionProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find((entry) => entry.isIntersecting)
          ?.target.id;
        if (visibleSection) {
          setActiveSection(visibleSection);
        }
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    const elements = document.querySelectorAll("section[id]");
    elements.forEach((el) => observer.current?.observe(el));

    return () => {
      elements.forEach((el) => observer.current?.unobserve(el));
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  return (
    <div className="pb-4">
      <div className="container-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Sticky Sidebar */}
          {productDetails.sections && productDetails.sections.length > 0 && (
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <nav className="shadow-md rounded-xl p-3 bg-white">
                  <ul className="space-y-1">
                    {productDetails.sections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={clsx(
                            "block px-4 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors duration-200",
                            activeSection === section.id
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}

          {/* Right: Scrollable Content */}
          <main
            className={clsx(
              "space-y-6",
              productDetails.sections && productDetails.sections.length > 0
                ? "lg:col-span-3"
                : "lg:col-span-4"
            )}
          >
            {bundleProducts && bundleProducts.length > 0 ? (
              <BundleProductsSection
                id="whats-included"
                bundleProducts={bundleProducts}
                bundleOverview={productDetails.bundleOverview}
              />
            ) : (
              productDetails.bundleOverview && (
                <BundleOverviewSection
                  id="bundle-overview"
                  bundleOverview={productDetails.bundleOverview}
                />
              )
            )}
            {productDetails.bundleFeatures && (
              <BundleFeaturesSection
                id="bundle-features"
                bundleFeatures={productDetails.bundleFeatures}
              />
            )}
            {productDetails.overview && (
              <OverviewSection
                id="overview"
                overview={productDetails.overview}
              />
            )}
            {productDetails.whyChoose && (
              <WhyChooseSection
                id="why-choose"
                whyChoose={productDetails.whyChoose}
              />
            )}
            {productDetails.banner && (
              <BannerSection banner={productDetails.banner} />
            )}
            {productDetails.features && (
              <FeaturesSection
                id="features"
                features={productDetails.features}
              />
            )}
            {productDetails.productPoints && (
              <ProductPointsSection
                id="product-points"
                productPoints={productDetails.productPoints}
              />
            )}
            {productDetails.specifications && (
              <SpecificationsSection
                id="specifications"
                specifications={productDetails.specifications}
                selectedVariant={selectedVariant}
              />
            )}
            {productDetails.pricing && (
              <PricingSection
                id="pricing"
                pricing={productDetails.pricing}
                onPlanSelect={onPlanSelect}
              />
            )}
            {productDetails.faq && (
              <FaqSection id="faq" faq={productDetails.faq} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
