"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

const bands = ["80m", "40m", "20m", "15m", "10m"] as const;
type BandKey = (typeof bands)[number];

export default function DXOutlook() {
  const { data, isLoading } = useSummaryData();
  const forecast = data?.forecast24h ?? [];

  if (isLoading || !forecast.length) {
    return <div className={card}>Generating DX outlook…</div>;
  }

  // ---------------------------
  // Extract key metrics
  // ---------------------------

  // MUF trend
  const mufValues = forecast.map((f: any) => f.muf);
  const mufMin = Math.min(...mufValues);
  const mufMax = Math.max(...mufValues);
  const mufNow = mufValues[0];

  // Best DX window
  let bestDX = { time: "", band: "", dx: -1 };
  forecast.forEach((step: any) => {
    for (const band of bands) {
      const dx = step.dxProbability[band];
      if (dx > bestDX.dx) {
        bestDX = { time: step.timeLabel, band, dx };
      }
    }
  });

  // Band behaviour summaries
  const bandSummary: Record<BandKey, { avg: number; max: number }> = {
    "80m": { avg: 0, max: 0 },
    "40m": { avg: 0, max: 0 },
    "20m": { avg: 0, max: 0 },
    "15m": { avg: 0, max: 0 },
    "10m": { avg: 0, max: 0 },
  };

  bands.forEach((band) => {
    const values = forecast.map((f: any) => f.dxProbability[band]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    bandSummary[band] = { avg, max };
  });

  // ---------------------------
  // Build the narrative
  // ---------------------------

  const lines: string[] = [];

  // MUF behaviour
  if (mufMax >= 28) {
    lines.push(
      `MUF peaks around ${mufMax} MHz, supporting strong 20m and 15m openings through the day.`
    );
  } else if (mufMax >= 20) {
    lines.push(
      `MUF reaches about ${mufMax} MHz, giving moderate 20m performance and limited 15m activity.`
    );
  } else {
    lines.push(
      `Low MUF today (max ${mufMax} MHz) limits higher-band DX, favouring 40m and 80m.`
    );
  }

  // High-band behaviour
  if (bandSummary["10m"].max >= 40) {
    lines.push(`10m may open briefly around midday with marginal DX potential.`);
  } else {
    lines.push(`10m remains mostly closed with poor DX probability.`);
  }

  if (bandSummary["15m"].max >= 60) {
    lines.push(`15m shows good DX potential during the late morning and early afternoon.`);
  }

  if (bandSummary["20m"].max >= 70) {
    lines.push(`20m is the most reliable daytime DX band with consistently strong signals.`);
  }

  // Low-band behaviour
  if (bandSummary["40m"].max >= 60 || bandSummary["80m"].max >= 60) {
    lines.push(
      `40m and 80m improve significantly after sunset with lower absorption and stable conditions.`
    );
  }

  // Best DX window
  lines.push(
    `Best DX window: around ${bestDX.time} UTC on ${bestDX.band} (${bestDX.dx}% probability).`
  );

  const outlook = lines.join(" ");

  // ---------------------------
  // Render
  // ---------------------------

  return (
    <div className={card}>
      <h2 className={panelTitle}>DX Outlook</h2>
      <p className="text-sm text-neutral-300 leading-relaxed mt-2">{outlook}</p>
    </div>
  );
}