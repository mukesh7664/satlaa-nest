"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  product?: {
    _id: string;
    productInfo: {
      title: string;
      images?: { url: string }[];
    };
    slug: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  reviewType: "product" | "brand";
  images?: { url: string; alt?: string }[];
}

interface ReviewCardProps {
  review: Review;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const productImage =
    review.product?.productInfo?.images?.[0]?.url || "/images/place.png";
  const brandLogo = review.brand?.logo || "/placeholder-brand.png";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header with products/Brand Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          {review.reviewType === "product" && review.product ? (
            <>
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={productImage}
                  alt={review.product.productInfo.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <Link
                  href={`/products/${review.product.slug}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                >
                  {review.product.productInfo.title}
                </Link>
                <p className="text-sm text-gray-500">Product Review</p>
              </div>
            </>
          ) : review.brand ? (
            <>
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={brandLogo}
                  alt={review.brand.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <Link
                  href={`/brands/${review.brand.slug}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {review.brand.name}
                </Link>
                <p className="text-sm text-gray-500">Brand Review</p>
              </div>
            </>
          ) : null}
        </div>
        {getStatusBadge(review.status)}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`w-5 h-5 ${
                star <= review.rating ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Review Title */}
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {review.title}
      </h3>

      {/* Review Comment */}
      <p className="text-gray-700 mb-4 line-clamp-3">{review.comment}</p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0"
            >
              <Image
                src={img.url}
                alt={img.alt || `Review image ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(review._id)}
            className="flex items-center gap-2"
          >
            <FaEdit className="w-4 h-4" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(review._id)}
            className="flex items-center gap-2"
          >
            <FaTrash className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
