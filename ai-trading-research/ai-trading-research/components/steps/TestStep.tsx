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
  const { metrics, equityCurve } = backtest;

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

      <button
        onClick={onContinue}
        className="w-full py-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-medium text-sm hover:bg-emerald-400 transition-colors"
      >
        View Conclusions
      </button>
    </div>
  );
}
