// lib/backtest/engine.ts
// [PERSONALLY DESIGNED LOGIC, AI-ASSISTED IMPLEMENTATION] This is the piece
// I'd most want to defend in an interview. Key decisions:
//   1. Entry signal is evaluated at day-close, execution happens at the NEXT
//      day's open — avoids the most obvious look-ahead bias (you can't trade
//      on a close you haven't seen yet).
//   2. No overlapping positions — if already in a trade, later signals are
//      skipped. Keeps trade count honest and avoids double-counting the same
//      market move as multiple "independent" trades (a classic overfitting trap).
//   3. Costs are applied per side (entry + exit), not once — matches how
//      slippage/brokerage actually work in practice.
import { StructuredExperiment } from "@/lib/schemas/experiment";
import { BacktestOutput, BacktestMetrics, Trade, EquityPoint, ValidationWindow } from "@/lib/schemas/backtest";
import { generateNiftySeries, OhlcBar } from "@/lib/mock-data/nifty";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function dailyReturnPct(bars: OhlcBar[], i: number): number | null {
  if (i === 0) return null;
  return ((bars[i].close - bars[i - 1].close) / bars[i - 1].close) * 100;
}

// Rolling 20-day standard deviation of daily returns, used as a crude
// stand-in for any "high_volatility" filter string. This is a simplified
// heuristic, not a validated volatility regime model — flagged explicitly
// in dataQualityNotes below. [AI-GENERATED, reviewed]
function rollingVolStdDev(bars: OhlcBar[], i: number, window = 20): number | null {
  if (i < window) return null;
  const rets: number[] = [];
  for (let j = i - window + 1; j <= i; j++) {
    const r = dailyReturnPct(bars, j);
    if (r !== null) rets.push(r);
  }
  if (rets.length === 0) return null;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
  return Math.sqrt(variance);
}

function passesEntry(bars: OhlcBar[], i: number, experiment: StructuredExperiment): boolean {
  const ret = dailyReturnPct(bars, i);
  if (ret === null) return false;

  const { operator, value } = experiment.entry;
  const conditionMet =
    operator === "<="
      ? ret <= value
      : operator === ">="
      ? ret >= value
      : operator === "<"
      ? ret < value
      : operator === ">"
      ? ret > value
      : ret === value;

  if (!conditionMet) return false;

  const hasVolFilter = experiment.filters.some((f) => /volatil/i.test(f));
  if (hasVolFilter) {
    const vol = rollingVolStdDev(bars, i);
    if (vol === null || vol < 1.0) return false; // require >1% daily std dev to count as "high vol"
  }

  return true;
}

function holdingDaysFrom(experiment: StructuredExperiment): number {
  const { value, unit } = experiment.holdingPeriod;
  const days = unit === "weeks" ? value * 5 : value;
  return Math.max(1, Math.round(days));
}

function avgHoldingDays(trades: Trade[]): number {
  if (trades.length === 0) return 1;
  const days = trades.map(
    (t) => (new Date(t.exitDate).getTime() - new Date(t.entryDate).getTime()) / 86_400_000
  );
  return Math.max(1, days.reduce((a, b) => a + b, 0) / days.length);
}

function computeMetrics(trades: Trade[]): BacktestMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgReturnPct: 0,
      totalReturnPct: 0,
      maxDrawdownPct: 0,
      sharpeRatio: 0,
      totalCostDragPct: 0,
    };
  }

  const wins = trades.filter((t) => t.returnPctAfterCosts > 0).length;
  const avgReturnPct = trades.reduce((a, t) => a + t.returnPctAfterCosts, 0) / trades.length;

  let equity = 100;
  for (const t of trades) equity *= 1 + t.returnPctAfterCosts / 100;
  const totalReturnPct = equity - 100;

  const returns = trades.map((t) => t.returnPctAfterCosts);
  const mean = avgReturnPct;
  const stdDev =
    Math.sqrt(returns.reduce((a, r) => a + (r - mean) ** 2, 0) / returns.length) || 1e-9;
  // Simplified annualization assuming roughly independent, evenly-spaced
  // trades — a real Sharpe calc would account for trade overlap/spacing
  // more carefully. Worth calling out explicitly as a simplification.
  const sharpeRatio = (mean / stdDev) * Math.sqrt(252 / avgHoldingDays(trades));

  const rawAvg = trades.reduce((a, t) => a + t.returnPct, 0) / trades.length;
  const totalCostDragPct = round2(rawAvg - avgReturnPct);

  let peakEquity = 100;
  let runningEquity = 100;
  let maxDD = 0;
  for (const t of trades) {
    runningEquity *= 1 + t.returnPctAfterCosts / 100;
    peakEquity = Math.max(peakEquity, runningEquity);
    maxDD = Math.max(maxDD, ((peakEquity - runningEquity) / peakEquity) * 100);
  }

  return {
    totalTrades: trades.length,
    winRate: round2((wins / trades.length) * 100),
    avgReturnPct: round2(avgReturnPct),
    totalReturnPct: round2(totalReturnPct),
    maxDrawdownPct: round2(maxDD),
    sharpeRatio: round2(sharpeRatio),
    totalCostDragPct,
  };
}

