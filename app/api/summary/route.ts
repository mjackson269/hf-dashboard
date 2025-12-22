export async function GET(request: Request) {
  try {
    // Dynamically resolve the base URL for production-safe fetch
    const baseUrl = request.nextUrl.origin;

    // Fetch the markdown summary from the internal API
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