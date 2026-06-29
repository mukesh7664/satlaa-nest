"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { useState, useEffect } from "react";
import ProductCard from "@/components/Cards/ProductsCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getCollectionBySlug, type Product } from "@/lib/api/collections";
import { motion } from "motion/react";

export interface TopTrendingProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    collectionSlug?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function TopTrending({ data, sectionIndex }: TopTrendingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const slug = data?.collectionSlug;
        if (!slug) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const response = await getCollectionBySlug(slug, { limit: 20 });
        setProducts(response.collection?.products || []);
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, [data?.collectionSlug]);

  if (data?.show === false || !data?.title) return null;

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

  if (products.length === 0 && !loading) return null;

  return (
    <main
      className="flex items-start justify-center py-12 overflow-hidden"
      style={sectionStyle}
    >
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-gray-600 mx-auto"
          >
            <InlineEditable tag="div" value={data?.subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </motion.div>
        </header>

        {/* Products row */}
        <section>
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading trending products...
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="px-4">
                  {products.map((product) => (
                    <CarouselItem
                      key={product._id}
                      className="pl-4 basis-[80%] sm:basis-1/2 lg:basis-1/3 xl:basis-[calc(100%/4.5)] p-2"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>
          )}
        </section>
      </div>
    </main>
  );
}
