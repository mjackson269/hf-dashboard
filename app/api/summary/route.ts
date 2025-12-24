export async function GET() {
  try {
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      throw new Error("BASE_URL environment variable is missing");
    }

    const urls = {
      current: `${baseUrl}/api/current`,
      score: `${baseUrl}/api/score`,
      alerts: `${baseUrl}/api/alerts`,
      forecast: `${baseUrl}/api/forecast`,
    };

    const responses = await Promise.all([
      fetch(urls.current),
      fetch(urls.score),
      fetch(urls.alerts),
      fetch(urls.forecast),
    ]);

    const names = ["current", "score", "alerts", "forecast"];

    responses.forEach((res, i) => {
      if (!res.ok) {
        console.error(`❌ ${names[i]} failed:`, urls[names[i]], res.status);
      }
    });

    if (responses.some((r) => !r.ok)) {
      throw new Error("One or more internal API calls failed");
    }

    const [current, score, alerts, forecast] = await Promise.all(
      responses.map((r) => r.json())
    );

    return new Response(
      JSON.stringify({ current, score, alerts, forecast }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Summary route error:", err);
    return new Response("Error generating summary", { status: 500 });
  }
}