// lib/schemas/experiment.ts
// [AI-GENERATED — reviewed and adjusted] Core data contract for the entire app.
// Every step (Clarify, Define, Test, Learn) reads and writes against this
// single schema, which is what keeps the app "structured JSON" rather than
// a chatbot wrapper: the LLM's only job is to fill this shape, nothing more.
import { z } from "zod";

export const InstrumentSchema = z.enum(["NIFTY", "BANKNIFTY", "SENSEX"]);

export const ConditionSchema = z.object({
  metric: z.string().describe("e.g. 'daily_return_pct', 'rsi_14'"),
  operator: z.enum(["<=", ">=", "<", ">", "=="]),
  value: z.number(),
  description: z
    .string()
    .describe("Human-readable version, e.g. 'NIFTY closes down 1% or more vs previous close'"),
});

// Distinguishes: did the user say this, did we assume it, or is it still open?
export const AssumptionSchema = z.object({
  field: z.string().describe("Dot-path into StructuredExperiment this assumption fills, e.g. 'holdingPeriod'"),
  assumedValue: z.string(),
  reasoning: z.string().describe("Why this default was chosen"),
  confidence: z.enum(["high", "medium", "low"]),
  userConfirmed: z.boolean().default(false),
});

export const ClarificationQuestionSchema = z.object({
  id: z.string(),
  field: z.string(),
  question: z.string(),
  why: z.string().describe("Why this matters for the experiment's validity"),
  suggestedDefault: z.string().optional(),
  priority: z.enum(["critical", "recommended", "optional"]),
});

export const StructuredExperimentSchema = z.object({
  market: InstrumentSchema,
  timeframe: z.enum(["daily", "weekly", "intraday"]),
  entry: ConditionSchema,
  exit: z.object({
    type: z.enum(["fixed_holding_period", "target_stop", "signal_reversal"]),
    description: z.string(),
    targetPct: z.number().optional(),
    stopPct: z.number().optional(),
  }),
  holdingPeriod: z.object({
    value: z.number(),
    unit: z.enum(["days", "weeks"]),
  }),
  testPeriod: z.object({
    start: z.string().describe("ISO date, e.g. 2021-01-01"),
    end: z.string().describe("ISO date, e.g. 2024-12-31"),
    rationale: z.string(),
  }),
  filters: z.array(z.string()).default([]),
  costAssumptions: z.object({
    slippagePct: z.number().default(0.05),
    transactionCostPct: z.number().default(0.03),
    notes: z.string().optional(),
  }),
  hypothesis: z.string().describe("The testable claim, phrased precisely"),
  originalQuestion: z.string(),
  assumptions: z.array(AssumptionSchema),
  clarificationsNeeded: z.array(ClarificationQuestionSchema),
});

export type Instrument = z.infer<typeof InstrumentSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Assumption = z.infer<typeof AssumptionSchema>;
export type ClarificationQuestion = z.infer<typeof ClarificationQuestionSchema>;
export type StructuredExperiment = z.infer<typeof StructuredExperimentSchema>;
