"use client";

import HeroHeader from "./components/HeroHeader";
import StatusBar from "./components/StatusBar";
import SummaryPanel from "./components/SummaryPanel";
import CurrentPanel from "./components/CurrentPanel";
import ScorePanel from "./components/ScorePanel";
import ForecastPanel from "./components/ForecastPanel";
import AlertsPanel from "./components/AlertsPanel";
import QuickTake from "./components/QuickTake";
import Footer from "./components/Footer";
import { gridGap } from "./styles/designSystem";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col">

      {/* ⭐ New Hero Header */}
      <HeroHeader />
      
      {/* Modern Status Bar */}
      <StatusBar />

      {/* Quick Take */}
      <QuickTake />

      {/* Main Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
        <SummaryPanel />
        <CurrentPanel />
        <ScorePanel />
        <AlertsPanel />
        <ForecastPanel />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}