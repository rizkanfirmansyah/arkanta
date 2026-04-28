import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/useLocaleStore";
import { DiagnosisResult } from "@/types";

function riskClass(level: string) {
  if (level === "high") return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  if (level === "medium") return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
}

export function DiagnosisCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const locale = useLocaleStore((state) => state.locale);
  const riskLabels: Record<string, string> = {
    electricityRisk: t(locale, "riskElectricity"),
    thermalRisk: t(locale, "riskThermal"),
    workloadRisk: t(locale, "riskWorkload"),
    upgradeNeed: t(locale, "riskUpgrade"),
  };

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{t(locale, "aiDiagnosis")}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{t(locale, "diagnosisTitle")}</h3>
        </div>
        <Badge className="border-violet-400/30 bg-violet-400/10 text-violet-200">{diagnosis.strategy.mode}</Badge>
      </div>

      <p className="text-sm leading-6 text-zinc-300">{diagnosis.summary}</p>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(diagnosis.riskProfile).map(([key, value]) => (
          <Card key={key} className="p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{riskLabels[key] ?? key}</p>
            <Badge className={`mt-3 ${riskClass(value)}`}>{value}</Badge>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/5 bg-surface-900/70">
          <p className="text-sm font-medium text-white">{t(locale, "mainProblems")}</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {diagnosis.detectedProblems.map((problem) => (
              <li key={problem}>• {problem}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-white/5 bg-surface-900/70">
          <p className="text-sm font-medium text-white">{t(locale, "buildStrategy")}</p>
          <p className="mt-3 text-sm text-zinc-400">{diagnosis.strategy.reason}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {diagnosis.strategy.componentPriorities.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </Card>
  );
}
