"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaStar, FaHeart, FaCheck, FaMinus, FaPlus, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { shippingService } from "@/services/shipping.service";
import { toast } from "sonner";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CheckCircle2, Package, RotateCcw, ShieldCheck, Truck, Sparkles, XCircle } from "lucide-react";
import { PriceDisplay } from "@/components/common/PriceDisplay";

import clsx from "clsx";
import { pushToDataLayer, GTM_EVENTS } from "@/lib/gtm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

export interface ProductInfo {
  brand?: string;
  title: string;
  rating?: {
    stars: number;
    reviews: string;
  };
  price?: {
    current: string;
    per?: string;
    original?: string;
    discount?: string;
  };
  offers?: string[];
  viewOffers?: string;
  amc?: {
    title: string;
    plan: string;
    description: string;
  };
  plans?: string[];
  ctas?: {
    addToCart: string;
    getFreeDemo: string;
  };
}

export interface ProductVariant {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  description?: string;
  isPopular?: boolean;
  displayOrder?: number;
  attributes?: Record<string, string>;
  manualCurrencyPrices?: Record<string, number>;
}


export interface SimplePricing {
  basePrice: number;
  discountedPrice?: number;
  currency: string;
  inStock: boolean;
  stockQuantity?: number;
}

export interface BundleProduct {
  _id: string;
  product: {
    _id: string;
    productInfo: {
      title: string;
      brand: string;
    };
    icon?: {
      url: string;
      alt: string;
    };
    images?: Array<{
      url: string;
      alt: string;
    }>;
    slug: string;
    stock?: number;
    inStock?: boolean;
    price?: number;
    variants?: ProductVariant[];
  };
  quantity: number;
}

interface ProductSectionInfoProps {
  productInfo: ProductInfo;
  productId?: string;
  productName?: string;
  productImage?: string;
  productBrand?: string;
  quantityLabel?: string;
  variants?: ProductVariant[];
  productPricingType?: string;
  simplePricing?: SimplePricing;
  manualCurrencyPrices?: Record<string, number>;
  bundleProducts?: BundleProduct[];
  purchaseType?: "online" | "quote" | "both";
  // Tag related props
  collections?: Array<{ _id: string; name: string }>;
  tags?: Array<string | { _id: string; name: string }>;
  flags?: Array<string | { _id: string; name: string }>;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  category?: string;
  selectedVariant?: ProductVariant | null;
  attributes?: Record<string, any>;
  tax_rate?: number;
  is_returnable?: boolean;
  is_replaceable?: boolean;
  return_window_days?: number;
  onVariantChange?: (variant: ProductVariant) => void;
  description?: string;
}

