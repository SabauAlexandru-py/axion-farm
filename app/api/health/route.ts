import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    appium: "cloud-demo",
    appiumUrl: process.env.APPIUM_URL || "http://127.0.0.1:4723",
    deviceUdid: process.env.DEVICE_UDID ? "set" : "missing (expected on cloud)",
    smsKey: process.env.SMS_PROVIDER_API_KEY ? "set" : "missing",
    mode: "vercel-demo",
  });
}
