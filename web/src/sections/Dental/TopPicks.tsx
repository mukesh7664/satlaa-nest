"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ShoppingCart, Eye, ArrowRight, ChevronRight } from "lucide-react";
import { usePreview } from "@/contexts/PreviewContext";

interface Product {
  id: string;
  name: string;
  price: string;
  priceNum?: number;
  oldPriceNum?: number;
  currency?: string;
  manualCurrencyPrices?: Record<string, number>;
  originalPrice?: string;
  image: string;
  hoverImage?: string;
  rating: number;
  badge?: string;
  link: string;
}

const getPriceNumber = (priceVal: any): number => {
  if (typeof priceVal === "number") return priceVal;
  if (typeof priceVal === "string") {
    return parseFloat(priceVal.replace(/[^0-9.]/g, "")) || 0;
  }
  return 0;
};

interface TabData {
  category: string;
  products: Product[];
  categoryFilter?: string;
  collectionFilter?: string;
  tagFilter?: string;
  flagFilter?: string;
  limitFilter?: number;
  filter?: {
    type: "category" | "collection" | "flag" | "tag";
    value: string;
    name: string;
  } | null;
}

interface DentalTopPicksProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    tabs?: TabData[];
    sidebarTitle?: string;
    sidebarCategories?: string[];
    sidebarDiscount?: string;
    sidebarPromoText?: string;
    productsSource?: string;
  };
}

