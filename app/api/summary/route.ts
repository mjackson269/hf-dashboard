export async function GET() {
  try {
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      throw new Error("BASE_URL environment variable is missing");
    }

    const [currentRes, scoreRes, alertsRes, forecastRes] = await Promise.all([
      fetch(`${baseUrl}/api/current`),
      fetch(`${baseUrl}/api/score`),
      fetch(`${baseUrl}/api/alerts`),
      fetch(`${baseUrl}/api/forecast`)
    ]);

    if (!currentRes.ok || !scoreRes.ok || !alertsRes.ok || !forecastRes.ok) {
      throw new Error("One or more internal API calls failed");
    }

    const current = await currentRes.json();
    const score = await scoreRes.json();
    const alerts = await alertsRes.json();
    const forecast = await forecastRes.json();

    return new Response(
      JSON.stringify({ current, score, alerts, forecast }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Summary route error:", err);
    return new Response("Error generating summary", { status: 500 });
  }
}