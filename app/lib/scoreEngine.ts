// app/lib/scoreEngine.ts

export function computePropagationScore(bands: any): number {
  if (!bands) return 0;

  const entries = Object.values(bands);
  if (!entries.length) return 0;

  // Weighted scoring: higher bands matter slightly more
  const weights: Record<string, number> = {
    "80m": 0.8,
    "40m": 1.0,
    "20m": 1.2,
    "15m": 1.3,
    "10m": 1.4,
  };

  let total = 0;
  let weightSum = 0;

  for (const [bandName, stats] of Object.entries(bands)) {
    const dx = stats.dx ?? 0;
    const w = weights[bandName] ?? 1;
    total += dx * w;
    weightSum += w;
  }

  return Math.round(total / weightSum);
}