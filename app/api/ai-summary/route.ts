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

    // Build a readable summary
    const summary = `
# HF Propagation Summary

**Current Conditions**
- SFI: ${current.sfi}
- Kp Index: ${current.kp}
- MUF: ${current.muf} MHz

**Propagation Score:** ${score.value} — ${score.label}

${
  alerts.active.length > 0
    ? `**Active Alerts**\n${alerts.active
        .map(
          (a: any) =>
            `- **${a.type} (${a.level})** — ${a.message} (Issued: ${new Date(
              a.issued
            ).toLocaleString()})`
        )
        .join("\n")}`
    : "**No active alerts**"
}

**24‑Hour Forecast**
${forecast.hours
  .map(
    (h: any) =>
      `- ${h.time}: SFI ${h.SFI}, Kp ${h.Kp}, MUF ${h.MUF} MHz`
  )
  .join("\n")}
`;

    return new Response(summary.trim(), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("AI summary error:", err);
    return new Response("Error generating summary", { status: 500 });
  }
}