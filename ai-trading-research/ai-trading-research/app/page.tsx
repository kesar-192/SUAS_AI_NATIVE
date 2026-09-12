// app/page.tsx
// [PERSONALLY DESIGNED layout, AI-ASSISTED styling]
"use client";

import { TrendingUp } from "lucide-react";
import { useResearchFlow } from "@/lib/hooks/useResearchFlow";
import { StepProgress } from "@/components/StepProgress";
import { AskStep } from "@/components/steps/AskStep";
import { ClarifyStep } from "@/components/steps/ClarifyStep";
import { DefineStep } from "@/components/steps/DefineStep";
import { TestStep } from "@/components/steps/TestStep";
import { LearnStep } from "@/components/steps/LearnStep";

export default function Home() {
  const flow = useResearchFlow();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-12">
      <div className="flex items-center justify-center gap-2 mb-10">
        <TrendingUp className="text-emerald-400" size={20} />
        <span className="font-mono text-sm text-zinc-400 tracking-wide">AI TRADING RESEARCH ASSISTANT</span>
      </div>

      <StepProgress current={flow.step} />

      {flow.step === "ASK" && (
        <AskStep onSubmit={flow.submitQuestion} isLoading={flow.isLoading} error={flow.error} />
      )}

      {flow.step === "CLARIFY" && flow.experiment && (
        <ClarifyStep
          experiment={flow.experiment}
          onOverrideAssumption={flow.overrideAssumption}
          onResolveClarification={flow.resolveClarification}
          canProceed={flow.canProceedToDefine()}
          onContinue={flow.proceedToDefine}
        />
      )}

      {flow.step === "DEFINE" && flow.experiment && (
        <DefineStep experiment={flow.experiment} onRunTest={flow.runTest} />
      )}

      {flow.step === "TEST" && flow.backtest && (
        <TestStep backtest={flow.backtest} onContinue={flow.proceedToLearn} />
      )}

      {flow.step === "LEARN" && flow.experiment && flow.backtest && (
        <LearnStep experiment={flow.experiment} backtest={flow.backtest} onReset={flow.reset} />
      )}
    </main>
  );
}
