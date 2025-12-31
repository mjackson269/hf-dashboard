export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  // Force internal fetches to use the public production domain
  const origin = "https://hf-dashboard-weld.vercel.app";

  let current = null;

  try {
    const res = await fetch(`${origin}/api/current`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const raw = await res.text();

    if (!res.ok || raw.startsWith("<!doctype html")) {
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