# AI Trading Research Assistant — Prototype

A small prototype demonstrating the **Ask → Clarify → Define → Test → Learn** research
workflow for an AI-native trading research platform. Built for the "Option 2: AI
Full-Stack Developer Intern" assignment.

Not a trading platform. The scope is deliberately narrow: turn one informal question
into a structured, testable experiment, run it against simulated data, and present the
result honestly — including its own limitations.

## Architecture

```
User question
   │
   ▼
POST /api/parse-question  ──►  LLM (Claude, via Vercel AI SDK generateObject)
   │                              parses question into StructuredExperiment,
   │                              separating: stated facts / assumptions / open questions
   ▼
CLARIFY (client)  ──►  user resolves any "critical" clarifications,
   │                    can override any assumption inline
   ▼
DEFINE (client)   ──►  renders the finalized StructuredExperiment
   │
   ▼
runBacktest()     ──►  deterministic engine, runs client-side against
   │                    seeded mock NIFTY OHLC data (lib/mock-data/nifty.ts)
   ▼
TEST + LEARN (client) ──► equity curve + metrics, then "what the data shows"
                           vs. "what the system concludes" split
```

**Why the LLM only touches the ASK → CLARIFY boundary:** everything downstream
(backtest math, metrics, drawdown) is deterministic code, not model output. An LLM
computing a Sharpe ratio would be unverifiable and slower for no benefit — the model's
job is natural-language understanding and structuring, not arithmetic.

**Why `assumptions` and `clarificationsNeeded` are two separate arrays, not one:** an
assumption is something the system already resolved (with visible reasoning) that the
user can silently accept or override. A clarification is something the system refuses
to resolve on its own — because getting it wrong (e.g. holding period, exit rule) would
silently invalidate the result. The UI enforces this: critical clarifications physically
block progressing to DEFINE.

## Technologies

- **Next.js 14 (App Router) + TypeScript** — API routes double as the backend, no
  separate server needed for a prototype this size.
- **Vercel AI SDK (`generateObject`) + Anthropic** — structured output validated
  against a Zod schema, not free-text parsing. If the model's output doesn't match the
  schema, the call fails loudly rather than shipping malformed data downstream.
- **Zod** — the single source of truth (`lib/schemas/`) shared by the API route, the
  backtest engine, and every UI component.
- **Tailwind CSS + Lucide Icons** — dark, data-dense "terminal" aesthetic, chosen to
  match the subject matter (financial research tooling) rather than a generic SaaS look.
- **Recharts** — equity curve rendering.

## Key Assumptions

- **Volatility filters** are approximated with a rolling 20-day standard deviation of
  daily returns (threshold >1%), not a validated regime model — this is a heuristic
  stand-in, explicitly surfaced in the result's `dataQualityNotes`.
- **Market data is fully simulated** (seeded random walk with a crude volatility-regime
  switch), not real NIFTY history. The workflow is real; the "market" is not.
- **No overlapping positions** — once in a trade, later signals are skipped until exit.
  This keeps trade counts honest at the cost of understating how a real portfolio might
  size multiple concurrent signals.
- **Costs are charged per side** (entry + exit), using user-adjustable slippage/txn cost
  assumptions with sane defaults (0.05% / 0.03%).

## What I'd Improve With More Time

- Replace the mock NIFTY generator with a real historical dataset (even a static CSV of
  daily closes would meaningfully change the "Learn" step from illustrative to genuinely
  informative).
- Make volatility/qualitative-term parsing configurable per-question instead of a single
  hardcoded heuristic in the engine — right now "high volatility" always means the same
  20-day-std-dev rule regardless of what the user actually meant.
- Add a persistence layer (the brief mentions "remember what it learned") — currently
  each session is stateless; a Postgres/Supabase table of past experiments + results
  would let the system reference prior findings when parsing a new question.
- Out-of-sample / walk-forward validation instead of a single test window, to make the
  Sharpe/return numbers something closer to statistically defensible.

## Running Locally

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open `http://localhost:3000`.

---

## AI Usage Note

**Tools used:** Claude (via claude.ai chat), used as an iterative development partner
across the whole build.

**What I used it for:**
- Scaffolding boilerplate (Zod schema shapes, Recharts wiring, Tailwind class lists) —
  the parts of the code that are the same regardless of the specific product.
- A first draft of the backtest engine's metric formulas (win rate, Sharpe, drawdown),
  which I then reviewed line-by-line for the look-ahead-bias and cost-application logic
  specifically, since those are the parts that actually determine whether the results
  are trustworthy.
- Drafting component markup for the five workflow steps, which I then adjusted for the
  actual state shape and UX behavior I wanted (e.g. critical clarifications blocking
  progression — that gating logic is mine, not a default the model reached for).

**What I designed myself:**
- The `assumptions` vs. `clarificationsNeeded` split and the "critical blocks progress"
  rule — this is the core answer to "handling ambiguity" and isn't something a generic
  prompt produces on its own.
- The no-look-ahead / no-overlapping-trades constraints in the backtest engine, and the
  decision to keep the LLM entirely out of the arithmetic path.
- The Ask → Clarify → Define → Test → Learn state machine shape and what data crosses
  each boundary.
- The "what the data shows" vs. "system conclusions & limits" split in LEARN, including
  which specific caveats (sample size, simulated data, no out-of-sample testing) needed
  to be named rather than left implicit.

**What I reviewed or modified:**
- Renamed a volatility helper that AI-generated code had called `rollingVolPercentile`
  when it actually computed a raw standard deviation — the name was misleading about
  what the number meant, which matters for a research tool where precision of claims is
  the whole point.
- Tightened the Sharpe ratio annualization and added an explicit comment noting it
  assumes roughly independent, evenly-spaced trades — a simplification, not a rigorous
  calculation, and I wanted that limitation visible in the code, not just in my head.

**Part I'm most proud of:** the `assumptions`/`clarificationsNeeded` split and the UI
gate on critical clarifications. It's a small piece of logic, but it's the concrete,
checkable mechanism behind "the system should ask rather than blindly assume" — not
just a UI label saying so.
