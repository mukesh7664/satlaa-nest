"use client";

import React from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { getCurrencySymbol } from "@/utils/currencyUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe } from "lucide-react";

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency, supportedCurrencies, loading } = useCurrency();

  if (loading || supportedCurrencies.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 py-1.5 text-[14px] font-bold text-[#004DAA] transition-all hover:scale-105 active:scale-95 group">
          <Globe className="h-4 w-4 text-[#004DAA]" />
          <span>{currency} ({getCurrencySymbol(currency)})</span>
          <ChevronDown className="h-4 w-4 text-[#004DAA] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 rounded-xl p-1 shadow-md border-slate-100">
        {supportedCurrencies.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setCurrency(code)}
            className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <span>{code}</span>
            <span className="text-slate-400 font-normal">{getCurrencySymbol(code)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
