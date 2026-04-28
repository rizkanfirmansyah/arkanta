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
import type { PromptLocale } from "./prompts";
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

export function createLocalDiagnosis(input: UserIntake, locale: PromptLocale = "en"): DiagnosisResult {
  const isId = locale === "id";
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
    input.frequentOutage
      ? isId
        ? "Listrik rumah sering mati sehingga proteksi daya menjadi prioritas."
        : "Frequent outages make power protection a top priority."
      : null,
    input.mcbTripsOften
      ? isId
        ? "MCB sering jeglek, jadi konsumsi daya puncak harus dijaga."
        : "Frequent MCB trips mean peak power draw must be controlled."
      : null,
    input.hotRoom
      ? isId
        ? "Ruangan panas meningkatkan kebutuhan airflow dan cooler yang lebih baik."
        : "A hot room increases the need for stronger airflow and cooling."
      : null,
    input.silentPreference
      ? isId
        ? "Keinginan PC senyap membatasi pilihan cooler, case, dan GPU."
        : "A silent PC preference limits cooler, case, and GPU choices."
      : null,
  ].filter(Boolean) as string[];

  return {
    summary:
      electricityRisk === "high"
        ? isId
          ? "Kebutuhan kamu mengarah ke build yang tetap responsif tetapi lebih aman untuk kondisi listrik rumah yang tidak stabil."
          : "Your profile points to a build that stays responsive while prioritizing safety under unstable home electricity."
        : isId
          ? "Kebutuhan kamu cocok untuk build modern yang disesuaikan dengan performa, efisiensi, dan jalur upgrade."
          : "Your profile fits a modern build tuned for performance, efficiency, and practical upgrade path.",
    mainNeeds: input.mainNeeds.map((need) => need.replace("_", "/")),
    detectedProblems: problems.length
      ? problems
      : [isId ? "Tidak ada masalah besar, fokus bisa ke value dan performa." : "No major blocker detected, so the focus can stay on value and performance."],
    riskProfile: { electricityRisk, thermalRisk, workloadRisk, upgradeNeed },
    strategy: {
      mode: strategy,
      reason:
        strategy === "safety_first"
          ? isId
            ? "Risiko listrik tinggi, jadi PSU berkualitas, headroom sehat, dan UPS lebih penting daripada memaksimalkan GPU."
            : "Electricity risk is high, so PSU quality, healthy headroom, and UPS matter more than maximizing GPU tier."
          : strategy === "creator_first"
            ? isId
              ? "Workload creator atau AI butuh CPU/GPU yang stabil, RAM lebih lega, dan storage cepat."
              : "Creator and AI workloads need stable CPU/GPU performance, more RAM headroom, and faster storage."
            : strategy === "low_power"
              ? isId
                ? "Daya rumah atau prioritas hemat listrik mendorong build efisien dan mudah di-upgrade."
                : "House power limits or low-power priority favor an efficient and easy-to-upgrade build."
              : strategy === "value_first"
                ? isId
                  ? "Kebutuhan lebih cocok dikejar lewat rasio performa per rupiah."
                  : "Your needs are best met by maximizing performance-per-cost."
                : isId
                  ? "Keseimbangan performa, keamanan, dan upgrade masih menjadi pendekatan terbaik."
                  : "A balanced approach across performance, safety, and upgrade path remains the best fit.",
      componentPriorities: [
        electricityRisk !== "low"
          ? isId
            ? "PSU berkualitas dengan proteksi lengkap"
            : "Quality PSU with complete protections"
          : isId
            ? "GPU sesuai target resolusi"
            : "GPU matched to target resolution",
        workloadRisk !== "low"
          ? isId
            ? "RAM dan storage yang cukup untuk workload berat"
            : "Sufficient RAM and storage for heavy workloads"
          : isId
            ? "CPU seimbang"
            : "Balanced CPU choice",
        thermalRisk !== "low"
          ? isId
            ? "Case airflow dan cooler memadai"
            : "Adequate case airflow and cooling"
          : isId
            ? "Jalur upgrade realistis"
            : "Realistic upgrade path",
      ],
    },
    questionsToConsider: [
      isId
        ? "Apakah monitor target sudah ada atau masih masuk budget?"
        : "Do you already have the target monitor, or should it be included in budget planning?",
      isId
        ? "Apakah data kerja penting sehingga UPS wajib untuk shutdown aman?"
        : "Is your work data critical enough that a UPS should be mandatory for safe shutdown?",
      isId
        ? "Apakah software utama lebih diuntungkan oleh CUDA atau cukup dengan Radeon?"
        : "Does your main software benefit more from CUDA, or is Radeon sufficient?",
    ],
    warnings: [
      electricityRisk !== "low"
        ? isId
          ? "Sertifikasi 80+ adalah efisiensi, bukan satu-satunya indikator kualitas PSU. Lihat proteksi dan reputasi unit juga."
          : "80+ certification indicates efficiency, not full PSU quality. Always check protections and model reputation."
        : isId
          ? "Pastikan budget tidak habis di satu komponen hingga build menjadi tidak seimbang."
          : "Avoid spending too much on a single part and making the build imbalanced.",
      thermalRisk === "high"
        ? isId
          ? "Ruangan panas perlu airflow casing dan fan layout yang lebih serius."
          : "A hot room requires stronger case airflow and fan layout planning."
        : isId
          ? "Pastikan upgrade path tetap realistis sesuai platform."
          : "Keep the upgrade path realistic for the chosen platform.",
    ],
  };
}

