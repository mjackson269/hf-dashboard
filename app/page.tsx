"use client";

import { useEffect, useState } from "react";
import ForceCSS from "./force-css";
import { BandTable } from "./components/BandTable";
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
import { useSummaryData } from "./hooks/useSummaryData";

export default function Home() {
  const { data, isLoading, isError } = useSummaryData();

  // ---------------------------------------------
  // AI Commentary Fetch
  // ---------------------------------------------
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
  // Band scoring logic
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
  // Build bandRows for the Band Table
  // ---------------------------------------------
  let bandRows: any[] = [];

  if (data?.bands) {
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

  return (
    <>
      {/* Force Tailwind CSS to be emitted in production */}
      <ForceCSS />

      <main className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col">

        {/* ⭐ Hero Header */}
        <HeroHeader />

        {/* Modern Status Bar */}
        <StatusBar />

        {/* Quick Take */}
        <QuickTake />

        {/* Main Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
          <SummaryPanel />
          <CurrentPanel />
	  <BestBandNow />
          <ScorePanel />

          {/* ⭐ AI Commentary Panel */}
          {commentary && <CommentaryPanel commentary={commentary} />}

          <AlertsPanel />
          <ForecastPanelV2 />
	  <DXOutlook />
	  <DXHeatmap />

          {/* 📡 Band Table */}
          <BandTable bands={bandRows} />
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}