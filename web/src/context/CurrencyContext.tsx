"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getPublicSettings } from "@/lib/api/settings";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  supportedCurrencies: string[];
  exchangeRates: Record<string, number>;
  baseCurrency: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>("");
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [baseCurrency, setBaseCurrency] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initCurrency = async () => {
      try {
        const settings = await getPublicSettings();
        console.log("Full Settings received:", settings);
        
        if (settings) {
          const base = (settings as any).defaultCurrency || "INR";
          const supported = (settings as any).supportedCurrencies || [base];
          const config = (settings as any).currencyConfig || { rates: {} };

          setBaseCurrency(base);
          setSupportedCurrencies(supported);
          setExchangeRates(config.rates || {});

          // Load preferred currency from localStorage or use default
          const host = window.location.host;
          const saved = localStorage.getItem(`preferred_currency_${host}`);
          console.log(`Store Base (${host}):`, base, "User Preference:", saved);

          if (saved && supported.includes(saved)) {
            setCurrencyState(saved);
          } else {
            setCurrencyState(base);
          }
        } else {
          console.warn("No settings found, falling back to INR");
          setBaseCurrency("INR");
          setSupportedCurrencies(["INR"]);
          setCurrencyState("INR");
        }
      } catch (error) {
        console.error("Failed to initialize currency:", error);
      } finally {
        setLoading(false);
      }
    };

    initCurrency();
  }, []);

  const setCurrency = (newCurrency: string) => {
    if (supportedCurrencies.includes(newCurrency)) {
      setCurrencyState(newCurrency);
      const host = window.location.host;
      localStorage.setItem(`preferred_currency_${host}`, newCurrency);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        supportedCurrencies,
        exchangeRates,
        baseCurrency,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
