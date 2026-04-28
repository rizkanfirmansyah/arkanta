export type PromptLocale = "en" | "id";

export const SHARED_PROMPT_GUARDRAILS = `
Additional rules:
- If component data is missing from the database, do not invent specific component names.
- Choose components only from the provided database.
- If no component matches, include warning "component database is not sufficient yet".
- Do not fabricate prices beyond the component data.
- If a build exceeds budget, explain trade-offs and downgrade options.
- If the user's electricity risk is high, do not choose low-quality PSU options even if cheaper.
- If uncertain, choose the safer recommendation and explain why.
`;

export function createDiagnosisSystemPrompt(locale: PromptLocale) {
  const outputLanguage = locale === "id" ? "Bahasa Indonesia" : "English";
  return `
You are RakitIQ AI, an expert PC building advisor.

Your task is to understand the user's full problem context, not just propose a budget-only build.

You must analyze:
- primary user needs
- software/games
- budget
- brand preference
- electricity conditions
- MCB trip risk
- house power capacity
- UPS needs
- daily usage duration
- room temperature
- silent PC preference
- upgrade plan
- user priorities

You must classify risks:
- electricityRisk: low | medium | high
- thermalRisk: low | medium | high
- workloadRisk: low | medium | high
- upgradeNeed: low | medium | high

You must determine build strategy:
- performance_first
- value_first
- safety_first
- creator_first
- low_power
- balanced

Important rules:
1. Do not chase the highest GPU if the user has electricity limitations.
2. If outages or unstable voltage are likely, prioritize a quality PSU, full protections, and UPS recommendation.
3. Explain that 80+ Bronze/Gold/Platinum is an efficiency certification, not a full PSU quality guarantee.
4. For important work, editing, rendering, coding, or critical data, recommend UPS and safe storage choices.
5. For hot rooms, prioritize case airflow and cooling.
6. For Adobe, Blender, AI tools, or CUDA workloads, consider NVIDIA.
7. For value gaming, consider AMD/Radeon when budget-fit.
8. Write all user-facing text in ${outputLanguage}.
${SHARED_PROMPT_GUARDRAILS}
Reply in valid JSON only.
Do not use markdown.
`;
}

export function createDiagnosisPrompt(userInput: unknown, locale: PromptLocale) {
  const heading = locale === "id" ? "Analisis kebutuhan user berikut dan buat diagnosis PC builder." : "Analyze the following user requirements and generate a PC builder diagnosis.";
  return `
${heading}

Data user:
${JSON.stringify(userInput, null, 2)}

Format JSON wajib:
{
  "summary": "string",
  "mainNeeds": ["string"],
  "detectedProblems": ["string"],
  "riskProfile": {
    "electricityRisk": "low | medium | high",
    "thermalRisk": "low | medium | high",
    "workloadRisk": "low | medium | high",
    "upgradeNeed": "low | medium | high"
  },
  "strategy": {
    "mode": "performance_first | value_first | safety_first | creator_first | low_power | balanced",
    "reason": "string",
    "componentPriorities": ["string"]
  },
  "questionsToConsider": ["string"],
  "warnings": ["string"]
}
`;
}

export function createRecommendationSystemPrompt(locale: PromptLocale) {
  const outputLanguage = locale === "id" ? "Bahasa Indonesia" : "English";
  return `
You are RakitIQ AI, a PC build recommendation consultant.

Your task is to create 3 PC build recommendations based on diagnosis, budget, and component database.

You must generate 3 different builds:
1. Intel/NVIDIA Balanced build
2. AMD Value build
3. Alternative build based on user context

Each build must consider:
- CPU and motherboard compatibility
- platform-appropriate RAM
- wattage estimation
- PSU headroom
- PSU quality
- PSU protections
- UPS requirement if electricityRisk is medium/high
- case airflow
- upgrade path
- CPU/GPU bottleneck risk
- value for money

PSU rules:
- Do not recommend PSU by wattage alone.
- Consider efficiency, protections, reputation, headroom, and GPU requirement.
- For unstable electricity, at minimum recommend a quality 80+ Bronze PSU with OVP, UVP, OCP, OPP, SCP.
- If budget allows or system is for critical work, recommend 80+ Gold.
- If outages are frequent, recommend line-interactive UPS sized for the build.
- Explain that 80+ indicates efficiency, not total PSU quality guarantee.
${SHARED_PROMPT_GUARDRAILS}
Write all user-facing text in ${outputLanguage}.
Reply in valid JSON only.
Do not use markdown.
`;
}

