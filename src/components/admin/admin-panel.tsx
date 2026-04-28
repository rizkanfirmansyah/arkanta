"use client";

import { useState } from "react";
import { recommendationTemplates } from "@/data/templates";
import { useBuilderStore } from "@/store/useBuilderStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useLocaleStore } from "@/store/useLocaleStore";
import { ComponentItem, RecommendationTemplate } from "@/types";

const blankComponent: ComponentItem = {
  id: "custom-component",
  name: "Komponen Baru",
  category: "cpu",
  brand: "Custom",
  price: 0,
  imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  specs: { notes: "Edit sesuai kebutuhan admin." },
  compatibility: {},
  recommendedFor: ["custom"],
  pros: ["Bisa diatur lokal"],
  cons: ["Belum divalidasi"],
};

export function AdminPanel() {
  const locale = useLocaleStore((state) => state.locale);
  const { componentDatabase, templates, upsertComponent, saveTemplate, recommendations, setRecommendations } = useBuilderStore();
  const [draft, setDraft] = useState<ComponentItem>(blankComponent);

  const templateDraft: RecommendationTemplate = {
    id: `template-${templates.length + 1}`,
    name: locale === "en" ? "New Local Template" : "Template Lokal Baru",
    description: locale === "en" ? "Saved into Zustand state from admin mode." : "Disimpan ke Zustand state dari admin mode.",
    strategy: "balanced",
    tags: ["local", "admin"],
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{locale === "en" ? "Admin Mode" : "Admin Mode"}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{locale === "en" ? "Manage the local component database" : "Kelola database komponen lokal"}</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={draft.id}
            onChange={(event) => setDraft({ ...draft, id: event.target.value })}
            className="rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 text-sm"
            placeholder="id"
          />
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 text-sm"
            placeholder={locale === "en" ? "Component name" : "Nama komponen"}
          />
          <select
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value as ComponentItem["category"] })}
            className="rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 text-sm"
          >
            {["cpu", "gpu", "motherboard", "ram", "storage", "psu", "case", "cooler", "ups"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={draft.price}
            onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
            className="rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 text-sm"
            placeholder={locale === "en" ? "Price" : "Harga"}
          />
        </div>
        <Button onClick={() => upsertComponent(draft)}>{locale === "en" ? "Add/Edit Local Component" : "Tambah/Edit Komponen Lokal"}</Button>
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {componentDatabase.slice(0, 20).map((item) => (
            <Card key={item.id} className="p-4">
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {item.category} • {item.brand} • {formatCurrency(item.price)}
              </p>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{locale === "en" ? "Templates & Generate" : "Template & Generate"}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{locale === "en" ? "Save recommendation templates into state" : "Simpan template rekomendasi ke state"}</h3>
        </div>
        <div className="space-y-3">
          {[...recommendationTemplates, ...templates].slice(0, 8).map((template) => (
            <Card key={template.id} className="p-4">
              <p className="text-sm font-medium text-white">{template.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{template.description}</p>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => saveTemplate(templateDraft)}>{locale === "en" ? "Save Build Template" : "Simpan Template Build"}</Button>
          <Button
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => {
              if (recommendations) setRecommendations(recommendations);
            }}
          >
            {locale === "en" ? "Generate Sample Recommendation" : "Generate Contoh Rekomendasi"}
          </Button>
        </div>
        <p className="text-sm text-zinc-500">
          {locale === "en"
            ? "This admin mode does not use auth or a database yet. All changes are stored in browser state."
            : "Admin mode ini belum memakai auth atau database. Semua perubahan tersimpan di state browser."}
        </p>
      </Card>
    </div>
  );
}
