"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Eye, Heart, Star } from "lucide-react";
import { usePreview } from "@/contexts/PreviewContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface Product {
  id?: string;
  slug?: string;
  name: string;
  category: string;
  price: string;
  numericPrice?: number;
  priceNum?: number;
  oldPriceNum?: number;
  currency?: string;
  manualCurrencyPrices?: Record<string, number>;
  oldPrice?: string;
  image: string;
  hoverImage?: string;
  rating: number;
  reviews?: number;
  badge?: string;
  colors?: string[]; // hex codes e.g. ["#000000", "#d1d5db"]
  tab?: string;
}

interface ClothTopPicksProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    tabs?: Array<{
      name: string;
      filter?: {
        type: "category" | "collection" | "flag" | "tag";
        value: string;
        name: string;
      } | null;
      limit?: number;
    }> | string[];
    products?: Product[];
    ctaText?: string;
    ctaLink?: string;
    productsSource?: string;
    tabSettings?: Record<string, {
      category?: string;
      collection?: string;
      tag?: string;
      flag?: string;
      limit?: number;
      filter?: {
        type: "category" | "collection" | "flag" | "tag";
        value: string;
        name: string;
      } | null;
    }>;
  };
}

const getPriceNumber = (priceVal: any): number => {
  if (typeof priceVal === "number") return priceVal;
  if (typeof priceVal === "string") {
    return parseFloat(priceVal.replace(/[^0-9.]/g, "")) || 0;
  }
  return 0;
};

