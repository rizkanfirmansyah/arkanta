import { NextRequest, NextResponse } from "next/server";
import { getDiagnosis, getRecommendations } from "@/lib/openrouter";
import { DiagnosisResult, UserIntake } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userInput: UserIntake; diagnosis?: DiagnosisResult; locale?: "en" | "id" };
    const locale = body.locale ?? "en";
    const diagnosis = body.diagnosis ?? (await getDiagnosis(body.userInput, locale));
    const recommendations = await getRecommendations(body.userInput, diagnosis, locale);
    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat rekomendasi build." },
      { status: 500 },
    );
  }
}
