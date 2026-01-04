// /app/lib/hybridDxEngine.ts
// Hybrid DX scoring engine combining deterministic + WSPR + FT8

import { BAND_FREQ } from "@/app/lib/propagation/bandScoring";
import { generateDeterministicDX } from "@/app/lib/dxEngine";

export type BandKey = keyof typeof BAND_FREQ;

export interface BeaconBandStats {
  count: number;
  maxDistance: number;
  medianSNR: number;
  lastHeard: number;
}

export interface HybridInputs {
  snr: number;
  absorption: number;
  muf: number;
  beaconStats?: Partial<Record<BandKey, BeaconBandStats>>; // WSPR
  ft8Stats?: Partial<Record<BandKey, BeaconBandStats>>;     // FT8
}

export interface HybridBandScore {
  band: BandKey;
  deterministic: number;
  wsprScore: number;
  ft8Score: number;
  hybrid: number;
}

// -------------------------
// Layer scoring functions
// -------------------------

function scoreWsprLayer(stats?: BeaconBandStats): number {
  if (!stats || stats.count === 0) return 0;

  const activity = Math.min(100, stats.count * 6);
  const distance = Math.min(100, stats.maxDistance / 50);
  const snr = Math.min(100, (stats.medianSNR + 30) * 3);

  return Math.round(activity * 0.4 + distance * 0.4 + snr * 0.2);
}

function scoreFt8Layer(stats?: BeaconBandStats): number {
  if (!stats || stats.count === 0) return 0;

  const activity = Math.min(100, stats.count * 4);
  const distance = Math.min(100, stats.maxDistance / 60);
  const snr = Math.min(100, (stats.medianSNR + 20) * 2);

  return Math.round(activity * 0.4 + distance * 0.4 + snr * 0.2);
}

// -------------------------
// Main hybrid scoring engine
// -------------------------

export function computeHybridBandScore(
  band: BandKey,
  inputs: HybridInputs
): HybridBandScore {
  // Deterministic layer
  const det = generateDeterministicDX({
    muf: inputs.muf,
    sfi: 100, // placeholder until you wire real SFI
    kp: 2,    // placeholder until you wire real Kp
  });

  const deterministic = det[band]?.dx ?? 0;

  // WSPR layer
  const wsprScore = scoreWsprLayer(inputs.beaconStats?.[band]);

  // FT8 layer
  const ft8Score = scoreFt8Layer(inputs.ft8Stats?.[band]);

  // Hybrid mix
  const hybrid =
    deterministic * 0.5 +
    wsprScore * 0.25 +
    ft8Score * 0.25;

  return {
    band,
    deterministic,
    wsprScore,
    ft8Score,
    hybrid: Math.round(Math.max(0, Math.min(100, hybrid))),
  };
}