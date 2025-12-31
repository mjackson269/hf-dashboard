export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const origin = "https://hf-dashboard-weld.vercel.app";

  let current = null;

  try {
    const res = await fetch(`${origin}/api/current`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    current = await res.json();
  } catch {
    return Response.json({
      quickTake: "Propagation commentary unavailable.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available."
    });
  }

  const quickTake = `Solar flux is ${current.sfiEstimated}, Kp is ${current.kp}.`;

  const trendInsights = [
    `Solar flux trending at ${current.sfiEstimated}`,
    `Geomagnetic conditions stable at Kp ${current.kp}`
  ];

  const bandNotes = {
    "20m": "Strong daytime performance.",
    "40m": "Improves toward evening."
  };

  const advice = "Monitor Kp for sudden spikes.";

  return Response.json({
    quickTake,
    trendInsights,
    bandNotes,
    advice
  });
}