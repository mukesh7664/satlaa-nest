import { Skeleton } from "@/components/ui/skeleton";

const FilterSectionSkeleton = () => (
  <div className="pt-4 pb-5 border-b border-gray-200">
    <div className="flex justify-between items-center mb-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </div>
);

export const FilterSkeleton = () => {
  return (
    <aside className="lg:col-span-1">
      <div className="bg-white p-5 ">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Sections */}
        <FilterSectionSkeleton />
        <FilterSectionSkeleton />
        <FilterSectionSkeleton />
        <FilterSectionSkeleton />
      </div>
    </aside>
  );
};
