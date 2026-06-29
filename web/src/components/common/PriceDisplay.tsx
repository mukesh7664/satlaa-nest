"use client";

import React from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, convertCurrency, resolvePrice } from "@/utils/currencyUtils";

interface PriceDisplayProps {
  amount: number;
  quantity?: number;
  originalCurrency?: string;
  manualOverrides?: Record<string, number>;
  className?: string;
  showOriginal?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  quantity = 1,
  originalCurrency = "INR",
  manualOverrides = {},
  className = "",
  showOriginal = false,
}) => {
  const { currency, exchangeRates, loading } = useCurrency();
  
  if (loading || !currency) {
    return <span className={`${className} animate-pulse bg-slate-200 rounded w-16 h-4 inline-block`} />;
  }

  // 1. Get unit price (either manual override or converted)
  const unitPrice = resolvePrice(
    amount,
    originalCurrency,
    currency,
    exchangeRates,
    manualOverrides
  );

  const totalPrice = unitPrice * quantity;

  return (
    <span className={className}>
      {formatCurrency(totalPrice, currency)}
      {showOriginal && currency !== originalCurrency && (
        <span className="ml-1 text-xs opacity-50 block sm:inline">
          ({formatCurrency(amount * quantity, originalCurrency)})
        </span>
      )}
    </span>
  );
};
