import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    deepseek: process.env.DEEPSEEK_API_KEY || "NOT LOADED",
    base: process.env.BASE_URL || "NOT LOADED"
  });
}