export default function ClothTopPicks({ data, sectionIndex }: ClothTopPicksProps) {
  const {
    title = "",
    subtitle = "",
    products = [],
    ctaText = "",
    ctaLink = ""
  } = data || {};

  const { isPreview, pageData } = usePreview();
  const { addToCart, openCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const normalizedTabs = React.useMemo(() => {
    const rawTabs = data.tabs || [];
    const tabSettings = data.tabSettings || {};

    if (rawTabs.length > 0 && typeof rawTabs[0] === "string") {
      return (rawTabs as string[]).map((tabName) => {
        const settings = tabSettings[tabName] || {};
        return {
          name: tabName,
          filter: settings.filter || null,
          limit: settings.limit || 8,
          category: settings.category,
          collection: settings.collection,
          tag: settings.tag,
          flag: settings.flag
        };
      });
    }
    return (rawTabs as Array<{
      name: string;
      filter?: any;
      limit?: number;
      category?: string;
      collection?: string;
      tag?: string;
      flag?: string;
    }>) || [];
  }, [data.tabs, data.tabSettings]);

  const [activeTab, setActiveTab] = useState("");
  const [selectedColors, setSelectedColors] = useState<Record<number, string>>({});
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const productsSource = data?.productsSource || "static";

  // Sync activeTab when normalizedTabs loads/updates
  React.useEffect(() => {
    if (normalizedTabs.length > 0) {
      if (!activeTab || !normalizedTabs.some(t => t.name === activeTab)) {
        setActiveTab(normalizedTabs[0].name);
      }
    }
  }, [normalizedTabs, activeTab]);

  React.useEffect(() => {
    if (productsSource !== "dynamic") return;

    const fetchDynamicProducts = async () => {
      setLoading(true);
      try {
        const allFetched: Product[] = [];

        for (const tab of normalizedTabs) {
          const queryParams = new URLSearchParams();
          if (tab.filter) {
            const { type, value } = tab.filter;
            if (type === "category") queryParams.append("category", value);
            else if (type === "collection") queryParams.append("collection", value);
            else if (type === "tag") queryParams.append("tags", value);
            else if (type === "flag") queryParams.append("flags", value);
          } else {
            if (tab.category) queryParams.append("category", tab.category);
            if (tab.collection) queryParams.append("collection", tab.collection);
            if (tab.tag) queryParams.append("tags", tab.tag);
            if (tab.flag) queryParams.append("flags", tab.flag);
          }
          queryParams.append("limit", String(tab.limit || 8));

          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (isPreview && pageData?.storeId) {
            headers["x-tenant-domain"] = pageData.storeId;
          } else if (typeof window !== "undefined") {
            const host = window.location.host;
            const cleanHost = host.split(":")[0];
            headers["x-tenant-domain"] = cleanHost;
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
          const res = await fetch(`${apiUrl}/products?${queryParams.toString()}`, { headers });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const mapped = json.data.map((p: any) => {
                const ratingStars = p.productInfo?.rating?.stars || p.attributes?.ratingStars || 5;
                const ratingReviews = p.productInfo?.rating?.reviews || p.attributes?.ratingReviews || "0";
                const reviewsCount = typeof ratingReviews === "string" ? parseInt(ratingReviews) || 0 : ratingReviews;

                let finalPrice = parseFloat(p.productInfo?.price?.current || "0");
                if (finalPrice === 0 && p.variants && p.variants.length > 0) {
                  const prices = p.variants.map((v: any) => v.price).filter((pr: number) => pr > 0);
                  if (prices.length > 0) {
                     finalPrice = Math.min(...prices);
                  }
                }
                const priceVal = finalPrice > 0 ? `$${finalPrice.toFixed(2)}` : "$0.00";

                const oldPriceVal = p.productInfo?.price?.original ? `$${parseFloat(p.productInfo.price.original).toFixed(2)}` : undefined;

                const colorsVal = p.attributes?.colors || p.attributes?.color || [];
                const colorsArray = Array.isArray(colorsVal) ? colorsVal : [colorsVal];

                return {
                  id: p._id,
                  slug: p.slug,
                  name: p.productInfo?.title || p.title || "",
                  category: p.category?.name || "Outerwear",
                  price: priceVal,
                  numericPrice: finalPrice,
                  oldPrice: oldPriceVal,
                  priceNum: finalPrice,
                  oldPriceNum: p.productInfo?.price?.original ? parseFloat(p.productInfo.price.original) : undefined,
                  currency: p.simplePricing?.currency || "INR",
                  manualCurrencyPrices: p.manualCurrencyPrices || {},
                  image: p.icon?.url || (p.images && p.images[0]?.url) || "",
                  hoverImage: (p.images && p.images[1]?.url) || undefined,
                  rating: ratingStars,
                  reviews: reviewsCount,
                  badge: p.flags && p.flags[0] ? p.flags[0].name : undefined,
                  colors: colorsArray,
                  tab: tab.name
                };
              });
              allFetched.push(...mapped);
            }
          }
        }
        setDynamicProducts(allFetched);
      } catch (err) {
        console.error("Error fetching dynamic products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicProducts();
  }, [productsSource, normalizedTabs]);

  const staticProducts = data?.products || [];
  const productsList = productsSource === "dynamic" ? dynamicProducts : staticProducts;

  const filteredProducts = productsList.filter((p) => !p.tab || p.tab === activeTab);

  const handleColorSelect = (productIdx: number, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productIdx]: color }));
  };

  const handleAddToCart = async (product: Product) => {
    if (!product.id) {
      toast.success("Added to cart (Preview)!");
      return;
    }
    try {
      const price = product.numericPrice || parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
      await addToCart({
        productId: product.id,
        variantId: undefined,
        price: Number(price),
        quantity: 1,
        purchaseType: "online",
        notes: "",
      });
      toast.success(`Added ${product.name} to cart!`);
      openCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    if (!product.id) {
      toast.success("Added to favorites (Preview)!");
      return;
    }
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleViewDetails = (product: Product) => {
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    router.push(`/products/${slug}`);
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-gray-100 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#8e8e8e] uppercase block">
              <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </span>
            <h2 className="text-3xl font-light font-serif text-[#111111] tracking-tight">
              <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
          </div>

          {/* Elegant Tabs */}
          <div className="flex flex-wrap gap-4 md:gap-8">
            {normalizedTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`text-xs sm:text-sm font-semibold tracking-wider uppercase relative pb-3 -mb-[17px] transition-colors duration-300 ${
                  activeTab === tab.name ? "text-black" : "text-[#8e8e8e] hover:text-black"
                }`}
              >
                {tab.name}
                {activeTab === tab.name && (
                  <motion.div
                    layoutId="topPicksActiveTab"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-12">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={`${activeTab}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col relative"
              >
                {/* Product Image Container */}
                <div className="relative aspect-[3/4] w-full bg-[#f9f9f9] overflow-hidden mb-4 shadow-sm">
                  {/* Primary & Hover Images */}
                  <InlineImageEditable
                    src={product.image}
                    alt={product.name}
                    fill
                    fieldPath={productsSource === 'static' ? `products.${idx}.image` : ''}
                    sectionIndex={sectionIndex}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-102"
                  />
                  {product.hoverImage && (
                    <InlineImageEditable
                      src={product.hoverImage}
                      alt={`${product.name} Alternate`}
                      fill
                      fieldPath={productsSource === 'static' ? `products.${idx}.hoverImage` : ''}
                      sectionIndex={sectionIndex}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                    />
                  )}

                  {/* Badges */}
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                      {product.badge}
                    </span>
                  )}

                  {/* Interactive Quick Actions Panel */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      title="Add to Cart"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-md hover:scale-110 active:scale-95 duration-200 cursor-pointer"
                    >
                      <ShoppingBag size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleViewDetails(product);
                      }}
                      title="View Details"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-md hover:scale-110 active:scale-95 duration-200 cursor-pointer"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleWishlistToggle(product);
                      }}
                      title="Add to Favorites"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-md hover:scale-110 active:scale-95 duration-200 cursor-pointer"
                    >
                      <Heart 
                        size={16} 
                        className={product.id && isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-black"} 
                      />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col space-y-1.5 flex-grow">
                  {/* Category */}
                  <span className="text-[10px] text-[#8e8e8e] tracking-widest uppercase">
                    {product.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#111111] font-serif leading-snug line-clamp-1 group-hover:underline transition-all">
                    {product.name}
                  </h3>

                  {/* Stars & Reviews */}
                  <div className="flex items-center gap-1 py-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={
                          i < Math.floor(product.rating)
                            ? "fill-black text-black"
                            : "text-gray-200"
                        }
                      />
                    ))}
                    <span className="text-[10px] text-[#8e8e8e] font-semibold ml-1">
                      {product.rating} ({product.reviews || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-sm font-bold text-[#111111]">
                      <PriceDisplay
                        amount={product.priceNum ?? getPriceNumber(product.price)}
                        originalCurrency={product.currency || "USD"}
                        manualOverrides={(product as any).manualCurrencyPrices}
                      />
                    </span>
                    {(product.oldPrice || product.oldPriceNum) && (
                      <span className="text-xs text-[#8e8e8e] line-through">
                        <PriceDisplay
                          amount={product.oldPriceNum ?? getPriceNumber(product.oldPrice)}
                          originalCurrency={product.currency || "USD"}
                          manualOverrides={(product as any).manualCurrencyPrices}
                        />
                      </span>
                    )}
                  </div>

                  {/* Premium Color Swatches */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {product.colors.map((color, colorIdx) => {
                        const isSelected =
                          selectedColors[idx] === color ||
                          (!selectedColors[idx] && colorIdx === 0);
                        return (
                          <button
                            key={colorIdx}
                            onClick={() => handleColorSelect(idx, color)}
                            className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                              isSelected
                                ? "border-black scale-110 shadow-sm"
                                : "border-gray-200 hover:border-black"
                            }`}
                            style={{ padding: "1px" }}
                          >
                            <div
                              className="w-full h-full rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        {ctaText && (
          <div className="text-center mt-16">
            <a
              href={ctaLink}
              className="inline-block border-b-2 border-black font-semibold text-xs tracking-widest uppercase pb-1 hover:text-[#8e8e8e] hover:border-[#8e8e8e] transition-colors duration-300"
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
