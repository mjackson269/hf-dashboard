"use client";

import { useEffect, useState } from "react";
import { computeHybridBandScore } from "@/app/lib/hybridDxEngine";
import { BAND_FREQ } from "@/app/lib/propagation/bandScoring";

// -----------------------------
// Timeout wrapper (never hangs)
// -----------------------------
async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    console.warn("Timeout or fetch error for:", url);
    return null;
  }
}

export function useSummaryData() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // -----------------------------------------
        // 1. Load deterministic forecast (required)
        //-----------------------------------------
        const currentRes = await fetch("/api/current", { cache: "no-store" });
        const current = await currentRes.json();

        // -----------------------------------------
        // 2. Load WSPR (optional, timeout protected)
        //-----------------------------------------
        const wsprRes = await fetchWithTimeout("/api/wspr", 3000);
        const wspr = wsprRes ? await wsprRes.json() : null;
        const wsprEurope = wspr?.Europe ?? null;

        if (!wsprEurope) {
          console.warn("Hybrid scoring: WSPR unavailable");
        }

        // -----------------------------------------
        // 3. Load FT8 (optional, timeout protected)
        //-----------------------------------------
        const ft8Res = await fetchWithTimeout("/api/ft8", 3000);
        const ft8 = ft8Res ? await ft8Res.json() : null;

        if (!ft8) {
          console.warn("Hybrid scoring: FT8 unavailable");
        }

        // -----------------------------------------
        // 4. Build hybrid forecast (safe)
        //-----------------------------------------
        let hybridForecast = current.forecast24h;

        try {
          const bands = Object.keys(BAND_FREQ) as (keyof typeof BAND_FREQ)[];

          hybridForecast = current.forecast24h.map((step: any) => {
            const muf = step.muf;
            const hybridBands: any = {};

            for (const band of bands) {
              const base = step.bands?.[band];
              if (!base) {
                console.warn("Missing band in forecast step:", band);
                continue;
              }

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

            return {
              ...step,
              bands: hybridBands,
              muf,
            };
          });
        } catch (err) {
          console.error("Hybrid scoring failed:", err);
          hybridForecast = current.forecast24h; // fallback
        }

        // -----------------------------------------
        // 5. Final data payload (EXPOSE HYBRID LAYERS)
        //-----------------------------------------
        setData({
          ...current,
          forecast24h: hybridForecast,
          ft8Bands: ft8 ?? null,
          wsprBands: wsprEurope ?? null,
        });

      } catch (err) {
        console.error("Failed to load summary data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return { data, isLoading };
}