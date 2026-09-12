# Demo Script (2-3 minutes)

## 0:00-0:20 — Frame the problem

Open the app at `http://localhost:3000`. Say: "This is a research assistant, not a trading signal generator. Its job is to turn an ambiguous market question into an inspectable experiment and make uncertainty visible."

## 0:20-0:55 — Ask and clarify

Use: "Does buying NIFTY after a 1% fall work?" Click **Ask**. Point out that the model returns a typed experiment rather than a paragraph. Resolve any critical clarification, and show that assumptions include reasoning and can be overridden.

## 0:55-1:20 — Define

Continue to DEFINE. Point out the market, entry condition, holding period, date range, costs, and hypothesis. Explain that the backtest cannot silently use a cosmetic override: confirmed answers are applied to the typed fields consumed by the engine.

## 1:20-1:55 — Test

Run the test. Show the equity curve and metrics. Pause on the small-sample warning if the result has fewer than 20 trades. Then show the in-sample/out-of-sample cards and the split date. Say: "This second window was held out chronologically; agreement is useful evidence, disagreement is a reason not to trust the edge."

## 1:55-2:40 — Learn and risk register

Open **View Conclusions**. Contrast "What the data shows" with "System conclusions & limits." Scroll to the risk register and name the categories: ambiguous definitions, look-ahead bias, overfitting, insufficient evidence, survivorship bias, transaction costs, data quality, and execution/liquidity. Highlight that the UI labels each as mitigated, partial, or open instead of burying caveats in code.

## 2:40-3:00 — Close

Say: "The current prices are seeded mock data, so this is evidence about the workflow, not a market claim. The next honest upgrade is real historical data plus walk-forward folds and realistic execution modeling." 
