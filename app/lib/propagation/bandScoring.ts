// /lib/propagation/bandScoring.ts
// Deterministic MUF-aware band scoring

export const BAND_FREQ = {
  "80m": 3.6,
  "40m": 7.1,
  "20m": 14.1,
  "15m": 21.1,
  "10m": 28.5,
};

export type BandKey = keyof typeof BAND_FREQ;

export function classifyMufSupport(muf: number, band: BandKey) {
  const ratio = muf / BAND_FREQ[band];

  if (ratio < 0.8) return { label: "Closed", viability: 0 };
  if (ratio < 1.1) return { label: "Marginal", viability: 0.5 };
  return { label: "Open", viability: 1 };
}

export function scoreBand({
  muf,
  band,
  dx,
}: {
  muf: number;
  band: BandKey;
  dx: number;
}) {
  const { viability } = classifyMufSupport(muf, band);
  return viability * dx;
}