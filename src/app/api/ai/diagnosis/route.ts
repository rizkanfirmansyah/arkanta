import { NextRequest, NextResponse } from "next/server";
import { getDiagnosis } from "@/lib/openrouter";
import { completeRequestLog, createRequestLog } from "@/lib/request-logger";
import { UserIntake } from "@/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { userInput: UserIntake; locale?: "en" | "id" };
  const logContext = await createRequestLog(request, "ai/diagnosis", body);

  try {
    const diagnosis = await getDiagnosis(body.userInput, body.locale ?? "en");
    await completeRequestLog(logContext, 200, diagnosis, "diagnosis generated");
    return NextResponse.json(diagnosis);
  } catch (error) {
    const errorPayload = { error: error instanceof Error ? error.message : "Gagal menganalisis kebutuhan user." };
    await completeRequestLog(logContext, 500, errorPayload, "diagnosis failed");
    return NextResponse.json(errorPayload, { status: 500 });
  }
}
