export async function GET(request: Request) {
  try {
    const baseUrl = request.nextUrl.origin;

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

    const summary = JSON.stringify(
      { current, score, alerts, forecast },
      null,
      2
    );

    return new Response(summary, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Summary route error:", err);
    return new Response("Error generating summary", { status: 500 });
  }
}