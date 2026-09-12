// components/StepProgress.tsx
// [AI-GENERATED, reviewed] Purely presentational.
import { MessageSquareText, HelpCircle, FileJson2, LineChart, BookOpenCheck, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FlowStep } from "@/lib/hooks/useResearchFlow";

interface StepDef {
  key: FlowStep;
  label: string;
  icon: LucideIcon;
}

const STEPS: StepDef[] = [
  { key: "ASK", label: "Ask", icon: MessageSquareText },
  { key: "CLARIFY", label: "Clarify", icon: HelpCircle },
  { key: "DEFINE", label: "Define", icon: FileJson2 },
  { key: "TEST", label: "Test", icon: LineChart },
  { key: "LEARN", label: "Learn", icon: BookOpenCheck },
];

export function StepProgress({ current }: { current: FlowStep }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto mb-10">
      {STEPS.map((s, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                  active
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : done
                    ? "border-emerald-700 bg-emerald-900/30 text-emerald-600"
                    : "border-zinc-700 bg-zinc-900 text-zinc-500"
                }`}
              >
                {done ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={`text-[11px] font-mono ${active ? "text-emerald-400" : "text-zinc-500"}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${done ? "bg-emerald-800" : "bg-zinc-800"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
