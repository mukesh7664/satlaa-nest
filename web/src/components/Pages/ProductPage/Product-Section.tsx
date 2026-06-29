"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";
import ProductSectionInfo from "./Product-Section-Info";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductInfo, ProductVariant, SimplePricing, BundleProduct } from "./Product-Section-Info";

interface ProductImage {
  url: string;
  fullUrl?: string;
  position: number;
  alt: string;
  type?: "image" | "video";
  variantId?: string | null;
}

interface ProductSectionProps {
  images?: ProductImage[];
  productInfo: ProductInfo;
  productId?: string;
  productName?: string;
  productBrand?: string;
  quantityLabel?: string;
  variants?: ProductVariant[];
  productPricingType?: string;
  simplePricing?: SimplePricing;
  manualCurrencyPrices?: Record<string, number>;
  bundleProducts?: BundleProduct[];
  purchaseType?: "online" | "quote" | "both";
  // Tag related props
  collections?: Array<{ _id: string; name: string }>;
  tags?: Array<string | { _id: string; name: string }>;
  flags?: Array<string | { _id: string; name: string }>;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  category?: string;
  selectedVariant?: ProductVariant | null;
  attributes?: Record<string, any>;
  tax_rate?: number;
  is_returnable?: boolean;
  is_replaceable?: boolean;
  return_window_days?: number;
  onVariantChange?: (variant: ProductVariant) => void;
  description?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  images,
  productInfo,
  productId,
  productName,
  productBrand,
  quantityLabel,
  variants,
  productPricingType,
  simplePricing,
  manualCurrencyPrices,
  bundleProducts,
  purchaseType,
  collections,
  tags,
  flags,
  isFeatured,
  isBestSeller,
  isNewArrival,
  category,
  selectedVariant,
  attributes,
  tax_rate,
  is_returnable,
  is_replaceable,
  return_window_days,
  onVariantChange,
  description,
}) => {
  const isVideo = (img: ProductImage) => {
    if (img.type === "video") return true;
    const url = img.fullUrl || img.url;
    if (!url) return false;
    return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
  };

  const productImages = images || [];
  const mainImageUrl = productImages.length > 0 ? productImages[0].fullUrl || productImages[0].url : "";
  const altText = productImages.length > 0 ? productImages[0].alt : "Product image";
  const allImages = productImages;

  const [mainImage, setMainImage] = useState(mainImageUrl);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filter images based on selected variant
  const filteredImages = React.useMemo(() => {
    if (!selectedVariant) return allImages.filter(img => !img.variantId);
    
    const variantSpecific = allImages.filter(img => img.variantId === selectedVariant._id);
    const general = allImages.filter(img => !img.variantId);
    
    // If variant has specific images, show them first, then general
    return variantSpecific.length > 0 ? [...variantSpecific, ...general] : general;
  }, [allImages, selectedVariant]);

  // Update main image and reset index when filtered images change
  React.useEffect(() => {
    if (filteredImages.length > 0) {
      const firstImg = filteredImages[0];
      setMainImage(firstImg.fullUrl || firstImg.url);
      setIndex(0);
    }
  }, [filteredImages]);

  const slides = filteredImages.map((img) =>
    isVideo(img)
      ? {
          type: "video" as const,
          width: 1280,
          height: 720,
          sources: [
            {
              src: img.fullUrl || img.url,
              type: "video/mp4",
            },
          ],
        }
      : {
          src: img.fullUrl || img.url,
          width: 1200,
          height: 1200,
        }
  );

  const handleThumbnailClick = (img: ProductImage, idx: number) => {
    setMainImage(img.fullUrl || img.url);
    setIndex(idx);
  };

  // Auto-rotation effect
  React.useEffect(() => {
    if (isHovered || filteredImages.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % filteredImages.length;
        // Sync mainImage state with the new index
        const nextImage = filteredImages[nextIndex];
        setMainImage(nextImage.fullUrl || nextImage.url);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, filteredImages]);

  // Get the first available tag to display
  const getFirstTag = (): {
    label: string;
    bgColor: string;
    textColor: string;
  } | null => {
    if (isFeatured) {
      return {
        label: "⭐ Featured",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
      };
    }
    if (isBestSeller) {
      return {
        label: "🏆 Best Seller",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      };
    }
    if (isNewArrival) {
      return {
        label: "✨ New Arrival",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
      };
    }
    if (collections && collections.length > 0) {
      return {
        label: collections[0].name,
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
      };
    }
    if (tags && tags.length > 0) {
      const firstTag = tags[0];
      return {
        label:
          typeof firstTag === "object" &&
          firstTag !== null &&
          "name" in firstTag
            ? (firstTag as { name: string }).name
            : String(firstTag),
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
      };
    }
    if (flags && flags.length > 0) {
      const firstFlag = flags[0];
      return {
        label:
          typeof firstFlag === "object" &&
          firstFlag !== null &&
          "name" in firstFlag
            ? (firstFlag as { name: string }).name
            : String(firstFlag),
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      };
    }
    return null;
  };

  const firstTag = getFirstTag();

  return (
    <>
      <ProductSectionInfo
        productInfo={productInfo}
        productId={productId}
        productName={productName}
        productImage={allImages.find(img => !isVideo(img))?.fullUrl || allImages.find(img => !isVideo(img))?.url || mainImageUrl}
        productBrand={productBrand}
        quantityLabel={quantityLabel}
        variants={variants}
        productPricingType={productPricingType}
        simplePricing={simplePricing}
        manualCurrencyPrices={manualCurrencyPrices}
        bundleProducts={bundleProducts}
        purchaseType={purchaseType}
        collections={collections}
        tags={tags}
        flags={flags}
        isFeatured={isFeatured}
        isBestSeller={isBestSeller}
        isNewArrival={isNewArrival}
        category={category}
        selectedVariant={selectedVariant}
        attributes={attributes}
        tax_rate={tax_rate}
        is_returnable={is_returnable}
        is_replaceable={is_replaceable}
        return_window_days={return_window_days}
        onVariantChange={onVariantChange}
        description={description}
      >
        <div 
          className="w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {mainImage ? (
            <>
              <div
                className="border border-slate-100 rounded-2xl overflow-hidden mb-4 cursor-pointer relative aspect-square bg-slate-50/30 shadow-sm"
                onClick={() => setOpen(true)}
              >
                {/* Tag Overlay */}
                {firstTag && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${firstTag.bgColor} ${firstTag.textColor} border border-current shadow-sm`}
                    >
                      {firstTag.label}
                    </span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {isVideo(
                      filteredImages.find(
                        (img) => (img.fullUrl || img.url) === mainImage
                      ) || filteredImages[0]
                    ) ? (
                      <video
                        src={mainImage}
                        className="w-full h-full object-contain"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <Image
                        src={mainImage}
                        alt={altText}
                        width={600}
                        height={600}
                        className="w-full h-full object-contain"
                        priority
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                {filteredImages.map((img, idx) => (
                  <motion.button
                    key={img.url + idx}
                    onClick={() => handleThumbnailClick(img, idx)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`border-2 rounded-xl overflow-hidden flex-shrink-0 w-20 h-20 bg-slate-50 ${
                      mainImage === (img.fullUrl || img.url)
                        ? "border-blue-600 shadow-sm"
                        : "border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {isVideo(img) ? (
                      <video
                        src={img.fullUrl || img.url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={img.fullUrl || img.url}
                        alt={img.alt}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <div className="border rounded-2xl overflow-hidden mb-4 bg-gray-50 flex items-center justify-center aspect-square border-slate-100">
              <p className="text-gray-400">No image available</p>
            </div>
          )}
        </div>
      </ProductSectionInfo>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        on={{
          view: ({ index: currentIndex }: { index: number }) =>
            setIndex(currentIndex),
        }}
        plugins={[Video]}
      />
    </>
  );
};

export default ProductSection;
