// components/steps/AskStep.tsx
// [PERSONALLY DESIGNED UX, AI-ASSISTED MARKUP]
"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Does buying NIFTY after a sharp fall work?",
  "Does buying NIFTY after a 1% fall have an edge during high-volatility periods?",
  "Is there a mean-reversion edge in NIFTY after two consecutive down days?",
];

interface AskStepProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function AskStep({ onSubmit, isLoading, error }: AskStepProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim() && !isLoading) onSubmit(value.trim());
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Ask a market question</h1>
      <p className="text-zinc-500 text-sm mb-8">
        Plain English. The system will structure it into a testable experiment.
      </p>

      <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 focus-within:border-emerald-600 transition-colors">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Does buying NIFTY after a 1% fall work?"
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-zinc-100 placeholder-zinc-600 outline-none font-mono text-sm disabled:opacity-60"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isLoading ? "Parsing…" : "Ask"}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-3 font-mono" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 justify-center mt-6">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setValue(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
