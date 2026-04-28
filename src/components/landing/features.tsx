import { Cpu, Gauge, GitCompareArrows, PencilRuler, PlugZap, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/useLocaleStore";

export function FeatureSection() {
  const locale = useLocaleStore((state) => state.locale);
  const features = [
    { icon: Cpu, title: t(locale, "feature1Title"), description: t(locale, "feature1Desc") },
    { icon: GitCompareArrows, title: t(locale, "feature2Title"), description: t(locale, "feature2Desc") },
    { icon: PencilRuler, title: t(locale, "feature3Title"), description: t(locale, "feature3Desc") },
    { icon: PlugZap, title: t(locale, "feature4Title"), description: t(locale, "feature4Desc") },
    { icon: Gauge, title: t(locale, "feature5Title"), description: t(locale, "feature5Desc") },
    { icon: TriangleAlert, title: t(locale, "feature6Title"), description: t(locale, "feature6Desc") },
  ];

  return (
    <section className="space-y-8">
      <SectionTitle
        eyebrow={t(locale, "capability")}
        title={t(locale, "featureTitle")}
        description={t(locale, "featureDescription")}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="group transition hover:-translate-y-1 hover:border-cyan-300/20">
            <feature.icon className="h-8 w-8 text-cyan-300 transition group-hover:text-cyan-200" />
            <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
