import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder alert data — replace with real feeds later
  const alerts = {
    active: [
      {
        type: "Solar Flare",
        level: "M-class",
        issued: "2025-12-22T18:00:00Z",
        message: "Moderate solar flare detected. Possible HF disruption in polar regions.",
      },
      {
        type: "Geomagnetic Storm",
        level: "G2",
        issued: "2025-12-22T12:00:00Z",
        message: "Kp index elevated. Expect degraded conditions on 80m and 160m bands.",
      },
    ],
  };

  return NextResponse.json(alerts);
}