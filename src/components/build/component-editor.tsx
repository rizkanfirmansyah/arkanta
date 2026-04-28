"use client";

import { useState, useTransition } from "react";
import { calculateBuildPrice, calculateScores, estimateBuildWattage } from "@/lib/scoring";
import { useBuilderStore } from "@/store/useBuilderStore";
import { ChangeAnalysis, ComponentCategory, RecommendedBuild } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useLocaleStore } from "@/store/useLocaleStore";

const editableCategories: ComponentCategory[] = ["cpu", "gpu", "ram", "storage", "psu", "case", "cooler", "ups"];

export function ComponentEditor() {
  const [pending, startTransition] = useTransition();
  const [analyzingCategory, setAnalyzingCategory] = useState<ComponentCategory | null>(null);
  const locale = useLocaleStore((state) => state.locale);
  const {
    componentDatabase,
    editedBuild,
    recommendations,
    diagnosis,
    intake,
    applyComponentChange,
    setChangeAnalysis,
    setChangeAnalysisLoading,
    changeAnalysisLoading,
    changeAnalysis,
    selectedBuildId,
  } = useBuilderStore();

  if (!editedBuild || !recommendations || !diagnosis) return null;

  const original = recommendations.builds.find((build) => build.id === selectedBuildId);

  const analyzeChange = async (category: ComponentCategory, nextBuild: RecommendedBuild) => {
    if (!original) return;

    setChangeAnalysis(null);
    setChangeAnalysisLoading(true);
    setAnalyzingCategory(category);

    try {
      const response = await fetch("/api/ai/analyze-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: intake,
          diagnosis,
          oldBuild: original,
          newBuild: nextBuild,
          changedComponent: { category, component: nextBuild.components[category] },
        }),
      });

      const data = (await response.json()) as ChangeAnalysis;
      setChangeAnalysis(data);
    } finally {
      setChangeAnalysisLoading(false);
      setAnalyzingCategory(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Component Editor</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{locale === "en" ? "Edit the build without heavy reloads" : "Edit build tanpa reload berat"}</h3>
          </div>
          <Badge className="border-violet-400/30 bg-violet-400/10 text-violet-200">{formatCurrency(editedBuild.estimatedPrice)}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {editableCategories.map((category) => {
            const options = componentDatabase.filter((item) => item.category === category);
            return (
              <div key={category} className="space-y-2">
                <label className="text-sm capitalize text-zinc-300">{category}</label>
                <select
                  value={editedBuild.components[category].id}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    const currentId = editedBuild.components[category].id;
                    if (nextId === currentId) return;

                    const component = componentDatabase.find((item) => item.id === nextId);
                    if (!component) return;

                    const nextBuild: RecommendedBuild = {
                      ...editedBuild,
                      components: {
                        ...editedBuild.components,
                        [category]: { id: component.id, name: component.name, price: component.price },
                      },
                    };

                    nextBuild.estimatedPrice = calculateBuildPrice(nextBuild);
                    nextBuild.estimatedWattage = estimateBuildWattage(nextBuild);
                    nextBuild.scores = calculateScores(nextBuild, intake, diagnosis);

                    startTransition(() => {
                      applyComponentChange(category, nextId);
                    });

                    void analyzeChange(category, nextBuild);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-cyan-400/40"
                >
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} • {formatCurrency(option.price)}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(editedBuild.scores).map(([key, value]) => (
            <Card key={key} className="p-4 text-center">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">{key}</p>
              <p className="mt-1 text-xl font-semibold text-white">{value}</p>
            </Card>
          ))}
        </div>

        <Button className="w-full justify-center border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={pending}>
          {pending ? (locale === "en" ? "Applying change..." : "Memproses perubahan...") : locale === "en" ? "Change applied to state" : "Perubahan diterapkan di state"}
        </Button>
      </Card>

      <Card className="space-y-4">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">AI Impact Analysis</p>
        {changeAnalysisLoading ? (
          <>
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-16 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
            <Skeleton className="h-20 w-full" />
            {analyzingCategory ? (
              <p className="text-xs text-zinc-500">
                {locale === "en" ? `Re-analyzing ${analyzingCategory} change...` : `Menganalisis ulang perubahan ${analyzingCategory}...`}
              </p>
            ) : null}
          </>
        ) : changeAnalysis ? (
          <>
            <Badge
              className={
                changeAnalysis.recommendation === "dangerous"
                  ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
                  : changeAnalysis.recommendation === "not_recommended"
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              }
            >
              {changeAnalysis.recommendation}
            </Badge>
            <p className="text-sm leading-6 text-zinc-300">{changeAnalysis.summary}</p>
            <div>
              <p className="text-sm font-medium text-white">{locale === "en" ? "Positive Impacts" : "Dampak Positif"}</p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-400">
                {changeAnalysis.positiveImpacts.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{locale === "en" ? "Negative Impacts" : "Dampak Negatif"}</p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-400">
                {changeAnalysis.negativeImpacts.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <Card className="border-white/5 bg-surface-900/70">
              <p className="text-sm text-white">Final Advice</p>
              <p className="mt-2 text-sm text-zinc-400">{changeAnalysis.finalAdvice}</p>
            </Card>
          </>
        ) : (
          <p className="text-sm text-zinc-400">{locale === "en" ? "Pick another component to trigger build change analysis." : "Pilih komponen lain untuk memicu analisis perubahan build."}</p>
        )}
      </Card>
    </div>
  );
}