export function analyzeChangeLocally(
  oldBuild: RecommendedBuild,
  newBuild: RecommendedBuild,
  diagnosis: DiagnosisResult,
  locale: PromptLocale = "en",
): ChangeAnalysis {
  const isId = locale === "id";
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
    summary: recommendation === "dangerous"
      ? isId
        ? "Perubahan ini menurunkan margin keamanan build."
        : "This change reduces the build's safety margin."
      : isId
        ? "Perubahan berhasil dianalisis dari sisi harga, performa, dan risiko."
        : "The change has been analyzed across price, performance, and risk.",
    recommendation,
    positiveImpacts: [
      newPrice < oldPrice
        ? isId
          ? "Harga build turun sehingga budget lebih longgar."
          : "Build cost decreases, so the budget is more flexible."
        : isId
          ? "Komponen baru berpotensi meningkatkan kenyamanan pemakaian."
          : "The new component can improve day-to-day usability.",
      newWatt <= oldWatt
        ? isId
          ? "Konsumsi daya tidak bertambah agresif."
          : "Power consumption does not increase aggressively."
        : isId
          ? "Performa atau kapasitas build meningkat."
          : "Build performance or capacity is improved.",
    ],
    negativeImpacts: [
      newPrice > oldPrice
        ? isId
          ? "Biaya total build naik."
          : "Total build cost increases."
        : isId
          ? "Penghematan bisa memunculkan trade-off di fitur atau headroom."
          : "Savings may introduce trade-offs in features or headroom.",
      newWatt > oldWatt
        ? isId
          ? "Daya puncak build meningkat dan perlu dicek terhadap PSU dan listrik rumah."
          : "Peak power draw increases and should be checked against PSU and house power."
        : isId
          ? "Potensi performa mentok jika komponen turun kelas."
          : "Performance potential can be limited if the component tier is reduced.",
    ],
    priceImpact: {
      oldPrice,
      newPrice,
      difference: newPrice - oldPrice,
      explanation: newPrice > oldPrice
        ? isId
          ? "Perubahan menambah biaya demi performa atau fitur."
          : "The change increases cost in exchange for performance or features."
        : isId
          ? "Perubahan menekan budget tetapi perlu dilihat efek sampingnya."
          : "The change reduces budget pressure but side effects should be reviewed.",
    },
    performanceImpact: newWatt > oldWatt
      ? isId
        ? "Secara umum build baru lebih agresif dan berpotensi lebih kencang."
        : "Overall, the new build is more aggressive and can deliver higher performance."
      : isId
        ? "Tidak ada lonjakan performa besar, fokus lebih ke efisiensi atau value."
        : "No major performance jump; the change leans toward efficiency or value.",
    powerImpact: isId
      ? `Estimasi daya berubah dari ${oldWatt}W menjadi ${newWatt}W.`
      : `Estimated power changes from ${oldWatt}W to ${newWatt}W.`,
    safetyImpact:
      recommendation === "dangerous"
        ? isId
          ? "Tidak disarankan karena kondisi listrik user berisiko dan PSU/build baru menurunkan margin keamanan."
          : "Not recommended because electricity conditions are risky and the new PSU/build lowers safety margin."
        : isId
          ? "Masih aman selama headroom PSU, proteksi, dan airflow tetap dijaga."
          : "Still safe as long as PSU headroom, protections, and airflow remain adequate.",
    compatibilityWarnings: warnings,
    finalAdvice:
      recommendation === "dangerous"
        ? isId
          ? "Lebih aman pertahankan PSU berkualitas lebih tinggi atau upgrade UPS lebih dulu."
          : "Safer option is to keep a higher-quality PSU or upgrade UPS first."
        : recommendation === "not_recommended"
          ? isId
            ? "Perubahan bisa dipakai, tetapi ada mismatch yang sebaiknya diperbaiki dulu."
            : "The change is usable, but mismatches should be fixed first."
          : isId
            ? "Perubahan masih masuk akal untuk kebutuhan user saat ini."
            : "The change is reasonable for current needs.",
  };
}
