import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { productsApi, Product } from "@/services/products.api";
import { collectionsApi, Collection } from "@/services/collections.api";
import { pagesApi, Page } from "@/services/pages.api";

import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { TextField, InputAdornment } from "@mui/material";

type ResourceType = "product" | "collection" | "page";

interface ResourcePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (
    slug: string,
    type: ResourceType,
    extraData?: Product | Collection | Page
  ) => void;
  initialType?: ResourceType;
  allowedTypes?: ResourceType[];
  collectionLinkFormat?: "plain" | "query";
}

export default function ResourcePicker({
  isOpen,
  onClose,
  onSelect,
  initialType = "product",
  allowedTypes = ["product", "collection", "page"],
  collectionLinkFormat = "plain",
}: ResourcePickerProps) {
  // Ensure initialType is valid
  const validInitialType = allowedTypes.includes(initialType)
    ? initialType
    : allowedTypes[0];

  const [activeTab, setActiveTab] = useState<ResourceType>(validInitialType);
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setItems([]);
      fetchItems(activeTab, "");
    }
  }, [isOpen, activeTab]);

  // Update activeTab if allowedTypes changes and current is invalid
  useEffect(() => {
    if (!allowedTypes.includes(activeTab)) {
      setActiveTab(allowedTypes[0]);
    }
  }, [allowedTypes]);

  const fetchItems = async (type: ResourceType, query: string) => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any[] = [];
      if (type === "product") {
        const response = await productsApi.getAllProducts({
          search: query,
          limit: 20,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = (response as any).products || (response as any).data || [];

        if (!query) {
          data.unshift({
            _id: "static-all-products",
            productInfo: { title: "All Products" },
            slug: "/manage-products/product-list",
          });
        }
      } else if (type === "collection") {
        const response = await collectionsApi.getAllCollections({
          search: query,
          limit: 20,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = response.collections || (response as any).data || [];
      } else if (type === "page") {
        const pagesRes = await pagesApi.getAllPages();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cmsPages = (Array.isArray(pagesRes) ? pagesRes : []).map(
          (p: any) => ({
            ...p,
            _type: "cms_page",
            finalSlug: p.slug.startsWith("/") ? p.slug : `/pages/${p.slug}`,
          })
        );

        data = cmsPages;

        // Filter by search query if provided
        if (query) {
          const lowerQuery = query.toLowerCase();
          data = data.filter(
            (item) =>
              item.title?.toLowerCase().includes(lowerQuery) ||
              item.finalSlug?.toLowerCase().includes(lowerQuery) ||
              item.slug?.toLowerCase().includes(lowerQuery)
          );
        }
      }
      setItems(data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems(activeTab, searchQuery);
  };

  const getItemDisplay = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any,
    type: ResourceType
  ) => {
    let title = "";
    let slug = "";
    const extraLabel = ""; // e.g. "Brand", "Service"

    if (type === "product") {
      const product = item as Product;
      title = product.productInfo?.title || "";
      const rawSlug = product.slug || "";
      slug = rawSlug.startsWith("/") ? rawSlug : `/products/${rawSlug}`;
    } else if (type === "collection") {
      const collection = item as Collection;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title = collection.name || (collection as any).title || "";
      const rawSlug = collection.slug || "";

      if (collectionLinkFormat === "query") {
        slug = `/products?collection=${rawSlug}`;
      } else {
        slug = rawSlug;
      }
    } else if (type === "page") {
      // aggregated items
      title = item.title;
      slug = item.finalSlug || item.slug;
    }

    return { title, slug, extraLabel };
  };

  if (!isOpen) return null;

  // Use Portal to render at document body level to avoid z-index/stacking context issues
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col h-[500px] max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Select Resource</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(["product", "collection", "page"] as ResourceType[])
            .filter((type) => allowedTypes.includes(type))
            .map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === type
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </button>
            ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              size="small"
              placeholder={`Search ${activeTab}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ bgcolor: "slate.50" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-slate-400 w-5 h-5" />
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : items?.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No items found
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item: any) => {
                const { title, slug } = getItemDisplay(item, activeTab);
                const typeLabel =
                  activeTab === "page"
                    ? item._type === "brand"
                      ? "Brand"
                      : item._type === "service"
                        ? "Service"
                        : item._type === "static"
                          ? "System"
                          : "Page"
                    : "";

                return (
                  <button
                    key={item._id || slug}
                    onClick={() => {
                      onSelect(slug, activeTab, item);
                      onClose();
                    }}
                    className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors group border-b border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-700 group-hover:text-[var(--primary)]">
                        {title}
                      </div>
                      {typeLabel && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          {typeLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{slug}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
