import { NextRequest, NextResponse } from "next/server";
import { getDiagnosis } from "@/lib/openrouter";
import { UserIntake } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userInput: UserIntake };
    const diagnosis = await getDiagnosis(body.userInput);
    return NextResponse.json(diagnosis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menganalisis kebutuhan user." },
      { status: 500 },
    );
  }
}