const ProductSectionInfo: React.FC<ProductSectionInfoProps & { children?: React.ReactNode }> = ({
  children,
  productInfo,
  productId,
  productName,
  productImage,
  productBrand,
  quantityLabel,
  variants,
  productPricingType,
  simplePricing,
  manualCurrencyPrices,
  bundleProducts,
  purchaseType,
  isNewArrival,
  category,
  selectedVariant: propSelectedVariant,
  attributes,
  tax_rate,
  is_returnable = true,
  is_replaceable = true,
  return_window_days = 7,
  onVariantChange,
  description,
}) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Quote dialog form states
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [bundleSelections, setBundleSelections] = useState<Record<string, string>>({});

  const handleCheckDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    
    setIsChecking(true);
    setPincodeError(null);
    try {
      const result = await shippingService.checkServiceability(pincode, productId);
      setDeliveryInfo(result.data);
    } catch (error) {
      console.error("Delivery check failed", error);
      setDeliveryInfo({ serviceable: false, message: "Delivery check service unavailable" });
    } finally {
      setIsChecking(false);
    }
  };



  // Internal state for uncontrolled usage, synced with prop if provided
  const [internalSelectedVariant, setInternalSelectedVariant] =
    useState<ProductVariant | null>(
      variants && variants.length > 0 ? variants[0] : null
    );

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (variants && variants.length > 0) {
      return variants[0].attributes || {};
    }
    return {};
  });


  // Optionally keep useEffect for dynamic updates of variants prop
  React.useEffect(() => {
    if (variants && variants.length > 0 && Object.keys(selectedAttributes).length === 0) {
      setSelectedAttributes(variants[0].attributes || {});
    }
  }, [variants]);

  // Robust Find a variant that matches ALL selected attribute values (Case-Insensitive & Key-Agnostic)
  const findMatchingVariant = (attrs: Record<string, string>): ProductVariant | null => {
    if (!variants || Object.keys(attrs).length === 0) return null;

    return variants.find(v => {
      const vAttrs = v.attributes || {};
      return Object.entries(attrs).every(([key, value]) => 
        vAttrs[key] === value
      );
    }) || null;
  };

  const selectedVariant =
    propSelectedVariant !== undefined
      ? propSelectedVariant
      : internalSelectedVariant;

  const handleAttributeChange = (key: string, value: string) => {
    const lowerKey = key.toLowerCase();
    // Start with a clean slate of lowercase keys
    const newAttrs: Record<string, string> = {};
    Object.entries(selectedAttributes).forEach(([k, v]) => {
      newAttrs[k.toLowerCase()] = v;
    });
    newAttrs[lowerKey] = value;

    setSelectedAttributes(newAttrs);

    const matched = findMatchingVariant(newAttrs);
    setInternalSelectedVariant(matched);
    if (onVariantChange && matched) onVariantChange(matched);
  };

  const handleVariantChange = (variant: ProductVariant) => {
    setInternalSelectedVariant(variant);
    if (onVariantChange) {
      onVariantChange(variant);
    }
    // Update selected attributes to match this variant (normalized keys)
    if (variant.attributes) {
      const normalized: Record<string, string> = {};
      Object.entries(variant.attributes).forEach(([k, v]) => {
        normalized[k.toLowerCase()] = v;
      });
      setSelectedAttributes(normalized);
    }
  };

  // Group unique attribute values for rendering swatches
  const getUniqueAttributes = () => {
    const attrs: Record<string, Set<string>> = {};
    variants?.forEach(v => {
      const vAttrs = v.attributes || {};
      Object.entries(vAttrs).forEach(([key, val]) => {
        const lowerKey = key.toLowerCase();
        if (!attrs[lowerKey]) attrs[lowerKey] = new Set();
        attrs[lowerKey].add(val);
      });
    });

    const result: Record<string, string[]> = {};
    Object.entries(attrs).forEach(([key, set]) => {
      result[key] = Array.from(set);
    });
    return result;
  };

  const availableAttributes = getUniqueAttributes();

  // Helper to check if a specific attribute combination exists
  const isCombinationAvailable = (key: string, value: string) => {
    if (!variants) return false;
    const testAttrs = { ...selectedAttributes, [key.toLowerCase()]: value };
    return variants.some(v => {
      const vAttrs = v.attributes || {};
      return Object.entries(testAttrs).every(([k, vVal]) => !vAttrs[k] || vAttrs[k] === vVal);
    });
  };



  const { items, addToCart, openCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Check if current product/variant combination is already in cart
  const isInCart = items.some(item => 
    item.productId === productId && 
    (selectedVariant ? item.variantId === selectedVariant._id : !item.variantId)
  );

  // Calculate dynamic price based on variant/simple pricing and quantity
  const getUnitPrice = (): number => {
    if (productPricingType === "variant" && selectedVariant) {
      return selectedVariant.price;
    } else if (productPricingType === "simple" && simplePricing) {
      return simplePricing.discountedPrice || simplePricing.basePrice;
    }
    // Fallback to productInfo.price.current
    return parseFloat(
      productInfo.price?.current?.replace(/[^0-9.]/g, "") || "0"
    );
  };

  const unitPrice = getUnitPrice();
  const taxMultiplier = 1 + (tax_rate || 0) / 100;
  const finalTotalPrice = unitPrice * quantity * taxMultiplier;

  const [dynamicReviews, setDynamicReviews] = useState<any[]>([]);
  const [hasFetchedReviews, setHasFetchedReviews] = useState(false);

  React.useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1"}/products/${productId}/reviews`
        );
        if (response.ok) {
          const data = await response.json();
          setDynamicReviews(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setHasFetchedReviews(true);
      }
    };
    fetchReviews();
  }, [productId]);

  const totalReviewsCount = dynamicReviews.length;
  const averageRatingVal = totalReviewsCount > 0
    ? Number((dynamicReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1))
    : 0;

  const showRating = hasFetchedReviews 
    ? totalReviewsCount > 0 
    : (productInfo.rating ? Number(productInfo.rating.stars ?? 0) > 0 : false);

  const ratingStarsRaw = hasFetchedReviews ? averageRatingVal : Number(productInfo.rating?.stars ?? 0);
  const filledStars = ratingStarsRaw > 0 ? Math.min(5, Math.round(ratingStarsRaw)) : 0;

  const currency = simplePricing?.currency || "INR";

  // Bundle Stock Logic - Any item out of stock means the whole bundle is out
  const isBundle = React.useMemo(() => bundleProducts && bundleProducts.length > 0, [bundleProducts]);
  
  const isBundleOutOfStock = React.useMemo(() => {
    if (!isBundle) return false;
    // For bundles, we trust the inStock boolean. 
    // If it's a variable product, inStock=true means at least one variant is available.
    return bundleProducts!.some(item => item.product.inStock === false);
  }, [isBundle, bundleProducts]);

  const availableStock = React.useMemo(() => {
    if (isBundle) {
      if (!bundleProducts || bundleProducts.length === 0) return 0;
      // For items with variants, we treat them as in-stock (99+) for the simple bundle quantity logic,
      // as the real stock depends on the variant selection.
      const stocks = bundleProducts.map(item => {
        if (item.product.variants && item.product.variants.length > 0) return 99;
        return Math.floor((item.product.stock || 0) / item.quantity);
      });
      return Math.max(0, Math.min(...stocks));
    }
    if (productPricingType === "variant" && selectedVariant) {
      return selectedVariant.stock || 0;
    }
    if (productPricingType === "simple" && simplePricing) {
      return simplePricing.stockQuantity || 0;
    }
    return 0;
  }, [isBundle, bundleProducts, productPricingType, selectedVariant, simplePricing]);

  React.useEffect(() => {
    if (quantity > availableStock && availableStock > 0) {
      setQuantity(availableStock);
    } else if (availableStock === 0 && quantity > 0) {
      setQuantity(1); // Keep 1 as minimum for UI even if out of stock (button will be disabled)
    }
  }, [availableStock, quantity]);

  // Sync auth user details when dialog opens
  React.useEffect(() => {
    if (isQuoteOpen) {
      setCustomerName(user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "");
      setCustomerEmail(user?.email || "");
      const phoneVal = user?.phone 
        ? `${user.phone.countryCode || ""} ${user.phone.number || ""}`.trim() 
        : "";
      setCustomerPhone(phoneVal);
      setCustomerMessage("");
      setQuoteSubmitted(false);
    }
  }, [isQuoteOpen, user]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmittingQuote(true);
    try {
      const payload = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        message: customerMessage || `Requested quote for ${productInfo.title}`,
        subject: `Quote Request: ${productName || productInfo.title || "Product"}`,
        type: "quote",
        metadata: {
          productId: productId || "",
          productTitle: productName || productInfo.title || "",
          quantity: quantity,
          estimatedPrice: unitPrice * quantity,
          currency: currency || "INR",
          variant: selectedVariant ? selectedVariant.name : "Standard",
          sku: selectedVariant && "sku" in selectedVariant ? (selectedVariant as any).sku : ("sku" in productInfo ? (productInfo as any).sku : ""),
        }
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1"}/communication/inquiry`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      setQuoteSubmitted(true);
      toast.success("Quote request submitted successfully!");
    } catch (err: any) {
      console.error("Failed to submit quote request:", err);
      toast.error(err.response?.data?.message || "Failed to submit quote request. Please try again.");
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleAddToCart = () => {
    if (!productId) return;
    if (unitPrice === 0) return; // Don't add to cart if no price

    // Validate bundle selections
    if (bundleProducts && bundleProducts.length > 0) {
      const missingSelections = bundleProducts.filter(item => 
        item.product.variants && 
        item.product.variants.length > 0 && 
        !bundleSelections[item._id]
      );

      if (missingSelections.length > 0) {
        toast.error(`Please select a variant for ${missingSelections[0].product.productInfo.title}`);
        return;
      }
    }

    addToCart({
      productId: productId,
      variantId: selectedVariant?._id,
      price: unitPrice,
      quantity,
      selectedVariant: selectedVariant
        ? {
          userType: selectedVariant.name,
          planName: selectedVariant.name,
          pricePerUnit: Number(selectedVariant.price || unitPrice),
        }
        : undefined,
      bundleSelections,
      notes: "",
    });

    // Track add_to_cart event
    pushToDataLayer(GTM_EVENTS.ADD_TO_CART, {
      currency: currency || "INR",
      value: unitPrice * quantity,
      items: [
        {
          item_id: productId,
          item_name: productName || productInfo.title,
          item_brand: productInfo.brand,
          price: unitPrice,
          quantity: quantity,
          item_variant: selectedVariant?.name,
        },
      ],
    });

    openCart(); // Open cart drawer
  };

  const handleBuyNow = async () => {
    // Validate bundle selections
    if (bundleProducts && bundleProducts.length > 0) {
      const missingSelections = bundleProducts.filter(item => 
        item.product.variants && 
        item.product.variants.length > 0 && 
        !bundleSelections[item._id]
      );

      if (missingSelections.length > 0) {
        toast.error(`Please select a variant for ${missingSelections[0].product.productInfo.title}`);
        return;
      }
    }

    // Add to cart but bypass drawer and redirect
    await addToCart({
      productId: productId || "",
      variantId: selectedVariant?._id,
      price: unitPrice,
      quantity,
      selectedVariant: selectedVariant
        ? {
          userType: selectedVariant.name,
          planName: selectedVariant.name,
          pricePerUnit: Number(selectedVariant.price || unitPrice),
        }
        : undefined,
      bundleSelections,
      notes: "",
    }, false);

    // Track buy_now event (similar to add_to_cart)
    pushToDataLayer(GTM_EVENTS.ADD_TO_CART, {
      currency: currency || "INR",
      value: unitPrice * quantity,
      items: [
        {
          item_id: productId,
          item_name: productName || productInfo.title,
          item_brand: productInfo.brand,
          price: unitPrice,
          quantity: quantity,
          item_variant: selectedVariant?.name,
        },
      ],
    });

    // Redirect to checkout
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Gallery + Buttons */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {children}

          {/* CTA Buttons Row right under the gallery */}
          <div className="flex items-center gap-3 w-full">
            {purchaseType === "quote" ? (
              <Button
                variant="BlueDark"
                className="w-full h-[52px] rounded-xl text-base font-bold bg-[#E07A5F] hover:bg-[#d06b50] text-white shadow-md hover:shadow-lg transition-all hover:scale-100 active:scale-100"
                onClick={() => setIsQuoteOpen(true)}
              >
                Request a Quote
              </Button>
            ) : (
              <>
                {isInCart ? (
                  <Link href="/cart" className="flex-1">
                    <Button variant="BlueDark" className="w-full h-[52px] rounded-xl text-base font-bold bg-[#E07A5F] hover:bg-[#d06b50] text-white flex items-center justify-center gap-2 hover:scale-100 active:scale-100">
                      <CheckCircle2 className="h-5 w-5" />
                      Go to Cart
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="flex-1 h-[52px] rounded-xl text-base font-bold bg-[#E07A5F] hover:bg-[#d06b50] text-white flex items-center justify-center gap-2 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed hover:scale-100 active:scale-100"
                    onClick={() => handleAddToCart()}
                    disabled={
                      unitPrice === 0 || 
                      (productPricingType === "variant" && (!selectedVariant || (selectedVariant.stock !== undefined && selectedVariant.stock <= 0))) ||
                      (productPricingType === "simple" && simplePricing && !simplePricing.inStock && !isBundle) ||
                      isBundleOutOfStock
                    }
                  >
                    {isBundleOutOfStock ? "Out of Stock" : 
                      (productPricingType === "variant" ? (
                        !selectedVariant ? (productInfo.ctas?.addToCart || "Add To Cart") : 
                        (selectedVariant.stock !== undefined && selectedVariant.stock <= 0 ? "Out of Stock" : (productInfo.ctas?.addToCart || "Add To Cart"))
                      ) : (
                        (simplePricing && !simplePricing.inStock && !isBundle) ? "Out of Stock" : (productInfo.ctas?.addToCart || "Add To Cart")
                      ))
                    }
                  </Button>
                )}
                <Button
                  className="flex-1 h-[52px] rounded-xl text-base font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed hover:scale-100 active:scale-100"
                  onClick={() => handleBuyNow()}
                  disabled={
                    unitPrice === 0 || 
                    (productPricingType === "variant" && (!selectedVariant || (selectedVariant.stock !== undefined && selectedVariant.stock <= 0))) ||
                    (productPricingType === "simple" && simplePricing && !simplePricing.inStock && !isBundle) ||
                    isBundleOutOfStock
                  }
                >
                  {isBundleOutOfStock ? "Out of Stock" : 
                    (productPricingType === "variant" ? (
                      selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0 ? "Out of Stock" : (productInfo.ctas?.getFreeDemo || "Buy Now")
                    ) : (
                      (simplePricing && !simplePricing.inStock && !isBundle) ? "Out of Stock" : (productInfo.ctas?.getFreeDemo || "Buy Now")
                    ))
                  }
                </Button>

                {/* Wishlist button */}
                <button
                  onClick={() => {
                    if (productId) {
                      if (isInWishlist(productId)) {
                        removeFromWishlist(productId);
                      } else {
                        addToWishlist(productId);
                      }
                    }
                  }}
                  className="w-[52px] h-[52px] shrink-0 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors shadow-sm"
                  title="Add to Wishlist"
                >
                  <FaHeart
                    className={`h-5 w-5 transition-colors duration-200 ${productId && isInWishlist(productId)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-500 hover:text-red-500"
                    }`}
                  />
                </button>
              </>
            )}
          </div>

          {purchaseType === "both" && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl text-base font-bold border-blue-600 text-blue-600 hover:bg-blue-50/50 transition-all"
              onClick={() => setIsQuoteOpen(true)}
            >
              Request a Quote
            </Button>
          )}
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Badge */}
          {isNewArrival && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
              ✨ New Arrival
            </span>
          )}

          {/* Title */}
          <div>
            {productInfo.brand && (
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{productInfo.brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {productInfo.title}
            </h1>
          </div>

          {/* Rating */}
          {showRating && (
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-4.5 w-4.5 ${
                      i < filledStars
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200 fill-transparent"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{ratingStarsRaw.toFixed(1)}</span>
              <span className="text-sm text-gray-400">
                ({hasFetchedReviews ? totalReviewsCount : (productInfo.rating?.reviews || 0)} {(hasFetchedReviews ? totalReviewsCount : parseInt(productInfo.rating?.reviews || "0")) === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          {/* Price */}
          {unitPrice > 0 && (
            <div className="flex flex-col border-b border-slate-100 pb-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                  <PriceDisplay 
                    amount={unitPrice * taxMultiplier} 
                    quantity={quantity} 
                    originalCurrency={currency}
                    manualOverrides={selectedVariant?.manualCurrencyPrices || manualCurrencyPrices}
                  />
                  {productInfo.price?.per && (
                    <span className="text-lg font-normal text-gray-500 ml-1">
                      {productInfo.price.per}
                    </span>
                  )}
                </span>

                {/* Base / Original Price */}
                {((simplePricing && simplePricing.discountedPrice && simplePricing.basePrice > simplePricing.discountedPrice) || productInfo.price?.original) && (
                  <span className="line-through text-slate-400 text-lg">
                    {simplePricing && simplePricing.discountedPrice ? (
                      <PriceDisplay amount={simplePricing.basePrice} quantity={quantity} originalCurrency={currency} />
                    ) : (
                      productInfo.price?.original
                    )}
                  </span>
                )}

                {/* Discount Badge */}
                {(productInfo.price?.discount || (simplePricing?.discountedPrice && simplePricing.basePrice > simplePricing.discountedPrice)) && (
                  <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                    {productInfo.price?.discount || `${Math.round(((simplePricing!.basePrice - simplePricing!.discountedPrice!) / simplePricing!.basePrice) * 100)}% OFF`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs font-bold text-slate-500">
                  <PriceDisplay 
                    amount={unitPrice} 
                    originalCurrency={currency}
                    manualOverrides={selectedVariant?.manualCurrencyPrices || manualCurrencyPrices}
                  /> + {tax_rate || 0}% GST
                </p>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">
                  Incl. of all taxes
                </span>
              </div>
            </div>
          )}

          {/* Swatches (Color & Size) */}
          {variants && variants.length > 0 && (
            <div className="space-y-5 border-b border-slate-100 pb-5">
              {Object.entries(availableAttributes).map(([attrKey, values]) => {
                const keyLower = attrKey.toLowerCase();
                const isColor = keyLower === "color" || keyLower === "colour";
                
                return (
                  <div key={attrKey} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Select {attrKey}
                    </h4>

                    <div className="flex flex-wrap gap-2.5">
                      {values.map((val) => {
                        const isSelected = selectedAttributes[attrKey] === val;
                        const isAvailable = isCombinationAvailable(attrKey, val);

                        if (isColor) {
                          return (
                            <button
                              key={val}
                              onClick={() => handleAttributeChange(attrKey, val)}
                              className={clsx(
                                "w-10 h-10 rounded-full border-2 transition-all relative p-[2px]",
                                isSelected ? "border-slate-800 scale-105 shadow-sm" : "border-slate-200 hover:border-slate-400",
                                !isAvailable && "opacity-40"
                              )}
                              title={val}
                            >
                              <span
                                className="absolute inset-[2px] rounded-full shadow-inner"
                                style={{ backgroundColor: val.toLowerCase().replace(" ", "") }}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <FaCheck className={clsx("w-3.5 h-3.5 drop-shadow-sm", ["white", "yellow", "ivory", "beige"].includes(val.toLowerCase()) ? "text-gray-800" : "text-white")} />
                                </div>
                              )}
                              {!isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-full h-[1.5px] bg-red-500 rotate-45 transform opacity-75" />
                                </div>
                              )}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={val}
                            onClick={() => handleAttributeChange(attrKey, val)}
                            className={clsx(
                              "transition-all flex items-center justify-center font-bold px-4 py-2 rounded-xl text-sm min-w-[3rem] border",
                              isSelected
                                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-800 hover:border-slate-900 hover:bg-slate-50",
                              !isAvailable && "opacity-35 cursor-not-allowed line-through border-dashed"
                            )}
                            disabled={!isAvailable && isSelected}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</span>
            <div className="flex items-center border border-slate-200 rounded-xl h-10 bg-white group hover:border-slate-400 transition-colors max-w-[120px]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 h-full hover:bg-slate-50 rounded-l-xl transition-colors text-slate-500 hover:text-slate-800"
              >
                <FaMinus className="w-2.5 h-2.5" />
              </button>
              <span className="flex-1 text-center font-bold text-sm text-slate-800 min-w-[2.5rem]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(availableStock || 1, q + 1))}
                disabled={quantity >= (availableStock || 1)}
                className="px-3 h-full hover:bg-slate-50 rounded-r-xl transition-colors text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FaPlus className="w-2.5 h-2.5" />
              </button>
            </div>
            {availableStock > 0 && (
              <span className={clsx(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                availableStock < 5 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                {availableStock < 5 ? `Only ${availableStock} left!` : `${availableStock} in stock`}
              </span>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-2.5 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <FaCheck className="w-2 h-2" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {availableStock > 0 ? "In Stock & ready to ship" : "Out of Stock"}
              </span>
            </div>

            {is_returnable ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <FaCheck className="w-2 h-2" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Easy return window: {return_window_days} days
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                  <XCircle className="w-2.5 h-2.5" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Non-Returnable product</span>
              </div>
            )}

            {is_replaceable && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <FaCheck className="w-2 h-2" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Replacement eligible
                </span>
              </div>
            )}

            {deliveryInfo?.serviceable && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <FaCheck className="w-2 h-2" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {deliveryInfo.message} (PIN: {pincode})
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isDescExpanded ? description : `${description.slice(0, 180)}${description.length > 180 ? '...' : ''}`}
                {description.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs ml-1.5 focus:outline-none"
                  >
                    {isDescExpanded ? "Read less" : "Read more"}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Offers */}
          {productInfo.offers && productInfo.offers.length > 0 && (
            <div className="space-y-2.5 border-b border-slate-100 pb-5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Available Offers
              </h4>
              <ul className="space-y-2">
                {productInfo.offers.map((offer, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0 mt-0.5">
                      <FaCheck className="w-2 h-2" />
                    </div>
                    <span>{offer}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pincode Check Delivery Box */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" /> Expected Delivery Time
            </h4>
            <div className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  type="text"
                  placeholder="Enter PIN Code"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPincode(val);
                    if (pincodeError) setPincodeError(null);
                  }}
                  className={clsx(
                    "pl-9 h-10 rounded-xl border-slate-200 text-sm font-semibold transition-all focus:border-slate-800 focus:ring-0",
                    pincodeError ? "border-red-500" : ""
                  )}
                />
              </div>
              <Button
                onClick={handleCheckDelivery}
                disabled={isChecking || pincode.length !== 6}
                className="h-10 px-5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                {isChecking ? "Checking..." : "Check"}
              </Button>
            </div>
            
            {pincodeError && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                <FaInfoCircle className="w-3 h-3" /> {pincodeError}
              </p>
            )}

            {deliveryInfo && (
              <div className={clsx(
                "rounded-xl p-3.5 border text-sm transition-all max-w-sm",
                deliveryInfo.serviceable 
                  ? "bg-blue-50/40 border-blue-100 text-blue-900" 
                  : "bg-red-50/40 border-red-100 text-red-900"
              )}>
                <p className="font-bold flex items-center gap-1.5">
                  {deliveryInfo.serviceable ? <Truck className="w-4 h-4 shrink-0 text-blue-600" /> : <FaInfoCircle className="w-4 h-4 shrink-0 text-red-500" />}
                  {deliveryInfo.message}
                </p>
                {deliveryInfo.serviceable && deliveryInfo.courier_name && (
                  <p className="text-xs font-semibold text-blue-700/80 mt-1">
                    Delivered via {deliveryInfo.courier_name}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* AMC Box (If present) */}
          {productInfo.amc && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3 mt-4">
              <input type="checkbox" className="mt-1 accent-slate-900 w-4 h-4 shrink-0 rounded border-slate-300" />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  {productInfo.amc.title}
                  <span className="text-blue-600 text-xs hover:underline cursor-pointer">
                    {productInfo.amc.plan}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {productInfo.amc.description}
                </p>
              </div>
            </div>
          )}

          {/* Bundle Contents (If present) */}
          {bundleProducts && bundleProducts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> What&apos;s Included in this Bundle
              </h3>
              <div className="space-y-3">
                {bundleProducts.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border shrink-0">
                      <Image 
                        src={item.product.images?.[0]?.url || item.product.icon?.url || "/placeholder.png"} 
                        alt={item.product.productInfo.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">{item.product.productInfo.brand}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{item.product.productInfo.title}</p>
                    </div>
                    <div className="text-right shrink-0 px-3 py-1 bg-white rounded-lg border shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase leading-tight">Qty</p>
                      <p className="text-sm font-black text-blue-600 leading-tight">×{item.quantity}</p>
                    </div>
                    {item.product.variants && item.product.variants.length > 0 && (
                      <div className="ml-2 min-w-[120px]">
                        <Select
                          value={bundleSelections[item._id] || ""}
                          onValueChange={(val) => setBundleSelections(prev => ({ ...prev, [item._id]: val }))}
                        >
                          <SelectTrigger className="h-9 text-xs font-bold border-2 focus:ring-1 focus:ring-blue-600 rounded-lg">
                            <SelectValue placeholder="Choose Option" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.product.variants.map((v) => (
                              <SelectItem key={v._id} value={v._id} className="text-xs font-medium">
                                {v.name} - <PriceDisplay amount={v.price} originalCurrency={currency} manualOverrides={v.manualCurrencyPrices} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {item.product.inStock === false && (
                      <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase">Out of Stock</span>
                    )}
                  </div>
                ))}
              </div>
              {isBundleOutOfStock && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                  <FaInfoCircle className="text-red-500 w-4 h-4 shrink-0" />
                  <p className="text-xs font-bold text-red-800">Note: One or more items in this bundle are currently unavailable.</p>
                </div>
              )}
            </div>
          )}

          {/* Specifications / Dynamic Attributes inside Right Column */}
          {attributes && Object.keys(attributes).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6">
                {Object.entries(attributes)
                  .filter(([key]) => ![
                    "originalPrice", "discount", "pricePer", "ratingStars", 
                    "ratingReviews", "offers", "bundleProducts", "purchaseType", 
                    "currency", "brand", "video"
                  ].includes(key))
                  .map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{key}</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{String(value)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Return & Replacement Policy Cards */}
          {(is_returnable || is_replaceable) && (
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Return window policy */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                  <RotateCcw className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {is_returnable ? `${return_window_days} Days Return` : "Non-Returnable"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {is_returnable ? "Easy return & refund" : "No returns accepted"}
                  </p>
                </div>
              </div>

              {/* Card 2: Replacement policy */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {is_replaceable ? "Replacement Available" : "No Replacement"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {is_replaceable ? "Eligible for exchange" : "Replacement not eligible"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Quote Dialog */}
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Request a Custom Quote</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Interested in <span className="font-semibold text-gray-800">{productName || productInfo.title}</span>? Fill out the details below and our team will get back to you with a custom quote.
            </DialogDescription>
          </DialogHeader>

          {quoteSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Request Submitted!</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Thank you for your interest. We have received your request and will contact you shortly at <span className="font-semibold text-gray-800">{customerEmail}</span>.
              </p>
              <Button
                variant="BlueDark"
                className="mt-4 px-6 h-10 rounded-xl font-semibold"
                onClick={() => setIsQuoteOpen(false)}
              >
                Close Window
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuote} className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Item Details</h4>
                  <p className="text-sm font-bold text-gray-800 truncate max-w-[240px]">
                    {productName || productInfo.title}
                  </p>
                  {selectedVariant && (
                    <p className="text-xs text-gray-500">Variant: {selectedVariant.name}</p>
                  )}
                  <p className="text-xs text-gray-500">Qty: {quantity}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Est. Price</h4>
                  <div className="text-base font-black text-gray-900">
                    <PriceDisplay
                      amount={unitPrice * quantity}
                      originalCurrency={currency}
                      manualOverrides={selectedVariant?.manualCurrencyPrices || manualCurrencyPrices}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="quote-name" className="text-xs font-bold text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="quote-name"
                    required
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-10 rounded-lg border-gray-200 focus:border-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="quote-email" className="text-xs font-bold text-gray-700">Email Address <span className="text-red-500">*</span></Label>
                    <Input
                      id="quote-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="h-10 rounded-lg border-gray-200 focus:border-gray-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="quote-phone" className="text-xs font-bold text-gray-700">Phone Number</Label>
                    <Input
                      id="quote-phone"
                      type="tel"
                      placeholder="e.g. +1234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-10 rounded-lg border-gray-200 focus:border-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="quote-message" className="text-xs font-bold text-gray-700">Custom Requirements / Message</Label>
                  <Textarea
                    id="quote-message"
                    placeholder="Tell us about any specific customization, shipping requirements, or queries..."
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    className="rounded-lg border-gray-200 focus:border-gray-900 resize-none min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsQuoteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="BlueDark"
                  disabled={isSubmittingQuote}
                  className="flex-1 h-11 rounded-xl font-bold shadow-lg shadow-blue-100 hover:shadow-xl transition-all"
                >
                  {isSubmittingQuote ? "Submitting..." : "Submit Quote Request"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductSectionInfo;
