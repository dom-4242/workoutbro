import { startTrainingSession } from "@/lib/actions/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sessionId = await startTrainingSession();
    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to start session" },
      { status: 400 },
    );
  }
}
