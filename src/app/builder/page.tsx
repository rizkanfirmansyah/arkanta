"use client";

import { DiagnosisCard } from "@/components/ai/diagnosis-card";
import { BuildCard } from "@/components/build/build-card";
import { ComponentEditor } from "@/components/build/component-editor";
import { PsuElectricityAdvisor } from "@/components/build/psu-electricity-advisor";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle } from "@/components/ui/section-title";
import { IntakeWizard } from "@/components/wizard/intake-wizard";
import { t } from "@/lib/i18n";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useLocaleStore } from "@/store/useLocaleStore";

export default function BuilderPage() {
  const locale = useLocaleStore((state) => state.locale);
  const { diagnosis, recommendations, selectBuild, selectedBuildId, editedBuild, loading, error } = useBuilderStore();

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow={t(locale, "builderEyebrow")}
        title={t(locale, "builderTitle")}
        description={t(locale, "builderDescription")}
      />
      <IntakeWizard />

      {loading ? <p className="text-sm text-cyan-300">{t(locale, "loadingAi")}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {loading ? (
        <>
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-80 max-w-full" />
              </div>
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-56 w-full" />
            </div>
          </Card>
          <section className="space-y-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-80 max-w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 8 }).map((__, partIndex) => (
                      <Skeleton key={partIndex} className="h-16 w-full" />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </>
      ) : null}
      {diagnosis ? <DiagnosisCard diagnosis={diagnosis} /> : null}
      {diagnosis && !loading && !recommendations ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
          {t(locale, "diagnosisOnlyWarning")}
        </div>
      ) : null}

      {recommendations ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{t(locale, "aiRecommendation")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{t(locale, "aiRecommendationTitle")}</h2>
            <p className="mt-2 text-sm text-zinc-400">{recommendations.recommendationSummary}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {recommendations.builds.map((build) => (
              <BuildCard key={build.id} build={build} selected={selectedBuildId === build.id} onSelect={() => selectBuild(build.id)} />
            ))}
          </div>
        </section>
      ) : null}

      {editedBuild ? (
        <>
          <ComponentEditor />
          <PsuElectricityAdvisor build={editedBuild} />
        </>
      ) : null}
    </div>
  );
}
