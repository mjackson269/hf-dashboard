import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    keyLoaded: !!process.env.DEEPSEEK_API_KEY,
    keyPreview: process.env.DEEPSEEK_API_KEY
      ? process.env.DEEPSEEK_API_KEY.slice(0, 6) + "..."
      : null
  });
}