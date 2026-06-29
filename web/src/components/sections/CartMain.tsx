"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { DiscountInput } from "@/components/Cart/DiscountInput";
import { toast } from "sonner";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { useCurrency } from "@/context/CurrencyContext";
import { resolvePrice, formatCurrency } from "@/utils/currencyUtils";
import { Separator } from "@/components/ui/separator";

// --- Helper for Product Card ---
interface ProductCardProps {
  item: {
    id: string;
    productId: string;
    variantId?: string;
    product: {
      title: string;
      media: Array<{ url: string; is_main: boolean }>;
      is_variant: boolean;
      parent?: {
        title: string;
        media: Array<{ url: string; is_main: boolean }>;
      };
      manualCurrencyPrices?: Record<string, number>;
    };
    price: number;
    quantity: number;
    quantityLabel?: string;
    purchaseType?: "online" | "quote" | "both";
    selectedVariant?: {
      userType?: string;
      planName?: string;
      billingCycle?: "monthly" | "yearly";
      pricePerUnit: number;
      numberOfUsers?: number;
      manualCurrencyPrices?: Record<string, number>;
    };
    subtotal: number;
  };
  onRemove: (cartItemId: string) => void;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  currencyCode?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
  currencyCode = "INR",
}) => {
  const displayTitle = item.product?.is_variant && item.product?.parent
    ? item.product.parent.title
    : (item.product?.title || "Unknown Product");

  const displayImage = item.product?.media?.find((m: any) => m.is_main)?.url ||
    item.product?.media?.[0]?.url ||
    (item.product?.is_variant && item.product?.parent?.media?.find((m: any) => m.is_main)?.url) ||
    (item.product?.is_variant && item.product?.parent?.media?.[0]?.url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:shadow-xl hover:shadow-slate-200/50 md:flex-row md:items-center md:p-5"
    >
      {/* Product Image */}
      <div className="relative aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 p-2 md:h-28 md:w-28">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={displayTitle}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            <ShoppingCart className="h-8 w-8 opacity-20" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between self-stretch py-1">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="line-clamp-1 text-base font-bold text-slate-900 md:text-lg">
              {displayTitle}
            </h3>
            <button
              onClick={() => onRemove(item.id)}
              className="ml-2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 md:hidden"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {item.purchaseType === "quote" && (
            <span className="mt-1 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase ring-1 ring-inset ring-amber-600/10">
              Request Quote
            </span>
          )}

          {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(item.selectedVariant)
                .filter(([key]) => !["pricePerUnit", "id", "_id", "sku", "image", "stock", "manualCurrencyPrices"].includes(key))
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-100"
                  >
                    {key}: <span className="ml-1 text-slate-800">{String(value)}</span>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Pricing & Controls for Desktop */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/50 p-1">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-primary active:scale-95 disabled:opacity-30"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-[32px] text-center text-sm font-bold text-slate-800">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-primary active:scale-95"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <span className="ml-2 text-xs font-medium text-slate-400">
              × <PriceDisplay
                amount={Number(item.price || 0)}
                originalCurrency={currencyCode}
                manualOverrides={item.selectedVariant?.manualCurrencyPrices || item.product?.manualCurrencyPrices}
              />
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-black text-slate-900">
                <PriceDisplay
                  amount={Number(item.subtotal || 0)}
                  originalCurrency={currencyCode}
                  manualOverrides={item.selectedVariant?.manualCurrencyPrices ? Object.fromEntries(Object.entries(item.selectedVariant.manualCurrencyPrices as Record<string, number>).map(([k, v]) => [k, v * item.quantity])) : (item.product?.manualCurrencyPrices ? Object.fromEntries(Object.entries(item.product.manualCurrencyPrices as Record<string, number>).map(([k, v]) => [k, v * item.quantity])) : undefined)}
                />
              </p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="hidden rounded-full p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 md:flex"
              title="Remove item"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface CartMainProps {
  title?: string;
  subtitle?: string;
  showSummary?: boolean;
}

export const CartMain: React.FC<CartMainProps> = ({
  title = "Your Shopping Bag",
  subtitle = "Ready to finish your order?",
  showSummary = true
}) => {
  const router = useRouter();
  const { cart, items, itemCount, removeFromCart, updateQuantity, applyDiscount, removeDiscount, isLoading } =
    useCart();

  const { currency, exchangeRates } = useCurrency();

  const displaySubtotal = items.reduce((acc, item) => {
    const itemPrice = resolvePrice(
      item.price,
      cart?.totals?.currency || "INR",
      currency,
      exchangeRates,
      item.selectedVariant?.manualCurrencyPrices || item.product?.manualCurrencyPrices
    );
    return acc + (itemPrice * item.quantity);
  }, 0);

  const totals = cart?.totals;
  const platformFee = resolvePrice(Number(totals?.shippingCharges || 0), cart?.totals?.currency || "INR", currency, exchangeRates);
  const shippingCost = 0;
  const discountAmount = resolvePrice(Number((totals?.discount || 0) + (totals?.discountAmount || 0)), cart?.totals?.currency || "INR", currency, exchangeRates);
  const taxes = resolvePrice(Number(totals?.tax || 0), cart?.totals?.currency || "INR", currency, exchangeRates);

  const displayTotalAmount = displaySubtotal + taxes - discountAmount + platformFee + shippingCost;

  const handleApplyDiscount = async (code: string) => {
    if (!code.trim()) return;
    try {
      await applyDiscount(code);
      toast.success("Discount applied successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to apply discount");
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      await removeDiscount();
      toast.info("Discount removed");
    } catch (error) {
      toast.error("Failed to remove discount");
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const isOnlinePayment = items.some(
    (item) => item.purchaseType === "online" || !item.purchaseType
  );

  if (isLoading && !cart) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-primary"></div>
          <ShoppingCart className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <p className="font-medium text-slate-500">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50">
          <ShoppingCart className="h-10 w-10 text-slate-300" />
        </div>
        <h1 className="mb-2 text-2xl font-black text-slate-900">Your bag is empty</h1>
        <p className="mb-8 text-slate-500">
          Looks like you haven't added anything to your cart yet. Browse our collections and find something you love.
        </p>
        <Button
          onClick={() => router.push("/products")}
          className="rounded-full bg-slate-900 px-8 py-6 text-white hover:bg-slate-800"
        >
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
              <button onClick={() => router.back()} className="hover:text-primary flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-slate-900">Cart</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              {title}
            </h1>
            <p className="mt-1 text-slate-500 font-medium">{subtitle}</p>
          </div>
          <div className="hidden rounded-full bg-white px-4 py-2 shadow-sm border border-slate-100 md:block">
            <span className="text-sm font-bold text-slate-800">
              {itemCount} {itemCount === 1 ? "Item" : "Items"} in bag
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-10 ${showSummary ? 'lg:grid-cols-[1fr_380px]' : ''}`}>
          {/* Cart Items List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item as any}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                  currencyCode={cart?.totals?.currency || "INR"}
                />
              ))}
            </AnimatePresence>

            {/* Guarantees */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, text: "Secure Payment", sub: "100% encryption" },
                { icon: Truck, text: "Express Delivery", sub: "Fast & reliable" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.text}</p>
                    <p className="text-[10px] text-slate-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {showSummary && (
            <div className="relative">
              <div className="sticky top-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200/50">
                <h2 className="mb-6 text-xl font-black text-slate-900">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">{formatCurrency(displaySubtotal, currency)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-green-600">Discount</span>
                      <span className="font-bold text-green-600">-{formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-500">Platform Fee</span>
                    <span className="font-bold text-green-600 uppercase text-[10px] tracking-wider bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                      {platformFee === 0 ? "Free" : formatCurrency(platformFee, currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-500">Shipping</span>
                    <span className="font-bold text-green-600 uppercase text-[10px] tracking-wider bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                      {shippingCost === 0 ? "Free" : formatCurrency(shippingCost, currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-500">Tax</span>
                    <span className="font-bold text-slate-900">{formatCurrency(taxes, currency)}</span>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</p>
                      <p className="text-3xl font-black text-slate-900">{formatCurrency(displayTotalAmount, currency)}</p>
                    </div>
                  </div>
                </div>

                {/* Discount Code */}
                <div className="mt-8">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Discount Code</p>
                  <DiscountInput
                    onApply={handleApplyDiscount}
                    onRemove={handleRemoveDiscount}
                    appliedDiscount={cart?.discountCode}
                    isLoading={isLoading}
                  />
                </div>

                {/* Checkout CTA */}
                <div className="mt-8">
                  <Button
                    onClick={handleCheckout}
                    className="w-full py-7 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-100 transition-all active:scale-[0.98] font-bold border-none"
                  >
                    {isOnlinePayment ? "Check out" : "Request Order"}
                  </Button>

                  <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
                    By clicking check out, you agree to our Terms of Service.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartMain;
