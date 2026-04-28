"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Workflow } from "lucide-react";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLocaleStore } from "@/store/useLocaleStore";

export function HeroSection() {
  const locale = useLocaleStore((state) => state.locale);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const hintCardRef = useRef<HTMLDivElement>(null);
  const compareButtonRef = useRef<HTMLAnchorElement>(null);
  const steps = [
    { number: "01", title: t(locale, "onboardingStep1Title"), text: t(locale, "onboardingStep1Text") },
    { number: "02", title: t(locale, "onboardingStep2Title"), text: t(locale, "onboardingStep2Text") },
    { number: "03", title: t(locale, "onboardingStep3Title"), text: t(locale, "onboardingStep3Text") },
  ];
  const tourStorageKey = "aran-home-tour-seen";
  const tourTargets = useMemo(() => [startButtonRef, hintCardRef, compareButtonRef] as const, []);
  const tourContent = [
    { title: t(locale, "tourStep1Title"), text: t(locale, "tourStep1Text") },
    { title: t(locale, "tourStep2Title"), text: t(locale, "tourStep2Text") },
    { title: t(locale, "tourStep3Title"), text: t(locale, "tourStep3Text") },
  ];

  useEffect(() => {
    const seen = window.localStorage.getItem(tourStorageKey);
    if (!seen) setShowTour(true);
  }, []);

  function closeTour() {
    window.localStorage.setItem(tourStorageKey, "1");
    setShowTour(false);
    setTourStep(0);
  }

  function getTooltipStyle(targetRef: RefObject<HTMLElement | null>) {
    const rect = targetRef.current?.getBoundingClientRect();
    if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } as const;

    const width = Math.min(360, window.innerWidth - 32);
    const prefersBelow = rect.bottom + 220 < window.innerHeight;
    const top = prefersBelow ? rect.bottom + 16 : Math.max(16, rect.top - 196);
    const left = Math.min(Math.max(16, rect.left), window.innerWidth - width - 16);

    return { top, left, width } as const;
  }

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">A.R.K.A.N.T.A. • Tailored PC Rig Advisor</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">{t(locale, "heroTitle")}</h1>
            <p className="max-w-2xl text-base text-zinc-400 md:text-lg">{t(locale, "heroDescription")}</p>
          </div>
          <Card
            ref={hintCardRef}
            className={cn(
              "border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 p-4",
              showTour && tourStep === 1 && "relative z-[60] border-cyan-300/50 shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_20px_60px_rgba(34,211,238,0.18)]",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{t(locale, "heroHintTitle")}</p>
                <p className="mt-2 max-w-xl text-sm text-zinc-300">{t(locale, "heroHintText")}</p>
              </div>
              <div className="hidden h-10 w-10 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 lg:block" />
            </div>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button
              ref={startButtonRef}
              className={cn(
                "px-5 py-3 text-base",
                showTour && tourStep === 0 && "relative z-[60] border-cyan-300/60 shadow-[0_0_0_1px_rgba(34,211,238,0.45),0_20px_60px_rgba(34,211,238,0.22)]",
              )}
              onClick={() => setShowOnboarding(true)}
            >
              {t(locale, "ctaStart")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link
              href="/compare"
              ref={compareButtonRef}
              className={cn(showTour && tourStep === 2 && "relative z-[60] rounded-2xl border-cyan-300/60 shadow-[0_0_0_1px_rgba(34,211,238,0.45),0_20px_60px_rgba(34,211,238,0.22)]")}
            >
              <Button className="border-white/10 bg-white/5 text-white hover:bg-white/10">{t(locale, "ctaCompare")}</Button>
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[t(locale, "heroFeature1"), t(locale, "heroFeature2"), t(locale, "heroFeature3")].map((item) => (
              <Card key={item} className="p-4">
                <p className="text-sm text-zinc-200">{item}</p>
              </Card>
            ))}
          </div>
        </div>
        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-cyan-400/20 via-blue-500/15 to-emerald-400/15 blur-2xl" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div>
                <p className="text-sm text-zinc-300">{t(locale, "psuSafety")}</p>
                <p className="text-xl font-semibold text-emerald-300">{t(locale, "high")}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-300" />
            </div>
            <Card className="border-white/5 bg-surface-900/80">
              <p className="text-sm text-zinc-300">{t(locale, "tradeoffCard")}</p>
              <p className="mt-2 text-sm text-zinc-400">{t(locale, "tradeoffExample")}</p>
            </Card>
            <Card className="border-white/5 bg-surface-900/80">
              <div className="flex items-center gap-3">
                <Workflow className="h-5 w-5 text-cyan-300" />
                <p className="text-sm text-zinc-300">{t(locale, "rakitiqFlow")}</p>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{t(locale, "flowText")}</p>
            </Card>
          </div>
        </Card>
      </section>

      {showOnboarding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 p-4 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setShowOnboarding(false)} />
          <Card className="relative w-full max-w-4xl overflow-hidden border-cyan-400/20 bg-surface-900/95 p-0">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-white/10 bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-emerald-400/10 p-6 lg:border-b-0 lg:border-r">
                <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">{t(locale, "onboardingBadge")}</Badge>
                <h3 className="mt-4 text-3xl font-semibold text-white">{t(locale, "onboardingTitle")}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{t(locale, "onboardingDescription")}</p>
                <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-surface-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{t(locale, "heroHintTitle")}</p>
                  <p className="mt-2 text-sm text-zinc-400">{t(locale, "heroHintText")}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.number} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                          {step.number}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{step.title}</p>
                          <p className="mt-1 text-sm text-zinc-400">{step.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/builder">
                    <Button className="px-5 py-3 text-base">
                      {t(locale, "onboardingPrimary")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setShowOnboarding(false)}>
                    {t(locale, "onboardingSecondary")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {showTour ? (
        <>
          <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px]" />
          <div className="fixed z-[70] rounded-3xl border border-cyan-300/40 bg-surface-900/95 p-5 shadow-2xl" style={getTooltipStyle(tourTargets[tourStep])}>
            <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">Tutorial</Badge>
            <h3 className="mt-3 text-xl font-semibold text-white">{tourContent[tourStep].title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{tourContent[tourStep].text}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={closeTour} className="text-sm text-zinc-400 transition hover:text-white">
                {t(locale, "tourSkip")}
              </button>
              <div className="flex items-center gap-2">
                <Button className="border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={tourStep === 0} onClick={() => setTourStep((value) => Math.max(0, value - 1))}>
                  {t(locale, "tourBack")}
                </Button>
                <Button
                  onClick={() => {
                    if (tourStep === tourContent.length - 1) {
                      closeTour();
                      return;
                    }
                    setTourStep((value) => value + 1);
                  }}
                >
                  {tourStep === tourContent.length - 1 ? t(locale, "tourDone") : t(locale, "tourNext")}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
