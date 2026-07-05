import { NextResponse } from "next/server";
import { runBenchmarkSuite } from "@/lib/run-benchmark";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = runBenchmarkSuite();
  return NextResponse.json(result);
}
