"use client";

import React, { useState, useEffect, useMemo } from "react";
import { InlineEditable } from "@/components/InlineEditable";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { ShoppingBag, Star, Heart, Eye } from "lucide-react";
import { usePreview } from "@/contexts/PreviewContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id?: string;
  _id?: string;
  slug?: string;
  name: string;
  categoryName?: string;
  priceNum: number;
  oldPriceNum?: number;
  currency?: string;
  image: string;
  ratingStars?: number;
  reviewsCount?: number;
  badge?: string;
}

interface EcommerceFeaturedProductsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    columns?: number;
    bgColor?: string;
    textColor?: string;
    limit?: number;
    badgeText?: string;
    products?: Product[];
    productsSource?: "static" | "dynamic";
    filter?: any;
  };
}
const EMPTY_PRODUCTS: Product[] = [];

export default function EcommerceFeaturedProducts({ data, sectionIndex }: EcommerceFeaturedProductsProps) {
  const {
    title = "Our Featured Collection",
    subtitle = "Curated selection of our finest products updated daily.",
    columns = 4,
    bgColor = "#ffffff",
    textColor = "#0f172a",
    limit = 8,
    badgeText = "FEATURED",
    filter = null,
  } = data || {};

  const { isPreview, pageData } = usePreview();
  const { addToCart, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("limit", String(limit));

        if (filter) {
          const { type, value } = filter;
          if (type === "category") queryParams.append("category", value);
          else if (type === "collection") queryParams.append("collection", value);
          else if (type === "tag") queryParams.append("tags", value);
          else if (type === "flag") queryParams.append("flags", value);
        }

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

              const oldPriceNum = p.productInfo?.price?.original ? parseFloat(p.productInfo.price.original) : undefined;
              const image = p.images && p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop";

              return {
                id: p._id || p.id,
                slug: p.slug,
                name: p.productInfo?.title || p.title || "",
                categoryName: p.category?.name || "Featured",
                priceNum: finalPrice,
                oldPriceNum: oldPriceNum,
                currency: p.currency || "INR",
                image: image,
                ratingStars: ratingStars,
                reviewsCount: reviewsCount,
                badge: p.flags && p.flags.length > 0 ? (typeof p.flags[0] === "object" ? p.flags[0].name : p.flags[0]) : undefined,
              };
            });
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [filter, limit, isPreview, pageData?.storeId]);

  const colSpanClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns as 1 | 2 | 3 | 4] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart({
        productId: product.id || "",
        variantId: undefined,
        price: Number(product.priceNum),
        quantity: 1,
        purchaseType: "online",
        notes: "",
      });
      toast.success(`${product.name} added to cart!`);
      openCart();
    } catch (err) {
      toast.error("Failed to add product to cart.");
    }
  };

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {badgeText && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-600 mb-4 border border-red-100">
              <InlineEditable tag="span" value={badgeText} fieldPath="badgeText" sectionIndex={sectionIndex} />
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
          {subtitle && (
            <p className="text-base sm:text-lg opacity-80 leading-relaxed">
              <InlineEditable tag="span" value={subtitle} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </p>
          )}
        </div>

        {/* Loading placeholder */}
        {loading ? (
          <div className={`grid ${colSpanClass} gap-8`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col space-y-4">
                <div className="aspect-square bg-slate-100 rounded-2xl w-full" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid */
          <div className={`grid ${colSpanClass} gap-8`}>
            {products.map((product, index) => (
              <div
                key={product.id || index}
                className="group relative flex flex-col rounded-2xl border border-slate-100 hover:border-slate-200/80 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
                style={{ color: "#0f172a" }}
              >
                {/* Product Image Box */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                  {/* Badge */}
                  {(product.badge || badgeText) && (
                    <span className="absolute top-4 left-4 z-10 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm">
                      {product.badge || badgeText}
                    </span>
                  )}

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Add To Cart Overlay Button */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-3 bg-white text-slate-800 hover:bg-red-600 hover:text-white rounded-full shadow-lg transition-colors cursor-pointer"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                    <a
                      href={`/products/${product.slug}`}
                      className="p-3 bg-white text-slate-800 hover:bg-slate-900 hover:text-white rounded-full shadow-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Details Box */}
                <div className="p-6 flex flex-col flex-grow items-start text-left">
                  <span className="text-xs uppercase font-semibold text-slate-400 mb-2">{product.categoryName}</span>
                  <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2 hover:text-red-600">
                    <a href={`/products/${product.slug}`}>{product.name}</a>
                  </h3>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-1 mb-4 text-amber-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (product.ratingStars || 5) ? "fill-current" : "text-slate-200"
                        }`}
                      />
                    ))}
                    {product.reviewsCount !== undefined && (
                      <span className="ml-1 text-slate-400 text-xs font-medium">({product.reviewsCount})</span>
                    )}
                  </div>

                  {/* Pricing row */}
                  <div className="flex items-baseline gap-2 mt-auto">
                    <span className="text-lg font-extrabold text-slate-900">
                      <PriceDisplay amount={product.priceNum} originalCurrency={product.currency || "INR"} />
                    </span>
                    {product.oldPriceNum && (
                      <span className="text-sm text-slate-400 line-through">
                        <PriceDisplay amount={product.oldPriceNum} originalCurrency={product.currency || "INR"} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
