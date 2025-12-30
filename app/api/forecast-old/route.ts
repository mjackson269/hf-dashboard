import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder forecast data — replace with real solar/Kp/MUF trends later
  const forecast = {
    hours: [
      { time: "00:00", SFI: 145, Kp: 2, MUF: 22.5 },
      { time: "06:00", SFI: 147, Kp: 3, MUF: 21.8 },
      { time: "12:00", SFI: 150, Kp: 4, MUF: 20.2 },
      { time: "18:00", SFI: 148, Kp: 3, MUF: 19.5 },
      { time: "00:00", SFI: 146, Kp: 2, MUF: 21.0 },
    ],
  };

  return NextResponse.json(forecast);
}