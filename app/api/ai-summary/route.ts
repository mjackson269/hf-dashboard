export async function GET() {
  const [scoreRes, forecastRes, alertsRes] = await Promise.all([
    fetch("http://localhost:3000/api/score"),
    fetch("http://localhost:3000/api/forecast"),
    fetch("http://localhost:3000/api/alerts"),
  ]);

  const score = await scoreRes.json();
  const forecast = await forecastRes.json();
  const alerts = await alertsRes.json();

  // Extract key data
  const sfi = score.details.SFI;
  const kp = score.details.Kp;
  const muf = score.details.MUF;
  const rating = score.label;

  const firstAlert = alerts.active[0];
  const alertSummary = firstAlert
    ? `${firstAlert.type} (${firstAlert.level}) issued at ${new Date(firstAlert.issued).toLocaleTimeString("en-GB")}`
    : "No active alerts";

  // Generate natural language summary
  const aiSummary = `
HF conditions today are rated **${rating}**, with an SFI of ${sfi}, a Kp index of ${kp}, and MUF values peaking around ${muf} MHz. 
Propagation across the mid‑bands remains stable, with the best performance expected between late morning and early afternoon.

Forecast data shows MUF gradually declining into the evening, though overall conditions remain usable for most UK and EU paths. 
The most significant space‑weather event today is: ${alertSummary}. This may briefly affect higher‑latitude circuits.

Overall, operators in the UK can expect reliable performance on 20m and 40m, with 80m improving after sunset.
`;

  return new Response(aiSummary.trim(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}