// src/components/OrderSummary.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Ticket, X, Loader2, Check, ShoppingBag, Info } from "lucide-react";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { useCurrency } from "@/context/CurrencyContext";
import { resolvePrice, formatCurrency } from "@/utils/currencyUtils";

export function OrderSummary({
  paymentMethod = "quote_request",
  isSubmitting = false,
}: {
  paymentMethod?: "razorpay" | "stripe" | "quote_request";
  isSubmitting?: boolean;
}) {
  const { cart, items, itemCount, applyDiscount, removeDiscount, isLoading } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");

  const { currency, exchangeRates } = useCurrency();
  
  // Calculate summary values
  const totals = cart?.totals;
  const originalCurrency = totals?.currency || "INR";

  const displaySubtotal = items.reduce((acc, item) => {
    const itemPrice = resolvePrice(
      item.price,
      originalCurrency,
      currency,
      exchangeRates,
      item.selectedVariant?.manualCurrencyPrices || item.product?.manualCurrencyPrices
    );
    return acc + (itemPrice * item.quantity);
  }, 0);

  const platformFee = resolvePrice(Number(totals?.shippingCharges || 0), originalCurrency, currency, exchangeRates);
  const shippingCost = 0;
  const discountAmount = resolvePrice(Number((totals?.discount || 0) + (totals?.discountAmount || 0)), originalCurrency, currency, exchangeRates);
  const taxes = resolvePrice(Number(totals?.tax || 0), originalCurrency, currency, exchangeRates);
  const displayTotalAmount = displaySubtotal + taxes - discountAmount + platformFee + shippingCost;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }
    setDiscountError("");
    try {
      await applyDiscount(discountCode);
      setDiscountCode("");
    } catch (error: any) {
      setDiscountError(error.response?.data?.message || "Invalid or expired discount");
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      await removeDiscount();
      setDiscountCode("");
      setDiscountError("");
    } catch (error) {
      setDiscountError("Failed to remove discount");
    }
  };

  const isDirectPayment = paymentMethod === "razorpay" || paymentMethod === "stripe";

  return (
    <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-blue-600" />
          Order Summary
        </h2>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {itemCount} {itemCount === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Cart Items List */}
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                className="flex items-center gap-4 group"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-1">
                  {(() => {
                    const product = item.product;
                    if (!product) return null;
                    const displayTitle = product.is_variant && product.parent ? product.parent.title : product.title;
                    const displayImage = product.media?.find((m: any) => m.is_main)?.url || product.media?.[0]?.url;
                    
                    return displayImage ? (
                      <Image src={displayImage} alt={displayTitle} fill className="object-contain p-1 group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600 font-bold text-xs uppercase">
                        {displayTitle?.charAt(0)}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">
                    {item.product.is_variant && item.product.parent ? item.product.parent.title : item.product.title}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                    Qty: {item.quantity} × <PriceDisplay amount={item.price} originalCurrency={originalCurrency} />
                  </p>
                  {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(item.selectedVariant)
                        .filter(([k]) => !["pricePerUnit", "id", "_id", "sku", "image", "stock", "manualCurrencyPrices"].includes(k))
                        .map(([k, v]) => (
                          <span key={k} className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 font-bold uppercase">
                            {k}: {String(v)}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    <PriceDisplay 
                      amount={item.subtotal || 0} 
                      originalCurrency={originalCurrency} 
                    />
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Separator className="bg-slate-50" />

        {/* Discount Section */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Discount Code</p>
          {cart?.discountCode ? (
            <div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm font-bold text-green-900 tracking-tight">{cart.discountCode}</span>
              </div>
              <button onClick={handleRemoveDiscount} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="PROMO10"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="rounded-xl border-slate-200 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              <Button onClick={handleApplyDiscount} disabled={isLoading || !discountCode.trim()} className="rounded-xl bg-slate-900 hover:bg-slate-800">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}
          {discountError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{discountError}</p>}
        </div>

        <Separator className="bg-slate-50" />

        {/* Price Breakdown */}
        <div className="space-y-3">
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

          <div className="pt-2">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</p>
                <p className="text-3xl font-black text-slate-900">{formatCurrency(displayTotalAmount, currency)}</p>
              </div>
            </div>
          </div>
        </div>

        {!isDirectPayment && (
          <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="text-[11px] text-blue-800 font-medium leading-relaxed">
                <p className="font-bold mb-1 uppercase tracking-wider">Quote Request Process</p>
                Our team will review your request and contact you to confirm the details and payment.
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full py-7 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-100 transition-all active:scale-[0.98] font-black border-none"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isDirectPayment ? (
              "Complete Purchase"
            ) : (
              "Send Request"
            )}
          </Button>

          <p className="text-center text-[10px] font-medium text-slate-400 px-4 leading-normal">
            Secure checkout powered by industry standard encryption. By completing your order you agree to our Terms.
          </p>
        </div>
      </div>
    </div>
  );
}
