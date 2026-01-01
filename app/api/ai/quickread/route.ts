import { NextResponse } from "next/server";

// Simple in-memory cache
const aiCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(req: Request) {
  try {
    const { summary } = await req.json();

    // Create a stable cache key from the summary payload
    const cacheKey = JSON.stringify(summary);

    // Check cache
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ text: cached.text, cached: true });
    }

    const prompt = `
You are an HF radio propagation analyst. Generate a concise operator briefing based on this live data:

${JSON.stringify(summary, null, 2)}

Your output must include:
- Quick Take
- Best Bands Now
- Risk Factors
- Recommended Operator Moves
- 2–3 Hour Outlook

Keep it short, actionable, and operator‑grade.
`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    const json = await response.json();
    const text =
      json?.choices?.[0]?.message?.content ??
      "No AI response available.";

    // Store in cache
    aiCache.set(cacheKey, {
      text,
      timestamp: Date.now(),
    });

    return NextResponse.json({ text, cached: false });
  } catch (err) {
    console.error("DeepSeek QuickRead error:", err);
    return NextResponse.json(
      { text: "AI service unavailable." },
      { status: 500 }
    );
  }
}