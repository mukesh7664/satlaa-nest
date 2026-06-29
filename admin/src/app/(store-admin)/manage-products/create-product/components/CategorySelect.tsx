"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CircularProgress, Tabs, Tab } from "@mui/material";
import {
  Checkroom as ClothingIcon,
  Devices as ElectronicsIcon,
  Home as HomeIcon,
  AutoAwesome as BeautyIcon,
  SportsSoccer as SportsIcon,
  Category as CategoryIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { categoriesApi, Category } from "@/services/categories.api";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";

interface CategorySelectProps {
  onSelect: (category: Category) => void;
  adminStoreId?: string | null;
}

const getCategoryIcon = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes("clothing")) return <ClothingIcon sx={{ fontSize: 22 }} />;
  if (s.includes("electronics")) return <ElectronicsIcon sx={{ fontSize: 22 }} />;
  if (s.includes("home")) return <HomeIcon sx={{ fontSize: 22 }} />;
  if (s.includes("beauty")) return <BeautyIcon sx={{ fontSize: 22 }} />;
  if (s.includes("sports")) return <SportsIcon sx={{ fontSize: 22 }} />;
  return <CategoryIcon sx={{ fontSize: 22 }} />;
};

// Color palette for category cards
const CARD_COLORS = [
  { bg: "bg-violet-50", icon: "text-violet-500", border: "border-violet-100 hover:border-violet-300" },
  { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100 hover:border-blue-300" },
  { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100 hover:border-emerald-300" },
  { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100 hover:border-amber-300" },
  { bg: "bg-rose-50", icon: "text-rose-500", border: "border-rose-100 hover:border-rose-300" },
  { bg: "bg-sky-50", icon: "text-sky-500", border: "border-sky-100 hover:border-sky-300" },
  { bg: "bg-indigo-50", icon: "text-indigo-500", border: "border-indigo-100 hover:border-indigo-300" },
  { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100 hover:border-orange-300" },
];

export default function CategorySelect({ onSelect, adminStoreId }: CategorySelectProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [history, setHistory] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const { themeColors, componentColors } = useAppSelector((state) => state.settings);
  const btnColor = (() => {
    const key = componentColors?.buttonContained || "primary";
    return (themeColors as any)[key] || themeColors.primary || "#7B3FF2";
  })();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const displayCategories = useMemo(() => {
    return categories.filter((c) => {
      if (currentParentId === null) {
        const isGlobal = !c.storeId || c.storeId === null;
        if (activeTab === 0) return isGlobal && !c.parentId;
        if (activeTab === 1) return !isGlobal && c.storeId === adminStoreId && !c.parentId;
        return !c.parentId;
      }
      return c.parentId === currentParentId;
    });
  }, [categories, currentParentId, activeTab, adminStoreId]);

  const handleCategoryClick = (category: Category) => {
    const hasChildren = categories.some((c) => c.parentId === category.id);
    if (hasChildren) {
      setHistory((prev) => [...prev, category]);
      setCurrentParentId(category.id || null);
    } else {
      onSelect(category);
    }
  };

  const handleBack = () => {
    const newHistory = [...history];
    newHistory.pop();
    const lastCategory = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setCurrentParentId(lastCategory?.id || null);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentParentId(null);
      setHistory([]);
    } else {
      const newHistory = history.slice(0, index + 1);
      const selectedCategory = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentParentId(selectedCategory.id || null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <CircularProgress size={36} />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {history.length === 0 ? "Select Category" : history[history.length - 1].name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {history.length === 0 ? "Choose the category that best fits your product" : "Select a sub-category or click to use this one"}
          </p>
        </div>

        {/* Breadcrumb */}
        {history.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <button onClick={() => handleBreadcrumbClick(-1)} className="hover:text-slate-700 transition-colors">All</button>
            {history.map((cat, index) => (
              <React.Fragment key={cat.id}>
                <ChevronRightIcon sx={{ fontSize: 12 }} />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-slate-700 transition-colors ${index === history.length - 1 ? "font-semibold text-slate-700" : ""}`}
                >
                  {cat.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Tabs + Back */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              <BackIcon sx={{ fontSize: 14 }} /> Back
            </button>
          )}
          {currentParentId === null && (
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 32,
                "& .MuiTab-root": { minHeight: 32, fontSize: 11, py: 0.5, px: 2, textTransform: "none", fontWeight: 600 },
                "& .MuiTabs-indicator": { height: 2, borderRadius: "2px 2px 0 0" },
              }}
            >
              <Tab label="Global Categories" />
              <Tab label="My Store Categories" />
            </Tabs>
          )}
        </div>
        {currentParentId === null && activeTab === 1 && (
          <button
            onClick={() => router.push("/manage-products/categories")}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors duration-200 shadow-sm cursor-pointer"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            Add Category
          </button>
        )}
      </div>

      {/* Category Grid */}
      {displayCategories.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CategoryIcon sx={{ fontSize: 40, opacity: 0.3 }} />
          <p className="text-sm mt-2">No categories found</p>
          <p className="text-xs mt-1">Try switching to the other tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {displayCategories.map((category, idx) => {
            const hasChildren = categories.some((c) => c.parentId === category.id);
            const colorSet = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`group relative flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${colorSet.border} bg-white`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all ${colorSet.bg} ${colorSet.icon}`}>
                  {getCategoryIcon(category.slug)}
                </div>

                {/* Name */}
                <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2 w-full">
                  {category.name}
                </p>

                {/* Sub-indicator */}
                {hasChildren ? (
                  <div className="flex items-center gap-0.5 mt-1.5">
                    <span className="text-[10px] text-slate-400">{categories.filter(c => c.parentId === category.id).length} sub</span>
                    <ChevronRightIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
                  </div>
                ) : (
                  <span className="mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${btnColor}15`, color: btnColor }}>
                    Select
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
