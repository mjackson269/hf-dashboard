"use client";

import { useEffect, useState } from "react";
import ForceCSS from "./force-css";
import BandTable from "./components/BandTable";
import HeroHeader from "./components/HeroHeader";
import StatusBar from "./components/StatusBar";
import SummaryPanel from "./components/SummaryPanel";
import CurrentPanel from "./components/CurrentPanel";
import ScorePanel from "./components/ScorePanel";
import AlertsPanel from "./components/AlertsPanel";
import QuickTake from "./components/QuickTake";
import Footer from "./components/Footer";
import CommentaryPanel from "./components/CommentaryPanel";
import { gridGap } from "./lib/designSystem";
import ForecastPanelV2 from "./components/ForecastPanelV2";
import DXHeatmap from "./components/DXHeatmap";
import DXOutlook from "./components/DXOutlook";
import BestBandNow from "./components/BestBandNow";
import DXPathsPanel from "./components/DXPathsPanel";
import { useSummaryData } from "./hooks/useSummaryData";

export default function Home() {
  // ---------------------------------------------
  // FIX: Hooks must run BEFORE any conditional return
  // ---------------------------------------------
  const { data, isLoading } = useSummaryData();
  const [commentary, setCommentary] = useState<any>(null);

  useEffect(() => {
    async function loadCommentary() {
      try {
        const res = await fetch("/api/commentary", { cache: "no-store" });
        const json = await res.json();
        setCommentary(json);
      } catch (err) {
        console.error("Failed to load commentary:", err);
      }
    }

    loadCommentary();
  }, []);

  // ---------------------------------------------
  // SAFE early return (hooks already executed)
  // ---------------------------------------------
  if (isLoading || !data) {
    return (
      <main className="p-4 text-neutral-400">
        Loading…
      </main>
    );
  }

  // ---------------------------------------------
  // Band scoring logic (unchanged)
  // ---------------------------------------------
  function scoreBand(mufSupport: string, snr: number) {
    let score = 0;

    if (mufSupport === "open") score += 60;
    if (mufSupport === "marginal") score += 30;

    if (snr >= 25) score += 30;
    else if (snr >= 15) score += 15;
    else score += 5;

    return score;
  }

  function statusFromScore(score: number) {
    if (score >= 70) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Poor";
    return "Closed";
  }

  function notesFromBand(mufSupport: string, snr: number) {
    if (mufSupport === "closed") return "MUF too low";
    if (mufSupport === "marginal") return "Weak MUF";
    if (snr < 15) return "High noise";
    if (snr < 25) return "Moderate noise";
    return "Stable";
  }

  // ---------------------------------------------
  // Build bandRows (unchanged)
  // ---------------------------------------------
  let bandRows: any[] = [];

  if (data?.bands && typeof data.bands === "object") {
    bandRows = Object.entries(data.bands).map(([band, info]: any) => {
      const score = scoreBand(info.mufSupport, info.snr);

      return {
        band,
        muf: info.freq,
        snr: info.snr,
        score,
        status: statusFromScore(score),
        notes: notesFromBand(info.mufSupport, info.snr),
      };
    });
  }

  // ---------------------------------------------
  // FULL ORIGINAL LAYOUT — NOTHING REMOVED
  // ---------------------------------------------
  return (
    <>
      <ForceCSS />

      <main className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col">

        <HeroHeader />
        <StatusBar />
        <QuickTake />

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
          <CurrentPanel />
          <BestBandNow />
          <ScorePanel />

          {commentary && <CommentaryPanel commentary={commentary} />}

          <AlertsPanel />
          <ForecastPanelV2 />
          <DXOutlook />
          <DXHeatmap />
          <DXPathsPanel data={data} />

          <BandTable bands={bandRows} />
        </div>

        <Footer />
      </main>
    </>
  );
}