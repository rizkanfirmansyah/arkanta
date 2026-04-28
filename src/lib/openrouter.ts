import { mockComponents } from "@/data/components";
import {
  analyzeChangeLocally,
  calculateBuildPrice,
  calculateScores,
  createLocalDiagnosis,
  estimateBuildWattage,
} from "@/lib/scoring";
import {
  createChangeAnalysisSystemPrompt,
  createBuildRecommendationPrompt,
  createChangeAnalysisPrompt,
  createDiagnosisSystemPrompt,
  createDiagnosisPrompt,
  createRecommendationSystemPrompt,
  PromptLocale,
} from "@/lib/prompts";
import { safeJsonParse, slugify } from "@/lib/utils";
import {
  BuildRecommendationResponse,
  BuildScores,
  ChangeAnalysis,
  ComponentCategory,
  ComponentItem,
  DiagnosisResult,
  RecommendedBuild,
  StrategyMode,
  UserIntake,
} from "@/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const LOG_PREFIX = "[A.R.K.A.N.T.A. AI]";

function logInfo(scope: string, message: string) {
  console.info(`${LOG_PREFIX} [${scope}] ${message}`);
}

function logWarn(scope: string, message: string) {
  console.warn(`${LOG_PREFIX} [${scope}] ${message}`);
}

function supportsStructuredOutput(model: string) {
  const normalized = model.toLowerCase();

  if (normalized.endsWith(":free")) return false;
  if (normalized.startsWith("tencent/")) return false;

  return true;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": process.env.NEXT_PUBLIC_APP_NAME ?? "A.R.K.A.N.T.A.",
  };
}

function getById(id: string) {
  return mockComponents.find((item) => item.id === id);
}

function buildRef(id: string) {
  const item = getById(id);
  return {
    id,
    name: item?.name ?? id,
    price: item?.price ?? 0,
  };
}

function pickAlternativeMode(strategy: StrategyMode) {
  if (strategy === "safety_first") return "safety";
  if (strategy === "creator_first") return "creator";
  if (strategy === "low_power") return "low_power";
  if (strategy === "performance_first") return "performance";
  return "balanced";
}

function hasValidScores(scores: unknown): scores is BuildScores {
  if (!scores || typeof scores !== "object") return false;
  const candidate = scores as Record<string, unknown>;
  return ["gaming", "editing", "value", "safety", "upgrade", "powerEfficiency"].every(
    (key) => typeof candidate[key] === "number",
  );
}

function isRecommendedBuildShape(build: unknown): build is RecommendedBuild {
  if (!build || typeof build !== "object") return false;
  const candidate = build as Partial<RecommendedBuild>;
  const components = candidate.components as Record<string, unknown> | undefined;

  return Boolean(
    typeof candidate.id === "string" &&
      typeof candidate.name === "string" &&
      typeof candidate.type === "string" &&
      components &&
      typeof components.cpu === "object" &&
      typeof components.gpu === "object" &&
      typeof components.motherboard === "object" &&
      typeof components.ram === "object" &&
      typeof components.storage === "object" &&
      typeof components.psu === "object" &&
      typeof components.case === "object" &&
      typeof components.cooler === "object" &&
      typeof components.ups === "object" &&
      hasValidScores(candidate.scores),
  );
}

function normalizeBuildRecommendationResponse(
  parsed: BuildRecommendationResponse,
  fallback: BuildRecommendationResponse,
  input: UserIntake,
  diagnosis: DiagnosisResult,
) {
  const incomingBuilds = Array.isArray(parsed.builds) ? parsed.builds.filter(isRecommendedBuildShape) : [];

  if (!incomingBuilds.length) {
    logWarn("recommend-builds", "Payload rekomendasi AI tidak memiliki daftar build valid. System fallback build dipakai penuh.");
    return fallback;
  }

  return {
    recommendationSummary: typeof parsed.recommendationSummary === "string" ? parsed.recommendationSummary : fallback.recommendationSummary,
    finalRecommendation: typeof parsed.finalRecommendation === "string" ? parsed.finalRecommendation : fallback.finalRecommendation,
    builds: incomingBuilds.map((build) => ({
      ...build,
      estimatedPrice: build.estimatedPrice || calculateBuildPrice(build),
      estimatedWattage: build.estimatedWattage || estimateBuildWattage(build),
      scores: hasValidScores(build.scores) ? build.scores : calculateScores(build, input, diagnosis),
    })),
  };
}

