"use client";

import { FeatureSection } from "@/components/landing/features";
import { HeroSection } from "@/components/landing/hero";

export default function HomePage() {
  return (
    <div className="space-y-20">
      <HeroSection />
      <FeatureSection />
    </div>
  );
}
