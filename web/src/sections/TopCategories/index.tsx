"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCollectionBySlug, Product } from "@/lib/api/collections";

export interface CategoriesSectionProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    items?: Array<{
      _id?: string;
      title: string;
      slug: string;
      image?: string;
    }>;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function CategoriesSection({ data, sectionIndex }: CategoriesSectionProps) {
  const items = data?.items || [];
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length > 0 && !activeCategory) {
      setActiveCategory(items[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, activeCategory]);

  useEffect(() => {
    async function fetchProducts() {
      if (!activeCategory) return;
      setLoading(true);
      try {
        const response = await getCollectionBySlug(activeCategory);
        if (response?.success && response?.collection?.products) {
          setProducts(response.collection.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory]);

  if (data?.show === false || !data?.title) return null;

  if (items.length === 0) return null;

  const activeCategoryData = items.find((c) => c.slug === activeCategory);

  // Background Logic
  const sectionStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    sectionStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    sectionStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    sectionStyle.backgroundImage = `url('${data.backgroundImage}')`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  } else {
    // Default
    sectionStyle.backgroundColor = "#ffffff";
  }

  return (
    <section className="py-4 lg:py-8" style={sectionStyle}>
      <div className="text-center py-12 px-4">
        <h1 className="font-semibold text-5xl leading-[60px] tracking-[0%] text-center align-middle text-gray-900 mb-3">
          <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
        </h1>
        <div className="mx-auto text-base text-gray-600">
          <InlineEditable tag="div" value={data?.subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1 ">
            <div className="bg-white shadow-sm p-2 h-full">
              <ul className="space-y-1">
                {items.map((item, index) => (
                  <li key={item._id || index}>
                    <button
                      onClick={() => setActiveCategory(item.slug)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-l-4 border-transparent",
                        activeCategory === item.slug
                          ? "bg-[#EBF5FF] text-[#408dfb] border-[#408dfb]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {item.image && (
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                          <InlineImageEditable
                            src={item.image}
                            alt={item.title}
                            width={24}
                            height={24}
                            fieldPath={`items.${index}.image`}
                            sectionIndex={sectionIndex}
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="truncate"><InlineEditable tag="span" value={item.title || ""} fieldPath={`items.${index}.title`} sectionIndex={sectionIndex} /></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 min-w-0">
            <div className="bg-[#f8fbff] p-6 lg:p-8 border border-slate-100 h-full">
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                  {activeCategoryData?.image && (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Image
                        src={activeCategoryData.image}
                        alt={activeCategoryData.title}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-slate-800">
                    {activeCategoryData?.title}
                  </h2>
                </div>

                {/* Products Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-lg p-4 shadow-md animate-pulse h-full"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="h-4 bg-slate-100 rounded w-3/4" />
                            </div>
                            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded" />
                          </div>
                          <div className="h-3 bg-slate-100 rounded w-12" />
                        </div>
                      ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product.slug}`}
                        className="block bg-white rounded-lg p-4 shadow-md hover:shadow-md transition-all duration-300 cursor-pointer h-full"
                      >
                        <div className="flex items-top justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#004DAA] text-sm leading-tight line-clamp-2">
                              {product.productInfo?.title}
                            </h4>
                          </div>
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {product.icon?.url || product.images?.[0]?.url ? (
                              <Image
                                src={
                                  product.icon?.url ||
                                  product.images?.[0]?.url ||
                                  ""
                                }
                                alt={product.productInfo?.title || "Product"}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            ) : (
                              <div className="text-slate-300 font-bold text-xs">
                                IMG
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs">Product</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">
                      No products found
                    </h3>
                    <p className="text-slate-500 max-w-sm">
                      We couldn&apos;t find any products in this category at the
                      moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
