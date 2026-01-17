import Footer from "./components/Footer";
import ClientClock from "./components/ClientClock";
import StatusBar from "./components/StatusBar";
import HeroHeader from "./components/HeroHeader";
import BestBandNow from "./components/BestBandNow";


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
      <BestBandNow />
      <Footer />
    </>
  );
}