import { NextRequest, NextResponse } from "next/server";
import { getDiagnosis, getRecommendations } from "@/lib/openrouter";
import { completeRequestLog, createRequestLog } from "@/lib/request-logger";
import { DiagnosisResult, UserIntake } from "@/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { userInput: UserIntake; diagnosis?: DiagnosisResult; locale?: "en" | "id" };
  const logContext = await createRequestLog(request, "ai/recommend-builds", body);

  try {
    const locale = body.locale ?? "en";
    const diagnosis = body.diagnosis ?? (await getDiagnosis(body.userInput, locale));
    const recommendations = await getRecommendations(body.userInput, diagnosis, locale);
    await completeRequestLog(logContext, 200, recommendations, "recommendations generated");
    return NextResponse.json(recommendations);
  } catch (error) {
    const errorPayload = { error: error instanceof Error ? error.message : "Gagal membuat rekomendasi build." };
    await completeRequestLog(logContext, 500, errorPayload, "recommendations failed");
    return NextResponse.json(errorPayload, { status: 500 });
  }
}
