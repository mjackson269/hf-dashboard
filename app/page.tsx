"use client";

import StatusBar from "./components/StatusBar";
import SummaryPanel from "./components/SummaryPanel";
import CurrentPanel from "./components/CurrentPanel";
import ScorePanel from "./components/ScorePanel";
import ForecastPanel from "./components/ForecastPanel";
import AlertsPanel from "./components/AlertsPanel";
import QuickTake from "./components/QuickTake";
import { gridGap } from "./styles/designSystem";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">HF Propagation Dashboard</h1>

      {/* Modern Status Bar */}
      <StatusBar />

      {/* Quick Take (1‑sentence operator summary) */}
      <QuickTake />

      {/* Main Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>

        {/* Daily HF Summary */}
        <SummaryPanel />

        {/* Current Conditions */}
        <CurrentPanel />

        {/* Propagation Score */}
        <ScorePanel />

        {/* Alerts */}
        <AlertsPanel />

        {/* Forecast */}
        <ForecastPanel />
      </div>
    </main>
  );
}