import { mockComponents } from "@/data/components";
import {
  BuildScores,
  ChangeAnalysis,
  ComponentCategory,
  ComponentItem,
  DiagnosisResult,
  RecommendedBuild,
  RiskLevel,
  UserIntake,
} from "@/types";
import { clamp } from "./utils";
import { validateBuildCompatibility } from "./compatibility";

const componentMap = new Map(mockComponents.map((item) => [item.id, item]));

function getBuildItems(build: RecommendedBuild) {
  return (Object.keys(build.components) as ComponentCategory[])
    .map((key) => componentMap.get(build.components[key].id))
    .filter(Boolean) as ComponentItem[];
}

export function calculateBuildPrice(build: RecommendedBuild) {
  return Object.values(build.components).reduce((sum, part) => sum + (part?.price ?? 0), 0);
}

export function estimateBuildWattage(build: RecommendedBuild) {
  return getBuildItems(build).reduce((sum, item) => sum + (item.wattage ?? 0), 60);
}

export function calculateScores(build: RecommendedBuild, intake?: UserIntake, diagnosis?: DiagnosisResult): BuildScores {
  const items = getBuildItems(build);
  const cpu = componentMap.get(build.components.cpu.id);
  const gpu = componentMap.get(build.components.gpu.id);
  const psu = componentMap.get(build.components.psu.id);
  const ram = componentMap.get(build.components.ram.id);
  const wattage = estimateBuildWattage(build);
  const price = calculateBuildPrice(build);
  const budget = intake?.budget ?? price;

  const gamingBase = (gpu?.wattage ?? 100) / 3 + (cpu?.specs.cores ?? 4) * 4;
  const editingBase = (cpu?.specs.threads ?? 8) * 2 + (ram?.specs.capacity?.includes("64") ? 24 : ram?.specs.capacity?.includes("48") ? 18 : ram?.specs.capacity?.includes("32") ? 12 : 6);
  const valueBase = 100 - Math.max(0, ((price - budget) / Math.max(budget, 1)) * 35) + (build.type === "amd_value" ? 6 : 0);
  const safetyBase =
    (psu?.protections?.length ?? 0) * 10 +
    (psu?.efficiency === "80+ Gold" ? 12 : psu?.efficiency === "80+ Platinum" ? 16 : psu?.efficiency === "80+ Bronze" ? 6 : 0) -
    (diagnosis?.riskProfile.electricityRisk === "high" && !build.components.ups.id ? 18 : 0);
  const upgradeBase =
    (cpu?.specs.socket === "AM5" ? 18 : 8) +
    (psu?.wattage && psu.wattage >= wattage * 1.45 ? 18 : 8) +
    (ram?.specs.memoryType === "DDR5" ? 14 : 8);
  const powerBase = 90 - clamp((wattage / 7) * (intake?.housePower === "900VA" ? 0.6 : 0.35), 0, 55) + ((psu?.efficiency ?? "").includes("Gold") ? 8 : 0);

  return {
    gaming: clamp(Math.round(gamingBase)),
    editing: clamp(Math.round(editingBase)),
    value: clamp(Math.round(valueBase)),
    safety: clamp(Math.round(safetyBase)),
    upgrade: clamp(Math.round(upgradeBase)),
    powerEfficiency: clamp(Math.round(powerBase)),
  };
}

