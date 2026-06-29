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

// --- Standalone Section Component ---
export interface SoftwareForGraphicDesignProps {
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

// --- Standalone Section Component ---
export default function SoftwareForGraphicDesign({
  data, sectionIndex,
}: SoftwareForGraphicDesignProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphicProducts = async () => {
      try {
        const slug = data?.collectionSlug || "graphic-software";
        const response = await getCollectionBySlug(slug, {
          limit: 20,
        });
        setProducts(response.collection.products || []);
      } catch (error) {
        console.error("Failed to fetch graphic design products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphicProducts();
  }, [data?.collectionSlug]);

  if (data?.show === false) return null;

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
    <section className="py-20 overflow-hidden" style={sectionStyle}>
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            {data?.title ? (
              <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            ) : (
              <>
                Software For{" "}
                <span className="text-[#4988FF]">Graphic Design</span>
              </>
            )}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-gray-600"
          >
            {data?.subtitle ? (
              <InlineEditable tag="div" value={data?.subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            ) : (
              "Explore the Best Graphic Design Software to Create Stunning Visuals for Web, Print, and Social Media"
            )}
          </motion.div>
        </div>

        {/* Products Grid */}
        <section>
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading graphic design products...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No graphic design products found
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
                <CarouselContent className="px-2">
                  {products.map((product) => (
                    <CarouselItem
                      key={product._id}
                      className="pl-4 basis-[80%] sm:basis-1/2 lg:basis-1/3 xl:basis-[calc(100%/4.5)] py-2"
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
    </section>
  );
}
