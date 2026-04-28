import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { useLocaleStore } from "@/store/useLocaleStore";
import { RecommendedBuild } from "@/types";

export function BuildCard({
  build,
  selected,
  onSelect,
}: {
  build: RecommendedBuild;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const locale = useLocaleStore((state) => state.locale);
  const labels: Record<string, string> = {
    cpu: "CPU",
    gpu: "GPU",
    motherboard: "Motherboard",
    ram: "RAM",
    storage: "Storage",
    psu: "PSU",
    case: "Case",
    cooler: "Cooler",
    ups: "UPS",
    gaming: "Gaming",
    editing: "Editing",
    value: "Value",
    safety: "Safety",
    upgrade: "Upgrade",
    powerEfficiency: "Power Efficiency",
  };

  return (
    <Card className={selected ? "border-cyan-400/30" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{build.type.replaceAll("_", " ")}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{build.name}</h3>
          <p className="mt-2 text-sm text-zinc-400">{build.targetUser}</p>
        </div>
        <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200">{formatCurrency(build.estimatedPrice)}</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Object.entries(build.components).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-white/6 bg-surface-900/70 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">{labels[key] ?? key}</p>
            <p className="mt-1 text-sm text-zinc-200">{value.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {Object.entries(build.scores).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">{labels[key] ?? key}</p>
            <p className="mt-1 text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {build.warnings.map((warning) => (
          <Badge key={warning} className="border-amber-400/30 bg-amber-400/10 text-amber-200">
            {warning}
          </Badge>
        ))}
      </div>
      {onSelect ? (
        <Button className="mt-5 w-full justify-center" onClick={onSelect}>
          {selected ? (locale === "en" ? "Selected" : "Sedang Dipilih") : locale === "en" ? "Select Build" : "Pilih Build"}
        </Button>
      ) : null}
    </Card>
  );
}
