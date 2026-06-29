import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="block w-full max-w-xs">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 relative">
        {/* Image Skeleton */}
        <div className="relative p-4 flex items-center justify-center h-48 bg-gray-50">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        {/* Content Skeleton */}
        <div className="p-4 pt-3 pb-2">
          {/* Title Skeleton */}
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-5 w-1/2 mb-4" />

          {/* Price and Button Area */}
          <div className="relative h-12 mt-2">
            <div className="flex items-baseline space-x-2">
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
