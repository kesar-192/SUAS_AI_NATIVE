// app/api/backtest/route.ts
// [PERSONALLY DESIGNED] Not called by the current UI — useResearchFlow runs
// runBacktest() directly on the client since it's a pure deterministic
// function over mock data, and routing it through the server would just add
// latency with no security or capability benefit today. This route exists
// for parity: the moment the engine starts reading a real (non-public) data
// source or gets computationally heavier, the client swaps its one call site
// from the local import to fetch("/api/backtest") with zero other changes,
// because both paths consume the exact same StructuredExperiment ->
// BacktestOutput contract.
import { NextRequest, NextResponse } from "next/server";
import { StructuredExperimentSchema } from "@/lib/schemas/experiment";
import { runBacktest } from "@/lib/backtest/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = StructuredExperimentSchema.safeParse((body as { experiment?: unknown })?.experiment);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid experiment payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const backtest = runBacktest(parsed.data);
    return NextResponse.json({ backtest });
  } catch (err) {
    console.error("[backtest] engine failed:", err);
    return NextResponse.json({ error: "Backtest failed to run." }, { status: 500 });
  }
}
