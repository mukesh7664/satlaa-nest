"use client";
import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterSkeleton } from "./FilterSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";

// Interfaces
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: {
    url?: string;
  };
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export interface FilterData {
  categories: Category[];
  priceRange: {
    min: number;
    max: number;
  };
  attributes: Record<string, string[]>;
  tags: { name: string; id: string; slug: string }[];
  collections: Collection[];
  brands: Brand[];
}

interface FilterSidebarProps {
  filters: FilterData | null;
  loading?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  black: "#000000",
  white: "#FFFFFF",
  yellow: "#F59E0B",
  pink: "#EC4899",
  purple: "#8B5CF6",
  orange: "#F97316",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#78350F",
  navy: "#1E3A8A",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
};

const standardPriceBrackets = [
  {
    label: `Under `,
    min: 0,
    max: 1000,
    displayLabel: (
      <span>
        Under <PriceDisplay amount={1000} />
      </span>
    ),
  },
  {
    label: `1,000 - 5,000`,
    min: 1000,
    max: 5000,
    displayLabel: (
      <span>
        <PriceDisplay amount={1000} /> - <PriceDisplay amount={5000} />
      </span>
    ),
  },
  {
    label: `5,000 - 10,000`,
    min: 5000,
    max: 10000,
    displayLabel: (
      <span>
        <PriceDisplay amount={5000} /> - <PriceDisplay amount={10000} />
      </span>
    ),
  },
  {
    label: `10,000 - 25,000`,
    min: 10000,
    max: 25000,
    displayLabel: (
      <span>
        <PriceDisplay amount={10000} /> - <PriceDisplay amount={25000} />
      </span>
    ),
  },
  {
    label: `Above 25,000`,
    min: 25000,
    max: 1000000,
    displayLabel: (
      <span>
        Above <PriceDisplay amount={25000} />
      </span>
    ),
  },
];

