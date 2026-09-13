// components/steps/ClarifyStep.tsx
// [PERSONALLY DESIGNED] This is the UI expression of the "don't blindly
// assume" requirement — critical questions physically block the Continue
// button; assumptions are shown but editable, never hidden.
"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, Pencil, Check } from "lucide-react";
import { StructuredExperiment, Assumption, ClarificationQuestion } from "@/lib/schemas/experiment";

interface ClarifyStepProps {
  experiment: StructuredExperiment;
  onOverrideAssumption: (field: string, value: string) => void;
  onResolveClarification: (id: string, value: string) => void;
  canProceed: boolean;
  onContinue: () => void;
  onBack: () => void;
}

export function ClarifyStep({
  experiment,
  onOverrideAssumption,
  onResolveClarification,
  canProceed,
  onContinue,
  onBack,
}: ClarifyStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Let&apos;s confirm the details</h2>
      <p className="text-zinc-500 text-sm mb-6">
        Original question: <span className="text-zinc-400 italic">&ldquo;{experiment.originalQuestion}&rdquo;</span>
      </p>

      {experiment.clarificationsNeeded.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-amber-500 font-mono mb-2">Needs your input</h3>
          <div className="space-y-3">
            {experiment.clarificationsNeeded.map((q) => (
              <ClarificationRow key={q.id} question={q} onAnswer={(v) => onResolveClarification(q.id, v)} />
            ))}
          </div>
        </div>
      )}

      {experiment.assumptions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wide text-zinc-500 font-mono mb-2">System assumptions</h3>
          <div className="space-y-2">
            {experiment.assumptions.map((a) => (
              <AssumptionRow key={a.field} assumption={a} onOverride={(v) => onOverrideAssumption(a.field, v)} />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={!canProceed}
        className="w-full py-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
      >
        {canProceed ? "Confirm & Build Experiment" : "Answer critical questions to continue"}
      </button>
    </div>
  );
}

function ClarificationRow({
  question,
  onAnswer,
}: {
  question: ClarificationQuestion;
  onAnswer: (value: string) => void;
}) {
  const [value, setValue] = useState(question.suggestedDefault ?? "");
  const isCritical = question.priority === "critical";

  return (
    <div
      className={`p-3 rounded-lg border ${
        isCritical ? "border-amber-800 bg-amber-950/20" : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      <div className="flex items-start gap-2">
        {isCritical && <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />}
        <div className="flex-1">
          <p className="text-sm text-zinc-200">{question.question}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{question.why}</p>
          <div className="flex gap-2 mt-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && value.trim() && onAnswer(value)}
              className="flex-1 text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 font-mono outline-none focus:border-emerald-600"
            />
            <button
              onClick={() => value.trim() && onAnswer(value)}
              disabled={!value.trim()}
              className="px-3 py-1 rounded bg-zinc-800 text-zinc-200 text-xs hover:bg-zinc-700 disabled:opacity-30"
              aria-label="Confirm answer"
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssumptionRow({
  assumption,
  onOverride,
}: {
  assumption: Assumption;
  onOverride: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(assumption.assumedValue);

  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm">
      <div className="flex-1 min-w-0">
        <span className="text-zinc-400 font-mono text-xs">{assumption.field}</span>
        {editing ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              setEditing(false);
              onOverride(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditing(false);
                onOverride(value);
              }
            }}
            autoFocus
            className="w-full bg-zinc-950 border border-emerald-700 rounded px-1.5 py-0.5 mt-0.5 text-zinc-100 font-mono text-xs outline-none"
          />
        ) : (
          <p className="text-zinc-200">{assumption.assumedValue}</p>
        )}
        <p className="text-zinc-600 text-xs">{assumption.reasoning}</p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="ml-2 text-zinc-500 hover:text-zinc-200 shrink-0"
        aria-label={`Edit ${assumption.field}`}
      >
        <Pencil size={13} />
      </button>
    </div>
  );
}