function createLocalBuilds(input: UserIntake, diagnosis: DiagnosisResult, locale: PromptLocale): BuildRecommendationResponse {
  const isId = locale === "id";
  const buildSkeletons: RecommendedBuild[] = [
    {
      id: slugify("Intel NVIDIA Balanced"),
      name: "Intel/NVIDIA Balanced",
      type: "intel_nvidia",
      targetUser: isId
        ? "User yang ingin build seimbang untuk gaming, kerja, dan software NVIDIA-friendly."
        : "Users who want a balanced build for gaming, productivity, and NVIDIA-friendly software.",
      estimatedPrice: 0,
      estimatedWattage: 0,
      components: {
        cpu: buildRef(input.budget > 18000000 ? "cpu-i5-14600k" : "cpu-i5-14400f"),
        gpu: buildRef(input.targetResolution === "1440p" || input.mainNeeds.includes("editing") ? "gpu-rtx4060ti" : "gpu-rtx4060"),
        motherboard: buildRef(input.budget > 16000000 ? "mb-b760m-a" : "mb-b760m-budget"),
        ram: buildRef(input.mainNeeds.includes("editing") || input.wantsUpgradeIn13Years ? "ram-ddr5-32-budget" : "ram-ddr4-16"),
        storage: buildRef(input.mainNeeds.includes("editing") ? "ssd-gen4-2tb" : "ssd-gen4-1tb"),
        psu: buildRef(diagnosis.riskProfile.electricityRisk !== "low" ? "psu-650-gold" : "psu-650-bronze"),
        case: buildRef(input.hotRoom ? "case-air-1" : input.silentPreference ? "case-silent-1" : "case-budget"),
        cooler: buildRef(input.budget > 16000000 ? "cooler-pa120" : "cooler-ak400"),
        ups: buildRef(diagnosis.riskProfile.electricityRisk === "high" ? "ups-1500va" : "ups-650va"),
      },
      scores: { gaming: 0, editing: 0, value: 0, safety: 0, upgrade: 0, powerEfficiency: 0 },
      pros: isId
        ? ["Mudah diseimbangkan", "Cocok untuk software berbasis CUDA/encoder NVIDIA"]
        : ["Easy to balance", "Great fit for CUDA and NVIDIA encoder software"],
      cons: isId
        ? ["Value mentah tidak setinggi opsi AMD", "Platform Intel ini bukan yang paling panjang upgrade-nya"]
        : ["Raw value is lower than AMD option", "This Intel platform is not the longest-term upgrade path"],
      warnings: [],
      upgradePath: isId
        ? ["Upgrade RAM ke 32GB jika editing makin berat", "Naik ke RTX 4070 jika budget dan listrik memungkinkan"]
        : ["Upgrade to 32GB RAM if editing gets heavier", "Move to RTX 4070 if budget and power conditions allow"],
      psuAdvice: {
        summary: isId
          ? "PSU dipilih bukan hanya dari watt, tetapi juga proteksi dan efisiensi untuk menjaga stabilitas build."
          : "PSU is selected not by wattage alone, but also by protections and efficiency to keep the build stable.",
        recommendedEfficiency: diagnosis.riskProfile.electricityRisk === "low" ? "80+ Bronze" : "80+ Gold",
        requiredProtections: ["OVP", "UVP", "OCP", "OPP", "SCP", "OTP"],
        headroomReason: isId
          ? "Headroom dijaga agar GPU boost dan lonjakan beban tetap aman."
          : "Headroom is maintained so GPU boost and transient loads remain safe.",
        upsRecommended: diagnosis.riskProfile.electricityRisk !== "low",
        upsReason:
          diagnosis.riskProfile.electricityRisk !== "low"
            ? isId
              ? "Listrik rumah berisiko, UPS membantu shutdown aman."
              : "Home electricity risk is elevated, so UPS helps safe shutdown."
            : isId
              ? "UPS opsional untuk proteksi data."
              : "UPS is optional for additional data protection.",
      },
      aiSummary: isId
        ? "Build ini fokus ke keseimbangan performa, software compatibility, dan stabilitas harian."
        : "This build focuses on balancing performance, software compatibility, and daily stability.",
    },
    {
      id: slugify("AMD Value"),
      name: "AMD Value Build",
      type: "amd_value",
      targetUser: isId
        ? "User yang mengejar rasio performa per rupiah, terutama untuk gaming."
        : "Users who target strong performance-per-cost, especially for gaming.",
      estimatedPrice: 0,
      estimatedWattage: 0,
      components: {
        cpu: buildRef(input.budget > 17000000 ? "cpu-r7-7700" : "cpu-r5-7600"),
        gpu: buildRef(input.targetResolution === "1440p" ? "gpu-rx7700xt" : "gpu-rx7600"),
        motherboard: buildRef(input.budget > 14000000 ? "mb-b650m" : "mb-b650-budget"),
        ram: buildRef("ram-ddr5-32"),
        storage: buildRef(input.budget > 15000000 ? "ssd-gen4-2tb-value" : "ssd-gen4-1tb"),
        psu: buildRef(diagnosis.riskProfile.electricityRisk === "high" ? "psu-750-gold" : "psu-650-bronze"),
        case: buildRef(input.hotRoom ? "case-air-2" : "case-air-1"),
        cooler: buildRef(input.budget > 15000000 ? "cooler-pa120" : "cooler-ak400"),
        ups: buildRef(diagnosis.riskProfile.electricityRisk !== "low" ? "ups-1500va" : "ups-650va"),
      },
      scores: { gaming: 0, editing: 0, value: 0, safety: 0, upgrade: 0, powerEfficiency: 0 },
      pros: isId
        ? ["Value gaming sangat kuat", "Platform AM5 lebih panjang untuk upgrade"]
        : ["Excellent gaming value", "AM5 offers a longer upgrade runway"],
      cons: isId
        ? ["Creator app tertentu lebih nyaman di NVIDIA", "GPU Radeon bisa lebih boros"]
        : ["Some creator apps are smoother on NVIDIA", "Mid-tier Radeon options may be less power efficient"],
      warnings: [],
      upgradePath: isId
        ? ["Naik GPU ke RX 7800 XT jika daya rumah aman", "Tambah storage 2TB untuk library besar"]
        : ["Upgrade to RX 7800 XT if house power is safe", "Add 2TB storage for large libraries"],
      psuAdvice: {
        summary: isId
          ? "Walau fokus value, PSU tetap tidak boleh dipilih asal murah."
          : "Even in a value-focused build, PSU should never be selected purely by low price.",
        recommendedEfficiency: diagnosis.riskProfile.electricityRisk === "high" ? "80+ Gold" : "80+ Bronze",
        requiredProtections: ["OVP", "UVP", "OCP", "OPP", "SCP", "OTP"],
        headroomReason: isId
          ? "GPU Radeon kelas menengah masih butuh margin daya yang sehat."
          : "Mid-range Radeon GPUs still need healthy power margin.",
        upsRecommended: diagnosis.riskProfile.electricityRisk !== "low",
        upsReason: isId
          ? "Jika listrik sering mati, UPS lebih berguna daripada memaksakan upgrade GPU kecil."
          : "If outages are frequent, UPS is usually more useful than forcing a minor GPU upgrade.",
      },
      aiSummary: isId
        ? "Pilihan ini cocok jika fokus utama adalah gaming value dan upgrade platform jangka menengah."
        : "This option fits users focused on gaming value and a mid-term platform upgrade path.",
    },
    {
      id: slugify("Alternative Context Build"),
      name:
        diagnosis.strategy.mode === "safety_first"
          ? "Safety Build"
          : diagnosis.strategy.mode === "creator_first"
            ? "Creator Build"
            : diagnosis.strategy.mode === "low_power"
              ? "Low Power Build"
              : "Alternative Balanced Build",
      type: pickAlternativeMode(diagnosis.strategy.mode),
      targetUser: isId
        ? "Disesuaikan dengan konteks risiko, workload, dan rencana upgrade user."
        : "Tailored to the user's risk profile, workload, and upgrade plan.",
      estimatedPrice: 0,
      estimatedWattage: 0,
      components: {
        cpu: buildRef(
          diagnosis.strategy.mode === "low_power"
            ? "cpu-r5-8600g"
            : diagnosis.strategy.mode === "creator_first"
              ? "cpu-i7-14700"
              : "cpu-r7-7700",
        ),
        gpu: buildRef(
          diagnosis.strategy.mode === "low_power"
            ? "gpu-rtx4060"
            : diagnosis.strategy.mode === "creator_first"
              ? "gpu-rtx4070"
              : "gpu-rtx4060",
        ),
        motherboard: buildRef(
          diagnosis.strategy.mode === "creator_first"
            ? "mb-z790"
            : diagnosis.strategy.mode === "low_power"
              ? "mb-a620m"
              : "mb-b650m",
        ),
        ram: buildRef(
          diagnosis.strategy.mode === "creator_first"
            ? "ram-ddr5-48"
            : diagnosis.strategy.mode === "low_power"
              ? "ram-ddr5-32-budget"
              : "ram-ddr5-32",
        ),
        storage: buildRef(diagnosis.strategy.mode === "creator_first" ? "ssd-gen4-2tb" : "ssd-gen4-1tb-value"),
        psu: buildRef(
          diagnosis.strategy.mode === "creator_first"
            ? "psu-750-gold"
            : diagnosis.strategy.mode === "low_power"
              ? "psu-650-gold"
              : diagnosis.riskProfile.electricityRisk === "high"
                ? "psu-750-gold"
                : "psu-650-gold",
        ),
        case: buildRef(input.hotRoom ? "case-air-2" : input.silentPreference ? "case-silent-1" : "case-premium"),
        cooler: buildRef(
          diagnosis.strategy.mode === "creator_first"
            ? "cooler-ak620"
            : diagnosis.strategy.mode === "low_power"
              ? "cooler-nh-u12s"
              : "cooler-pa120",
        ),
        ups: buildRef(diagnosis.riskProfile.electricityRisk === "high" ? "ups-1500va" : "ups-1200va"),
      },
      scores: { gaming: 0, editing: 0, value: 0, safety: 0, upgrade: 0, powerEfficiency: 0 },
      pros: isId
        ? ["Lebih spesifik ke konteks penggunaan", "Trade-off dijaga lebih jelas"]
        : ["More context-aware", "Trade-offs are managed more explicitly"],
      cons: isId
        ? ["Bisa mengorbankan value murni", "Konfigurasi lebih konservatif untuk alasan keamanan"]
        : ["May sacrifice raw value", "Configuration is more conservative for safety reasons"],
      warnings: [],
      upgradePath: isId
        ? ["Tambah UPS kapasitas lebih besar untuk kerja penting", "Naik storage kedua untuk backup dan project"]
        : ["Use a higher-capacity UPS for critical work", "Add a secondary drive for backup and project files"],
      psuAdvice: {
        summary: isId
          ? "Build alternatif ini lebih konservatif terhadap headroom dan kualitas PSU."
          : "This alternative build is more conservative on PSU headroom and quality.",
        recommendedEfficiency: diagnosis.riskProfile.electricityRisk === "high" || diagnosis.strategy.mode === "creator_first" ? "80+ Gold" : "80+ Bronze",
        requiredProtections: ["OVP", "UVP", "OCP", "OPP", "SCP", "OTP"],
        headroomReason: isId
          ? "Margin daya dipakai untuk menjaga kestabilan saat workload berat atau listrik kurang stabil."
          : "Power margin is reserved to keep stability during heavy workloads or unstable electricity.",
        upsRecommended: diagnosis.riskProfile.electricityRisk !== "low" || diagnosis.strategy.mode === "creator_first",
        upsReason: isId
          ? "UPS penting untuk proteksi data dan shutdown aman pada workload penting."
          : "UPS is important for data protection and safe shutdown during critical workloads.",
      },
      aiSummary: isId
        ? "Build ketiga mengambil pendekatan lebih spesifik terhadap konteks risiko dan prioritas user."
        : "The third build takes a more context-specific approach to risk and user priorities.",
    },
  ];

  const builds = buildSkeletons.map((build) => {
    const estimatedPrice = calculateBuildPrice(build);
    const estimatedWattage = estimateBuildWattage(build);
    const scores = calculateScores({ ...build, estimatedPrice, estimatedWattage }, input, diagnosis);
    const warnings = [];

    if (estimatedPrice > input.budget) {
      warnings.push(
        isId
          ? "Build melebihi budget saat ini. Pertimbangkan downgrade GPU, storage, atau casing."
          : "This build exceeds the current budget. Consider downgrading GPU, storage, or case."
      );
    }
    if (diagnosis.riskProfile.electricityRisk === "high" && !build.components.ups.id) {
      warnings.push(
        isId
          ? "Listrik berisiko tinggi, tetapi build belum menyertakan UPS."
          : "Electricity risk is high, but the build does not include a UPS."
      );
    }

    return { ...build, estimatedPrice, estimatedWattage, scores, warnings: [...build.warnings, ...warnings] };
  });

  return {
    recommendationSummary: isId
      ? "Tiga build disusun untuk memperlihatkan trade-off antara performa, value, dan keamanan pemakaian."
      : "Three builds are prepared to make the trade-offs across performance, value, and safety explicit.",
    builds,
    finalRecommendation:
      diagnosis.strategy.mode === "safety_first"
        ? isId
          ? "Untuk kondisi listrik berisiko, build alternatif yang lebih aman biasanya lebih bijak daripada memaksakan GPU lebih tinggi."
          : "For risky electricity conditions, a safer alternative build is usually wiser than forcing a higher-tier GPU."
        : isId
          ? "Pilih build dengan skor dan trade-off yang paling cocok dengan software utama serta kondisi listrik rumah kamu."
          : "Choose the build with scores and trade-offs that best fit your main software and home electricity conditions.",
  };
}

