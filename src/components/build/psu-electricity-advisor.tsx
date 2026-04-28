import { Card } from "@/components/ui/card";
import { useLocaleStore } from "@/store/useLocaleStore";
import { RecommendedBuild } from "@/types";

export function PsuElectricityAdvisor({ build }: { build: RecommendedBuild }) {
  const locale = useLocaleStore((state) => state.locale);

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">PSU & Electricity Advisor</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{locale === "en" ? "Review the electrical safety of this build" : "Baca keamanan listrik build"}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/5 bg-surface-900/70">
          <p className="text-sm font-medium text-white">{locale === "en" ? "PSU Recommendation" : "Rekomendasi PSU"}</p>
          <p className="mt-2 text-sm text-zinc-400">{build.psuAdvice.summary}</p>
          <p className="mt-3 text-sm text-zinc-300">{locale === "en" ? "Estimated wattage" : "Estimasi watt"}: {build.estimatedWattage}W</p>
          <p className="text-sm text-zinc-300">{locale === "en" ? "Efficiency" : "Efisiensi"}: {build.psuAdvice.recommendedEfficiency}</p>
        </Card>
        <Card className="border-white/5 bg-surface-900/70">
          <p className="text-sm font-medium text-white">{locale === "en" ? "Headroom & Protection" : "Headroom & Proteksi"}</p>
          <p className="mt-2 text-sm text-zinc-400">{build.psuAdvice.headroomReason}</p>
          <p className="mt-3 text-sm text-zinc-300">{locale === "en" ? "Protections" : "Proteksi"}: {build.psuAdvice.requiredProtections.join(", ")}</p>
          <p className="mt-2 text-sm text-zinc-300">
            UPS: {build.psuAdvice.upsRecommended ? (locale === "en" ? "Recommended" : "Direkomendasikan") : locale === "en" ? "Optional" : "Opsional"} • {build.psuAdvice.upsReason}
          </p>
        </Card>
      </div>
      <p className="text-sm text-zinc-500">
        {locale === "en"
          ? "Education note: 80+ Bronze/Gold/Platinum indicates efficiency, not absolute PSU quality. Still verify protections and unit reputation."
          : "Catatan edukasi: sertifikasi 80+ Bronze/Gold/Platinum adalah indikator efisiensi, bukan jaminan mutlak kualitas PSU. Tetap cek proteksi dan reputasi unit."}
      </p>
    </Card>
  );
}
