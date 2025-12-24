// Cache this route for 60 seconds to prevent Vercel 508 overload
export const revalidate = 60;

export async function GET() {
  try {
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      throw new Error("BASE_URL environment variable is missing");
    }

    // Fetch all internal endpoints in parallel
    const [currentRes, scoreRes, alertsRes, forecastRes] = await Promise.all([
      fetch(`${baseUrl}/api/current`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/score`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/alerts`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/forecast`, { cache: "no-store" })
    ]);

    // Check for failures
    if (!currentRes.ok || !scoreRes.ok || !alertsRes.ok || !forecastRes.ok) {
      console.error("❌ One or more internal API calls failed:", {
        current: currentRes.status,
        score: scoreRes.status,
        alerts: alertsRes.status,
        forecast: forecastRes.status
      });
      throw new Error("One or more internal API calls failed");
    }

    // Parse JSON
    const current = await currentRes.json();
    const score = await scoreRes.json();
    const alerts = await alertsRes.json();
    const forecast = await forecastRes.json();

    // Return aggregated summary
    return new Response(
      JSON.stringify({ current, score, alerts, forecast }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Summary route error:", err);
    return new Response("Error generating summary", { status: 500 });
  }
}