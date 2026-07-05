import { NextResponse } from "next/server";
import { runIncidentUpTo, INCIDENT_MAX_STEP } from "@/lib/run-incident";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stepParam = searchParams.get("step");
  const step = stepParam ? Number.parseInt(stepParam, 10) : INCIDENT_MAX_STEP;
  const result = runIncidentUpTo(Number.isFinite(step) ? step : INCIDENT_MAX_STEP);
  return NextResponse.json(result);
}
