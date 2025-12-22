import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder logic — replace with real propagation scoring later
  const score = {
    value: 78,
    label: "Good",
    details: {
      SFI: 145,
      Kp: 2,
      MUF: 22.5,
    },
  };

  return NextResponse.json(score);
}