export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  let current = null;

  try {
    const res = await fetch(`${origin}/api/current`, { cache: "no-store" });
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