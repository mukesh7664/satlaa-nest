"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import BasicInfoStep from "./components/BasicInfoStep";
import ImagesStepNew from "./components/ImagesStepNew";
import VariantsStep from "./components/VariantsStep";
import SEOStep from "./components/SEOStep";
import CategorySelect from "./components/CategorySelect";
import CategoryAttributesStep from "./components/CategoryAttributesStep";
import ProductDetailsStep from "./components/ProductDetailsStep";
import { productsApi } from "@/services/products.api";
import { categoriesApi, Category } from "@/services/categories.api";
import { settingsApi } from "@/services/settings.api";
import { getMergedCategoryFields } from "@/utils/categoryUtils";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Check,
  Save,
  Package,
  Layers,
  Box,
  Image,
  FileText,
  Search,
} from "lucide-react";

const STEPS = [
  { label: "Basic Info", icon: Package },
  { label: "Dynamic Fields", icon: Layers },
  { label: "Inventory & Variants", icon: Box },
  { label: "Media", icon: Image },
  { label: "Product Details", icon: FileText },
  { label: "SEO & Final Settings", icon: Search },
];

function CreateProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEdit = !!productId || (typeof window !== "undefined" && window.location.search.includes("id="));
  const { themeColors, componentColors } = useAppSelector((state) => state.settings);
  const btnColor = (() => {
    const key = componentColors?.buttonContained || "primary";
    return (themeColors as any)[key] || themeColors.primary || "#7B3FF2";
  })();

  const [activeStep, setActiveStep] = useState(0);
  const isEditUrl = typeof window !== "undefined" && window.location.search.includes("id=");
  const [loading, setLoading] = useState(isEditUrl);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoriesApi.getAllCategories();
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories for inheritance:", e);
      }
    };
    fetchCats();
  }, []);

  const [formData, setFormData] = useState<Record<string, any>>({
    productInfo: { title: "", sku: "", description: "", brand: "" },
    categoryId: "",
    dynamicAttributes: {},
    variantAttributeSelections: {},
    images: [],
    variants: [],
    productPricingType: "simple",
    simplePricing: { basePrice: null, stockQuantity: null, currency: "INR" },
    seo: { metaTitle: "", metaDescription: "", keywords: [] },
    isActive: true,
    is_returnable: false,
    is_replaceable: false,
    return_window_days: 7,
    purchaseType: "online",
    productDetails: {
      overview: { enabled: true, title: "Overview", content: "" },
      whyChoose: { enabled: true, title: "Why Choose Us", points: [] },
      features: { enabled: true, title: "Features", featurePoints: [], checklist: [] },
      specifications: { enabled: true, title: "Specifications", items: [] },
      faq: { enabled: true, questions: [] },
      productPoints: { title: "Product Points", points: [] },
      banner: { image: "", alt: "", title: "", subtitle: "" },
      reviews: { userReviews: [] }
    },
    showInMarketplace: false,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsApi.getSettings();
        setStoreSettings(settings);
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isEdit && productId) {
      loadProduct(productId);
    }
  }, [productId, isEdit]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const productData = await productsApi.getProductById(id);

      if (productData.isBundle || productData.productStructureType === "bundle" || productData.productStructureType === "BUNDLE") {
        router.replace(`/manage-products/add-bundle?id=${id}`);
        return;
      }

      if (productData.categoryId) {
        try {
          const cat = await categoriesApi.getCategoryById(productData.categoryId);
          setSelectedCategory(cat);
        } catch (catError) {
          console.error("Failed to fetch category:", catError);
        }
      }

      const parseNumeric = (val: any) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const cleaned = val.replace(/[^\d.-]/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? null : num;
        }
        return null;
      };

      const rawPrice = parseNumeric(
        productData.simplePricing?.basePrice ?? productData.simplePricing?.price ?? productData.price ??
        productData.priceValue ?? productData.pricing?.basePrice ?? productData.pricing?.price ??
        productData.basePrice ?? productData.productInfo?.price ?? productData.productInfo?.basePrice ??
        (productData.manualCurrencyPrices && storeSettings?.defaultCurrency ? productData.manualCurrencyPrices[storeSettings.defaultCurrency] : undefined) ??
        (productData.simplePricing?.currency && productData.manualCurrencyPrices ? productData.manualCurrencyPrices[productData.simplePricing.currency] : undefined)
      );

      const rawStock = parseNumeric(
        productData.simplePricing?.stockQuantity ?? productData.stock ??
        productData.productInfo?.stock ?? productData.inventory?.quantity ?? productData.productInfo?.inventory?.quantity
      );

      const rawCostPrice = parseNumeric(
        productData.simplePricing?.costPrice ?? productData.costPrice ?? productData.productInfo?.costPrice
      );

      setFormData((prev: any) => {
        const merged = {
          ...prev, ...productData,
          hsn_code: productData.hsn_code || productData.productInfo?.hsn_code || prev.hsn_code || "",
          productInfo: { ...(prev.productInfo || {}), ...(productData.productInfo || {}) },
          simplePricing: {
            ...(prev.simplePricing || {}), ...(productData.simplePricing || {}),
            basePrice: rawPrice !== null ? rawPrice : (prev.simplePricing?.basePrice || null),
            costPrice: rawCostPrice !== null ? rawCostPrice : (prev.simplePricing?.costPrice || null),
            stockQuantity: rawStock !== null ? rawStock : (prev.simplePricing?.stockQuantity || null),
          },
          seo: { ...(prev.seo || {}), ...(productData.seo || {}) },
          dynamicAttributes: productData.attributes || prev.dynamicAttributes || {},
          is_returnable: productData.is_returnable ?? false,
          is_replaceable: productData.is_replaceable ?? false,
          return_window_days: productData.return_window_days ?? 7,
          purchaseType: productData.purchaseType || "online",
          manualCurrencyPrices: productData.manualCurrencyPrices || {},
        };
        if (merged.productInfo && !merged.productInfo.title) {
          merged.productInfo.title = merged.productInfo.name || "";
        }
        return merged;
      });
    } catch (error: any) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const stepLabel = STEPS[step].label;
    switch (stepLabel) {
      case "Basic Info":
        if (!formData.productInfo?.title && !formData.productInfo?.name) {
          toast.error("Product title is required");
          return false;
        }
        if (!selectedCategory) {
          toast.error("Please select a category");
          return false;
        }
        return true;
      case "Inventory & Variants":
        if (formData.productPricingType === "simple") {
          if (formData.simplePricing?.basePrice === null || formData.simplePricing?.basePrice === undefined || formData.simplePricing?.basePrice === "") {
            toast.error("Base price is required for simple products");
            return false;
          }
        } else {
          if (!formData.variants || formData.variants.length === 0) {
            toast.error("At least one variant must be created");
            return false;
          }
          const invalidVariant = formData.variants.find((v: any) => !v.price || !v.sku);
          if (invalidVariant) {
            toast.error(`Variant "${invalidVariant.name}" must have a price and SKU`);
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === activeStep) return;
    setActiveStep(targetStep);
  };

  const handleNext = () => {
    setActiveStep((p) => p + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) router.push("/manage-products/product-list");
    else setActiveStep((p) => p - 1);
  };

  const validateAll = (): boolean => {
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    try {
      setLoading(true);
      // Clone formData to safely sanitize variant numeric values before API submission
      const submissionData = { ...formData };
      if (submissionData.variants) {
        submissionData.variants = submissionData.variants.map((v: any) => ({
          ...v,
          price: v.price === "" || v.price === null || v.price === undefined ? 0 : parseFloat(v.price),
          costPrice: v.costPrice === "" || v.costPrice === null || v.costPrice === undefined ? 0 : parseFloat(v.costPrice),
          stock: v.stock === "" || v.stock === null || v.stock === undefined ? 0 : parseInt(v.stock, 10),
        }));
      }
      if (isEdit) {
        await productsApi.updateProduct(productId!, submissionData);
        toast.success("Product updated successfully!");
      } else {
        await productsApi.createProduct(submissionData);
        toast.success("Product created successfully!");
      }
      router.push("/manage-products/product-list");
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    const stepLabel = STEPS[step].label;
    const mergedCategory = selectedCategory
      ? { ...selectedCategory, fieldsConfig: { ...selectedCategory.fieldsConfig, fields: getMergedCategoryFields(selectedCategory, categories) } }
      : null;

    switch (stepLabel) {
      case "Basic Info":
        return <BasicInfoStep formData={formData} setFormData={setFormData} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
      case "Dynamic Fields":
        return <CategoryAttributesStep formData={formData} setFormData={setFormData} category={mergedCategory!} />;
      case "Product Details":
        return <ProductDetailsStep formData={formData} setFormData={setFormData} bannerImageFile={bannerImageFile} setBannerImageFile={setBannerImageFile} />;
      case "Inventory & Variants":
        return <VariantsStep formData={formData} setFormData={setFormData} category={mergedCategory!} />;
      case "Media":
        return <ImagesStepNew formData={formData} setFormData={setFormData} imageFiles={imageFiles} setImageFiles={setImageFiles} />;
      case "SEO & Final Settings":
        return <SEOStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  if (isEdit && loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <CircularProgress size={48} thickness={4} />
      </div>
    );
  }

  // ─── Category Selection Screen ───────────────────────────────────────────────
  if (!selectedCategory) {
    return (
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isEdit && formData.categoryId) {
                const origCat = categories.find((c) => c.id === formData.categoryId);
                if (origCat) {
                  setSelectedCategory(origCat);
                  return;
                }
              }
              router.push("/manage-products/product-list");
            }}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{isEdit ? "Change Category" : "Create Product"}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? "Select a new category for the product" : "Step 1 of 2 — Select a category to continue"}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        {!isEdit && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: btnColor }}>1</div>
              <span className="text-xs font-semibold text-slate-700">Category</span>
            </div>
            <div className="h-px flex-1 bg-slate-200 max-w-12" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-100">2</div>
              <span className="text-xs text-slate-400">Product Info</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <CategorySelect
            onSelect={(cat) => {
              setSelectedCategory(cat);
              setFormData((prev) => ({ ...prev, categoryId: cat.id }));
            }}
          />
        </div>
      </div>
    );
  }

  // ─── Main Create/Edit Form ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col product-form-container">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/manage-products/product-list")}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800">{isEdit ? "Edit Product" : "Create Product"}</h1>
              {selectedCategory && (
                <p className="text-xs text-slate-500">Category: <span className="font-medium text-slate-700">{selectedCategory.name}</span></p>
              )}
            </div>
          </div>

          {/* Compact Stepper */}
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < activeStep;
              const isCurrent = index === activeStep;
              return (
                <React.Fragment key={step.label}>
                  <div
                    onClick={() => handleStepClick(index)}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isCompleted ? "text-white" : isCurrent ? "text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      style={isCompleted || isCurrent ? { background: btnColor } : {}}
                    >
                      {isCompleted ? <Check size={13} /> : <Icon size={12} />}
                    </div>
                    <span className={`text-xs font-medium hidden lg:block ${isCurrent ? "text-slate-800" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-0.5 ${index < activeStep ? "bg-current" : "bg-slate-200"}`}
                      style={index < activeStep ? { background: btnColor } : {}} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile step indicator */}
          <div className="md:hidden text-xs text-slate-500 font-medium">
            Step {activeStep + 1} / {STEPS.length}
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%`, background: btnColor }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-5 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Step Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
              {(() => {
                const Icon = STEPS[activeStep].icon;
                return (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: btnColor }}>
                    <Icon size={14} />
                  </div>
                );
              })()}
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{STEPS[activeStep].label}</h2>
                <p className="text-xs text-slate-500">Step {activeStep + 1} of {STEPS.length}</p>
              </div>
            </div>
            {/* Content */}
            <div className="p-5">
              {renderStepContent(activeStep)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-end">

          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
              Back
            </button>

            {activeStep === STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                style={{ background: btnColor }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={14} sx={{ color: "white" }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {isEdit ? "Update Product" : "Save Product"}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-all"
                style={{ background: btnColor }}
              >
                Next
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <CircularProgress size={40} />
      </div>
    }>
      <CreateProductContent />
    </Suspense>
  );
}
