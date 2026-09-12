// components/ExperimentCard.tsx
// [PERSONALLY DESIGNED] Split out from DefineStep so the same structured
// summary can be reused anywhere an experiment needs to be shown at a
// glance (e.g. a compact recap at the top of TEST/LEARN) without duplicating
// the row-rendering logic.
import { StructuredExperiment } from "@/lib/schemas/experiment";

interface ExperimentCardProps {
  experiment: StructuredExperiment;
  compact?: boolean;
}

export function ExperimentCard({ experiment, compact = false }: ExperimentCardProps) {
  const rows: [string, string][] = [
    ["Market", experiment.market],
    ["Timeframe", experiment.timeframe],
    ["Entry", experiment.entry.description],
    ["Exit", experiment.exit.description],
    ["Holding Period", `${experiment.holdingPeriod.value} ${experiment.holdingPeriod.unit}`],
    ["Test Period", `${experiment.testPeriod.start} → ${experiment.testPeriod.end}`],
    ["Filters", experiment.filters.length ? experiment.filters.join(", ") : "None"],
    [
      "Costs",
      `${experiment.costAssumptions.slippagePct}% slippage + ${experiment.costAssumptions.transactionCostPct}% txn`,
    ],
  ];

  return (
    <div>
      {!compact && (
        <p className="text-emerald-400 text-sm font-mono mb-4">&ldquo;{experiment.hypothesis}&rdquo;</p>
      )}
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        {rows.map(([label, value], idx) => (
          <div
            key={label}
            className={`flex px-4 py-2.5 text-sm ${idx % 2 === 0 ? "bg-zinc-900/50" : "bg-zinc-900/20"}`}
          >
            <span className="w-36 shrink-0 text-zinc-500 font-mono text-xs uppercase tracking-wide">
              {label}
            </span>
            <span className="text-zinc-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
