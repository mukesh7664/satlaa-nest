import {
  getProducts,
  getFilters,
} from "@/lib/api/products";
import { FilterSidebarWrapper } from "@/components/Pages/Listing/FilterSidebarWrapper";
import { ProductGrid } from "./ProductGrid";
import { Suspense } from "react";
import ProductCardSkeleton from "@/components/Cards/ProductCardSkeleton";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductListingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const filters: any = {
    page: Number(resolvedParams.page) || 1,
    limit: Number(resolvedParams.limit) || 12,
    brand: resolvedParams.brand as string,
    category: resolvedParams.category as string,
    collection: resolvedParams.collection as string,
    minPrice: resolvedParams.minPrice !== undefined ? Number(resolvedParams.minPrice) : undefined,
    maxPrice: resolvedParams.maxPrice !== undefined ? Number(resolvedParams.maxPrice) : undefined,
    rating: resolvedParams.rating ? Number(resolvedParams.rating) : undefined,
    search: resolvedParams.search as string,
    tags: resolvedParams.tags as string,
    sortBy: resolvedParams.sortBy as string || "createdAt",
    sortOrder: (resolvedParams.sortOrder as "asc" | "desc") || "desc",
  };

  // Extract all dynamic attributes (starting with attr_) from searchParams
  Object.keys(resolvedParams).forEach(key => {
    if (key.startsWith('attr_')) {
      filters[key] = resolvedParams[key];
    }
  });

  // Parallel data fetching
  const [productsData, filtersData] = await Promise.all([
    getProducts(filters),
    getFilters(filters.category),
  ]);

  const hasActiveFilters = Object.keys(resolvedParams).some(k =>
    !['page', 'limit', 'sortBy', 'sortOrder'].includes(k) && resolvedParams[k]
  );

  return (
    <main className="bg-gray-50">
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-12 mx-auto pt-4">
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Home / All Products
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12">

          <FilterSidebarWrapper
            filters={filtersData.filters || null}
            loading={false}
          />

          {/* Product Grid */}
          <section className="lg:col-span-3">
            <Suspense fallback={<ProductCardSkeleton />}>
              <ProductGrid
                products={productsData.data}
                pagination={productsData.pagination}
                hasActiveFilters={hasActiveFilters}
                // Legacy props if ProductGrid expects them
                brands={filtersData.filters?.brands || []}
                collections={filtersData.filters?.collections || []}
                categories={filtersData.filters?.categories || []}
                tags={filtersData.filters?.tags || []}
                activeFilters={filters}
              />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