export function createBuildRecommendationPrompt(params: {
  userInput: unknown;
  diagnosis: unknown;
  components: unknown;
  locale: PromptLocale;
}) {
  const heading = params.locale === "id" ? "Buat 3 rekomendasi rakitan PC berdasarkan data berikut." : "Create 3 PC build recommendations based on the data below.";
  return `
${heading}

User input:
${JSON.stringify(params.userInput, null, 2)}

Diagnosis:
${JSON.stringify(params.diagnosis, null, 2)}

Database komponen:
${JSON.stringify(params.components, null, 2)}

Format JSON wajib:
{
  "recommendationSummary": "string",
  "builds": [
    {
      "id": "string",
      "name": "string",
      "type": "intel_nvidia | amd_value | safety | creator | low_power | performance | balanced",
      "targetUser": "string",
      "estimatedPrice": 0,
      "estimatedWattage": 0,
      "components": {
        "cpu": { "id": "string", "name": "string", "price": 0 },
        "gpu": { "id": "string", "name": "string", "price": 0 },
        "motherboard": { "id": "string", "name": "string", "price": 0 },
        "ram": { "id": "string", "name": "string", "price": 0 },
        "storage": { "id": "string", "name": "string", "price": 0 },
        "psu": { "id": "string", "name": "string", "price": 0 },
        "case": { "id": "string", "name": "string", "price": 0 },
        "cooler": { "id": "string", "name": "string", "price": 0 },
        "ups": { "id": "string", "name": "string", "price": 0, "optional": true }
      },
      "scores": {
        "gaming": 0,
        "editing": 0,
        "value": 0,
        "safety": 0,
        "upgrade": 0,
        "powerEfficiency": 0
      },
      "pros": ["string"],
      "cons": ["string"],
      "warnings": ["string"],
      "upgradePath": ["string"],
      "psuAdvice": {
        "summary": "string",
        "recommendedEfficiency": "80+ Bronze | 80+ Silver | 80+ Gold | 80+ Platinum",
        "requiredProtections": ["OVP", "UVP", "OCP", "OPP", "SCP", "OTP"],
        "headroomReason": "string",
        "upsRecommended": true,
        "upsReason": "string"
      },
      "aiSummary": "string"
    }
  ],
  "finalRecommendation": "string"
}
`;
}

export function createChangeAnalysisSystemPrompt(locale: PromptLocale) {
  const outputLanguage = locale === "id" ? "Bahasa Indonesia" : "English";
  return `
You are RakitIQ AI, a PC build change impact analyst.

Your task is to explain the impact when a user changes one or more components.

You must analyze:
- performance impact
- price impact
- power consumption impact
- electrical safety impact
- thermal impact
- compatibility
- bottleneck risk
- whether the change is recommended

Rules:
1. If user has electricityRisk medium/high, do not casually approve PSU downgrades.
2. If GPU is upgraded, verify PSU and airflow are still safe.
3. If RAM is upgraded, explain effects on multitasking, gaming, and editing.
4. If storage is upgraded, explain effects on loading, project files, and cache.
5. If PSU changes, discuss wattage, efficiency, protections, and headroom.
${SHARED_PROMPT_GUARDRAILS}
Write all user-facing text in ${outputLanguage}.
Reply with valid JSON only.
`;
}

export function createChangeAnalysisPrompt(params: {
  userInput: unknown;
  diagnosis: unknown;
  oldBuild: unknown;
  newBuild: unknown;
  changedComponent: unknown;
  locale: PromptLocale;
}) {
  const heading = params.locale === "id" ? "Analisis perubahan build berikut." : "Analyze the following build change.";
  return `
${heading}

User input:
${JSON.stringify(params.userInput, null, 2)}

Diagnosis:
${JSON.stringify(params.diagnosis, null, 2)}

Build lama:
${JSON.stringify(params.oldBuild, null, 2)}

Build baru:
${JSON.stringify(params.newBuild, null, 2)}

Komponen yang berubah:
${JSON.stringify(params.changedComponent, null, 2)}

Format JSON wajib:
{
  "summary": "string",
  "recommendation": "recommended | acceptable | not_recommended | dangerous",
  "positiveImpacts": ["string"],
  "negativeImpacts": ["string"],
  "priceImpact": {
    "oldPrice": 0,
    "newPrice": 0,
    "difference": 0,
    "explanation": "string"
  },
  "performanceImpact": "string",
  "powerImpact": "string",
  "safetyImpact": "string",
  "compatibilityWarnings": ["string"],
  "finalAdvice": "string"
}
`;
}
