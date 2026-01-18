import Footer from "./components/Footer";
import ClientClock from "./components/ClientClock";
import StatusBar from "./components/StatusBar";
import HeroHeader from "./components/HeroHeader";
import BestBandNow from "./components/BestBandNow";
import QuickTake from "./components/QuickTake";
import CurrentPanel from "./components/CurrentPanel";
import ScorePanel from "./components/ScorePanel";
import AlertsPanel from "./components/AlertsPanel";


export default function Page() {
  return (
    <>
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

     <ClientClock />
     <StatusBar />
     <HeroHeader />

     <QuickTake />
     <CurrentPanel />
     <ScorePanel />
     <AlertsPanel />

     <BestBandNow />
     <Footer />
    </>
  );
}