export function FilterSidebar({
  filters,
  loading = false,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeFilters = useMemo(() => {
    if (!filters) return null;
    return {
      categories: filters.categories || [],
      priceRange: filters.priceRange || { min: 0, max: 1000000 },
      attributes: filters.attributes || {},
      tags: filters.tags || [],
      collections: filters.collections || [],
      brands: filters.brands || [],
    };
  }, [filters]);

  // Search input state
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  
  // Sync state if searchParams changes (React official direct rendering update pattern to avoid useEffect cascading renders)
  const [prevParamsString, setPrevParamsString] = useState(searchParams.toString());
  const currentParamsString = searchParams.toString();
  if (currentParamsString !== prevParamsString) {
    setPrevParamsString(currentParamsString);
    setSearchValue(searchParams.get("search") || "");
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Helper to update URL params for multi-select
  const handleFilterToggle = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.get(key)?.split(",").filter(Boolean) || [];

    let newValues;
    if (checked) {
      newValues = Array.from(new Set([...currentValues, value]));
    } else {
      newValues = currentValues.filter((v) => v !== value);
    }

    if (newValues.length > 0) {
      params.set(key, newValues.join(","));
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Special handler for price range
  const handlePriceChange = (min: number, max: number, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("minPrice", min.toString());
      params.set("maxPrice", max.toString());
    } else {
      params.delete("minPrice");
      params.delete("maxPrice");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Special handler for rating
  const handleRatingChange = (rating: number, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("rating", rating.toString());
    } else {
      params.delete("rating");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handler to toggle case-insensitive attribute groups
  const handleAttributeToggle = (originalKeys: string[], val: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    originalKeys.forEach((origKey) => {
      const originalValues = safeFilters?.attributes?.[origKey] || [];
      const hasValue = originalValues.some((v: string) => v.trim() === val.trim());
      
      if (hasValue) {
        const queryKey = `attr_${origKey}`;
        const currentValues = params.get(queryKey)?.split(",").filter(Boolean) || [];
        
        let newValues;
        if (checked) {
          newValues = Array.from(new Set([...currentValues, val]));
        } else {
          newValues = currentValues.filter((v) => v !== val);
        }

        if (newValues.length > 0) {
          params.set(queryKey, newValues.join(","));
        } else {
          params.delete(queryKey);
        }
      }
    });

    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const selectedCategories = useMemo(() => searchParams.get("category")?.split(",") || [], [searchParams]);
  const selectedBrands = useMemo(() => searchParams.get("brand")?.split(",") || [], [searchParams]);
  const selectedCollections = useMemo(() => searchParams.get("collection")?.split(",") || [], [searchParams]);
  const selectedTags = useMemo(() => searchParams.get("tags")?.split(",") || [], [searchParams]);
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");
  const currentRating = searchParams.get("rating");

  const consolidatedAttributes = useMemo(() => {
    if (!safeFilters || !safeFilters.attributes) return [];
    
    const groups: Record<string, {
      originalKeys: string[];
      displayName: string;
      values: string[];
    }> = {};

    Object.entries(safeFilters.attributes).forEach(([key, values]) => {
      const normalizedKey = key.toLowerCase().trim();
      const trimmedValues = (values as string[]).map(v => v.trim()).filter(Boolean);

      if (!groups[normalizedKey]) {
        groups[normalizedKey] = {
          originalKeys: [key],
          displayName: key,
          values: trimmedValues,
        };
      } else {
        if (!groups[normalizedKey].originalKeys.includes(key)) {
          groups[normalizedKey].originalKeys.push(key);
        }
        trimmedValues.forEach(val => {
          if (!groups[normalizedKey].values.includes(val)) {
            groups[normalizedKey].values.push(val);
          }
        });
      }
    });

    return Object.entries(groups).map(([normalizedKey, group]) => ({
      normalizedKey,
      displayName: group.displayName,
      originalKeys: group.originalKeys,
      values: group.values.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })),
    }));
  }, [safeFilters]);

  if (loading || !safeFilters) return <FilterSkeleton />;

  return (
    <aside className="lg:col-span-1 flex flex-col gap-6">
      {/* Search Bar - Standalone Box */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-2 px-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-transparent pl-8 pr-4 py-1 text-sm border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
            placeholder="Search..."
          />
        </div>
      </form>

      {/* Main Filter Accordions Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <button 
            onClick={() => router.push(window.location.pathname)}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Clear All
          </button>
        </div>

        <Accordion type="multiple" defaultValue={["categories", "price", "attributes"]}>
          
          {/* A. Categories */}
          <AccordionItem value="categories" className="border-none mb-5">
            <AccordionTrigger className="hover:no-underline py-2.5 px-4 bg-[#EEF2F6] rounded-xl text-slate-700 font-bold text-sm [&[data-state=open]>svg]:rotate-180 mb-3">
              <span>Categories</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 px-1">
              <div className="space-y-2.5 pl-1">
                {/* All Categories Checkbox */}
                <div className="flex items-center space-x-2 py-0.5">
                  <Checkbox
                    id="cat-all"
                    checked={selectedCategories.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("category");
                        params.set("page", "1");
                        router.push(`?${params.toString()}`, { scroll: false });
                      }
                    }}
                  />
                  <label htmlFor="cat-all" className="text-sm font-bold text-slate-800 cursor-pointer">
                    All Categories
                  </label>
                </div>

                {safeFilters.categories.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.slug}`}
                        checked={selectedCategories.includes(cat.slug)}
                        onCheckedChange={(checked) => handleFilterToggle("category", cat.slug, checked as boolean)}
                      />
                      <label htmlFor={`cat-${cat.slug}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                        {cat.name}
                      </label>
                    </div>
                    {/* Nested children */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="ml-6 space-y-2 border-l border-gray-150 pl-3">
                        {cat.children.map((child) => (
                          <div key={child.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${child.slug}`}
                              checked={selectedCategories.includes(child.slug)}
                              onCheckedChange={(checked) => handleFilterToggle("category", child.slug, checked as boolean)}
                            />
                            <label htmlFor={`cat-${child.slug}`} className="text-xs text-gray-600 cursor-pointer">
                              {child.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* B. Price Range */}
          <AccordionItem value="price" className="border-none mb-5">
            <AccordionTrigger className="hover:no-underline py-2.5 px-4 bg-[#EEF2F6] rounded-xl text-slate-700 font-bold text-sm [&[data-state=open]>svg]:rotate-180 mb-3">
              <span>Product Price</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 px-1">
              <div className="space-y-2 pl-1 mb-4">
                {standardPriceBrackets.map((range) => (
                  <div key={range.label} className="flex items-center space-x-2 py-0.5">
                    <Checkbox
                      id={`price-${range.label}`}
                      checked={currentMinPrice === range.min.toString() && currentMaxPrice === range.max.toString()}
                      onCheckedChange={(checked) => handlePriceChange(range.min, range.max, checked as boolean)}
                    />
                    <label htmlFor={`price-${range.label}`} className="text-sm text-gray-700 cursor-pointer">
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* D. Attributes (Dynamic) */}
          {consolidatedAttributes.map(({ normalizedKey, displayName, originalKeys, values }) => {
            const isColor = normalizedKey === "color";
            const isSize = normalizedKey === "size" || normalizedKey.startsWith("size");

            return (
              <AccordionItem key={normalizedKey} value={`attr-${normalizedKey}`} className="border-none mb-5">
                <AccordionTrigger className="hover:no-underline py-2.5 px-4 bg-[#EEF2F6] rounded-xl text-slate-700 font-bold text-sm [&[data-state=open]>svg]:rotate-180 mb-3">
                  <span className="capitalize">{displayName}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-1">
                  <div className={isColor ? "flex flex-wrap gap-3 pl-1" : isSize ? "flex flex-wrap gap-2 pl-1" : "space-y-2.5 pl-1"}>
                    {values.map((val) => {
                      const isChecked = originalKeys.some(origKey => 
                        searchParams.get(`attr_${origKey}`)?.split(",").includes(val)
                      );

                      if (isColor) {
                        const bgCode = COLOR_MAP[val.toLowerCase()] || "#E5E7EB";
                        return (
                          <button
                            key={val}
                            title={val}
                            onClick={() => handleAttributeToggle(originalKeys, val, !isChecked)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              isChecked ? "border-blue-600 scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: bgCode }}
                          />
                        );
                      }

                      if (isSize) {
                        return (
                          <button
                            key={val}
                            onClick={() => handleAttributeToggle(originalKeys, val, !isChecked)}
                            className={`min-w-[40px] h-10 px-2 rounded-xl border text-sm font-medium transition-all ${
                              isChecked 
                                ? "bg-[#E07A5F] border-[#E07A5F] text-white" 
                                : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      }

                      return (
                        <div key={val} className="flex items-center space-x-2">
                          <Checkbox
                            id={`attr-${normalizedKey}-${val}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleAttributeToggle(originalKeys, val, checked as boolean)}
                          />
                          <label htmlFor={`attr-${normalizedKey}-${val}`} className="text-sm text-gray-700 cursor-pointer">
                            {val}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {/* E. Collections */}
          {safeFilters.collections.length > 0 && (
            <AccordionItem value="collections" className="border-none mb-5">
              <AccordionTrigger className="hover:no-underline py-2.5 px-4 bg-[#EEF2F6] rounded-xl text-slate-700 font-bold text-sm [&[data-state=open]>svg]:rotate-180 mb-3">
                <span>Collections</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-1">
                <div className="space-y-2.5 pl-1">
                  {safeFilters.collections.map((coll) => (
                    <div key={coll.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`coll-${coll.slug}`}
                        checked={selectedCollections.includes(coll.slug)}
                        onCheckedChange={(checked) => handleFilterToggle("collection", coll.slug, checked as boolean)}
                      />
                      <label htmlFor={`coll-${coll.slug}`} className="text-sm text-gray-700 cursor-pointer">
                        {coll.name}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* F. Ratings */}
          <AccordionItem value="ratings" className="border-none mb-5">
            <AccordionTrigger className="hover:no-underline py-2.5 px-4 bg-[#EEF2F6] rounded-xl text-slate-700 font-bold text-sm [&[data-state=open]>svg]:rotate-180 mb-3">
              <span>Customer Ratings</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 px-1">
              <div className="space-y-2.5 pl-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={currentRating === rating.toString()}
                      onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
                    />
                    <label htmlFor={`rating-${rating}`} className="text-sm text-gray-700 cursor-pointer flex items-center">
                      <span className="mr-1">{rating}</span>
                      <span className="text-yellow-400 text-lg">★</span>
                      <span className="ml-1 text-gray-500">& Up</span>
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* G. Tags */}
          {safeFilters.tags.length > 0 && (
            <AccordionItem value="tags" className="border-none mb-5">
              <AccordionTrigger className="hover:no-underline py-2.5 px-4 bg-[#EEF2F6] rounded-xl text-slate-700 font-bold text-sm [&[data-state=open]>svg]:rotate-180 mb-3">
                <span>Tags</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-1">
                <div className="flex flex-wrap gap-2 pl-1">
                  {safeFilters.tags.map((tag) => {
                    const isChecked = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleFilterToggle("tags", tag.id, !isChecked)}
                        className={`px-3 py-1 rounded-full border text-xs transition-all ${
                          isChecked 
                            ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" 
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* H. Brands */}
          {safeFilters.brands.length > 0 && (
            <AccordionItem value="brands" className="border-none mb-5">
              <AccordionTrigger className="hover:no-underline py-2.5 px-4 bg-[#EEF2F6] rounded-xl text-slate-700 font-bold text-sm [&[data-state=open]>svg]:rotate-180 mb-3">
                <span>Brands</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-1">
                <div className="space-y-2.5 pl-1">
                  {safeFilters.brands.map((brand) => (
                    <div key={brand.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand.slug}`}
                        checked={selectedBrands.includes(brand.slug)}
                        onCheckedChange={(checked) => handleFilterToggle("brand", brand.slug, checked as boolean)}
                      />
                      <label htmlFor={`brand-${brand.slug}`} className="text-sm text-gray-700 cursor-pointer">
                        {brand.name}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

        </Accordion>
      </div>
    </aside>
  );
}
