"use client";

import { useEffect, useState } from "react";
import { computeHybridBandScore } from "@/app/lib/hybridDxEngine";
import { BAND_FREQ } from "@/app/lib/propagation/bandScoring";
import { computePropagationScore } from "@/app/lib/scoreEngine";

// ----------------------------------------------------
// Utility: fetch with timeout (prevents hanging requests)
// ----------------------------------------------------
async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);
    return res;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export function useSummaryData() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const FT8_INTERVAL = 60000;      // 60s
  const WSPR_INTERVAL = 60000;     // 60s
  const CURRENT_INTERVAL = 300000; // 5 min

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    async function loadAll() {
      try {
        // ----------------------------------------------------
        // 1. Deterministic baseline forecast
        // ----------------------------------------------------
        const currentRes = await fetch("/api/current", { cache: "no-store" });
        const current = await currentRes.json();

        // ----------------------------------------------------
        // 2. WSPR (optional)
        // ----------------------------------------------------
        const wsprRes = await fetchWithTimeout("/api/wspr", 3000);
        const wspr = wsprRes ? await wsprRes.json() : null;
        const wsprEurope = wspr?.Europe ?? null;

        // ----------------------------------------------------
        // 3. FT8 (optional)
        // ----------------------------------------------------
        const ft8Res = await fetchWithTimeout("/api/ft8", 3000);
        const ft8 = ft8Res ? await ft8Res.json() : null;

        // ----------------------------------------------------
        // 4. Hybrid forecast (deterministic + WSPR + FT8)
        // ----------------------------------------------------
        let hybridForecast = current.forecast24h;

        try {
          const bands = Object.keys(BAND_FREQ) as (keyof typeof BAND_FREQ)[];

          hybridForecast = current.forecast24h.map((step: any) => {
            const muf = step.muf;
            const hybridBands: any = {};

            for (const band of bands) {
              const base = step.bands?.[band];
              if (!base) continue;

              const hybrid = computeHybridBandScore(band, {
                snr: base.snr,
                absorption: base.absorption,
                muf,
                beaconStats: wsprEurope,
                ft8Stats: ft8,
              });

              hybridBands[band] = {
                ...base,
                dx: hybrid.hybrid,
                dxDeterministic: hybrid.deterministic,
                dxWspr: hybrid.wsprScore,
                dxFt8: hybrid.ft8Score,
              };
            }

            return { ...step, bands: hybridBands, muf };
          });
        } catch (err) {
          console.warn("Hybrid scoring failed:", err);
        }

        // ----------------------------------------------------
        // 5. Snapshot values (safe, never zero unless truly zero)
        // ----------------------------------------------------
        const safeMuf =
          hybridForecast?.[0]?.muf ??
          current.forecast24h?.[0]?.muf ??
          current.muf ??
          0;

        const safeSf =
          current.sfEstimated ??
          current.sfiEstimated ?? // fallback for NOAA naming
          0;

        const safeKp = current.kp ?? 0;

        // ----------------------------------------------------
        // 6. Compute propagation score (shared scoring engine)
        // ----------------------------------------------------
        const currentBands = hybridForecast?.[0]?.bands ?? {};
        const score = computePropagationScore(currentBands);

        // ----------------------------------------------------
        // 7. Final payload
        // ----------------------------------------------------
        setData({
          ...current,
          forecast24h: hybridForecast,
          ft8Bands: ft8 ?? null,
          wsprBands: wsprEurope ?? null,
          snapshot: {
            muf: safeMuf,
            sf: safeSf,
            kp: safeKp,
          },
          score, // ⭐ now dynamic and correct
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Initial load
    loadAll();

    // Polling intervals
    t1 = setInterval(loadAll, CURRENT_INTERVAL);
    t2 = setInterval(loadAll, WSPR_INTERVAL);
    t3 = setInterval(loadAll, FT8_INTERVAL);

    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, []);

  return { data, isLoading };
}