// app/api/forecast/route.ts

function getInternalUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://127.0.0.1:3000";
}

export async function GET() {
  let current = null;

  try {
    const baseUrl =
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

    const res = await fetch(`${getInternalUrl()}/api/current`, { cache: "no-store" });
    const raw = await res.text();

    if (!res.ok) {
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
        forecast: "Forecast unavailable due to upstream data error.",
      },
      { status: 200 }
    );
  }

  const forecast = `Expect MUF around ${current.muf} with Kp ${current.kp}.`;

  return Response.json({ forecast });
}