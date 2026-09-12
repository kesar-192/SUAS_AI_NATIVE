// lib/schemas/backtest.ts
// [PERSONALLY DESIGNED] Kept separate from experiment.ts on purpose — this is
// the output of a different subsystem (a deterministic engine, not the LLM),
// and keeping the two decoupled is what lets TEST stay swappable later (mock
// data now, a real backtesting service later) without touching DEFINE at all.
import { z } from "zod";

export const TradeSchema = z.object({
  entryDate: z.string(),
  exitDate: z.string(),
  entryPrice: z.number(),
  exitPrice: z.number(),
  returnPct: z.number(),
  returnPctAfterCosts: z.number(),
});

export const BacktestMetricsSchema = z.object({
  totalTrades: z.number(),
  winRate: z.number(),
  avgReturnPct: z.number(),
  totalReturnPct: z.number(),
  maxDrawdownPct: z.number(),
  sharpeRatio: z.number(),
  totalCostDragPct: z.number().describe("Return eroded by slippage + transaction costs"),
});

export const EquityPointSchema = z.object({
  date: z.string(),
  equity: z.number(),
});

export const BacktestOutputSchema = z.object({
  metrics: BacktestMetricsSchema,
  trades: z.array(TradeSchema),
  equityCurve: z.array(EquityPointSchema),
  dataQualityNotes: z.array(z.string()).describe("Caveats: sample size, mock data, look-ahead risk, etc."),
});

export type Trade = z.infer<typeof TradeSchema>;
export type BacktestMetrics = z.infer<typeof BacktestMetricsSchema>;
export type EquityPoint = z.infer<typeof EquityPointSchema>;
export type BacktestOutput = z.infer<typeof BacktestOutputSchema>;
