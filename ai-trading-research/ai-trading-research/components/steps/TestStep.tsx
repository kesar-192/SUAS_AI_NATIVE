// components/steps/TestStep.tsx
// [AI-GENERATED CHART SETUP, PERSONALLY DESIGNED metric selection]
"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BacktestOutput } from "@/lib/schemas/backtest";

interface TestStepProps {
  backtest: BacktestOutput;
  onContinue: () => void;
}

interface Tile {
  label: string;
  value: string;
  warn?: boolean;
}

export function TestStep({ backtest, onContinue }: TestStepProps) {
  const { metrics, equityCurve, validation } = backtest;
  const [inSample, outOfSample] = validation.windows;
  const lowSample = metrics.totalTrades < 20;

  const tiles: Tile[] = [
    { label: "Win Rate", value: `${metrics.winRate}%` },
    { label: "Total Return", value: `${metrics.totalReturnPct}%`, warn: metrics.totalReturnPct < 0 },
    { label: "Max Drawdown", value: `${metrics.maxDrawdownPct}%`, warn: true },
    { label: "Sharpe Ratio", value: `${metrics.sharpeRatio}` },
    { label: "Cost Drag", value: `${metrics.totalCostDragPct}%`, warn: true },
    { label: "Total Trades", value: `${metrics.totalTrades}` },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Backtest Results</h2>

      <div className="h-56 mb-6 border border-zinc-800 rounded-xl bg-zinc-900/30 p-4">
        {equityCurve.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurve}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} minTickGap={40} />
              <YAxis tick={{ fontSize: 10, fill: "#71717a" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", fontSize: 12 }} />
              <Line type="monotone" dataKey="equity" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-600 text-sm font-mono">
            No qualifying trades in this test period — try widening the entry condition or date range.
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {tiles.map((tile) => (
          <div key={tile.label} className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/50">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wide font-mono">{tile.label}</p>
            <p className={`text-lg font-mono mt-0.5 ${tile.warn ? "text-amber-400" : "text-zinc-100"}`}>
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      {lowSample && (
        <div className="border border-amber-900/60 bg-amber-950/20 rounded-lg p-3 mb-4 text-sm text-amber-300">
          <strong>Small sample warning:</strong> {metrics.totalTrades} full-period trades is below the 20-trade review threshold. Sharpe and win rate are unstable estimates, not proof of an edge.
        </div>
      )}

      <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 p-4 mb-6">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h3 className="text-xs uppercase tracking-wide text-zinc-400 font-mono">Out-of-sample check</h3>
          <span className="text-[10px] text-zinc-600 font-mono">split after {validation.splitDate}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[inSample, outOfSample].map((window) => (
            <div key={window.label} className="border border-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-300 font-mono">{window.label === "in_sample" ? "In-sample" : "Out-of-sample"}</p>
              <p className="text-[10px] text-zinc-600 font-mono mt-1">{window.start} to {window.end}</p>
              <p className="text-sm text-zinc-200 mt-3">{window.metrics.totalTrades} trades</p>
              <p className={window.metrics.totalReturnPct >= 0 ? "text-emerald-400 text-sm" : "text-red-400 text-sm"}>
                {window.metrics.totalReturnPct}% return · Sharpe {window.metrics.sharpeRatio}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          {inSample.metrics.totalReturnPct >= 0 && outOfSample.metrics.totalReturnPct >= 0
            ? "The return direction is consistent across both windows, but sample size and simulated data still limit confidence."
            : "The return direction does not hold in both windows; treat the full-period result as inconclusive."}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-medium text-sm hover:bg-emerald-400 transition-colors"
      >
        View Conclusions
      </button>
    </div>
  );
}
