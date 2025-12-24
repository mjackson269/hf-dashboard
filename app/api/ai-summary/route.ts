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

    const markdown = await res.text();

    return new Response(markdown, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("AI summary error:", err);
    return new Response("Error generating summary", { status: 500 });
  }
}