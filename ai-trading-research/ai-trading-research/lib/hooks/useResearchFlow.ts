// lib/hooks/useResearchFlow.ts
// [PERSONALLY DESIGNED] Deliberately does NOT let the user reach DEFINE
// until every "critical" clarification is resolved — that's the enforcement
// point for "system should ask rather than blindly assume" from the brief.
"use client";

import { useCallback, useState } from "react";
import { StructuredExperiment, Assumption } from "@/lib/schemas/experiment";
import { BacktestOutput } from "@/lib/schemas/backtest";
import { runBacktest } from "@/lib/backtest/engine";

export type FlowStep = "ASK" | "CLARIFY" | "DEFINE" | "TEST" | "LEARN";

interface FlowState {
  step: FlowStep;
  question: string;
  experiment: StructuredExperiment | null;
  backtest: BacktestOutput | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FlowState = {
  step: "ASK",
  question: "",
  experiment: null,
  backtest: null,
  isLoading: false,
  error: null,
};

export function useResearchFlow() {
  const [state, setState] = useState<FlowState>(initialState);

  const submitQuestion = useCallback(async (question: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null, question }));
    try {
      const res = await fetch("/api/parse-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to parse question.");

      setState((s) => ({
        ...s,
        isLoading: false,
        experiment: data.experiment as StructuredExperiment,
        step: "CLARIFY",
      }));
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false, error: (err as Error).message }));
    }
  }, []);

  // Override an already-resolved assumption (user disagrees with the default).
  const overrideAssumption = useCallback((field: string, newValue: string) => {
    setState((s) => {
      if (!s.experiment) return s;
      const assumptions: Assumption[] = s.experiment.assumptions.map((a) =>
        a.field === field ? { ...a, assumedValue: newValue, userConfirmed: true } : a
      );
      return { ...s, experiment: { ...s.experiment, assumptions } };
    });
  }, []);

  // Answer an open (critical/recommended/optional) clarification question,
  // moving it out of clarificationsNeeded and recording it as a confirmed assumption.
  const resolveClarification = useCallback((id: string, answer: string) => {
    setState((s) => {
      if (!s.experiment) return s;
      const q = s.experiment.clarificationsNeeded.find((c) => c.id === id);
      if (!q) return s;

      const clarificationsNeeded = s.experiment.clarificationsNeeded.filter((c) => c.id !== id);
      const assumptions: Assumption[] = [
        ...s.experiment.assumptions,
        {
          field: q.field,
          assumedValue: answer,
          reasoning: "User-provided answer",
          confidence: "high",
          userConfirmed: true,
        },
      ];

      return { ...s, experiment: { ...s.experiment, clarificationsNeeded, assumptions } };
    });
  }, []);

  const canProceedToDefine = useCallback(() => {
    if (!state.experiment) return false;
    return !state.experiment.clarificationsNeeded.some((c) => c.priority === "critical");
  }, [state.experiment]);

  const proceedToDefine = useCallback(() => {
    setState((s) => {
      if (!s.experiment) return s;
      const stillCritical = s.experiment.clarificationsNeeded.some((c) => c.priority === "critical");
      if (stillCritical) return s;
      return { ...s, step: "DEFINE" };
    });
  }, []);

  const runTest = useCallback(() => {
    setState((s) => {
      if (!s.experiment) return s;
      // Pure client-side computation — no network round trip needed for a
      // deterministic function over mock data. (See app/api/backtest/route.ts
      // for the equivalent server-side path, kept for parity / future use
      // with a real data source.)
      const backtest = runBacktest(s.experiment);
      return { ...s, backtest, step: "TEST" };
    });
  }, []);

  const proceedToLearn = useCallback(() => {
    setState((s) => ({ ...s, step: "LEARN" }));
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return {
    ...state,
    submitQuestion,
    overrideAssumption,
    resolveClarification,
    canProceedToDefine,
    proceedToDefine,
    runTest,
    proceedToLearn,
    reset,
  };
}
