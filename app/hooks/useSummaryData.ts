"use client";

import { useEffect, useState } from "react";
import { computeHybridBandScore } from "@/app/lib/hybridDxEngine";
import { BAND_FREQ } from "@/app/lib/propagation/bandScoring";
import { computePropagationScore } from "@/app/lib/scoreEngine";

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
  const [data, setData] = useState<any>({
    snapshot: null,
    score: null,
    intel: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    async function loadAll() {
      try {
        // -----------------------------
        // 1. Fetch CURRENT snapshot
        // -----------------------------
        const currentRes = await fetch("/api/current", { cache: "no-store" });
        if (!currentRes.ok) throw new Error("current API failed");

        const current = await currentRes.json();

        // -----------------------------
        // 2. Fetch WSPR + FT8 (timeout)
        // -----------------------------
        const wsprRes = await fetchWithTimeout("/api/wspr", 3000);
        const wspr = wsprRes ? await wsprRes.json() : null;
        const wsprEurope = wspr?.Europe ?? null;

        const ft8Res = await fetchWithTimeout("/api/ft8", 3000);
        const ft8 = ft8Res ? await ft8Res.json() : null;

        // -----------------------------
        // 3. Build hybrid forecast
        // -----------------------------
        let hybridForecast = current.forecast24h ?? [];

        try {
          const bands = Object.keys(BAND_FREQ) as (keyof typeof BAND_FREQ)[];
          hybridForecast = hybridForecast.map((step: any) => {
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
        } catch {}

        // -----------------------------
        // 4. Safe snapshot extraction
        // -----------------------------
        const safeMuf =
          hybridForecast?.[0]?.muf ??
          current.forecast24h?.[0]?.muf ??
          current.muf ??
          null;

        const safeSf =
          current.sfEstimated ??
          current.sfiEstimated ??
          null;

        const safeKp = current.kp ?? null;

        const snapshotReady =
          safeMuf !== null &&
          safeSf !== null &&
          safeKp !== null;

        if (!snapshotReady) {
          return; // keep loading state
        }

        // -----------------------------
        // 5. Compute numeric score
        // -----------------------------
        const currentBands = hybridForecast?.[0]?.bands ?? {};
        const score = computePropagationScore(currentBands);

        // -----------------------------
        // 6. RESTORE AI INTELLIGENCE CALL
        // -----------------------------
        let intel = null;
        try {
          const summaryPayload = {
            muf: safeMuf,
            sf: safeSf,
            kp: safeKp,
            bands: currentBands,
            forecast: hybridForecast,
            score,
          };

          const intelRes = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary: summaryPayload }),
          });

          if (intelRes.ok) {
            const json = await intelRes.json();
            intel = json.text ?? null;
          }
        } catch (err) {
          console.error("AI summary error:", err);
          intel = null;
        }

        // -----------------------------
        // 7. Final state update
        // -----------------------------
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
          score,
          intel, // ⭐ restored AI intelligence feed
        });

        setIsLoading(false);
      } catch {
        // keep loading state
      }
    }

    loadAll();

    // Refresh intervals
    t1 = setInterval(loadAll, 300000);
    t2 = setInterval(loadAll, 60000);
    t3 = setInterval(loadAll, 60000);

    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, []);

  return { data, isLoading };
}