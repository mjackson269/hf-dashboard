import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    solar: {
      sn: 75,
      sfi: 135,
      kp: 3,
      ssnDescription: "Moderate sunspot activity",
      kpDescription: "Quiet geomagnetic conditions"
    },
    bands: [
      { band: "80m", day: "Poor", night: "Fair", overall: "Fair" },
      { band: "40m", day: "Fair", night: "Good", overall: "Good" },
      { band: "20m", day: "Good", night: "Fair", overall: "Good" },
      { band: "10m", day: "Excellent", night: "Poor", overall: "Good" }
    ],
    alerts: [
      { id: "1", type: "info", message: "Solar flux rising steadily" },
      { id: "2", type: "warning", message: "Minor geomagnetic disturbance expected" }
    ],
    summary: {
      highlights: [
        "20m and 10m bands showing strong daytime propagation",
        "Kp index remains low, minimal disruption"
      ],
      recommendations: [
        "Try 10m during daylight for DX",
        "Monitor 40m after sunset for stable QSOs"
      ]
    }
  });
}