function riskLevelScore(level: RiskLevel) {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

export function createLocalDiagnosis(input: UserIntake): DiagnosisResult {
  const electricityScore =
    (input.frequentOutage ? 2 : 0) +
    (input.mcbTripsOften ? 2 : 0) +
    (input.housePower === "900VA" ? 2 : input.housePower === "1300VA" ? 1 : 0) +
    (!input.hasUps ? 1 : 0);
  const thermalScore = (input.hotRoom ? 2 : 0) + (input.silentPreference ? 1 : 0) + (input.usageHoursPerDay >= 10 ? 1 : 0);
  const workloadScore =
    (input.mainNeeds.includes("editing") ? 2 : 0) +
    (input.mainNeeds.includes("streaming") ? 1 : 0) +
    (input.mainNeeds.includes("ai_ml") ? 2 : 0) +
    (input.software.some((item) => /blender|premiere|after effects|llm|stable diffusion/i.test(item)) ? 2 : 0);
  const upgradeScore = (input.wantsUpgradeIn13Years ? 2 : 0) + (input.priorities.includes("future-proof") ? 2 : 0);

  const electricityRisk: RiskLevel = electricityScore >= 4 ? "high" : electricityScore >= 2 ? "medium" : "low";
  const thermalRisk: RiskLevel = thermalScore >= 3 ? "high" : thermalScore >= 2 ? "medium" : "low";
  const workloadRisk: RiskLevel = workloadScore >= 4 ? "high" : workloadScore >= 2 ? "medium" : "low";
  const upgradeNeed: RiskLevel = upgradeScore >= 3 ? "high" : upgradeScore >= 2 ? "medium" : "low";

  const strategy =
    electricityRisk === "high"
      ? "safety_first"
      : input.mainNeeds.includes("editing") || input.mainNeeds.includes("ai_ml")
        ? "creator_first"
        : input.priorities.includes("low power") || input.housePower === "900VA"
          ? "low_power"
          : input.priorities.includes("hemat")
            ? "value_first"
            : input.priorities.includes("performa")
              ? "performance_first"
              : "balanced";

  const problems = [
    input.frequentOutage ? "Listrik rumah sering mati sehingga proteksi daya menjadi prioritas." : null,
    input.mcbTripsOften ? "MCB sering jeglek, jadi konsumsi daya puncak harus dijaga." : null,
    input.hotRoom ? "Ruangan panas meningkatkan kebutuhan airflow dan cooler yang lebih baik." : null,
    input.silentPreference ? "Keinginan PC senyap membatasi pilihan cooler, case, dan GPU." : null,
  ].filter(Boolean) as string[];

  return {
    summary:
      electricityRisk === "high"
        ? "Kebutuhan kamu mengarah ke build yang tetap responsif tetapi lebih aman untuk kondisi listrik rumah yang tidak stabil."
        : "Kebutuhan kamu cocok untuk build modern yang disesuaikan dengan performa, efisiensi, dan jalur upgrade.",
    mainNeeds: input.mainNeeds.map((need) => need.replace("_", "/")),
    detectedProblems: problems.length ? problems : ["Tidak ada masalah besar, fokus bisa ke value dan performa."],
    riskProfile: { electricityRisk, thermalRisk, workloadRisk, upgradeNeed },
    strategy: {
      mode: strategy,
      reason:
        strategy === "safety_first"
          ? "Risiko listrik tinggi, jadi PSU berkualitas, headroom sehat, dan UPS lebih penting daripada memaksimalkan GPU."
          : strategy === "creator_first"
            ? "Workload creator atau AI butuh CPU/GPU yang stabil, RAM lebih lega, dan storage cepat."
            : strategy === "low_power"
              ? "Daya rumah atau prioritas hemat listrik mendorong build efisien dan mudah di-upgrade."
              : strategy === "value_first"
                ? "Kebutuhan lebih cocok dikejar lewat rasio performa per rupiah."
                : "Keseimbangan performa, keamanan, dan upgrade masih menjadi pendekatan terbaik.",
      componentPriorities: [
        electricityRisk !== "low" ? "PSU berkualitas dengan proteksi lengkap" : "GPU sesuai target resolusi",
        workloadRisk !== "low" ? "RAM dan storage yang cukup untuk workload berat" : "CPU seimbang",
        thermalRisk !== "low" ? "Case airflow dan cooler memadai" : "Jalur upgrade realistis",
      ],
    },
    questionsToConsider: [
      "Apakah monitor target sudah ada atau masih masuk budget?",
      "Apakah data kerja penting sehingga UPS wajib untuk shutdown aman?",
      "Apakah software utama lebih diuntungkan oleh CUDA atau cukup dengan Radeon?",
    ],
    warnings: [
      electricityRisk !== "low"
        ? "Sertifikasi 80+ adalah efisiensi, bukan satu-satunya indikator kualitas PSU. Lihat proteksi dan reputasi unit juga."
        : "Pastikan budget tidak habis di satu komponen hingga build menjadi tidak seimbang.",
      thermalRisk === "high" ? "Ruangan panas perlu airflow casing dan fan layout yang lebih serius." : "Pastikan upgrade path tetap realistis sesuai platform.",
    ],
  };
}

export function analyzeChangeLocally(oldBuild: RecommendedBuild, newBuild: RecommendedBuild, diagnosis: DiagnosisResult): ChangeAnalysis {
  const oldPrice = calculateBuildPrice(oldBuild);
  const newPrice = calculateBuildPrice(newBuild);
  const oldWatt = estimateBuildWattage(oldBuild);
  const newWatt = estimateBuildWattage(newBuild);
  const warnings = validateBuildCompatibility(newBuild, mockComponents);
  const oldPsu = componentMap.get(oldBuild.components.psu.id);
  const newPsu = componentMap.get(newBuild.components.psu.id);

  const recommendation =
    diagnosis.riskProfile.electricityRisk === "high" &&
    newPsu &&
    oldPsu &&
    (newPsu.wattage ?? 0) < (oldPsu.wattage ?? 0) &&
    (newPsu.protections?.length ?? 0) < (oldPsu.protections?.length ?? 0)
      ? "dangerous"
      : warnings.length
        ? "not_recommended"
        : newPrice <= oldPrice
          ? "recommended"
          : "acceptable";

  return {
    summary: recommendation === "dangerous" ? "Perubahan ini menurunkan margin keamanan build." : "Perubahan berhasil dianalisis dari sisi harga, performa, dan risiko.",
    recommendation,
    positiveImpacts: [
      newPrice < oldPrice ? "Harga build turun sehingga budget lebih longgar." : "Komponen baru berpotensi meningkatkan kenyamanan pemakaian.",
      newWatt <= oldWatt ? "Konsumsi daya tidak bertambah agresif." : "Performa atau kapasitas build meningkat.",
    ],
    negativeImpacts: [
      newPrice > oldPrice ? "Biaya total build naik." : "Penghematan bisa memunculkan trade-off di fitur atau headroom.",
      newWatt > oldWatt ? "Daya puncak build meningkat dan perlu dicek terhadap PSU dan listrik rumah." : "Potensi performa mentok jika komponen turun kelas.",
    ],
    priceImpact: {
      oldPrice,
      newPrice,
      difference: newPrice - oldPrice,
      explanation: newPrice > oldPrice ? "Perubahan menambah biaya demi performa atau fitur." : "Perubahan menekan budget tetapi perlu dilihat efek sampingnya.",
    },
    performanceImpact: newWatt > oldWatt ? "Secara umum build baru lebih agresif dan berpotensi lebih kencang." : "Tidak ada lonjakan performa besar, fokus lebih ke efisiensi atau value.",
    powerImpact: `Estimasi daya berubah dari ${oldWatt}W menjadi ${newWatt}W.`,
    safetyImpact:
      recommendation === "dangerous"
        ? "Tidak disarankan karena kondisi listrik user berisiko dan PSU/build baru menurunkan margin keamanan."
        : "Masih aman selama headroom PSU, proteksi, dan airflow tetap dijaga.",
    compatibilityWarnings: warnings,
    finalAdvice:
      recommendation === "dangerous"
        ? "Lebih aman pertahankan PSU berkualitas lebih tinggi atau upgrade UPS lebih dulu."
        : recommendation === "not_recommended"
          ? "Perubahan bisa dipakai, tetapi ada mismatch yang sebaiknya diperbaiki dulu."
          : "Perubahan masih masuk akal untuk kebutuhan user saat ini.",
  };
}
