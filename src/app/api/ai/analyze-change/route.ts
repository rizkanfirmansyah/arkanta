import { NextRequest, NextResponse } from "next/server";
import { analyzeBuildChange } from "@/lib/openrouter";
import { completeRequestLog, createRequestLog } from "@/lib/request-logger";
import { DiagnosisResult, RecommendedBuild, UserIntake } from "@/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    userInput: UserIntake;
    diagnosis: DiagnosisResult;
    oldBuild: RecommendedBuild;
    newBuild: RecommendedBuild;
    changedComponent: unknown;
    locale?: "en" | "id";
  };
  const logContext = await createRequestLog(request, "ai/analyze-change", body);

  try {
    const analysis = await analyzeBuildChange(
      body.userInput,
      body.diagnosis,
      body.oldBuild,
      body.newBuild,
      body.changedComponent,
      body.locale ?? "en",
    );

    await completeRequestLog(logContext, 200, analysis, "change analysis generated");
    return NextResponse.json(analysis);
  } catch (error) {
    const errorPayload = { error: error instanceof Error ? error.message : "Gagal menganalisis perubahan komponen." };
    await completeRequestLog(logContext, 500, errorPayload, "change analysis failed");
    return NextResponse.json(errorPayload, { status: 500 });
  }
}
