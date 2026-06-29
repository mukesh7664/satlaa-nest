"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { useCurrency } from "@/context/CurrencyContext";
import { resolvePrice, formatCurrency } from "@/utils/currencyUtils";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { cart, items, itemCount, removeFromCart, updateQuantity, isLoading } = useCart();
  const { currency, exchangeRates } = useCurrency();

  const displayTotal = items.reduce((acc, item) => {
    const itemPrice = resolvePrice(
      item.price,
      cart?.totals?.currency || "INR",
      currency,
      exchangeRates,
      item.selectedVariant?.manualCurrencyPrices || item.product?.manualCurrencyPrices
    );
    return acc + (itemPrice * item.quantity);
  }, 0);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col [&>button]:hidden border-none shadow-2xl bg-white"
      >
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                Your Cart
                {itemCount > 0 && (
                  <span className="ml-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    ({itemCount})
                  </span>
                )}
              </SheetTitle>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600"></div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Loading Cart...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                <div className="bg-slate-50 rounded-full p-10 mb-6">
                  <ShoppingCart className="h-16 w-16 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <Button
                  onClick={() => {
                    onClose();
                    router.push("/products");
                  }}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 px-8 py-6 font-bold"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-6 pt-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className="flex gap-4 group"
                    >
                      {/* Product Image */}
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-2">
                        {(() => {
                          const product = item.product;
                          if (!product) return null;
                          const displayTitle = product.is_variant && product.parent ? product.parent.title : product.title;
                          const displayImage = product.media?.find((m: any) => m.is_main)?.url || product.media?.[0]?.url;
                          
                          return displayImage ? (
                            <Image src={displayImage} alt={displayTitle} fill className="object-contain p-1 transition-transform group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600 font-black text-2xl">
                              {displayTitle?.charAt(0)}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {item.product?.is_variant && item.product?.parent 
                              ? item.product.parent.title 
                              : (item.product?.title || "Product")}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {Object.entries(item.selectedVariant)
                              .filter(([k]) => !["pricePerUnit", "id", "_id", "sku", "image", "stock", "manualCurrencyPrices"].includes(k))
                              .map(([k, v]) => (
                                <span key={k} className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 font-bold uppercase">
                                  {k}: {String(v)}
                                </span>
                              ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-slate-50 rounded-full p-1 border border-slate-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-500"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 font-black text-xs text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-500"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">
                              <PriceDisplay 
                                amount={Number(item.subtotal || 0)} 
                                originalCurrency={cart?.totals?.currency || "INR"} 
                              />
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              <PriceDisplay amount={item.price} originalCurrency={cart?.totals?.currency || "INR"} /> each
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
 
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 bg-white px-8 py-8 space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">
                    {formatCurrency(displayTotal, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    Free Shipping
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleCheckout}
                  className="w-full py-7 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md shadow-blue-100 transition-all active:scale-[0.98] font-black border-none"
                >
                  Checkout Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={handleViewCart}
                  variant="ghost"
                  className="w-full py-6 text-slate-500 hover:text-slate-900 font-bold hover:bg-slate-50 rounded-full transition-all"
                >
                  View Shopping Bag
                </Button>
              </div>

              <p className="text-[10px] text-center text-slate-400 font-medium">
                Taxes and shipping calculated at checkout. Secure payment guaranteed.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
