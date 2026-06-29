"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { ProductInfoSection } from "@/components/Pages/ProductPage/ProductDetails";
import OtherProducts from "@/components/Pages/ProductPage/Other-Products";
import ProductSection from "@/components/Pages/ProductPage/Product-Section";
import { Loader2, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { pushToDataLayer, GTM_EVENTS } from "@/lib/gtm";
import type { ProductVariant, SimplePricing, BundleProduct } from "@/components/Pages/ProductPage/Product-Section-Info";

interface ProductDetails {
  sections: { id: string; title: string }[];
  overview?: {
    title: string;
    content: string;
    enabled: boolean;
  };
  bundleOverview?: {
    title: string;
    content?: string;
    enabled: boolean;
  };
  bundleFeatures?: {
    title: string;
    enabled: boolean;
    points: string[];
  };
  whyChoose?: {
    title: string;
    enabled: boolean;
    points: Array<{ title: string; content: string }>;
  };
  banner?: {
    image: string;
    alt: string;
    title: string;
    subtitle: string;
    enabled: boolean;
  };
  features?: {
    title: string;
    enabled: boolean;
    description: string;
    featurePoints: Array<{ title: string; content: string }>;
    checklist: string[];
  };
  productPoints?: {
    title: string;
    enabled: boolean;
    points: string[];
  };
  specifications?: {
    title: string;
    enabled: boolean;
    columns: Array<Array<{ title: string; value: string }>>;
  };
  pricing?: {
    title: string;
    enabled: boolean;
    plans: Array<{ name: string; price: string; description: string }>;
  };
  faq?: {
    title: string;
    enabled: boolean;
    questions: Array<{ question: string; answer: string }>;
  };
}

interface ProductData {
  _id: string;
  brand: {
    _id: string;
    name: string;
    slug?: string;
  };
  saleBanner: {
    text: string;
    link: string;
    isActive: boolean;
  };
  breadcrumbs: string;
  quantityLabel?: string; // Custom label for quantity selector
  purchaseType?: "online" | "quote" | "both";
  images?: Array<{
    url: string;
    fullUrl?: string;
    position: number;
    alt: string;
    type?: "image" | "video";
  }>;
  productSection?: {
    mainImage: string;
    thumbnails: string[];
    alt: string;
  };
  productInfo: {
    brand: string;
    title: string;
    rating: {
      stars: number;
      reviews: string;
    };
    price: {
      current: string;
      original: string;
      discount: string;
      per: string;
    };
    offers: string[];
    viewOffers: string;
    amc: {
      title: string;
      plan: string;
      description: string;
    };
    plans: string[];
    ctas: {
      addToCart: string;
      getFreeDemo: string;
    };
  };
  guarantees: Array<{
    title: string;
    subtitle: string;
    icon?: string;
  }>;
  productDetails: ProductDetails;
  otherProducts: {
    title: string;
    products: Array<{
      name: string;
      category: string;
      price: number;
      originalPrice?: number;
      discount?: number;
      rating: number;
      image: string;
      backgroundColor: string;
      slug: string;
    }>;
  };
  category?: string;
  collections?: Array<{
    _id: string;
    name: string;
  }>;
  tags?: string[];
  flags?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  variants?: ProductVariant[];
  productPricingType?: "simple" | "tiered";
  simplePricing?: SimplePricing;
  manualCurrencyPrices?: Record<string, number>;
  bundleProducts?: BundleProduct[];
  video?: {
    url: string;
    altText: string;
    type: "video";
  } | null;
  tax_rate?: number;
  attributes?: Record<string, any>;
  is_returnable?: boolean;
  is_replaceable?: boolean;
  return_window_days?: number;
}
const guarantees = [
  { title: "100% GENUINE", subtitle: "PRODUCT" },
  { title: "Assured Best Price", subtitle: "Guaranteed" },
  { title: "Safe & Secure", subtitle: "Payment" },
  { title: "Get Instant Expert", subtitle: "Advice" },
];

// Generate sections array for navigation based on enabled sections
function generateSections(
  productDetails: ProductDetails,
  bundleProducts?: ProductData["bundleProducts"]
): Array<{ id: string; title: string }> {
  const sections: Array<{ id: string; title: string }> = [];

  // Bundle-specific sections (if bundle type)
  // If bundleProducts exists, we use the combined section with id="whats-included"
  // Otherwise we use the standalone overview with id="bundle-overview"
  if (bundleProducts && bundleProducts.length > 0) {
    sections.push({
      id: "whats-included",
      title: productDetails.bundleOverview?.title || "What's Included",
    });
  } else if (
    productDetails.bundleOverview?.enabled !== false &&
    productDetails.bundleOverview?.content
  ) {
    sections.push({
      id: "bundle-overview",
      title: productDetails.bundleOverview.title || "Bundle Overview",
    });
  }

  if (
    productDetails.bundleFeatures?.enabled !== false &&
    productDetails.bundleFeatures?.points &&
    productDetails.bundleFeatures.points.length > 0
  ) {
    sections.push({
      id: "bundle-features",
      title: productDetails.bundleFeatures.title || "Bundle Features",
    });
  }

  // Regular product sections
  if (
    productDetails.overview?.enabled !== false &&
    productDetails.overview?.content
  ) {
    sections.push({
      id: "overview",
      title: productDetails.overview.title || "Overview",
    });
  }
  if (
    productDetails.whyChoose?.enabled !== false &&
    productDetails.whyChoose?.points &&
    productDetails.whyChoose.points.length > 0
  ) {
    sections.push({
      id: "why-choose",
      title: productDetails.whyChoose.title || "Why Choose",
    });
  }
  if (
    productDetails.features?.enabled !== false &&
    ((productDetails.features?.featurePoints &&
      productDetails.features.featurePoints.length > 0) ||
      (productDetails.features?.checklist &&
        productDetails.features.checklist.length > 0))
  ) {
    sections.push({
      id: "features",
      title: productDetails.features.title || "Features",
    });
  }
  if (
    productDetails.productPoints?.enabled !== false &&
    productDetails.productPoints?.points &&
    productDetails.productPoints.points.length > 0
  ) {
    sections.push({
      id: "product-points",
      title: productDetails.productPoints.title || "Product Points",
    });
  }
  if (
    productDetails.specifications?.enabled !== false &&
    productDetails.specifications?.columns &&
    productDetails.specifications.columns.length > 0
  ) {
    sections.push({
      id: "specifications",
      title: productDetails.specifications.title || "Specifications",
    });
  }
  if (
    productDetails.pricing?.enabled !== false &&
    productDetails.pricing?.plans &&
    productDetails.pricing.plans.length > 0
  ) {
    sections.push({
      id: "pricing",
      title: productDetails.pricing.title || "Pricing",
    });
  }
  if (
    productDetails.faq?.enabled !== false &&
    productDetails.faq?.questions &&
    productDetails.faq.questions.length > 0
  ) {
    sections.push({ id: "faq", title: productDetails.faq.title || "FAQ" });
  }

  return sections;
}

interface ProductClientProps {
  initialProductData?: ProductData | null;
}

export default function ProductClient({ initialProductData }: ProductClientProps) {
  const { slug } = useParams();

  const [mounted, setMounted] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(initialProductData || null);
  const [loading, setLoading] = useState(!initialProductData);
  const [error, setError] = useState<string | null>(initialProductData ? null : null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(initialProductData?.variants?.[0] || null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch if no initial data or if slug changes (and doesn't match initial data)
    if (mounted && slug && !initialProductData) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, slug]);

  // Track view_item event
  useEffect(() => {
    if (productData) {
      const price = parseFloat(
        (
          selectedVariant?.price ||
          productData.simplePricing?.discountedPrice ||
          productData.simplePricing?.basePrice ||
          productData.productInfo.price.current ||
          "0"
        )
          .toString()
          .replace(/[^0-9.]/g, "")
      );

      pushToDataLayer(GTM_EVENTS.VIEW_ITEM, {
        currency: "USD", // Defaulting to USD, adjust if needed
        value: price,
        items: [
          {
            item_id: productData._id,
            item_name: productData.productInfo.title,
            item_brand:
              productData.brand?.name || productData.productInfo.brand,
            price: price,
            item_category: productData.category,
            quantity: 1,
            item_variant: selectedVariant?.name,
          },
        ],
      });
    }
  }, [productData, selectedVariant]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const response = await fetch(`${apiUrl}/products/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Product not found");
        }
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();

      if (data.success) {
        setProductData(data.data);

        // Initialize selected variant
        if (data.data.variants && data.data.variants.length > 0) {
          const sortedVariants = [...data.data.variants].sort(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)
          );
          setSelectedVariant(sortedVariants[0]);
        }
      } else {
        throw new Error(data.message || "Failed to fetch product");
      }
    } catch (err: unknown) {
      console.error("Error fetching product:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
  };

  const handlePlanSelect = (planName: string) => {
    if (!productData?.variants) return;

    const variant = productData.variants.find(
      (v) => v.name.toLowerCase() === planName.toLowerCase()
    );

    if (variant) {
      setSelectedVariant(variant);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !productData) {
    if (error === "Product not found") {
      notFound();
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">
              {error || "Failed to load product details"}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => fetchProduct()}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/products"
                className="block w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[#F5F5F5] ">
      {/* Top Sale Banner */}
      {productData.saleBanner?.isActive && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-center py-2 text-sm font-semibold">
          {productData.saleBanner.text}{" "}
          <a href={productData.saleBanner.link} className="underline">
            Shop Now
          </a>
        </div>
      )}


      <div className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto py-1">
        {/* Breadcrumbs */}
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 my-2 ml-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          {productData.brand?.slug ? (
            <Link
              href={`/brands/${productData.brand.slug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {productData.brand.name}
            </Link>
          ) : (
            <span>
              {productData.brand?.name || productData.productInfo.brand}
            </span>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">
            {productData.productInfo.title}
          </span>
        </nav>

        {/* Product Badges */}

        {/* Product Details Section */}
        <ProductSection
          images={[
            ...(productData.video ? [{ ...productData.video, position: -1, alt: productData.video.altText }] : []),
            ...(productData.images || []),
          ]}
          productInfo={productData.productInfo}
          productId={productData._id}
          productName={productData.productInfo.title}
          productBrand={productData.brand?._id}
          quantityLabel={productData.quantityLabel}
          variants={productData.variants}
          productPricingType={productData.productPricingType}
          simplePricing={productData.simplePricing}
          manualCurrencyPrices={productData.manualCurrencyPrices}
          bundleProducts={productData.bundleProducts}
          purchaseType={productData.purchaseType}
          collections={productData.collections}
          tags={productData.tags}
          flags={productData.flags}
          isFeatured={productData.isFeatured}
          isBestSeller={productData.isBestSeller}
          isNewArrival={productData.isNewArrival}
          category={productData.category}
          selectedVariant={selectedVariant}
          attributes={productData.attributes}
          tax_rate={productData.tax_rate}
          is_returnable={productData.is_returnable}
          is_replaceable={productData.is_replaceable}
          return_window_days={productData.return_window_days}
          onVariantChange={handleVariantChange}
          description={productData.productDetails?.overview?.content}
        />



        {/* Detailed Product Information */}
        {productData.productDetails && (
          <div className="mb-4 mt-4">
            <ProductInfoSection
              productDetails={productData.productDetails}
              bundleProducts={productData.bundleProducts}
              selectedVariant={selectedVariant}
              onPlanSelect={handlePlanSelect}
            />
          </div>
        )}

        {/* Customer Reviews Section */}
        <StorefrontReviews productId={productData._id} />

        {/* Other Products */}
        {productData.otherProducts &&
          productData.otherProducts.products?.length > 0 && (
            <OtherProducts otherProducts={productData.otherProducts} />
          )}
      </div>
    </main>
  );
}

function StorefrontReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/products/${productId}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setFormError("You must be logged in to submit a review.");
      return;
    }
    const customerEmail = user.email || "";
    const customerName = (user as any).name || `${user.firstName || ""} ${user.lastName && user.lastName !== "." ? user.lastName : ""}`.trim() || (user.email ? user.email.split("@")[0] : "Customer");

    if (!rating || !comment) {
      setFormError("Please fill out all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const response = await fetch(`${apiUrl}/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || undefined,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to submit review");
      }

      setSuccessMsg("Thank you! Your review has been submitted.");
      setComment("");
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const starsBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  const finalName = user ? ((user as any).name || `${user.firstName || ""} ${user.lastName && user.lastName !== "." ? user.lastName : ""}`.trim() || (user.email ? user.email.split("@")[0] : "")) : "";
  const finalEmail = user?.email || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 my-8 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            Customer Reviews
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Read what other buyers have to say or share your own experience.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setSuccessMsg(null);
            setFormError(null);
          }}
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all text-sm shadow-md shadow-indigo-100"
        >
          {showForm ? "Cancel Review" : "Write a Review"}
        </button>
      </div>

      {/* Write review Form / Login Check */}
      {showForm && (
        !isAuthenticated ? (
          <div className="mt-6 p-8 bg-gray-50 rounded-2xl border border-gray-200 text-center">
            <Star className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Write a Customer Review</h3>
            <p className="text-gray-600 text-sm mb-4">
              Please log in to share your experience with this product.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl active:scale-95 transition-all shadow-md shadow-indigo-100"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Share Your Feedback</h3>
            <p className="text-sm text-gray-500 mb-4">
              Reviewing as: <strong className="text-indigo-950">{finalName}</strong> ({finalEmail})
            </p>

            {formError && (
              <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {formError}
              </div>
            )}

            {/* Stars Selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= (hoveredRating ?? rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 fill-transparent"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  ({rating} out of 5 stars)
                </span>
              </div>
            </div>

            {/* Comment Box */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about this product? Tell us details..."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-all text-sm"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )
    )}

      {/* Success Msg Banner */}
      {successMsg && (
        <div className="mt-4 p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-center shadow-sm">
          {successMsg}
        </div>
      )}

      {/* Ratings Overview Stats */}
      {totalReviews > 0 && !showForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/40">
          {/* Average Box */}
          <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
            <div className="text-5xl font-extrabold text-indigo-950 mb-2">
              {averageRating}
            </div>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(Number(averageRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>

          {/* Progress Bars */}
          <div className="col-span-2 flex flex-col justify-center gap-2.5">
            {starsBreakdown.map(({ stars, percentage, count }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700 w-12 flex items-center gap-1 justify-end">
                  {stars} <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-3 bg-gray-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-550"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-500 w-12 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-gray-900">No Reviews Yet</h4>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Be the first to share your thoughts about this product with other buyers.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="pt-6 first:pt-0 group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* User and Stars */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">
                        {review.customerName}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Verified Buyer
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xs text-gray-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
