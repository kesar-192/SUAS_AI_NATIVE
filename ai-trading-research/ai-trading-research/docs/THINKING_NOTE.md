# Thinking Note: AI Trading Research Assistant

## Problem and thesis

The assistant is designed for questions that sound simple but hide decisions that materially change a backtest: what counts as a fall, when to enter, how long to hold, and which dates count as evidence. The central product decision is to separate stated facts, explicit assumptions, and unresolved critical clarifications. A polished answer is less valuable than a reproducible experiment whose uncertainty is visible.

## Why this workflow

ASK converts natural language into a typed experiment. CLARIFY blocks progress when a missing decision could invalidate the result. DEFINE makes every parameter inspectable before TEST runs. TEST performs deterministic arithmetic through the server backtest route. LEARN separates observations from conclusions and now shows a chronological out-of-sample check plus a risk register.

This boundary keeps the model responsible for language understanding, not financial arithmetic. The API validates the model response with Zod before it reaches the engine. The engine applies costs on both entry and exit, prevents overlapping positions, and executes on the next day's open after a close-based signal.

## What can go wrong

The risk register names eight failure modes instead of hiding them in implementation comments. Ambiguous definitions are mitigated by critical clarifications and visible assumptions. Look-ahead bias is mitigated by next-open execution. Overfitting and insufficient evidence remain only partially mitigated: a 20-trade warning and a 70/30 split improve discipline but do not create statistical power. Survivorship bias, simulated data quality, and realistic liquidity remain open because this prototype uses one seeded synthetic index series. Transaction costs are partial because fees are modeled but spread, impact, and failed fills are not.

## Evidence and limits

The full-period result is useful for demonstrating the workflow, not for claiming a market edge. The out-of-sample window is chronological and never used to choose parameters; it is a falsification check. If return direction changes between windows, the conclusion is inconclusive. Even if it agrees, the evidence is weak when the trade count is low. The app therefore uses language such as directional and exploratory rather than authoritative.

The most important next step is replacing the mock series with survivorship-aware historical data and adding a proper transaction model. After that, the experiment should support multiple walk-forward folds, confidence intervals or bootstrap analysis, and a persisted experiment ledger so future questions can be compared with prior evidence.

## AI use and engineering judgment

AI assistance was used for scaffolding and alternative implementation ideas. The product judgments are the clarification gate, the typed experiment contract, next-open execution, non-overlapping trades, the split between observations and conclusions, and the explicit risk register. Those choices are where trust is won or lost in a research assistant; they are also the parts I would defend in a code review.