async function requestOpenRouter(systemPrompt: string, userPrompt: string) {
  const model = process.env.OPENROUTER_MODEL;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey && !model) {
    logWarn("openrouter", "AI tidak aktif: OPENROUTER_API_KEY dan OPENROUTER_MODEL belum di-set. Generate memakai system fallback lokal.");
    return null;
  }

  if (!apiKey) {
    logWarn("openrouter", "AI tidak aktif: OPENROUTER_API_KEY belum di-set. Generate memakai system fallback lokal.");
    return null;
  }

  if (!model) {
    logWarn("openrouter", "AI tidak aktif: OPENROUTER_MODEL belum di-set. Generate memakai system fallback lokal.");
    return null;
  }

  logInfo("openrouter", `Mencoba request ke OpenRouter dengan model "${model}".`);
  const useStructuredOutput = supportsStructuredOutput(model);

  if (useStructuredOutput) {
    logInfo("openrouter", "Request memakai structured output JSON mode.");
  } else {
    logWarn(
      "openrouter",
      `Model "${model}" dipanggil tanpa response_format. Output JSON hanya dipandu lewat prompt agar kompatibel dengan provider/model ini.`,
    );
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      ...(useStructuredOutput ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    logWarn(
      "openrouter",
      `AI request gagal dengan status ${response.status}.${response.status === 400 && !useStructuredOutput ? " Kemungkinan ada parameter lain yang tidak didukung provider/model ini." : ""} Generate akan memakai system fallback lokal.`,
    );
    throw new Error(`OpenRouter error ${response.status}`);
  }

  const data = await response.json();
  logInfo("openrouter", "Response OpenRouter berhasil diterima.");
  return data?.choices?.[0]?.message?.content as string | undefined;
}

