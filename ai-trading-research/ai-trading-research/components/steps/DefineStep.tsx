// components/steps/DefineStep.tsx
// [PERSONALLY DESIGNED composition, AI-GENERATED markup] Delegates the
// actual row rendering to ExperimentCard so the same summary can be reused
// elsewhere without duplicating logic.
import { StructuredExperiment } from "@/lib/schemas/experiment";
import { ExperimentCard } from "@/components/ExperimentCard";

interface DefineStepProps {
  experiment: StructuredExperiment;
  onRunTest: () => void;
}

export function DefineStep({ experiment, onRunTest }: DefineStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Structured Experiment</h2>

      <div className="mb-6">
        <ExperimentCard experiment={experiment} />
      </div>

      <button
        onClick={onRunTest}
        className="w-full py-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-medium text-sm hover:bg-emerald-400 transition-colors"
      >
        Run Backtest
      </button>
    </div>
  );
}
