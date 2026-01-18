import Footer from "./components/Footer";
import ClientClock from "./components/ClientClock";
import StatusBar from "./components/StatusBar";
import HeroHeader from "./components/HeroHeader";
import BestBandNow from "./components/BestBandNow";
import QuickTake from "./components/QuickTake";
import CurrentPanel from "./components/CurrentPanel";
import ScorePanel from "./components/ScorePanel";
import AlertsPanel from "./components/AlertsPanel";
import ForecastPanelV2 from "./components/ForecastPanelV2";
import DXOutlook from "./components/DXOutlook";
import DXHeatmap from "./components/DXHeatmap";
import DXPathsPanel from "./components/DXPathsPanel";
import BandTable from "./components/BandTable";
import CommentaryPanel from "./components/CommentaryPanel";
import { gridGap } from "./lib/designSystem";

export default function Page() {
  return (
    <>
      {/* Temporary baseline test */}
      <div
        style={{
          padding: 40,
          color: "lime",
          backgroundColor: "black",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Baseline test — visible
      </div>

      {/* Header + Status */}
      <ClientClock />
      <StatusBar />
      <HeroHeader />
      <QuickTake />

      {/* ⭐ Restored original grid layout */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
        <CurrentPanel />
        <BestBandNow />
        <ScorePanel />

        {/* Commentary can be re-enabled once logic is restored */}
        {/* <CommentaryPanel commentary={commentary} /> */}

        <AlertsPanel />
        <ForecastPanelV2 />
        <DXOutlook />
        <DXHeatmap />
        <DXPathsPanel />

        {/* Band table placeholder until data is wired back in */}
        <BandTable bands={[]} />
      </div>

      <Footer />
    </>
  );
}