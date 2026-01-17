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
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    async function loadAll() {
      try {
        const currentRes = await fetch("/api/current", { cache: "no-store" });
        if (!currentRes.ok) throw new Error("current API failed");

        const current = await currentRes.json();

        const wsprRes = await fetchWithTimeout("/api/wspr", 3000);
        const wspr = wsprRes ? await wsprRes.json() : null;
        const wsprEurope = wspr?.Europe ?? null;

        const ft8Res = await fetchWithTimeout("/api/ft8", 3000);
        const ft8 = ft8Res ? await ft8Res.json() : null;

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

        const currentBands = hybridForecast?.[0]?.bands ?? {};
        const score = computePropagationScore(currentBands);

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
        });

        setIsLoading(false);
      } catch {
        // keep loading state
      }
    }

    loadAll();

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