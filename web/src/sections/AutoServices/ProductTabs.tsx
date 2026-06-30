"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";

interface AutoServicesProductTabsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    tabs?: string[] | Array<{
      name: string;
      filter?: any;
      limit?: number;
    }>;
    products?: {
      name: string;
      brand?: string;
      price: string;
      oldPrice?: string;
      image: string;
      rating: number;
      reviews?: number;
      discount?: string;
      available?: number;
      sold?: number;
      tab?: string;
    }[];
    productsSource?: string;
  };
}

const getPriceNumber = (priceVal: any): number => {
  if (typeof priceVal === "number") return priceVal;
  if (typeof priceVal === "string") {
    return parseFloat(priceVal.replace(/[^0-9.]/g, "")) || 0;
  }
  return 0;
};

export default function AutoServicesProductTabs({ data, sectionIndex }: AutoServicesProductTabsProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const title = data?.title || "";
  const subtitle = data?.subtitle || "";

  // Normalize tabs
  const normalizedTabs = React.useMemo(() => {
    const rawTabs = data?.tabs || [];
    if (rawTabs.length > 0 && typeof rawTabs[0] === "string") {
      return (rawTabs as string[]).map((tabName) => ({
        name: tabName,
        filter: null,
        limit: 5
      }));
    }
    return (rawTabs as Array<{ name: string; filter: any; limit?: number }>) || [];
  }, [data?.tabs]);

  const [activeTab, setActiveTab] = useState("");
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync activeTab when normalizedTabs updates
  useEffect(() => {
    if (normalizedTabs.length > 0) {
      if (!activeTab || !normalizedTabs.some(t => t.name === activeTab)) {
        setActiveTab(normalizedTabs[0].name);
      }
    }
  }, [normalizedTabs, activeTab]);

  // Fetch dynamic products
  useEffect(() => {
    if (!activeTab) return;

    const tab = normalizedTabs.find((t) => t.name === activeTab);
    if (!tab) return;

    if (!tab.filter) {
      setDynamicProducts([]);
      return;
    }

    const fetchDynamicTabProducts = async () => {
      try {
        setLoading(true);
        const tab = normalizedTabs.find((t) => t.name === activeTab);
        if (!tab) return;

        const queryParams = new URLSearchParams();
        if (tab.filter) {
          const { type, value } = tab.filter;
          if (type === "category") queryParams.append("category", value);
          else if (type === "collection") queryParams.append("collection", value);
          else if (type === "tag") queryParams.append("tags", value);
          else if (type === "flag") queryParams.append("flags", value);
        }
        queryParams.append("limit", String(tab.limit || 5));

        const headers: Record<string, string> = { "Content-Type": "application/json" };

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

              const available = p.stock || 10;
              const sold = p.soldCount || 42;

              return {
                id: p._id || p.id,
                slug: p.slug,
                name: p.productInfo?.title || p.title || "",
                brand: p.attributes?.brand || "Premium Parts",
                price: priceVal,
                oldPrice: oldPriceVal,
                priceNum: finalPrice,
                oldPriceNum: p.productInfo?.price?.original ? parseFloat(p.productInfo.price.original) : undefined,
                currency: p.simplePricing?.currency || "INR",
                manualCurrencyPrices: p.manualCurrencyPrices || {},
                image: p.icon?.url || (p.images && p.images[0]?.url) || "",
                rating: ratingStars,
                reviews: reviewsCount,
                discount: p.flags && p.flags[0] ? p.flags[0].name : undefined,
                available: available,
                sold: sold,
                tab: activeTab
              };
            });
            setDynamicProducts(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load AutoServices dynamic products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicTabProducts();
  }, [activeTab, normalizedTabs]);

  const handleWishlistToggle = async (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleViewDetails = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.slug) {
      router.push(`/products/${product.slug}`);
    } else if (product.id) {
      router.push(`/products/${product.id}`);
    }
  };

  const handleAddToCart = async (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const priceNum = typeof product.price === "number" 
        ? product.price 
        : parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
        
      await addToCart({
        productId: product.id || product.name,
        variantId: undefined,
        price: priceNum,
        quantity: 1,
        purchaseType: "online",
        notes: "",
      }, true);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add item to cart.");
    }
  };

  const activeTabConfig = normalizedTabs.find((t) => t.name === activeTab);
  const hasFilter = !!activeTabConfig?.filter;

  const displayProducts = hasFilter
    ? dynamicProducts
    : (data?.products || []).filter(p => !p.tab || p.tab === activeTab);

  const isStaticProduct = !hasFilter;

  if (displayProducts.length === 0 && !loading) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-inter font-bold text-[#1a1a1a]"><InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} /></h2>
            <p className="text-[#8e8e8e] text-sm font-inter"><InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} /></p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              {normalizedTabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`text-sm font-inter font-bold transition-colors relative pb-4 -mb-4 border-0 bg-transparent cursor-pointer ${
                    activeTab === tab.name ? "text-[#0067b2]" : "text-[#8e8e8e] hover:text-[#1a1a1a]"
                  }`}
                >
                  {tab.name}
                  {activeTab === tab.name && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0067b2]" />
                  )}
                </button>
              ))}
            </div>
            <a href="/shop" className="text-[#0067b2] font-inter font-bold text-sm hover:underline decoration-0">View All</a>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#0067b2] font-bold">
            Loading dynamic catalog products...
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-slate-400 font-bold">
            No products found matching this filter tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <AnimatePresence mode="wait">
              {displayProducts.map((product, idx) => (
                <motion.div
                  key={`${activeTab}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group border border-transparent hover:border-gray-100 rounded-lg transition-all p-3"
                >
                  <div className="relative mb-4 bg-[#f3f4f6] rounded-lg overflow-hidden aspect-square">
                    {isStaticProduct ? (
                      <InlineImageEditable 
                        src={product.image} 
                        alt={product.name}
                        fieldPath={`products.${idx}.image`}
                        sectionIndex={sectionIndex}
                        className="w-full h-full object-contain p-4 mix-blend-multiply"
                      />
                    ) : (
                      <img 
                        src={product.image || "https://via.placeholder.com/300?text=No+Image"} 
                        alt={product.name}
                        className="w-full h-full object-contain p-4 mix-blend-multiply"
                      />
                    )}
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-[#0067b2] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {product.discount}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button 
                        onClick={(e) => handleWishlistToggle(product, e)}
                        title="Add to Favorites"
                        className="p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm border-0 cursor-pointer flex items-center justify-center transition-colors"
                      >
                        <Heart 
                          size={14} 
                          className={product.id && isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} 
                        />
                      </button>
                      <button 
                        onClick={(e) => handleViewDetails(product, e)}
                        title="View Details"
                        className="p-1.5 bg-white rounded-full text-gray-400 hover:text-[#0067b2] shadow-sm border-0 cursor-pointer flex items-center justify-center transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < Math.floor(product.rating) ? "fill-[#ffb700] text-[#ffb700]" : "text-gray-300"} 
                        />
                      ))}
                      <span className="text-[#8e8e8e] text-[10px] font-bold ml-1">{product.rating} ({product.reviews || 0})</span>
                    </div>
                    
                    <h3 className="text-[#1a1a1a] font-inter font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-[#0067b2] transition-colors leading-snug">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-lg font-oswald font-bold text-[#0067b2]">
                        <PriceDisplay
                          amount={product.priceNum ?? getPriceNumber(product.price)}
                          originalCurrency={product.currency || "USD"}
                          manualOverrides={product.manualCurrencyPrices}
                        />
                      </span>
                      {(product.oldPrice || product.oldPriceNum) && (
                        <span className="text-xs text-[#8e8e8e] line-through font-inter">
                          <PriceDisplay
                            amount={product.oldPriceNum ?? getPriceNumber(product.oldPrice)}
                            originalCurrency={product.currency || "USD"}
                            manualOverrides={product.manualCurrencyPrices}
                          />
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {product.available !== undefined && (
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] font-bold font-inter mb-1.5">
                          <span className="text-[#8e8e8e]">Available:<span className="text-[#1a1a1a] ml-1">{product.available}</span></span>
                          <span className="text-[#8e8e8e]">Sold:<span className="text-[#1a1a1a] ml-1">{product.sold}</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#ff4c3b] to-[#ffb700] rounded-full"
                            style={{ width: `${(product.sold / (product.available + product.sold)) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full mt-4 bg-[#0067b2] hover:bg-[#005694] text-white font-inter font-bold py-2 rounded-md flex items-center justify-center gap-2 text-xs transition-colors border-0 cursor-pointer"
                    >
                      <ShoppingCart size={14} /> Add to cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-1 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === 0 ? "w-4 bg-[#0067b2]" : "w-1.5 bg-gray-200"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
