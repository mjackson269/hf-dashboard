export async function GET() {
  const [scoreRes, forecastRes, alertsRes] = await Promise.all([
    fetch("http://localhost:3000/api/score"),
    fetch("http://localhost:3000/api/forecast"),
    fetch("http://localhost:3000/api/alerts"),
  ]);

  const score = await scoreRes.json();
  const forecast = await forecastRes.json();
  const alerts = await alertsRes.json();

  const markdown = `
## HF Propagation Summary — ${new Date().toLocaleDateString("en-GB")}

**Current Conditions:**  
- SFI: ${score.details.SFI}  
- Kp Index: ${score.details.Kp}  
- MUF: ${score.details.MUF} MHz  
- Propagation Score: ${score.value} — ${score.label}

**Forecast Highlights:**  
| Time   | SFI | Kp | MUF (MHz) |
|--------|-----|----|-----------|
${forecast.hours.map(f => `| ${f.time} | ${f.SFI} | ${f.Kp} | ${f.MUF} |`).join("\n")}

**Active Alerts:**  
${alerts.active.length === 0 ? "- None" : alerts.active.map(alert => `
- **${alert.type} — ${alert.level}**  
  ${alert.message}  
  *Issued: ${new Date(alert.issued).toLocaleString("en-GB")}*
`).join("\n")}

**UK Propagation Notes:**  
Conditions remain favourable across 20m–40m bands.  
Expect stable daytime propagation and mild evening absorption.
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}