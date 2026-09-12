// components/steps/LearnStep.tsx
// [PERSONALLY DESIGNED] The facts/conclusions split is the direct answer to
// the brief's "distinguish what the data shows vs. what the system believes"
// requirement — kept as two visually separate columns so it can't be skimmed
// past as one blended paragraph.
import { RotateCcw } from "lucide-react";
import { BacktestOutput } from "@/lib/schemas/backtest";
import { StructuredExperiment } from "@/lib/schemas/experiment";
import { RiskRegister } from "@/components/RiskRegister";

interface LearnStepProps {
  experiment: StructuredExperiment;
  backtest: BacktestOutput;
  onReset: () => void;
}

export function LearnStep({ experiment, backtest, onReset }: LearnStepProps) {
  const { metrics } = backtest;
  const edgeDirection = metrics.totalReturnPct > 0 ? "positive" : "negative";

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6">What did we learn?</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
          <h3 className="text-xs uppercase tracking-wide text-zinc-400 font-mono mb-3">What the data shows</h3>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>{metrics.totalTrades} qualifying trades over the test period</li>
            <li>{metrics.winRate}% of trades were profitable after costs</li>
            <li>
              Net return of {metrics.totalReturnPct}% ({edgeDirection}) after costs
            </li>
            <li>Max drawdown of {metrics.maxDrawdownPct}% across the sequence</li>
            <li>{metrics.totalCostDragPct}% of raw return consumed by slippage + fees</li>
          </ul>
        </div>

        <div className="border border-amber-900/50 rounded-xl p-4 bg-amber-950/10">
          <h3 className="text-xs uppercase tracking-wide text-amber-500 font-mono mb-3">
            System conclusions &amp; limits
          </h3>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>
              Results are <span className="text-amber-400">directional, not conclusive</span> — sample size (
              {metrics.totalTrades} trades) is likely too small for statistical confidence.
            </li>
            <li>Data is simulated, not real NIFTY history — treat as a workflow demo, not a market finding.</li>
            <li>No slippage-on-wide-spread or execution failure modeling — real costs may run higher.</li>
            <li>Out-of-sample results are shown separately, but this is not a walk-forward or statistical significance test.</li>
          </ul>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 mb-6">
        <h3 className="text-xs uppercase tracking-wide text-zinc-400 font-mono mb-3">Validation readout</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {backtest.validation.windows.map((window) => (
            <div key={window.label}>
              <p className="text-zinc-500 text-xs font-mono">{window.label === "in_sample" ? "In-sample" : "Out-of-sample"}</p>
              <p className="text-zinc-200 mt-1">{window.metrics.totalTrades} trades, {window.metrics.totalReturnPct}% return</p>
            </div>
          ))}
        </div>
      </div>

      <RiskRegister backtest={backtest} />

      <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 mb-6">
        <h3 className="text-xs uppercase tracking-wide text-zinc-400 font-mono mb-2">Suggested next questions</h3>
        <ul className="space-y-1 text-sm text-zinc-300 list-disc list-inside">
          <li>Does the edge hold across a longer or different test period?</li>
          <li>How sensitive is the result to the entry threshold ({experiment.entry.value})?</li>
          <li>Does adding a stop-loss change the drawdown profile materially?</li>
        </ul>
      </div>

      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium text-sm hover:border-zinc-500 hover:text-zinc-100 transition-colors"
      >
        <RotateCcw size={14} /> Start New Research
      </button>
    </div>
  );
}
