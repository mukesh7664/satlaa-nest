"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FiX, FiChevronRight } from "react-icons/fi";
import { motion, type Variants } from "motion/react";
import ProductCard from "@/components/Cards/ProductsCard";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { useCurrency } from "@/context/CurrencyContext";
import { Product } from "@/lib/api/collections";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

interface ProductGridProps {
    products: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    hasActiveFilters: boolean;
    brands: any[];
    collections: any[];
    categories: any[];
    tags: any[];
    activeFilters: any;
}


export function ProductGrid({
    products,
    pagination,
    hasActiveFilters,
    brands,
    collections,
    categories,
    tags,
    activeFilters,
}: ProductGridProps) {
    const { currency } = useCurrency();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sortOption = searchParams.get("sortBy") === "price" ? `price_${searchParams.get("sortOrder")}` : "newest";

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");

        if (value === "price_asc") {
            params.set("sortBy", "price");
            params.set("sortOrder", "asc");
        } else if (value === "price_desc") {
            params.set("sortBy", "price");
            params.set("sortOrder", "desc");
        } else {
            params.set("sortBy", "createdAt");
            params.set("sortOrder", "desc");
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleRemoveFilter = (key: string, value?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            const values = params.get(key)?.split(",") || [];
            const newValues = values.filter(v => v !== value);
            if (newValues.length > 0) params.set(key, newValues.join(","));
            else params.delete(key);
        } else {
            params.delete(key);
            if (key === "minPrice" || key === "maxPrice") {
                params.delete("minPrice");
                params.delete("maxPrice");
            }
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleClearFilters = () => {
        router.push(window.location.pathname);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(newPage));
        window.scrollTo({ top: 0, behavior: "smooth" });
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Extract dynamic attribute filters for badge display
    const dynamicAttrFilters = Array.from(searchParams.entries())
        .filter(([key]) => key.startsWith('attr_'))
        .flatMap(([key, val]) => val.split(',').map(v => ({ key, label: key.replace('attr_', ''), value: v })));

    const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) || [];
    const selectedCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
    const selectedCollections = searchParams.get("collection")?.split(",").filter(Boolean) || [];

    const currentCategoryName = categories.find(c => selectedCategories.includes(c.slug))?.name || 'All Product';

    return (
        <>
            {/* Top Redesigned Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-150 pb-5">
                <div>
                    <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mb-1">
                        <span>Categories</span>
                        <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-slate-800 font-bold">{currentCategoryName}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                        Showing all <span className="text-slate-800 font-semibold">{pagination.total.toLocaleString()}</span> items results
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    {/* Sort Dropdown */}
                    <Select value={sortOption} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl border-slate-200 bg-white">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-bold mr-1">Active Filters:</span>
                    
                    {/* Categories */}
                    {selectedCategories.map((slug) => (
                        <div key={slug} className="flex items-center gap-1 bg-white text-blue-700 text-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                            <span className="font-semibold">Category: {categories.find(c => c.slug === slug)?.name || slug}</span>
                            <button onClick={() => handleRemoveFilter("category", slug)} className="focus:outline-none">
                                <FiX className="h-3 w-3 hover:text-blue-900" />
                            </button>
                        </div>
                    ))}
                    
                    {/* Brands */}
                    {selectedBrands.map((slug) => (
                        <div key={slug} className="flex items-center gap-1 bg-white text-blue-700 text-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                            <span className="font-semibold">Brand: {brands.find(b => b.slug === slug)?.name || slug}</span>
                            <button onClick={() => handleRemoveFilter("brand", slug)} className="focus:outline-none">
                                <FiX className="h-3 w-3 hover:text-blue-900" />
                            </button>
                        </div>
                    ))}

                    {/* Dynamic Attributes */}
                    {dynamicAttrFilters.map((f, i) => (
                        <div key={`${f.key}-${i}`} className="flex items-center gap-1 bg-white text-purple-700 text-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                            <span className="font-semibold capitalize">{f.label}: {f.value}</span>
                            <button onClick={() => handleRemoveFilter(f.key, f.value)} className="focus:outline-none">
                                <FiX className="h-3 w-3 hover:text-purple-900" />
                            </button>
                        </div>
                    ))}

                    {/* Tags */}
                    {selectedTags.map((tagId) => {
                        const tag = (tags || []).find(t => t.id === tagId);
                        return (
                            <div key={tagId} className="flex items-center gap-1 bg-white text-green-700 text-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                                <span className="font-semibold">Tag: {tag?.name || tagId}</span>
                                <button onClick={() => handleRemoveFilter("tags", tagId)} className="focus:outline-none">
                                    <FiX className="h-3 w-3 hover:text-green-900" />
                                </button>
                            </div>
                        );
                    })}

                    {/* Price */}
                    {(activeFilters.minPrice !== undefined || activeFilters.maxPrice !== undefined) && (
                        <div className="flex items-center gap-1 bg-white text-orange-700 text-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                            <span className="font-semibold">
                                Price: <PriceDisplay amount={activeFilters.minPrice || 0} originalCurrency={currency} /> - 
                                {activeFilters.maxPrice ? <PriceDisplay amount={activeFilters.maxPrice} originalCurrency={currency} /> : '∞'}
                            </span>
                            <button onClick={() => handleRemoveFilter("minPrice")} className="focus:outline-none">
                                <FiX className="h-3 w-3 hover:text-orange-900" />
                            </button>
                        </div>
                    )}

                    {/* Rating */}
                    {activeFilters.rating && (
                        <div className="flex items-center gap-1 bg-white text-yellow-700 text-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                            <span className="font-bold">{activeFilters.rating}★ & Up</span>
                            <button onClick={() => handleRemoveFilter("rating")} className="focus:outline-none">
                                <FiX className="h-3 w-3 hover:text-yellow-900" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 ml-auto"
                    >
                        Clear All
                    </button>
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="text-gray-600 font-medium">No products found</div>
                    <div className="text-gray-400 text-sm mt-1">Try adjusting your filters to find what you're looking for.</div>
                </div>
            ) : (
                <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {products.map((product) => (
                            <motion.div key={product._id} variants={itemVariants}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center mt-12 gap-2">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    variant={pagination.page === p ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(p)}
                                    className={pagination.page === p ? "bg-blue-600 hover:bg-blue-700" : ""}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-6 text-xs text-gray-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                        {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                        )}{" "}
                        of {pagination.total} products
                    </div>
                </>
            )}
        </>
    );
}