export async function getDiagnosis(input: UserIntake, locale: PromptLocale = "en") {
  const fallback = createLocalDiagnosis(input, locale);
  try {
    const content = await requestOpenRouter(createDiagnosisSystemPrompt(locale), createDiagnosisPrompt(input, locale));
    if (!content) {
      logWarn("diagnosis", "Diagnosis dihasilkan oleh system fallback lokal karena AI tidak aktif atau tidak mengembalikan konten.");
      return fallback;
    }

    const parsed = safeJsonParse<DiagnosisResult>(content, fallback);
    if (parsed === fallback) {
      logWarn("diagnosis", "JSON diagnosis dari AI gagal diparse. System fallback lokal dipakai.");
    } else {
      logInfo("diagnosis", "Diagnosis berhasil dihasilkan oleh AI.");
    }

    return parsed;
  } catch (error) {
    logWarn("diagnosis", `AI diagnosis gagal: ${error instanceof Error ? error.message : "unknown error"}. System fallback lokal dipakai.`);
    return fallback;
  }
}

export async function getRecommendations(input: UserIntake, diagnosis: DiagnosisResult, locale: PromptLocale = "en") {
  const fallback = createLocalBuilds(input, diagnosis, locale);
  try {
    const content = await requestOpenRouter(
      createRecommendationSystemPrompt(locale),
      createBuildRecommendationPrompt({ userInput: input, diagnosis, components: mockComponents, locale }),
    );
    if (!content) {
      logWarn("recommend-builds", "Rekomendasi build dihasilkan oleh system fallback lokal karena AI tidak aktif atau tidak mengembalikan konten.");
      return fallback;
    }

    const parsed = safeJsonParse<BuildRecommendationResponse>(content, fallback);
    if (parsed === fallback) {
      logWarn("recommend-builds", "JSON rekomendasi build dari AI gagal diparse. System fallback lokal dipakai.");
    } else {
      logInfo("recommend-builds", "Rekomendasi build berhasil dihasilkan oleh AI.");
    }

    const normalized = normalizeBuildRecommendationResponse(parsed, fallback, input, diagnosis);
    logInfo("recommend-builds", `Mengembalikan ${normalized.builds.length} build untuk dirender.`);
    return normalized;
  } catch (error) {
    logWarn("recommend-builds", `AI recommendation gagal: ${error instanceof Error ? error.message : "unknown error"}. System fallback lokal dipakai.`);
    return fallback;
  }
}

