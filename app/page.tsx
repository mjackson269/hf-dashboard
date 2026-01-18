"use client";

import { useEffect, useState } from "react";
import ForceCSS from "./force-css";

import HeroHeader from "./components/HeroHeader";
import StatusBar from "./components/StatusBar";
import QuickTake from "./components/QuickTake";
import CurrentPanel from "./components/CurrentPanel";
import ScorePanel from "./components/ScorePanel";
import AlertsPanel from "./components/AlertsPanel";
import ForecastPanelV2 from "./components/ForecastPanelV2";
import DXOutlook from "./components/DXOutlook";
import DXHeatmap from "./components/DXHeatmap";
import BestBandNow from "./components/BestBandNow";
import DXPathsPanel from "./components/DXPathsPanel";
import BandTable from "./components/BandTable";
import CommentaryPanel from "./components/CommentaryPanel";
import Footer from "./components/Footer";

import { gridGap } from "./lib/designSystem";

export default function Page() {
  return (
    <>
      <ForceCSS />

      <main className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col">

        {/* ⭐ Hero Header */}
        <HeroHeader />

        {/* Modern Status Bar */}
        <StatusBar />

        {/* ⭐ Next component added */}
        <QuickTake />

        {/* Main Grid (same layout as original) */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>

          {/* Only the components that do NOT require data yet */}
          <CurrentPanel />
          <BestBandNow />
          <ScorePanel />

          {/* These will be added later once data is restored */}
          {/* <CommentaryPanel commentary={commentary} /> */}
          {/* <AlertsPanel /> */}
          {/* <ForecastPanelV2 /> */}
          {/* <DXOutlook /> */}
          {/* <DXHeatmap /> */}
          {/* <DXPathsPanel data={data} /> */}
          {/* <BandTable bands={bandRows} /> */}
        </div>

        <Footer />
      </main>
    </>
  );
}