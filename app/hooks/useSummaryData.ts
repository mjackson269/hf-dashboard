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
    console.log("🔄 useSummaryData mounted");

    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    async function loadAll() {
      console.log("🚀 Running loadAll()");

      try {
        // ----------------------------------------------------
        // 1. Fetch CURRENT snapshot
        // ----------------------------------------------------
        console.log("📡 Fetching /api/current …");
        const currentRes = await fetch("/api/current", { cache: "no-store" });

        if (!currentRes.ok) {
          console.error("❌ /api/current failed:", currentRes.status);
          return;
        }

        const current = await currentRes.json();
        console.log("✅ /api/current:", current);

        // ----------------------------------------------------
        // 2. Fetch WSPR + FT8 (with timeout)
        // ----------------------------------------------------
        console.log("📡 Fetching /api/wspr …");
        const wsprRes = await fetchWithTimeout("/api/wspr", 3000);
        const wspr = wsprRes ? await wsprRes.json() : null;
        console.log("📡 WSPR:", wspr);

        const wsprEurope = wspr?.Europe ?? null;

        console.log("📡 Fetching /api/ft8 …");
        const ft8Res = await fetchWithTimeout("/api/ft8", 3000);
        const ft8 = ft8Res ? await ft8Res.json() : null;
        console.log("📡 FT8:", ft8);

        // ----------------------------------------------------
        // 3. Build hybrid forecast
        // ----------------------------------------------------
        console.log("⚙️ Building hybrid forecast …");
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
        } catch (err) {
          console.error("❌ Hybrid forecast error:", err);
        }

        console.log("✅ Hybrid forecast:", hybridForecast);

        // ----------------------------------------------------
        // 4. Extract safe snapshot values
        // ----------------------------------------------------
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

        console.log("📊 Snapshot:", { safeMuf, safeSf, safeKp });

        // ----------------------------------------------------
        // 5. Compute numeric score
        // ----------------------------------------------------
        const currentBands = hybridForecast?.[0]?.bands ?? {};
        const score = computePropagationScore(currentBands);

        console.log("📈 Numeric score:", score);

        // ----------------------------------------------------
        // 6. AI INTELLIGENCE CALL (DeepSeek)
        // ----------------------------------------------------
        console.log("🤖 Preparing AI summary payload …");

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

          console.log("📡 CALLING AI SUMMARY…", summaryPayload);

          // ⭐ FIXED: Correct endpoint path
          const intelRes = await fetch("/api/ai/quickread", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary: summaryPayload }),
          });

          console.log("📡 AI RESPONSE STATUS:", intelRes.status);

          if (intelRes.ok) {
            const json = await intelRes.json();
            console.log("📡 AI RESPONSE JSON:", json);
            intel = json.text ?? null;
          } else {
            console.error("❌ AI endpoint returned error:", intelRes.status);
          }
        } catch (err) {
          console.error("❌ AI summary error:", err);
          intel = null;
        }

        // ----------------------------------------------------
        // 7. Final state update
        // ----------------------------------------------------
        console.log("💾 Updating state with:", {
          snapshot: { safeMuf, safeSf, safeKp },
          score,
          intel,
        });

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
          intel,
        });

        setIsLoading(false);
        console.log("✅ State updated, loading complete");
      } catch (err) {
        console.error("❌ Summary load error:", err);
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