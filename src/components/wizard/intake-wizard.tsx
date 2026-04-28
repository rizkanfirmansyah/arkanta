"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { Spinner } from "@/components/ui/spinner";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useLocaleStore } from "@/store/useLocaleStore";
import { formatRupiahNumber, parseRupiahInput } from "@/lib/utils";
import { MainNeed, PriorityOption } from "@/types";

const booleanKeys = ["frequentOutage", "mcbTripsOften", "hasUps", "hotRoom", "silentPreference", "wantsUpgradeIn13Years"] as const;

export function IntakeWizard() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const [step, setStep] = useState(0);
  const [softwareDraft, setSoftwareDraft] = useState("");
  const [budgetDraft, setBudgetDraft] = useState(formatRupiahNumber(12000000));
  const { intake, updateIntake, setDiagnosis, setRecommendations, setLoading, setError, clearGeneratedResults, loading } = useBuilderStore();
  const steps = [t(locale, "stepProfile"), t(locale, "stepSoftware"), t(locale, "stepElectricity"), t(locale, "stepPriorities")];
  const needOptions: { label: string; value: MainNeed }[] = [
    { label: "Gaming", value: "gaming" },
    { label: "Editing", value: "editing" },
    { label: "Office", value: "office" },
    { label: "Streaming", value: "streaming" },
    { label: "Coding", value: "coding" },
    { label: "AI/ML", value: "ai_ml" },
    { label: locale === "en" ? "Design" : "Desain", value: "desain" },
    { label: locale === "en" ? "School/College" : "Sekolah/Kuliah", value: "sekolah_kuliah" },
  ];
  const priorityOptions: { label: string; value: PriorityOption }[] = [
    { label: t(locale, "priorityPerformance"), value: "performa" },
    { label: t(locale, "priorityValue"), value: "hemat" },
    { label: t(locale, "priorityDurable"), value: "awet" },
    { label: t(locale, "prioritySafe"), value: "aman" },
    { label: t(locale, "priorityFutureProof"), value: "future-proof" },
    { label: t(locale, "priorityLowPower"), value: "low power" },
    { label: t(locale, "priorityAesthetic"), value: "aesthetic" },
  ];
  const brandOptions = [
    { label: t(locale, "brandIntel"), value: "Intel" },
    { label: t(locale, "brandAmd"), value: "AMD" },
    { label: t(locale, "brandNvidia"), value: "NVIDIA" },
    { label: t(locale, "brandRadeon"), value: "Radeon" },
    { label: t(locale, "brandAny"), value: "bebas" },
  ];

  function addSoftwareEntry(rawValue: string) {
    const value = rawValue.trim();
    if (!value) return;
    if (intake.software.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setSoftwareDraft("");
      return;
    }
    updateIntake("software", [...intake.software, value]);
    setSoftwareDraft("");
  }

  function handleSoftwareKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addSoftwareEntry(softwareDraft);
  }

  useEffect(() => {
    setBudgetDraft(formatRupiahNumber(intake.budget));
  }, [intake.budget]);

  async function runAiFlow() {
    if (loading) return;
    try {
      setLoading(true);
      clearGeneratedResults();
      setError(null);
      const diagnosisResponse = await fetch("/api/ai/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: intake, locale }),
      });
      if (!diagnosisResponse.ok) {
        throw new Error(t(locale, "diagnosisApiFailed"));
      }
      const diagnosis = await diagnosisResponse.json();
      setDiagnosis(diagnosis);

      const recommendationResponse = await fetch("/api/ai/recommend-builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: intake, diagnosis, locale }),
      });
      if (!recommendationResponse.ok) {
        throw new Error(t(locale, "recommendationApiFailed"));
      }
      const recommendations = await recommendationResponse.json();
      if (!Array.isArray(recommendations.builds) || !recommendations.builds.length) {
        throw new Error(t(locale, "invalidBuilds"));
      }
      setRecommendations(recommendations);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{t(locale, "wizardEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{t(locale, "wizardTitle")}</h2>
          </div>
          <Badge>{intake.mainNeeds.join(", ")}</Badge>
        </div>
        <ProgressStepper steps={steps} current={step} />
      </div>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t(locale, "budget")}</span>
            <div className="flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-surface-900">
              <input
                type="text"
                inputMode="numeric"
                value={budgetDraft}
                onChange={(event) => {
                  const numeric = parseRupiahInput(event.target.value);
                  updateIntake("budget", numeric);
                  setBudgetDraft(formatRupiahNumber(numeric));
                }}
                onBlur={() => setBudgetDraft(formatRupiahNumber(intake.budget))}
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none focus:border-cyan-400/40"
              />
              <div className="flex items-center border-l border-white/10 px-4 text-sm font-semibold text-zinc-400">
                Rp
              </div>
            </div>
            <p className="text-xs text-zinc-500">Preview: Rp {formatRupiahNumber(intake.budget)}</p>
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t(locale, "targetResolution")}</span>
            <select
              value={intake.targetResolution}
              onChange={(event) => updateIntake("targetResolution", event.target.value as typeof intake.targetResolution)}
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 outline-none focus:border-cyan-400/40"
            >
              {["1080p", "1440p", "4K"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-2 md:col-span-2">
            <span className="text-sm text-zinc-300">{t(locale, "mainNeedsLabel")}</span>
            <div className="flex flex-wrap gap-2">
              {needOptions.map((option) => {
                const active = intake.mainNeeds.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateIntake(
                        "mainNeeds",
                        active ? intake.mainNeeds.filter((item) => item !== option.value) : [...intake.mainNeeds, option.value],
                      )
                    }
                    disabled={loading}
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      active ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-zinc-300"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300 md:col-span-2">
            <span>{t(locale, "softwareGames")}</span>
            <div className="rounded-2xl border border-white/10 bg-surface-900 p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {intake.software.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={loading}
                    onClick={() => updateIntake("software", intake.software.filter((software) => software !== item))}
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-400/20"
                  >
                    {item} ×
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={softwareDraft}
                  onChange={(event) => setSoftwareDraft(event.target.value)}
                  onKeyDown={handleSoftwareKeyDown}
                  disabled={loading}
                  placeholder={t(locale, "addSoftwarePlaceholder")}
                  className="w-full rounded-2xl border border-white/10 bg-surface-950 px-4 py-3 outline-none focus:border-cyan-400/40"
                />
                <Button type="button" disabled={loading || !softwareDraft.trim()} onClick={() => addSoftwareEntry(softwareDraft)}>
                  {t(locale, "addSoftwareButton")}
                </Button>
              </div>
            </div>
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t(locale, "brandPreference")}</span>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-surface-900 p-3">
              {brandOptions.map((option) => {
                const active = intake.brandPreference.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      updateIntake(
                        "brandPreference",
                        active
                          ? intake.brandPreference.filter((item) => item !== option.value)
                          : option.value === "bebas"
                            ? ["bebas"]
                            : [...intake.brandPreference.filter((item) => item !== "bebas"), option.value],
                      )
                    }
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      active ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-zinc-300"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t(locale, "usageHours")}</span>
            <input
              type="number"
              min={1}
              max={24}
              value={intake.usageHoursPerDay}
              onChange={(event) => updateIntake("usageHoursPerDay", Number(event.target.value))}
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 outline-none focus:border-cyan-400/40"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: "frequentOutage", label: t(locale, "frequentOutage") },
            { key: "mcbTripsOften", label: t(locale, "mcbTripsOften") },
            { key: "hasUps", label: t(locale, "hasUps") },
            { key: "hotRoom", label: t(locale, "hotRoom") },
            { key: "silentPreference", label: t(locale, "silentPc") },
            { key: "wantsUpgradeIn13Years", label: t(locale, "upgradeSoon") },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface-900 px-4 py-4 text-sm text-zinc-300">
              <span>{item.label}</span>
              <input
                type="checkbox"
                checked={Boolean(intake[item.key as (typeof booleanKeys)[number]])}
                onChange={(event) => updateIntake(item.key as (typeof booleanKeys)[number], event.target.checked)}
                disabled={loading}
              />
            </label>
          ))}
          <label className="space-y-2 text-sm text-zinc-300 md:col-span-2">
            <span>{t(locale, "housePower")}</span>
            <select
              value={intake.housePower}
              onChange={(event) => updateIntake("housePower", event.target.value as typeof intake.housePower)}
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 bg-surface-900 px-4 py-3 outline-none focus:border-cyan-400/40"
            >
              {["900VA", "1300VA", "2200VA", "3500VA+"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">{t(locale, "userPriorities")}</p>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => {
              const active = intake.priorities.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updateIntake(
                      "priorities",
                      active ? intake.priorities.filter((item) => item !== option.value) : [...intake.priorities, option.value],
                    )
                  }
                  disabled={loading}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                      active ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-zinc-300"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3">
        <Button className="border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={step === 0 || loading} onClick={() => setStep((value) => value - 1)}>
          {t(locale, "back")}
        </Button>
        {step < steps.length - 1 ? (
          <Button disabled={loading} onClick={() => setStep((value) => value + 1)}>{t(locale, "next")}</Button>
        ) : (
          <Button disabled={loading} onClick={() => void runAiFlow()}>
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {locale === "en" ? "Generating..." : "Generating..."}
              </>
            ) : (
              t(locale, "generateBuild")
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
