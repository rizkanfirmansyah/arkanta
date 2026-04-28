"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { initializeLocale, useLocaleStore } from "@/store/useLocaleStore";

export function LocaleToggle() {
  const { locale, setLocale } = useLocaleStore();

  useEffect(() => {
    initializeLocale();
  }, []);

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      {(["en", "id"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white",
            locale === item && "bg-white/10 text-white",
          )}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
