export async function GET() {
  try {
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      throw new Error("BASE_URL environment variable is missing");
    }

    const res = await fetch(`${baseUrl}/api/summary`);

    if (!res.ok) {
      throw new Error(`Failed to fetch summary: ${res.status}`);
    }

    const data = await res.json();
    const { current, score, alerts, forecast } = data;

    // Extract forecast trends
    const first = forecast.hours[0];
    const midday = forecast.hours.find((h: any) => h.time === "12:00");
    const last = forecast.hours[forecast.hours.length - 1];

    const mufTrend =
      last.MUF > first.MUF
        ? "rising slightly later in the period"
        : last.MUF < first.MUF
        ? "declining toward the end of the period"
        : "remaining broadly stable";

    const kpTrend =
      midday.Kp > current.kp
        ? "peaking around midday"
        : midday.Kp < current.kp
        ? "easing through the day"
        : "remaining steady";

    const sfiTrend =
      midday.SFI > current.sfi
        ? "increasing slightly by midday"
        : midday.SFI < current.sfi
        ? "dipping slightly by midday"
        : "remaining stable";

    // Build the daily summary
    const summary = `
# Daily HF Propagation Summary

**Overall Propagation Score:** ${score.value} — ${score.label}

## Current Conditions
- **Solar Flux Index (SFI):** ${current.sfi}
- **Kp Index:** ${current.kp}
- **Maximum Usable Frequency (MUF):** ${current.muf} MHz

Conditions are currently stable with good mid‑band performance and minimal geomagnetic disturbance.

## Alerts
${
  alerts.active.length > 0
    ? alerts.active
        .map(
          (a: any) =>
            `- **${a.type} (${a.level})** — ${a.message}\n  *Issued: ${new Date(
              a.issued
            ).toLocaleString()}*`
        )
        .join("\n")
    : "No active HF alerts at this time."
}

## 24‑Hour Trend Overview
- **SFI:** ${sfiTrend}
- **Kp Index:** ${kpTrend}
- **MUF:** ${mufTrend}

Expect the best HF performance during the early morning and late evening, with some midday degradation as Kp rises and MUF dips.

## Full 24‑Hour Forecast
${forecast.hours
  .map(
    (h: any) =>
      `- **${h.time}** — SFI ${h.SFI}, Kp ${h.Kp}, MUF ${h.MUF} MHz`
  )
  .join("\n")}
`;

    return new Response(summary.trim(), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Daily summary error:", err);
    return new Response("Error generating daily summary", { status: 500 });
  }
}