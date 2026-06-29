// components/ProductCard.js

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHeart } from "react-icons/fa";
import { WishlistButton } from "../ui/UiverseButtons";
import { FiMinus, FiShoppingCart } from "react-icons/fi";

import { type Product } from "@/lib/api/collections";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { PriceDisplay } from "../common/PriceDisplay";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { addToCart, openCart, items, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

  const { _id, slug, images, simplePricing, productInfo } = product;

  // Find if this item is in the cart
  const cartItem = items?.find(
    (item) => item.productId === _id || (item.product as any)?._id === _id
  );

  // Get product image URL
  const getImageUrl = () => {
    const getFullUrl = (url: string) => {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
      if (cleanUrl.startsWith("uploads/")) {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
        const baseUrl = apiUrl.replace("/api/v1", "");
        return `${baseUrl}/${cleanUrl}`;
      }
      return url;
    };

    let url = "";
    if (images && images.length > 0 && images[0].url) {
      url = getFullUrl(images[0].url);
    } else if (product.icon?.url) {
      url = getFullUrl(product.icon.url);
    }
    return url;
  };

  // Handle add to cart
  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsAdding(true);
    try {
      const price = simplePricing?.discountedPrice || simplePricing?.basePrice || (product.variants?.[0]?.price) || 0;

      if (price === 0) {
        toast.error("Product price not available");
        return;
      }

      await addToCart({
        productId: _id,
        variantId: undefined,
        price: Number(price),
        quantity: 1,
        purchaseType: (product as any).purchaseType || "online",
        notes: "",
      });

      openCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle decrement/remove from cart
  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      await updateQuantity(cartItem.id, cartItem.quantity - 1);
    } else {
      toast.error("Item is not in cart");
    }
  };

  // Price calculations
  const currentPrice = simplePricing?.discountedPrice || simplePricing?.basePrice || (product.variants?.[0]?.price) || 0;
  const originalPrice = simplePricing?.basePrice;
  const hasDiscount = !!(originalPrice && currentPrice < originalPrice);
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const isPriceOnRequest = currentPrice === 0 || currentPrice === undefined;

  // Real database rating/reviews
  const starsValue = productInfo?.rating?.stars ?? 5;
  const reviewsValue = (productInfo?.rating as any)?.reviews ?? 0;

  return (
    <div className="block w-full max-w-sm group">
      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300 relative border border-gray-100 flex flex-col justify-between h-full p-4 cursor-pointer">
        {/* Main Clickable Link Overlay */}
        <Link
          href={`/products/${slug}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${productInfo?.title || "Product"}`}
        />

        {/* Product Image and Wishlist Overlay */}
        <div className="relative aspect-square bg-[#F8F9FB] rounded-xl p-6 flex items-center justify-center overflow-hidden">
          {/* Wishlist Button - Top Right of Card (Always Visible) */}
          <div className="absolute top-3 right-3 z-20">
            <button
              className="bg-white p-2.5 rounded-full hover:bg-red-50 border border-gray-100 shadow-sm transform hover:scale-110 transition-all duration-200"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (isInWishlist(_id)) {
                  removeFromWishlist(_id);
                } else {
                  addToWishlist(_id);
                }
              }}
            >
              <FaHeart
                className={`h-4.5 w-4.5 transition-colors duration-200 ${
                  isInWishlist(_id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
              />
            </button>
          </div>

          {/* Product image/video */}
          <div className="w-full h-full relative">
            {images &&
              images.length > 0 &&
              (images[0].type === "video" ||
                /\.(mp4|mov|webm|avi|mkv)$/i.test(images[0].url)) &&
              images[0].url ? (
              <video
                src={getImageUrl()}
                className="w-full h-full object-cover rounded-xl"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (product.icon?.type === "video" ||
              (product.icon?.url &&
                /\.(mp4|mov|webm|avi|mkv)$/i.test(product.icon.url))) &&
              !images?.length &&
              product.icon.url ? (
              <video
                src={getImageUrl()}
                className="w-full h-full object-cover rounded-xl"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <Image
                src={getImageUrl() || "/placeholder.png"}
                alt={images?.[0]?.alt || productInfo?.title || "Product"}
                fill
                className="object-contain rounded-xl p-2"
                unoptimized
              />
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="pt-3.5 pb-1 relative z-20 flex flex-col justify-between flex-1">
          <div>
            {/* Product Title */}
            <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1.5 hover:text-blue-600 transition-colors">
              {productInfo?.title || "Product"}
            </h3>

            {/* Rating Block */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starIndex = index + 1;
                  return (
                    <span key={index} className="text-sm">
                      {starIndex <= starsValue ? "★" : "☆"}
                    </span>
                  );
                })}
              </div>
              <span className="text-slate-700 font-bold ml-1">{Number(starsValue).toFixed(1)}</span>
              <span>({reviewsValue} {reviewsValue === 1 ? "Review" : "Reviews"})</span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-1.5 mb-4">
              {isPriceOnRequest ? (
                <span className="text-slate-800 font-extrabold text-sm">Price on request</span>
              ) : (
                <>
                  {hasDiscount && (
                    <span className="text-slate-400 line-through text-xs font-semibold">
                      <PriceDisplay 
                        amount={originalPrice} 
                        originalCurrency={simplePricing?.currency || "INR"}
                      />
                    </span>
                  )}
                  <span className="text-slate-800 font-extrabold text-base">
                    <PriceDisplay 
                      amount={currentPrice} 
                      originalCurrency={simplePricing?.currency || "INR"}
                      manualOverrides={(product as any).manualCurrencyPrices}
                    />
                  </span>
                  {hasDiscount && (
                    <span className="text-[#9CA3AF] text-xs font-medium ml-1">
                      ({discountPercentage}% Off)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-2 mt-auto">
            {/* Decrement Button */}
            <button
              onClick={handleDecrement}
              disabled={!cartItem}
              className={`w-9.5 h-9.5 flex items-center justify-center rounded-xl transition-all duration-200 border ${
                cartItem 
                  ? "bg-[#FDF2F0] hover:bg-[#FCE7E4] text-[#E07A5F] border-[#FCE7E4]" 
                  : "bg-gray-50 text-gray-300 border-gray-150 cursor-not-allowed"
              }`}
              title="Remove one from cart"
            >
              <FiMinus className="w-4 h-4" />
            </button>

            {/* Add to Cart Button */}
            {isPriceOnRequest ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/products/${slug}`);
                }}
                className="flex-1 h-9.5 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl text-xs transition-all duration-200 shadow-sm"
              >
                <span>Check Product</span>
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 h-9.5 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl text-xs transition-all duration-200 shadow-sm"
              >
                <FiShoppingCart className="w-3.5 h-3.5" />
                <span>{isAdding ? "Adding..." : "Add To Cart"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
