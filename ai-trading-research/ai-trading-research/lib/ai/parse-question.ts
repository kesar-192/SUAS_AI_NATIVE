// lib/ai/parse-question.ts
// [PERSONALLY DESIGNED PROMPT, AI-ASSISTED WRAPPER] The prompt is the actual
// "product thinking" artifact here — it encodes the rule that the LLM must
// never silently invent a critical parameter, which is the assignment's
// core "handling ambiguity" requirement made concrete.
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StructuredExperimentSchema, type StructuredExperiment } from "@/lib/schemas/experiment";

const SYSTEM_PROMPT = `You are a quantitative research assistant that converts an informal
trading question into a structured, testable experiment.

RULES (do not break these):
1. Only fill a field with high confidence if the user's wording directly implies it.
   Example: "1% fall" -> entry condition is unambiguous, no assumption needed for that field.
2. For anything not directly stated (holding period, exit rule, test period, volatility
   definition, filters), you MUST either:
   a) put it in "assumptions" with your reasoning and a "confidence" level, OR
   b) if it's critical to the validity of the result (e.g. holding period, exit rule),
      put it in "clarificationsNeeded" with priority "critical" instead of silently assuming.
3. Never invent a "reasonable-sounding" number for something load-bearing (holding period,
   stop-loss, test date range) without flagging it as either an assumption or a question.
   It is better to ask than to quietly decide for the user.
4. Vague qualitative terms ("sharp fall", "high volatility") always need a numeric
   definition. Propose one as an assumption (with reasoning), AND add a clarification
   question offering to change it — never resolve ambiguity invisibly.
5. testPeriod should default to a recent multi-year window (state your reasoning) unless
   the user specified one — always flagged as an assumption, never as fact.
6. costAssumptions should always be filled (slippage + transaction cost are structural,
   not something to ask the user for) — default them and explain briefly in "notes".
7. hypothesis must be a single falsifiable sentence, not a restatement of the question.
8. Every "id" inside clarificationsNeeded must be a short unique slug (e.g. "holding_period").

Output must conform exactly to the provided schema.`;

export async function parseQuestionToExperiment(question: string): Promise<StructuredExperiment> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: StructuredExperimentSchema,
    system: SYSTEM_PROMPT,
    prompt: `User's question: "${question}"

Parse this into a StructuredExperiment. Remember: distinguish clearly between what the
user actually said, what you're assuming (and why), and what genuinely needs to be asked.`,
  });

  return object;
}
