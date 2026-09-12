// app/api/parse-question/route.ts
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { StructuredExperimentSchema } from "@/lib/schemas/experiment";

export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an AI trading research assistant. Parse the user's market question into a structured JSON object.

Return STRICT RAW JSON ONLY. Do not use markdown blocks or extra text.
The JSON must match this exact shape:
{
  "market": "NIFTY" | "BANKNIFTY" | "SENSEX",
  "timeframe": "daily" | "weekly" | "intraday",
  "entry": { "metric": string, "operator": "<=" | ">=" | "<" | ">" | "==", "value": number, "description": string },
  "exit": { "type": "fixed_holding_period" | "target_stop" | "signal_reversal", "description": string, "targetPct"?: number, "stopPct"?: number },
  "holdingPeriod": { "value": number, "unit": "days" | "weeks" },
  "testPeriod": { "start": string, "end": string, "rationale": string },
  "filters": string[],
  "costAssumptions": { "slippagePct": number, "transactionCostPct": number, "notes"?: string },
  "hypothesis": string,
  "originalQuestion": string,
  "assumptions": [{ "field": string, "assumedValue": string, "reasoning": string, "confidence": "high" | "medium" | "low", "userConfirmed": boolean }],
  "clarificationsNeeded": [{ "id": string, "field": string, "question": string, "why": string, "suggestedDefault"?: string, "priority": "critical" | "recommended" | "optional" }]
}

Do not silently invent load-bearing details. Put uncertain details in assumptions, and add critical missing details to clarificationsNeeded. Use recent multi-year dates when the user does not provide a test period, and explain that assumption. Always include costAssumptions.`;

function cleanJsonResponse(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function omitOptionalNulls(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;

  const value = parsed as Record<string, unknown>;
  const exit = value.exit;
  if (exit && typeof exit === "object") {
    const exitValue = exit as Record<string, unknown>;
    if (exitValue.targetPct === null) delete exitValue.targetPct;
    if (exitValue.stopPct === null) delete exitValue.stopPct;
  }

  const clarifications = value.clarificationsNeeded;
  if (Array.isArray(clarifications)) {
    for (const clarification of clarifications) {
      if (clarification && typeof clarification === "object") {
        const clarificationValue = clarification as Record<string, unknown>;
        if (clarificationValue.suggestedDefault === null) delete clarificationValue.suggestedDefault;
      }
    }
  }

  return value;
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question = (body as { question?: unknown })?.question;

  if (typeof question !== "string" || question.trim().length < 8) {
    return NextResponse.json(
      { error: "Please enter a fuller question (at least a few words)." },
      { status: 400 }
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0,
      max_tokens: 1000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${question.trim()}\nKeep every string concise and omit optional numeric fields when unused.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty response.");

    const parsed = omitOptionalNulls(JSON.parse(cleanJsonResponse(content)));
    const result = StructuredExperimentSchema.safeParse(parsed);
    if (!result.success) {
      console.error("[parse-question] Groq returned invalid experiment JSON:", result.error.flatten());
      throw new Error("Groq returned an invalid experiment shape.");
    }

    const experiment = result.data;
    return NextResponse.json({ experiment });
  } catch (err) {
    console.error("[parse-question] LLM call failed:", err);
    return NextResponse.json(
      { error: "Could not parse the question right now. Please try again." },
      { status: 502 }
    );
  }
}
