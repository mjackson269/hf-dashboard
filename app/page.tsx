import Footer from "./components/Footer";
import ClientClock from "./components/ClientClock";

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
      <Footer />
    </>
  );
}