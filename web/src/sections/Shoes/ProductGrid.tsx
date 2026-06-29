"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Heart, Eye, GitCompare, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { usePreview } from "@/contexts/PreviewContext";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  stock: number;
  specs: string[];
  currency?: string;
  manualCurrencyPrices?: Record<string, number>;
}

interface ShoesProductGridProps {
  sectionIndex?: number;
  data?: {
    title?: string;
    subtitle?: string;
    products?: Product[];
    productsSource?: string;
    filter?: {
      type: "category" | "collection" | "flag" | "tag";
      value: string;
      name: string;
    } | null;
    limit?: number;
  };
}


export default function ShoesProductGrid({ data, sectionIndex }: ShoesProductGridProps) {
  const { addToCart } = useCart();
  const { isPreview, pageData } = usePreview();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const title = data?.title || "RECOMMENDED FOR YOU";
  const productsSource = data?.productsSource || "static";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (productsSource !== "dynamic") {
      setProducts(data?.products || []);
      return;
    }

    const fetchDynamicProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        const filter = data?.filter;

        if (filter) {
          const { type, value } = filter;
          if (type === "category") queryParams.append("category", value);
          else if (type === "collection") queryParams.append("collection", value);
          else if (type === "tag") queryParams.append("tags", value);
          else if (type === "flag") queryParams.append("flags", value);
        }
        queryParams.append("limit", String(data?.limit || 8));

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

              let finalPrice = parseFloat(p.productInfo?.price?.current || "0");
              if (finalPrice === 0 && p.variants && p.variants.length > 0) {
                const prices = p.variants.map((v: any) => v.price).filter((pr: number) => pr > 0);
                if (prices.length > 0) {
                  finalPrice = Math.min(...prices);
                }
              }

              let specs = p.attributes?.specs || [];
              if (specs.length === 0) {
                specs = ["Premium Quality Guaranteed", "Secure Checkout", "Store Pick-up Available"];
              }

              return {
                id: p._id || p.id,
                slug: p.slug,
                name: p.productInfo?.title || p.title || "",
                price: finalPrice,
                rating: ratingStars,
                image: p.icon?.url || (p.images && p.images[0]?.url) || "",
                stock: p.stock || 100,
                specs: specs,
                currency: p.simplePricing?.currency || "INR",
                manualCurrencyPrices: p.manualCurrencyPrices || {}
              };
            });
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic shoes products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicProducts();
  }, [productsSource, data?.filter, data?.limit, isPreview, pageData?.storeId]);

  const handleAddToCartClick = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart({
        productId: product.id,
        variantId: undefined,
        price: Number(product.price),
        quantity: 1,
        purchaseType: "online",
        notes: "",
      }, true);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add item to cart.");
    }
  };

  const handleWishlistToggle = async (product: Product, e: React.MouseEvent) => {
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

  const handleViewDetails = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    router.push(`/products/${slug}`);
  };

  return (
    <section className="w-full bg-[#fcfcfc] py-20 border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-black tracking-[0.3em] text-[#55eb0c] bg-black px-4 py-1.5 rounded-full uppercase select-none mb-3 inline-block">
            <InlineEditable tag="span" value={data?.subtitle || "MUST HAVES"} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight font-sans">
            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
        </div>

        {/* 4-Column Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-500 font-bold">
            Loading dynamic catalog products...
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-slate-400 font-bold">
            No products found matching this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {products.map((product) => {
              const isHovered = hoveredCard === product.id;

              return (
                <div
                  key={product.id}
                  onMouseEnter={() => setHoveredCard(product.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 relative group flex flex-col h-full"
                >
                  
                  {/* Image Showcase Container */}
                  <div className="w-full aspect-square bg-[#f2f5fa] p-6 relative flex items-center justify-center overflow-hidden shrink-0">
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.08 : 1,
                        rotate: isHovered ? -5 : 0
                      }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="w-full h-full"
                    >
                      <img 
                        src={product.image || "https://via.placeholder.com/300?text=No+Image"} 
                        alt={product.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.08)] select-none"
                      />
                    </motion.div>

                    {/* Dynamic Action Badges Sidebar on Hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ x: 30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 30, opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20"
                        >
                          <button 
                            onClick={(e) => handleWishlistToggle(product, e)}
                            title="Add to Favorites"
                            className="w-9 h-9 rounded-full bg-white hover:bg-black hover:text-[#55eb0c] text-slate-800 shadow-md flex items-center justify-center transition-colors cursor-pointer border-0"
                          >
                            <Heart 
                              size={14} 
                              className={product.id && isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} 
                            />
                          </button>
                          <button 
                            onClick={(e) => handleViewDetails(product, e)}
                            title="View Details"
                            className="w-9 h-9 rounded-full bg-white hover:bg-black hover:text-[#55eb0c] text-slate-800 shadow-md flex items-center justify-center transition-colors cursor-pointer border-0"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            title="Compare"
                            className="w-9 h-9 rounded-full bg-white hover:bg-black hover:text-[#55eb0c] text-slate-800 shadow-md flex items-center justify-center transition-colors cursor-pointer border-0"
                          >
                            <GitCompare size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleAddToCartClick(product, e)}
                            title="Add to Cart"
                            className="w-9 h-9 rounded-full bg-[#55eb0c] hover:bg-black hover:text-[#55eb0c] text-black shadow-md flex items-center justify-center transition-colors cursor-pointer border-0"
                          >
                            <ShoppingCart size={14} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Stock Left Notification pill */}
                    <span className="absolute left-3 top-3 bg-white/90 backdrop-blur-sm text-[9px] font-black px-2.5 py-1 rounded-full text-slate-700 tracking-wider">
                      {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                    </span>
                  </div>

                  {/* Info and Expandable details area */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Star Ratings */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={idx < product.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}
                        />
                      ))}
                    </div>

                    <h3 className="text-sm font-black text-black tracking-tight mb-2 uppercase group-hover:text-[#55eb0c] transition-colors leading-tight line-clamp-2 min-h-[36px]">
                      {product.name}
                    </h3>

                    <span className="text-sm font-black text-slate-900 mb-4">
                      <PriceDisplay
                        amount={product.price}
                        originalCurrency={product.currency || "USD"}
                        manualOverrides={product.manualCurrencyPrices}
                      />
                    </span>

                    {/* Expandable highlight specifications segment */}
                    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isHovered ? "200px" : "0px", opacity: isHovered ? 1 : 0 }}>
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 text-slate-500">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#55eb0c]">
                          <Check size={12} className="stroke-[3px]" />
                          <span>{`${product.stock} Products in stock`}</span>
                        </div>
                        {product.specs.map((spec, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
