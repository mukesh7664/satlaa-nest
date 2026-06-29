"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ArrowUpDown, Search, Heart, ShoppingBag, Loader2 } from "lucide-react";
import {
  FavoriteItemCard,
  FavoriteItemType,
} from "@/components/Pages/customerAccount/FavoriteItemCard";
import { wishlistService } from "@/services/wishlist.service";
import { toast } from "sonner";
import Link from "next/link";

export default function MyFavoritesPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [favoriteItems, setFavoriteItems] = React.useState<FavoriteItemType[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const wishlistItems = await wishlistService.getWishlist();
        const mappedItems: FavoriteItemType[] = (wishlistItems as any[])
          .map((item) => {
            const product = item.product;
            if (!product) return null;

            const currentPrice = product.simplePricing?.discountedPrice || product.simplePricing?.basePrice || 0;
            const originalPrice = product.simplePricing?.basePrice || 0;
            const discountPercentage = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

            let imageUrl = "/images/place.png";
            const getFullUrl = (url: string) => {
              if (!url) return "";
              if (url.startsWith("http")) return url;
              const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
              if (cleanUrl.startsWith("uploads/")) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
                const baseUrl = apiUrl.replace("/api/v1", "");
                return `${baseUrl}/${cleanUrl}`;
              }
              return url;
            };

            if (product.icon?.url) {
              imageUrl = getFullUrl(product.icon.url);
            } else if (product.images?.[0]?.url) {
              imageUrl = getFullUrl(product.images[0].url);
            }

            return {
              id: product._id,
              logo: imageUrl,
              vendor: product.brand?.name || product.productInfo?.brand || "Unknown Vendor",
              productName: product.productInfo?.title || "Untitled Product",
              slug: product.slug,
              rating: product.productInfo?.rating?.stars || 0,
              currentPrice,
              originalPrice,
              discountPercentage,
              perCycle: "",
              productType: product.productType,
              purchaseType: product.purchaseType,
              brandId: product.brand?._id,
              brandName: product.brand?.name,
            } as FavoriteItemType;
          })
          .filter((item): item is FavoriteItemType => item !== null);

        setFavoriteItems(mappedItems);
      } catch (error) {
        toast.error("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const filteredItems = favoriteItems.filter(
    (item) =>
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Loading Favorites...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900">Wishlist</h1>
          <p className="text-slate-500 font-medium">Manage your favorite products and saved items.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search wishlist..."
              className="h-14 rounded-xl border-slate-100 bg-white pl-12 transition-all focus:ring-2 focus:ring-blue-600/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-14 rounded-xl border-slate-100 px-6 font-bold gap-2 hover:bg-slate-50">
            <ArrowUpDown size={18} />
            Sort
          </Button>
        </div>
      </div>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-slate-50 rounded-full p-10 w-fit mx-auto mb-6 text-slate-200">
            <Heart size={64} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Wishlist is empty</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">Start adding your favorite products to keep track of them.</p>
          <Button asChild className="rounded-full bg-blue-600 px-8 py-6 font-black">
            <Link href="/products">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.map((item) => (
              <FavoriteItemCard
                key={item.id}
                item={item}
                onRemove={async (id) => {
                  try {
                    await wishlistService.removeFromWishlist(id.toString());
                    setFavoriteItems((prev) => prev.filter((i) => i.id.toString() !== id.toString()));
                    toast.success("Removed from wishlist");
                  } catch (error) {
                    toast.error("Failed to remove item");
                  }
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-8 border-t border-slate-100">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
