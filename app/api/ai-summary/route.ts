import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.BASE_URL;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!baseUrl) throw new Error("BASE_URL is missing");
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY is missing");

    // Fetch internal data
    const [currentRes, scoreRes, alertsRes, forecastRes] = await Promise.all([
      fetch(baseUrl + "/api/current", { cache: "no-store" }),
      fetch(baseUrl + "/api/score", { cache: "no-store" }),
      fetch(baseUrl + "/api/alerts", { cache: "no-store" }),
      fetch(baseUrl + "/api/forecast", { cache: "no-store" })
    ]);

    const current = await currentRes.json();
    const score = await scoreRes.json();
    const alerts = await alertsRes.json();
    const forecast = await forecastRes.json();

    // ----------------------------------------------------
    // BAND DOWNGRADE LOGIC
    // ----------------------------------------------------
    function downgradeBand(band: string) {
      const order = ["10m", "12m", "15m", "17m", "20m", "30m", "40m"];
      const idx = order.indexOf(band);
      const next = idx + 1;
      if (next >= order.length) return order[order.length - 1];
      return order[next];
    }

    // ----------------------------------------------------
    // BEST BAND LOGIC
    // ----------------------------------------------------
    function getBestBand(current: any, alerts: any) {
      const muf = current.muf;
      const kp = current.kp;

      let band = "30m";
      if (muf >= 28) band = "10m";
      else if (muf >= 24) band = "12m";
      else if (muf >= 21) band = "15m";
      else if (muf >= 18) band = "17m";
      else if (muf >= 14) band = "20m";

      if (kp >= 4) {
        band = downgradeBand(band);
      }

      const hasGStorm = alerts.active.some((a: any) =>
        a.type.includes("Geomagnetic")
      );
      const hasFlare = alerts.active.some((a: any) =>
        a.type.includes("Flare")
      );

      if (hasGStorm) {
        band = downgradeBand(band);
      }

      if (hasFlare) {
        if (
          band === "10m" ||
          band === "12m" ||
          band === "15m" ||
          band === "17m" ||
          band === "20m"
        ) {
          band = "30m";
        }
      }

      return band;
    }

    const bestBand = getBestBand(current, alerts);

    // ----------------------------------------------------
    // WHY THIS BAND? (NEW)
    // ----------------------------------------------------
    function getBestBandReason(current: any, alerts: any, bestBand: string) {
      const reasons: string[] = [];
      const { sfi, kp, muf } = current;

      // SFI
      if (sfi >= 140) {
        reasons.push("High solar flux is boosting ionization");
      } else if (sfi >= 120) {
        reasons.push("Solar flux is healthy enough for stable daytime propagation");
      }

      // MUF
      if (muf >= 22) {
        reasons.push(`MUF at ${muf} MHz supports higher bands`);
      } else if (muf >= 18) {
        reasons.push(`MUF supports mid‑range bands like 17m and 20m`);
      }

      // Kp
      if (kp <= 3) {
        reasons.push("Low geomagnetic activity keeps paths stable");
      } else {
        reasons.push("Elevated Kp is degrading higher‑frequency performance");
      }

      // Alerts
      const hasGStorm = alerts.active.some((a: any) =>
        a.type.includes("Geomagnetic")
      );
      const hasFlare = alerts.active.some((a: any) =>
        a.type.includes("Flare")
      );

      if (hasGStorm) {
        reasons.push("Geomagnetic storm conditions are weakening low bands");
      }

      if (hasFlare) {
        reasons.push("Solar flare absorption is affecting higher bands");
      }

      // Band‑specific
      if (bestBand === "30m") {
        reasons.push("30m remains reliable even during disturbed conditions");
      }

      return reasons.join(". ") + ".";
    }

    const reason = getBestBandReason(current, alerts, bestBand);

    // ----------------------------------------------------
    // AI PROMPT
    // ----------------------------------------------------
    const prompt =
      "Write a short, natural, human-readable HF radio propagation briefing. " +
      "Do NOT use headings or sections. Do NOT format like a report. " +
      "Write like an experienced HF operator giving a quick spoken summary. " +
      "Keep it conversational, clear, and easy to skim. " +
      "Use short sentences. No jargon unless necessary. No filler. No repetition.\n\n" +

      "Best band right now: " + bestBand + "\n\n" +

      "Here is the data to base it on:\n" +
      "- SFI: " + current.sfi + "\n" +
      "- Kp: " + current.kp + "\n" +
      "- MUF: " + current.muf + " MHz\n" +
      "- Overall rating: " + score.label + "\n" +
      "- Alerts:\n" +
      alerts.active
        .map(
          (a: any) =>
            "  * " + a.type + " (" + a.level + "): " + a.message
        )
        .join("\n") +
      "\n" +
      "- Forecast hours:\n" +
      forecast.hours
        .map(
          (h: any) =>
            "  * " +
            h.time +
            ": SFI " +
            h.SFI +
            ", Kp " +
            h.Kp +
            ", MUF " +
            h.MUF
        )
        .join("\n") +
      "\n\n" +
      "Now produce a friendly, spoken-style summary of what this means for HF operators today. " +
      "Focus on what bands will work well, what to avoid, and what to expect over the next 12–24 hours. " +
      "Keep it human. Keep it simple. Keep it short.";

    // ----------------------------------------------------
    // DEEPSEEK CALL
    // ----------------------------------------------------
    const deepseekRes = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an HF radio operator with decades of experience."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.4
        })
      }
    );

    const deepseekData = await deepseekRes.json();
    console.log("DeepSeek response:", deepseekData);

    const summary =
      deepseekData?.choices?.[0]?.message?.content ||
      "No summary generated.";

    return NextResponse.json({
      markdown: summary,
      bestBand: bestBand,
      reason: reason
    });

  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({ markdown: "AI summary unavailable." });
  }
}