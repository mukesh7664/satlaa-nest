"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Link from "next/link";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { motion } from "framer-motion";

export type FavoriteItemType = {
  id: string | number;
  logo: string;
  vendor: string;
  productName: string;
  slug: string;
  rating: number;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  perCycle: string;
  productType?: string;
  purchaseType?: string;
  brandId?: string;
  brandName?: string;
};

interface FavoriteItemCardProps {
  item: FavoriteItemType;
  onRemove?: (id: string | number) => void;
}

export function FavoriteItemCard({ item, onRemove }: FavoriteItemCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart({
        productId: item.id.toString(),
        variantId: undefined,
        price: Number(item.currentPrice),
        quantity: 1,
        purchaseType: item.purchaseType || "online",
        notes: "",
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-all duration-300 overflow-hidden"
    >
      <Link href={`/products/${item.slug}`} className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative aspect-square p-6 bg-slate-50/50 flex items-center justify-center">
          <Image
            src={item.logo || "/images/place.png"}
            alt={item.productName}
            width={200}
            height={200}
            className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
          
          {/* Discount Badge */}
          {item.discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
              -{item.discountPercentage}%
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove?.(item.id);
            }}
            className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-2">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.vendor}</p>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug h-10">
              {item.productName}
            </h3>
          </div>

          <div className="flex items-center gap-1 mb-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill={i < Math.round(item.rating) ? "currentColor" : "none"} className={i < Math.round(item.rating) ? "text-amber-400" : "text-slate-200"} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400">({item.rating})</span>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900">
                <PriceDisplay amount={item.currentPrice} />
              </span>
              {item.originalPrice > item.currentPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  <PriceDisplay amount={item.originalPrice} />
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full rounded-xl h-12 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest gap-2 transition-all duration-300"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
