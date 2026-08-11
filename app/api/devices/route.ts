import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    devices: [{ container_name: "actual account", udid: "SET_ON_LOCAL_MAC", free: true, wda_healthy: false }],
    appium: process.env.APPIUM_URL || "http://127.0.0.1:4723",
    note: "Real device control runs on your Mac. This cloud UI is the control plane.",
  });
}
