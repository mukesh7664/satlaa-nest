"use client";

import React from "react";
import { Star, Heart, Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { PriceDisplay } from "@/components/common/PriceDisplay";

interface ProductSpotlight {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency?: string;
  manualCurrencyPrices?: Record<string, number>;
  rating: number;
  image: string;
  discountBadge: string;
  description: string;
}

interface ShoesArtisticShowcaseProps {
  data?: {
    leftImage?: string;
    product?: ProductSpotlight;
  };
  sectionIndex?: number;
}


export default function ShoesArtisticShowcase({ data, sectionIndex }: ShoesArtisticShowcaseProps) {
  const { addToCart } = useCart();
  const leftImage = data?.leftImage || "";
  const product = data?.product || null;

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }, true);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add spotlight product to cart.");
    }
  };

  if (!product) return null;

  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-white border-b border-slate-100">
      
      {/* Left Column: Artistic Lifestyle Photo */}
      <div className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden group">
        <InlineImageEditable 
          src={leftImage} 
          alt="Artistic Lifestyle Showcase" 
          fill
          fieldPath="leftImage"
          sectionIndex={sectionIndex}
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 select-none z-0" 
        />
        <div className="absolute inset-0 bg-black/15 z-10" />
      </div>

      {/* Right Column: Spotlight Shoppable Card on light grey */}
      <div className="bg-[#f2f5fa] p-8 md:p-16 lg:p-24 flex items-center justify-center min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
        
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl max-w-md w-full relative group">
          
          {/* Sale Badge */}
          <span className="absolute left-6 top-6 bg-red-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full tracking-wider shadow-sm z-20">
            <InlineEditable tag="span" value={product.discountBadge || ""} fieldPath="product.discountBadge" sectionIndex={sectionIndex} />
          </span>

          {/* Product Image on solid block background */}
          <div className="w-full aspect-[4/3] bg-slate-50 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden mb-6">
            <InlineImageEditable 
              src={product.image} 
              alt={product.name} 
              fill
              fieldPath="product.image"
              sectionIndex={sectionIndex}
              className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.12)] group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500"
            />

            {/* Quick Hover Utilities */}
            <div className="absolute right-4 bottom-4 flex gap-2">
              <button className="w-8 h-8 rounded-full bg-white hover:bg-black hover:text-[#55eb0c] text-slate-800 shadow-md flex items-center justify-center transition-colors cursor-pointer">
                <Heart size={13} />
              </button>
              <button className="w-8 h-8 rounded-full bg-white hover:bg-black hover:text-[#55eb0c] text-slate-800 shadow-md flex items-center justify-center transition-colors cursor-pointer">
                <Eye size={13} />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star 
                key={idx} 
                size={12} 
                className={idx < product.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}
              />
            ))}
          </div>

          <h3 className="text-lg md:text-xl font-black text-black tracking-tight uppercase group-hover:text-[#55eb0c] transition-colors mb-3 leading-tight">
            <InlineEditable tag="span" value={product.name || ""} fieldPath="product.name" sectionIndex={sectionIndex} />
          </h3>

          <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
            <InlineEditable tag="span" value={product.description || ""} fieldPath="product.description" sectionIndex={sectionIndex} />
          </p>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-black">
                <PriceDisplay
                  amount={product.price}
                  originalCurrency={product.currency || "USD"}
                  manualOverrides={product.manualCurrencyPrices}
                />
              </span>
              <span className="text-xs font-bold text-slate-400 line-through">
                <PriceDisplay
                  amount={product.originalPrice}
                  originalCurrency={product.currency || "USD"}
                  manualOverrides={product.manualCurrencyPrices}
                />
              </span>
            </div>

            <button 
              onClick={handleAddToCart}
              className="bg-black hover:bg-[#55eb0c] hover:text-black text-white px-5 py-2.5 rounded-[30px] font-extrabold text-xs tracking-wider uppercase transition-colors duration-300 flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart size={13} />
              <span>Add to Cart</span>
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
