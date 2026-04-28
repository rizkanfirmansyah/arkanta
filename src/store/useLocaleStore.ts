"use client";

import { create } from "zustand";
import { Locale } from "@/lib/i18n";

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const storageKey = "rakitiq-locale";

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: "en",
  setLocale: (locale) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, locale);
    }
    set({ locale });
  },
}));

export function initializeLocale() {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem(storageKey);
  if (saved === "en" || saved === "id") {
    useLocaleStore.setState({ locale: saved });
  }
}