export async function analyzeBuildChange(
  input: UserIntake,
  diagnosis: DiagnosisResult,
  oldBuild: RecommendedBuild,
  newBuild: RecommendedBuild,
  changedComponent: unknown,
  locale: PromptLocale = "en",
) {
  const fallback = analyzeChangeLocally(oldBuild, newBuild, diagnosis, locale);
  try {
    const content = await requestOpenRouter(
      createChangeAnalysisSystemPrompt(locale),
      createChangeAnalysisPrompt({
        userInput: input,
        diagnosis,
        oldBuild,
        newBuild,
        changedComponent,
        locale,
      }),
    );
    if (!content) {
      logWarn("analyze-change", "Analisis perubahan build dihasilkan oleh system fallback lokal karena AI tidak aktif atau tidak mengembalikan konten.");
      return fallback;
    }

    const parsed = safeJsonParse<ChangeAnalysis>(content, fallback);
    if (parsed === fallback) {
      logWarn("analyze-change", "JSON analisis perubahan dari AI gagal diparse. System fallback lokal dipakai.");
    } else {
      logInfo("analyze-change", "Analisis perubahan build berhasil dihasilkan oleh AI.");
    }

    return parsed;
  } catch (error) {
    logWarn("analyze-change", `AI change analysis gagal: ${error instanceof Error ? error.message : "unknown error"}. System fallback lokal dipakai.`);
    return fallback;
  }
}
