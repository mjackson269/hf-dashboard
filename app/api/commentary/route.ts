export const dynamic = "force-dynamic";
export const revalidate = 0;

function getInternalUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://127.0.0.1:3000";
}

export async function GET() {
  let current = null;

  try {
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
      { commentary: "Propagation commentary unavailable due to upstream error." },
      { status: 200 }
    );
  }

  const commentary = `Solar flux is ${current.sfiEstimated}, Kp is ${current.kp}.`;

  return Response.json({ commentary });
}

    const data = await res.json();

    const {
      sfiEstimated,
      sfiEstimatedPrev,
      kp,
      kpPrev,
      muf,
      bands,
    } = data;

    // ---- Quick Take ----
    let quickTake = "";
    if (sfiEstimated > 180 && kp < 3) {
      quickTake = "High SFI and quiet geomagnetic conditions are creating excellent HF performance.";
    } else if (sfiEstimated > 150 && kp < 4) {
      quickTake = "Good solar flux with manageable geomagnetic activity — solid HF conditions overall.";
    } else if (kp >= 4) {
      quickTake = "Elevated Kp is introducing noise and fading, especially on higher bands.";
    } else {
      quickTake = "Moderate conditions with stable performance across most HF bands.";
    }

    // ---- Trend Insights ----
    const sfiTrend = sfiEstimated > sfiEstimatedPrev ? "rising" : "falling";
    const kpTrend = kp > kpPrev ? "rising" : "steady";

    const trendInsights = [
      `SFI is ${sfiTrend} (now ${sfiEstimated}).`,
      `Kp is ${kpTrend} at ${kp.toFixed(2)}.`,
      `MUF currently sits at ${muf} MHz.`,
    ];

    // ---- Band Notes ----
    const bandNotes = {
      "10m": bands["10m"].mufSupport === "open"
        ? "10m is fully open — excellent for DX and long‑path opportunities."
        : "10m is closed; MUF is below the band edge.",
      "15m": bands["15m"].mufSupport === "open"
        ? "15m is strong and reliable with today’s MUF."
        : "15m may be marginal depending on path.",
      "20m": "20m is stable and dependable — the most consistent band today.",
      "40m": kp < 3
        ? "40m is quiet thanks to low geomagnetic activity."
        : "40m may experience elevated noise due to Kp.",
      "80m": "80m is open but less influenced by high MUF — good for regional work.",
    };

    // ---- Operator Advice ----
    let advice = "";
    if (muf > 30 && kp < 3) {
      advice = "If you're chasing DX, focus on 10m and 15m this afternoon — conditions are unusually favourable.";
    } else if (kp >= 4) {
      advice = "Expect fading and noise on higher bands; 40m and 80m will be more reliable.";
    } else {
      advice = "20m remains the safest all‑round band for consistent contacts.";
    }

    // ---- Snapshot Score (0–10 scale) ----
    let snapshot = 5; // fallback

    if (muf >= 30 && kp < 3) {
      snapshot = 8;
    } else if (muf >= 25 && kp < 4) {
      snapshot = 7;
    } else if (kp >= 4) {
      snapshot = 3;
    } else {
      snapshot = 5;
    }

    return Response.json({
      quickTake,
      trendInsights,
      bandNotes,
      advice,
      snapshot,
    });

  } catch (err) {
    console.error("[/api/commentary] Error:", err);
    return Response.json(
      {
        quickTake: "Live commentary unavailable — using fallback conditions.",
        trendInsights: [],
        bandNotes: {},
        advice: "Try again shortly.",
        snapshot: 5,
      },
      { status: 500 }
    );
  }
}