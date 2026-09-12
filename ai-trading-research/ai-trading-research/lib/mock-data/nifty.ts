// lib/mock-data/nifty.ts
// [PERSONALLY DESIGNED] Seeded PRNG so every run of the same experiment
// produces the same "market" — reproducibility matters for a research tool,
// even a mock one. Includes a crude volatility regime switch so "high
// volatility" filters in the engine have something real to key off.
export interface OhlcBar {
  date: string; // ISO yyyy-mm-dd
  open: number;
  close: number;
  high: number;
  low: number;
}

function mulberry32(seed: number) {
  let s = seed;
  return function random(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function generateNiftySeries(startISO: string, endISO: string, seed = 42): OhlcBar[] {
  const rand = mulberry32(seed);
  const bars: OhlcBar[] = [];
  let price = 22000;
  let volRegime = 0.008; // baseline daily vol ~0.8%

  const start = new Date(startISO);
  const end = new Date(endISO);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    // Fallback window so a malformed testPeriod never crashes the engine.
    return generateNiftySeries("2021-01-01", "2024-12-31", seed);
  }

  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // skip weekends — no holiday calendar in mock data

    // Regime switch: ~3% daily chance of flipping into/out of a high-vol regime
    if (rand() < 0.03) {
      volRegime = volRegime > 0.012 ? 0.008 : 0.02;
    }

    const drift = 0.0002; // slight upward drift, roughly matches long-run index behavior
    const shock = (rand() - 0.5) * 2 * volRegime;
    const dailyReturn = drift + shock;

    const open = price;
    const close = open * (1 + dailyReturn);
    const wick = Math.abs(close - open) * (0.3 + rand() * 0.7);
    const high = Math.max(open, close) + wick * rand();
    const low = Math.min(open, close) - wick * rand();

    bars.push({
      date: new Date(d).toISOString().slice(0, 10),
      open: round2(open),
      close: round2(close),
      high: round2(high),
      low: round2(low),
    });

    price = close;
  }

  return bars;
}
