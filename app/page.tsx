import SummaryPanel from "../components/SummaryPanel";
import AISummaryPanel from "../components/AISummaryPanel";
import CurrentPanel from "../components/CurrentPanel";
import ScorePanel from "../components/ScorePanel";
import ForecastPanel from "../components/ForecastPanel";
import AlertsPanel from "../components/AlertsPanel";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">HF Propagation Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* AI-Generated Natural Language Summary — now at the top */}
        <AISummaryPanel />

        {/* Current Conditions */}
        <CurrentPanel />

        {/* Propagation Score */}
        <ScorePanel />

        {/* Alerts */}
        <AlertsPanel />

        {/* Forecast */}
        <ForecastPanel />

        {/* Markdown Summary */}
        <SummaryPanel />

      </div>
    </main>
  );
}