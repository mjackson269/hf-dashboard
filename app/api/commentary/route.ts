export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
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

    const raw = await res.text();

    if (!res.ok || raw.startsWith("<!doctype html")) {
      console.error("ERROR calling /api/current:", res.status, raw.slice(0, 200));
    } else {
      try {
        current = JSON.parse(raw);
      } catch {
        console.error("Invalid JSON from /api/current:", raw.slice(0, 200));
      }
    }
  } catch (err) {
    console.error("Failed to fetch /api/current:", err);
  }

  if (!current) {
    return Response.json(
      {
        quickTake: "Propagation commentary unavailable due to upstream error.",
        trendInsights: [],
        bandNotes: {},
        advice: "No operator advice available.",
      },
      { status: 200 }
    );
  }

  // Build structured commentary
  const quickTake = `Solar flux is ${current.sfiEstimated}, Kp is ${current.kp}.`;

  const trendInsights = [
    `Solar flux trending at ${current.sfiEstimated}`,
    `Geomagnetic conditions stable at Kp ${current.kp}`,
  ];

  const bandNotes = {
    "20m": "Generally reliable during daylight hours.",
    "40m": "Improves as evening approaches.",
  };

  const advice = "Monitor Kp for sudden spikes and adjust band choice accordingly.";

  return Response.json({
    quickTake,
    trendInsights,
    bandNotes,
    advice,
  });
}