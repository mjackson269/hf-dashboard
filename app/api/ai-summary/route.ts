// app/api/ai-summary/route.ts

type CurrentData = {
  sfiEstimated: number;
  sfiEstimatedPrev: number;
  sfiAdjusted: number;
  sfiAdjustedPrev: number;
  kp: number;
  kpPrev: number;
  muf: number;
  mufPrev: number;
};

function generateRuleBasedSignals(current: CurrentData): string {
  const signals: string[] = [];

  if (current.muf > current.mufPrev) {
    signals.push("higher bands are improving as MUF rises");
  } else if (current.muf < current.mufPrev) {
    signals.push("higher bands are weakening as MUF falls");
  }

  if (current.kp > current.kpPrev) {
    signals.push("geomagnetic activity is increasing, raising noise levels");
  } else if (current.kp < current.kpPrev) {
    signals.push("geomagnetic conditions are easing, reducing noise");
  }

  if (current.sfiEstimated > current.sfiEstimatedPrev) {
    signals.push("solar flux is strengthening, supporting higher bands");
  } else if (current.sfiEstimated < current.sfiEstimatedPrev) {
    signals.push("solar flux is dipping slightly, softening higher-band support");
  }

  if (signals.length === 0) {
    return "Conditions are broadly stable across the HF bands.";
  }

  return signals.join("; ");
}

function determineSeverity(
  current: CurrentData
): "improving" | "stable" | "degrading" {
  let score = 0;

  if (current.muf > current.mufPrev) score += 2;
  if (current.muf < current.mufPrev) score -= 2;

  if (current.kp < current.kpPrev) score += 1;
  if (current.kp > current.kpPrev) score -= 1;

  if (current.sfiEstimated > current.sfiEstimatedPrev) score += 1;
  if (current.sfiEstimated < current.sfiEstimatedPrev) score -= 1;

  if (score >= 2) return "improving";
  if (score <= -2) return "degrading";
  return "stable";
}

function calculatePropagationScore(current: CurrentData): number {
  let score = 50;

  if (current.muf > current.mufPrev) score += 20;
  if (current.muf < current.mufPrev) score -= 20;

  if (current.kp < current.kpPrev) score += 15;
  if (current.kp > current.kpPrev) score -= 15;

  if (current.sfiEstimated > current.sfiEstimatedPrev) score += 10;
  if (current.sfiEstimated < current.sfiEstimatedPrev) score -= 10;

  return Math.max(0, Math.min(100, score));
}

async function generateAIQuickTake(ruleSignals: string): Promise<string> {
  return `Quick take: ${ruleSignals.charAt(0).toUpperCase()}${ruleSignals.slice(1)}`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let current: CurrentData | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/current`, { cache: "no-store" });
    const raw = await res.text();

    if (!res.ok) {
      console.error("ERROR calling /api/current:", res.status, raw.slice(0, 200));
    } else {
      try {
        current = JSON.parse(raw);
      } catch (e) {
        console.error("Invalid JSON from /api/current:", raw.slice(0, 200));
      }
    }
  } catch (err) {
    console.error("Failed to fetch /api/current:", err);
  }

  if (!current) {
    return Response.json(
      {
        markdown: "Propagation summary unavailable due to upstream data error.",
        bestBand: "20m",
        reason: "Fallback due to missing data.",
        quickTake: "Quick take: Data unavailable",
        severity: "stable",
        score: 50,
      },
      { status: 200 }
    );
  }

  const ruleSignals = generateRuleBasedSignals(current);
  const aiQuickTake = await generateAIQuickTake(ruleSignals);
  const severity = determineSeverity(current);
  const score = calculatePropagationScore(current);

  const markdown = `
Alright, conditions are looking pretty good overall. The 30-meter band is your best bet right now, solid and reliable. Higher bands like 20m and 17m should also be working well for daylight paths. Watch out for the lower bands though, 80 and 160 meters are taking a hit from some geomagnetic activity, so they'll be noisy and weak. There was a moderate solar flare, so if you're working polar paths, you might see some brief dropouts. Looking ahead, the higher bands will slowly fade a bit later today as the MUF drops, but 30m should hold up. Things settle back down overnight. So, stick to the middle bands today and you'll do fine.
  `.trim();

  const bestBand = "30m";
  const reason =
    "30m is currently the most reliable mix of MUF support and resilience to geomagnetic noise for UK daytime paths.";

  return Response.json({
    markdown,
    bestBand,
    reason,
    quickTake: aiQuickTake,
    severity,
    score,
  });
}