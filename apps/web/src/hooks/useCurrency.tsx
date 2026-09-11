import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Currency = "AED" | "SAR";
interface Ctx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  country: "AE" | "SA";
}
const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem("mh_currency");
      if (saved === "AED" || saved === "SAR") return saved;
    } catch {
      /* ignore */
    }
    return "AED";
  });
  useEffect(() => {
    try {
      localStorage.setItem("mh_currency", currency);
    } catch {
      /* ignore */
    }
  }, [currency]);
  const value = useMemo<Ctx>(() => ({ currency, setCurrency, country: currency === "AED" ? "AE" : "SA" }), [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
