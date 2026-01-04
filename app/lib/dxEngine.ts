// /app/lib/dxEngine.ts
// Operator-grade deterministic DX/SNR/absorption model

import { BAND_FREQ, BandKey, classifyMufSupport } from "@/app/lib/propagation/bandScoring";

type DXInputs = {
  muf: number;
  sfi: number;
  kp: number;
};

type BandStats = {
  snr: number;
  absorption: number;
  dx: number;
};

export type BandStatsMap = Record<BandKey, BandStats>;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const BASE_NOISE_DB: Record<BandKey, number> = {
  "80m": 35,
  "40m": 30,
  "20m": 25,
  "15m": 22,
  "10m": 20,
};

const DX_FRIENDLINESS: Record<BandKey, number> = {
  "80m": 0.6,
  "40m": 0.8,
  "20m": 1.0,
  "15m": 0.85,
  "10m": 0.7,
};

const BASE_ABSORPTION: Record<BandKey, number> = {
  "80m": 6,
  "40m": 4,
  "20m": 2,
  "15m": 1.5,
  "10m": 1,
};

export function generateDeterministicDX({ muf, sfi, kp }: DXInputs): BandStatsMap {
  const result: Partial<BandStatsMap> = {};

  const kpAbsorptionBoost = Math.max(0, (kp - 2) * 1.2);
  const kpSnrPenalty = Math.max(0, (kp - 2) * 2.5);
  const sfiBoost = clamp((sfi - 70) / 4, -5, 15);

  (Object.keys(BAND_FREQ) as BandKey[]).forEach((band) => {
    const freq = BAND_FREQ[band];
    const { viability } = classifyMufSupport(muf, band);

    const ratio = muf / freq;

    let snr =
      18 +
      sfiBoost -
      kpSnrPenalty -
      (BASE_NOISE_DB[band] - 20) * 0.3;

    if (ratio > 1.2) snr += 3;
    if (ratio > 1.6) snr += 2;
    if (ratio < 1.0) snr -= 5;

    snr = clamp(snr, 5, 40);

    let absorption =
      BASE_ABSORPTION[band] +
      kpAbsorptionBoost +
      (ratio < 1 ? (1 - ratio) * 4 : 0);

    absorption = clamp(absorption, 0.5, 10);

    let dx =
      viability * 100 *
      DX_FRIENDLINESS[band] *
      (snr / 30) *
      (1 - absorption / 15);

    dx = clamp(dx, 0, 100);

    result[band] = {
      snr: Number(snr.toFixed(1)),
      absorption: Number(absorption.toFixed(1)),
      dx: Math.round(dx),
    };
  });

  return result as BandStatsMap;
}