function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  let equity = 100;
  const curve: EquityPoint[] = [{ date: trades[0]?.entryDate ?? "start", equity: round2(equity) }];
  for (const t of trades) {
    equity *= 1 + t.returnPctAfterCosts / 100;
    curve.push({ date: t.exitDate, equity: round2(equity) });
  }
  return curve;
}

function runPeriod(
  experiment: StructuredExperiment,
  start: string,
  end: string,
  sourceBars: OhlcBar[]
): { metrics: BacktestMetrics; trades: Trade[]; equityCurve: EquityPoint[] } {
  const bars = sourceBars.filter((bar) => bar.date >= start && bar.date <= end);
  const holdDays = holdingDaysFrom(experiment);
  const costPerSide =
    (experiment.costAssumptions.slippagePct + experiment.costAssumptions.transactionCostPct) / 100;

  const trades: Trade[] = [];
  let i = 0;

  while (i < bars.length - 1) {
    if (passesEntry(bars, i, experiment)) {
      const entryIdx = i + 1; // execute at next day's open — no look-ahead
      const exitIdx = entryIdx + holdDays;

      if (exitIdx < bars.length) {
        const entryPrice = bars[entryIdx].open;
        const exitPrice = bars[exitIdx].close;
        const rawReturnPct = ((exitPrice - entryPrice) / entryPrice) * 100;
        const returnPctAfterCosts = rawReturnPct - costPerSide * 2 * 100; // entry + exit legs

        trades.push({
          entryDate: bars[entryIdx].date,
          exitDate: bars[exitIdx].date,
          entryPrice: round2(entryPrice),
          exitPrice: round2(exitPrice),
          returnPct: round2(rawReturnPct),
          returnPctAfterCosts: round2(returnPctAfterCosts),
        });

        i = exitIdx + 1; // no overlapping trades
        continue;
      }
    }
    i++;
  }

  return { metrics: computeMetrics(trades), trades, equityCurve: buildEquityCurve(trades) };
}

function splitTestPeriod(experiment: StructuredExperiment): { splitDate: string; outStart: string } {
  const start = new Date(experiment.testPeriod.start);
  const end = new Date(experiment.testPeriod.end);
  const midpoint = new Date(start.getTime() + (end.getTime() - start.getTime()) * 0.7);
  const splitDate = midpoint.toISOString().slice(0, 10);
  const outStartDate = new Date(midpoint);
  outStartDate.setDate(outStartDate.getDate() + 1);
  return { splitDate, outStart: outStartDate.toISOString().slice(0, 10) };
}

function makeValidationWindow(
  label: ValidationWindow["label"],
  start: string,
  end: string,
  result: ReturnType<typeof runPeriod>
): ValidationWindow {
  return { label, start, end, metrics: result.metrics };
}

export function runBacktest(experiment: StructuredExperiment): BacktestOutput {
  const sourceBars = generateNiftySeries(experiment.testPeriod.start, experiment.testPeriod.end);
  const full = runPeriod(experiment, experiment.testPeriod.start, experiment.testPeriod.end, sourceBars);
  const { splitDate, outStart } = splitTestPeriod(experiment);
  const inSample = runPeriod(experiment, experiment.testPeriod.start, splitDate, sourceBars);
  const outOfSample = runPeriod(experiment, outStart, experiment.testPeriod.end, sourceBars);

  return {
    metrics: full.metrics,
    trades: full.trades,
    equityCurve: full.equityCurve,
    validation: {
      splitDate,
      windows: [
        makeValidationWindow("in_sample", experiment.testPeriod.start, splitDate, inSample),
        makeValidationWindow("out_of_sample", outStart, experiment.testPeriod.end, outOfSample),
      ],
    },
    dataQualityNotes: [
      "Prices are simulated (seeded random walk), not real NIFTY data — for workflow demonstration only.",
      "Volatility filters use a simplified rolling-std-dev heuristic, not a validated regime model.",
      "No overlapping positions are modeled — real capital allocation across concurrent signals is more complex.",
      "Sample size may be small depending on the test period and entry threshold chosen — treat metrics as directional, not conclusive.",
    ],
  };
}
