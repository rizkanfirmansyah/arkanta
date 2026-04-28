"use client";

import { ComparisonTable } from "@/components/comparison/comparison-table";
import { SectionTitle } from "@/components/ui/section-title";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/useLocaleStore";

export default function ComparePage() {
  const locale = useLocaleStore((state) => state.locale);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow={t(locale, "compareEyebrow")}
        title={t(locale, "compareTitle")}
        description={t(locale, "compareDescription")}
      />
      <ComparisonTable />
    </div>
  );
}