export default function DentalTopPicks({ data, sectionIndex }: DentalTopPicksProps) {
  const {
    title = "",
    subtitle = "",
    tabs = [],
    sidebarTitle = "",
    sidebarCategories = [],
    sidebarDiscount = "",
    sidebarPromoText = ""
  } = data || {};

  const { isPreview, pageData } = usePreview();

  const [dynamicTabs, setDynamicTabs] = useState<TabData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const productsSource = data?.productsSource || "static";

  React.useEffect(() => {
    if (productsSource !== "dynamic") return;

    const fetchDynamicProducts = async () => {
      setLoading(true);
      try {
        const tabsList = data.tabs || [];
        const updatedTabs = [];

        for (const tab of tabsList) {
          const queryParams = new URLSearchParams();
          if (tab.filter) {
            const { type, value } = tab.filter;
            if (type === "category") queryParams.append("category", value);
            else if (type === "collection") queryParams.append("collection", value);
            else if (type === "tag") queryParams.append("tags", value);
            else if (type === "flag") queryParams.append("flags", value);
          } else {
            if (tab.categoryFilter) queryParams.append("category", tab.categoryFilter);
            if (tab.collectionFilter) queryParams.append("collection", tab.collectionFilter);
            if (tab.tagFilter) queryParams.append("tags", tab.tagFilter);
            if (tab.flagFilter) queryParams.append("flags", tab.flagFilter);
          }
          queryParams.append("limit", String(tab.limitFilter || 8));

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
          let tabProducts = [];
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              tabProducts = json.data.map((p: any) => {
                const ratingStars = p.productInfo?.rating?.stars || p.attributes?.ratingStars || 5;

                let finalPrice = parseFloat(p.productInfo?.price?.current || "0");
                if (finalPrice === 0 && p.variants && p.variants.length > 0) {
                  const prices = p.variants.map((v: any) => v.price).filter((pr: number) => pr > 0);
                  if (prices.length > 0) {
                    finalPrice = Math.min(...prices);
                  }
                }
                const priceVal = finalPrice > 0 ? `$${finalPrice.toFixed(2)}` : "$0.00";

                const oldPriceVal = p.productInfo?.price?.original ? `$${parseFloat(p.productInfo.price.original).toFixed(2)}` : undefined;

                return {
                  id: p._id || p.id,
                  name: p.productInfo?.title || p.title || "",
                  price: priceVal,
                  originalPrice: oldPriceVal,
                  priceNum: finalPrice,
                  oldPriceNum: p.productInfo?.price?.original ? parseFloat(p.productInfo.price.original) : undefined,
                  currency: p.simplePricing?.currency || "INR",
                  manualCurrencyPrices: p.manualCurrencyPrices || {},
                  image: p.icon?.url || (p.images && p.images[0]?.url) || "",
                  hoverImage: (p.images && p.images[1]?.url) || undefined,
                  rating: ratingStars,
                  badge: p.flags && p.flags[0] ? p.flags[0].name : undefined,
                  link: `/products/${p.slug}`
                };
              });
            }
          }
          updatedTabs.push({
            ...tab,
            products: tabProducts
          });
        }
        setDynamicTabs(updatedTabs);
      } catch (err) {
        console.error("Error fetching dental dynamic products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicProducts();
  }, [productsSource, data.tabs, isPreview, pageData?.storeId]);

  const activeTabsList = productsSource === "dynamic" ? dynamicTabs : (tabs || []);

  if (activeTabsList.length === 0 && !loading) return null;

  const currentTab = activeTabsList[activeTab] || activeTabsList[0];
  const products = currentTab?.products || [];

  return (
    <section className="py-16 bg-white font-sans">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Section Heading & Tabs Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="block text-xs font-extrabold tracking-[0.2em] text-[#4c80fa] uppercase mb-3">
              WEEKLY TRENDS & SELECTIONS
            </span>
            <h2 
              className="text-3xl sm:text-4xl font-medium text-[#222222] tracking-tight leading-tight"
              style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
            >
              <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
            <p className="text-slate-400 text-sm mt-3 font-normal leading-relaxed max-w-xl">
              <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </p>
          </div>

          {/* Clean Rounded Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-2.5 text-xs font-bold tracking-wider rounded-full uppercase transition-all duration-300 ${
                  activeTab === idx
                    ? "bg-[#4c80fa] text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100"
                }`}
              >
                {tab.category}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px] items-stretch">
          
          {/* Columns 1, 2, 3: Product Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            <AnimatePresence mode="wait">
              {products.map((product) => {
                const isDiscount = product.badge?.includes("%") || product.badge?.includes("-");
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="group relative flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden">
                      {productsSource === 'static' ? (
                        <>
                          <InlineImageEditable
                            src={product.image}
                            alt={product.name}
                            fill
                            fieldPath={`tabs.${activeTab}.products.${products.indexOf(product)}.image`}
                            sectionIndex={sectionIndex}
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103"
                          />
                          {product.hoverImage && (
                            <InlineImageEditable
                              src={product.hoverImage}
                              alt={product.name}
                              fill
                              fieldPath={`tabs.${activeTab}.products.${products.indexOf(product)}.hoverImage`}
                              sectionIndex={sectionIndex}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <img
                            src={product.image || "https://via.placeholder.com/300?text=No+Image"}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103 w-full h-full"
                          />
                          {product.hoverImage && (
                            <img
                              src={product.hoverImage}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            />
                          )}
                        </>
                      )}

                      {/* StepMeds Specific Badge Layouts */}
                      {product.badge && (
                        <span
                          className={`absolute top-4 text-[10px] font-bold tracking-widest px-3 py-1 text-white uppercase ${
                            isDiscount
                              ? "right-0 rounded-l-[25px] bg-[#e4573d]" // Red discount top right
                              : "left-0 rounded-r-[25px] bg-[#57b47a]"  // Green new badge top left
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}

                      {/* Quick Icons Overlay */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a
                          href={product.link}
                          className="w-8 h-8 bg-white hover:bg-[#4c80fa] text-[#222222] hover:text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        >
                          <Eye size={14} />
                        </a>
                      </div>
                    </div>

                    {/* Meta/Description Info */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Star list */}
                        <div className="flex gap-0.5 mb-2.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < product.rating
                                  ? "fill-amber-400 stroke-amber-400"
                                  : "stroke-slate-200"
                              }
                            />
                          ))}
                        </div>

                        <a
                          href={product.link}
                          className="block font-bold text-[#222222] text-sm hover:text-[#4c80fa] transition-colors leading-snug mb-3 line-clamp-2"
                        >
                          {product.name}
                        </a>
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex flex-col gap-4">
                        {/* Price Details */}
                        <div className="flex items-baseline gap-1.5">
                          {(product.originalPrice || product.oldPriceNum) && (
                            <span className="text-xs text-slate-400 line-through">
                              <PriceDisplay
                                amount={product.oldPriceNum ?? getPriceNumber(product.originalPrice)}
                                originalCurrency={product.currency || "USD"}
                                manualOverrides={product.manualCurrencyPrices}
                              />
                            </span>
                          )}
                          <span className="font-extrabold text-[#e4573d] text-base">
                            <PriceDisplay
                              amount={product.priceNum ?? getPriceNumber(product.price)}
                              originalCurrency={product.currency || "USD"}
                              manualOverrides={product.manualCurrencyPrices}
                            />
                          </span>
                        </div>

                        {/* Hover Action Button at the bottom */}
                        <a
                          href={product.link}
                          className="w-full text-center bg-[#f2f2f2] group-hover:bg-[#4c80fa] text-slate-700 group-hover:text-white font-bold text-xs tracking-wider uppercase py-3 rounded-lg shadow-sm group-hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={13} />
                          Add To Cart
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Column 4: Categories Sidebar Widget */}
          <div className="flex flex-col h-full">
            <div 
              className="flex-1 rounded-2xl p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden bg-cover bg-center shadow-lg min-h-[450px]"
              style={{ 
                backgroundImage: 'url("https://www.devsnews.com/template/stepmeds/stepmeds/images/banner/pro-banner-bg.jpg")',
                backgroundColor: '#0f172a'
              }}
            >
              {/* Soft overlay gradient */}
              <div className="absolute inset-0 bg-blue-950/85 mix-blend-multiply" />

              <div className="relative z-10">
                <h4 className="font-extrabold text-sm tracking-[0.2em] border-b border-white/20 pb-4 mb-6 uppercase">
                  {sidebarTitle}
                </h4>
                <ul className="space-y-4">
                  {sidebarCategories.map((cat, idx) => (
                    <li key={idx}>
                      <a
                        href="/shop"
                        className="flex items-center gap-2 text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors group"
                      >
                        <ChevronRight size={14} className="text-[#4c80fa] group-hover:translate-x-0.5 transition-transform" />
                        <span>{cat}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Promo Mask Stickers */}
              <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between gap-4 mt-8">
                <div>
                  <span className="block text-[#f9c80e] text-2xl font-extrabold leading-none mb-1">
                    {sidebarDiscount}
                  </span>
                  <span className="block text-[10px] text-slate-300 font-extrabold tracking-widest uppercase">
                    {sidebarPromoText}
                  </span>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shrink-0 border border-white/10">
                  <ShoppingCart size={18} className="text-[#4c80fa]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
