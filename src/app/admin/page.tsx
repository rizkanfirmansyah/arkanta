"use client";

import { AdminPanel } from "@/components/admin/admin-panel";
import { SectionTitle } from "@/components/ui/section-title";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/useLocaleStore";

export default function AdminPage() {
  const locale = useLocaleStore((state) => state.locale);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow={t(locale, "adminEyebrow")}
        title={t(locale, "adminTitle")}
        description={t(locale, "adminDescription")}
      />
      <AdminPanel />
    </div>
  );
}
