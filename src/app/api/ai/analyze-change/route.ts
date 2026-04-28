import { NextRequest, NextResponse } from "next/server";
import { analyzeBuildChange } from "@/lib/openrouter";
import { DiagnosisResult, RecommendedBuild, UserIntake } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userInput: UserIntake;
      diagnosis: DiagnosisResult;
      oldBuild: RecommendedBuild;
      newBuild: RecommendedBuild;
      changedComponent: unknown;
    };

    const analysis = await analyzeBuildChange(
      body.userInput,
      body.diagnosis,
      body.oldBuild,
      body.newBuild,
      body.changedComponent,
    );

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menganalisis perubahan komponen." },
      { status: 500 },
    );
  }
}
