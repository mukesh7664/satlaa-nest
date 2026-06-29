import Image from "next/image";
import { FaStar } from "react-icons/fa";

import Link from "next/link";
import { PriceDisplay } from "../common/PriceDisplay";

export interface OtherProductsCardProps {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  image: string;
  backgroundColor: string;
  slug: string;
  originalCurrency?: string;
}

export function OtherProductsCard({
  name,
  category,
  price,
  originalPrice,
  discount,
  rating,
  image,
  backgroundColor,
  slug,
  originalCurrency = "INR",
}: OtherProductsCardProps) {
  return (
    <Link href={`/products/${slug}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200/80 hover:shadow-md transition-shadow duration-300 cursor-pointer h-full">
        {/* Product Image Section */}
        <div
          className="h-48 rounded-t-lg flex items-center justify-center p-4"
          style={{ backgroundColor }}
        >
          <div className="relative w-32 h-32">
            <Image src={image || "/placeholder.png"} alt={name} fill className="object-contain" />
          </div>
        </div>

        {/* Product Info Section */}
        <div className="p-4">
          {/* Category */}
          <p className="text-sm text-gray-500 mb-1">{category}</p>

          {/* Title */}
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-900 text-left line-clamp-2 min-h-[40px]">
              {name}
            </h3>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex text-blue-500">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) ? "text-blue-500" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex flex-col">
            <div className="text-xl font-semibold text-gray-900">
              <PriceDisplay amount={price} originalCurrency={originalCurrency} />
            </div>
            {originalPrice && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400 line-through">
                  <PriceDisplay amount={originalPrice} originalCurrency={originalCurrency} /> / user/month
                </span>
                {discount && (
                  <span className="text-sm text-orange-500 font-medium">
                    ({discount}%)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
