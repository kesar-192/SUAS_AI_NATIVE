# AI Trading Research Assistant - Prototype

A small prototype demonstrating the **Ask -> Clarify -> Define -> Test -> Learn** research workflow for an AI-native trading research platform. It turns one informal question into a structured experiment, runs it against seeded mock data, and presents results with explicit limitations.

## Architecture

```text
User question
   |
   v
POST /api/parse-question -> Groq JSON mode -> StructuredExperiment
   |
   v
CLARIFY -> resolve critical questions and inspect assumptions
   |
   v
DEFINE -> review the finalized experiment
   |
   v
POST /api/backtest -> deterministic engine over seeded mock OHLC data
   |
   v
TEST + LEARN -> metrics, 70/30 validation, risk register, conclusions
```

The model handles language understanding, not arithmetic. The server cleans and validates Groq's JSON with Zod before the experiment reaches the deterministic engine. TEST runs through `/api/backtest`, so the browser receives a checked backtest result rather than calculating it locally.

## Research safeguards

- Critical ambiguity blocks progress until the user answers it.
- Close-based signals execute at the next day's open to reduce look-ahead bias.
- Positions do not overlap, keeping trade counts honest.
- Costs apply on both entry and exit legs.
- TEST runs separate chronological in-sample and out-of-sample windows.
- A warning appears below 20 trades, and LEARN includes an eight-category risk register.
- Prices are simulated, so results are workflow evidence rather than market findings.

## Technologies

- Next.js 14 App Router and TypeScript
- Groq SDK with server-only JSON-mode completion
- Zod as the shared experiment and backtest contract
- Tailwind CSS, Lucide Icons, and Recharts

## Running locally

```bash
npm install
cp .env.local.example .env.local
# add GROQ_API_KEY and optionally GROQ_MODEL
npm run dev
```

Open `http://localhost:3000`.

## Submission artifacts

- [Thinking note](docs/THINKING_NOTE.md) - product reasoning, evidence limits, and AI-use reflection.
- [Demo script](docs/DEMO_SCRIPT.md) - a timed 2-3 minute walkthrough.

## What I would improve next

Replace the mock NIFTY generator with survivorship-aware historical data, add walk-forward folds and confidence intervals, model spread and market impact, and persist experiments so future questions can reference prior evidence.
