// app/layout.tsx
// [AI-GENERATED, reviewed] Standard Next.js root layout. Font choice
// (monospace-leaning) is a deliberate, personally-made call to reinforce the
// terminal aesthetic — see globals.css for the palette reasoning.
import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Trading Research Assistant",
  description: "Turn an informal market question into a structured, testable research experiment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">{children}</body>
    </html>
  );
}
