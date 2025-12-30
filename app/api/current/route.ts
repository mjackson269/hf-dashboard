export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const NOAA_URL =
      "https://services.swpc.noaa.gov/json/solar-cycle/solar_cycle.json";

    const res = await fetch(NOAA_URL, { cache: "no-store" });
    const raw = await res.text();

    if (!res.ok) {
      console.error("NOAA upstream error:", res.status, raw.slice(0, 200));
      return Response.json(
        {
          error: "NOAA upstream error",
          sfiEstimated: 90,
          kp: 2,
          muf: 12,
        },
        { status: 200 }
      );
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("NOAA returned invalid JSON:", raw.slice(0, 200));
      return Response.json(
        {
          error: "NOAA invalid JSON",
          sfiEstimated: 90,
          kp: 2,
          muf: 12,
        },
        { status: 200 }
      );
    }

    // Extract values safely
    const latest = data[data.length - 1] || {};
    const sfiEstimated = latest.solar_flux || 90;
    const kp = latest.kp_index || 2;
    const muf = 12 + (sfiEstimated - 70) * 0.1;

    return Response.json({
      sfiEstimated,
      kp,
      muf: Number(muf.toFixed(1)),
    });
  } catch (err) {
    console.error("[/api/current] Error:", err);
    return Response.json(
      {
        error: "Internal error in /api/current",
        sfiEstimated: 90,
        kp: 2,
        muf: 12,
      },
      { status: 200 }
    );
  }
}