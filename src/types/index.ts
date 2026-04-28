export type RiskLevel = "low" | "medium" | "high";

export type StrategyMode =
  | "performance_first"
  | "value_first"
  | "safety_first"
  | "creator_first"
  | "low_power"
  | "balanced";

export type BuildType =
  | "intel_nvidia"
  | "amd_value"
  | "safety"
  | "creator"
  | "low_power"
  | "performance"
  | "balanced";

export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooler"
  | "ups";

export type PriorityOption =
  | "performa"
  | "hemat"
  | "awet"
  | "aman"
  | "future-proof"
  | "low power"
  | "aesthetic";

export type MainNeed =
  | "gaming"
  | "editing"
  | "office"
  | "streaming"
  | "coding"
  | "ai_ml"
  | "desain"
  | "sekolah_kuliah";

export interface ComponentSpecs {
  cores?: number;
  threads?: number;
  socket?: string;
  chipset?: string;
  memoryType?: string;
  memorySpeed?: string;
  vram?: string;
  capacity?: string;
  readSpeed?: string;
  writeSpeed?: string;
  fanCount?: number;
  radiatorSize?: string;
  noiseLevel?: string;
  outputCapacityVA?: number;
  runtimeMinutes?: number;
  notes?: string;
}

export interface ComponentCompatibility {
  socket?: string[];
  memoryType?: string[];
  cpuBrands?: string[];
  gpuLengthMm?: number;
  maxCoolerHeightMm?: number;
  maxPsuWattage?: number;
  recommendedGpuTdp?: number;
  usageFocus?: string[];
}

export interface ComponentItem {
  id: string;
  name: string;
  category: ComponentCategory;
  brand: string;
  price: number;
  imageUrl: string;
  specs: ComponentSpecs;
  compatibility: ComponentCompatibility;
  wattage?: number;
  efficiency?: "80+ Bronze" | "80+ Silver" | "80+ Gold" | "80+ Platinum";
  protections?: string[];
  recommendedFor: string[];
  pros: string[];
  cons: string[];
}

export interface UserIntake {
  budget: number;
  mainNeeds: MainNeed[];
  software: string[];
  targetResolution: "1080p" | "1440p" | "4K";
  brandPreference: string[];
  usageHoursPerDay: number;
  frequentOutage: boolean;
  mcbTripsOften: boolean;
  housePower: "900VA" | "1300VA" | "2200VA" | "3500VA+";
  hasUps: boolean;
  hotRoom: boolean;
  silentPreference: boolean;
  wantsUpgradeIn13Years: boolean;
  priorities: PriorityOption[];
}

export interface DiagnosisResult {
  summary: string;
  mainNeeds: string[];
  detectedProblems: string[];
  riskProfile: {
    electricityRisk: RiskLevel;
    thermalRisk: RiskLevel;
    workloadRisk: RiskLevel;
    upgradeNeed: RiskLevel;
  };
  strategy: {
    mode: StrategyMode;
    reason: string;
    componentPriorities: string[];
  };
  questionsToConsider: string[];
  warnings: string[];
}

export interface BuildScores {
  gaming: number;
  editing: number;
  value: number;
  safety: number;
  upgrade: number;
  powerEfficiency: number;
}

export interface BuildComponentRef {
  id: string;
  name: string;
  price: number;
  optional?: boolean;
}

export interface RecommendedBuild {
  id: string;
  name: string;
  type: BuildType;
  targetUser: string;
  estimatedPrice: number;
  estimatedWattage: number;
  components: Record<ComponentCategory, BuildComponentRef>;
  scores: BuildScores;
  pros: string[];
  cons: string[];
  warnings: string[];
  upgradePath: string[];
  psuAdvice: {
    summary: string;
    recommendedEfficiency: "80+ Bronze" | "80+ Silver" | "80+ Gold" | "80+ Platinum";
    requiredProtections: string[];
    headroomReason: string;
    upsRecommended: boolean;
    upsReason: string;
  };
  aiSummary: string;
}

export interface BuildRecommendationResponse {
  recommendationSummary: string;
  builds: RecommendedBuild[];
  finalRecommendation: string;
}

export interface ChangeAnalysis {
  summary: string;
  recommendation: "recommended" | "acceptable" | "not_recommended" | "dangerous";
  positiveImpacts: string[];
  negativeImpacts: string[];
  priceImpact: {
    oldPrice: number;
    newPrice: number;
    difference: number;
    explanation: string;
  };
  performanceImpact: string;
  powerImpact: string;
  safetyImpact: string;
  compatibilityWarnings: string[];
  finalAdvice: string;
}

export interface RecommendationTemplate {
  id: string;
  name: string;
  description: string;
  strategy: StrategyMode;
  tags: string[];
}
