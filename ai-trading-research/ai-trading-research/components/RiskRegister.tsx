import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import { BacktestOutput } from "@/lib/schemas/backtest";

type RiskStatus = "Mitigated" | "Partial" | "Open";

interface RiskItem {
  category: string;
  status: RiskStatus;
  detail: string;
}

const RISK_ITEMS: RiskItem[] = [
  {
    category: "Ambiguous definitions",
    status: "Mitigated",
    detail: "Critical unknowns are surfaced as clarifications; assumptions show their reasoning.",
  },
  {
    category: "Look-ahead bias",
    status: "Mitigated",
    detail: "Signals use a close and execute at the next day's open.",
  },
  {
    category: "Overfitting",
    status: "Partial",
    detail: "No parameter search is run, but one hypothesis and mock series cannot rule it out.",
  },
  {
    category: "Insufficient evidence",
    status: "Partial",
    detail: "The result is split into in-sample and out-of-sample windows; trade counts may still be small.",
  },
  {
    category: "Survivorship bias",
    status: "Open",
    detail: "The prototype uses one simulated index series, not a survivorship-bias-controlled universe.",
  },
  {
    category: "Transaction costs",
    status: "Partial",
    detail: "Entry and exit costs are modeled, but spreads, impact, and failed fills are not.",
  },
  {
    category: "Data quality",
    status: "Open",
    detail: "Prices are seeded mock data and volatility is a simplified rolling standard deviation.",
  },
  {
    category: "Execution and liquidity",
    status: "Open",
    detail: "The engine assumes fills at the next open without volume or liquidity constraints.",
  },
];

function StatusIcon({ status }: { status: RiskStatus }) {
  if (status === "Mitigated") return <CheckCircle2 size={15} className="text-emerald-400" />;
  if (status === "Partial") return <CircleAlert size={15} className="text-amber-400" />;
  return <AlertTriangle size={15} className="text-red-400" />;
}

export function RiskRegister({ backtest }: { backtest: BacktestOutput }) {
  const lowEvidence = backtest.metrics.totalTrades < 20;

  return (
    <section className="border border-zinc-800 rounded-xl bg-zinc-900/30 p-4 mb-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-zinc-300 font-mono">Risk register</h3>
          <p className="text-xs text-zinc-500 mt-1">What could make this conclusion wrong?</p>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">8 categories</span>
      </div>

      <div className="space-y-2">
        {RISK_ITEMS.map((item) => (
          <div key={item.category} className="grid grid-cols-[auto_1fr_auto] gap-2 items-start border-t border-zinc-800/70 pt-2">
            <StatusIcon status={item.status} />
            <div>
              <p className="text-sm text-zinc-200">{item.category}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{item.detail}</p>
            </div>
            <span className={`text-[10px] font-mono ${item.status === "Mitigated" ? "text-emerald-400" : item.status === "Partial" ? "text-amber-400" : "text-red-400"}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {lowEvidence && (
        <p className="mt-4 pt-3 border-t border-amber-900/50 text-xs text-amber-300">
          Evidence warning: only {backtest.metrics.totalTrades} full-period trades were observed. Treat every metric as exploratory until a larger sample is tested.
        </p>
      )}
    </section>
  );
}
