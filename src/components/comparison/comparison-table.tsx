"use client";

import { useBuilderStore } from "@/store/useBuilderStore";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useLocaleStore } from "@/store/useLocaleStore";

export function ComparisonTable() {
  const locale = useLocaleStore((state) => state.locale);
  const rows = [
    { key: "estimatedPrice", label: locale === "en" ? "Price" : "Harga" },
    { key: "cpu", label: "CPU" },
    { key: "gpu", label: "GPU" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "psu", label: "PSU" },
    { key: "gaming", label: locale === "en" ? "Gaming Score" : "Skor Gaming" },
    { key: "editing", label: locale === "en" ? "Editing Score" : "Skor Editing" },
    { key: "value", label: locale === "en" ? "Value Score" : "Skor Value" },
    { key: "safety", label: locale === "en" ? "Safety Score" : "Skor Safety" },
    { key: "upgrade", label: locale === "en" ? "Upgrade Score" : "Skor Upgrade" },
    { key: "targetUser", label: locale === "en" ? "Best For" : "Cocok Untuk" },
    { key: "cons", label: locale === "en" ? "Main Weakness" : "Kekurangan Utama" },
  ];
  const { recommendations, comparisonBuildIds } = useBuilderStore();
  const builds = recommendations?.builds.filter((build) => comparisonBuildIds.includes(build.id)) ?? [];

  if (!builds.length) {
    return (
      <Card>
        <p className="text-sm text-zinc-400">{locale === "en" ? "No builds to compare yet. Run recommendations first on the Builder page." : "Belum ada build untuk dibandingkan. Jalankan rekomendasi dulu di halaman Builder."}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-zinc-300">
            <tr>
              <th className="px-4 py-4">{locale === "en" ? "Category" : "Kategori"}</th>
              {builds.map((build) => (
                <th key={build.id} className="px-4 py-4 text-white">
                  {build.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-white/6">
                <td className="px-4 py-4 text-zinc-400">{row.label}</td>
                {builds.map((build) => {
                  let value = "";
                  if (row.key === "estimatedPrice") value = formatCurrency(build.estimatedPrice);
                  else if (["cpu", "gpu", "ram", "storage", "psu"].includes(row.key))
                    value = build.components[row.key as "cpu" | "gpu" | "ram" | "storage" | "psu"]?.name ?? "-";
                  else if (["gaming", "editing", "value", "safety", "upgrade"].includes(row.key))
                    value = String(build.scores[row.key as "gaming" | "editing" | "value" | "safety" | "upgrade"]);
                  else if (row.key === "targetUser") value = build.targetUser;
                  else if (row.key === "cons") value = build.cons[0] ?? "-";
                  return (
                    <td key={build.id + row.key} className="px-4 py-4 text-zinc-200">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-white/6 bg-white/5 px-4 py-4 text-sm text-zinc-300">
        {locale === "en" ? "Final AI Recommendation" : "Rekomendasi final AI"}: {recommendations?.finalRecommendation}
      </div>
    </Card>
  );
}
