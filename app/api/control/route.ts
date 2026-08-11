import { NextRequest, NextResponse } from "next/server";
import { getControl, setControl, getMetrics, getJobs, getOutlookAccounts, getSheet, getStates } from "@/lib/store";
import { startAutomation, requestStop, clearStop } from "@/lib/runner";
import type { AutomationMode } from "@/types";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ control: getControl(), metrics: getMetrics(), ...getJobs(), outlook: getOutlookAccounts(), sheet: getSheet(), states: getStates() });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action as string;
  if (action === "start") {
    const mode = (body.mode || "instagram") as AutomationMode;
    const count = Math.max(1, Math.min(100, Number(body.count) || 1));
    clearStop();
    setControl({ running: true, paused: false, mode, target_count: count, created_count: 0 });
    startAutomation({ mode, count, usernames: body.usernames }).catch((e) => setControl({ running: false, last_message: String(e?.message || e) }));
    return NextResponse.json({ ok: true });
  }
  if (action === "pause" || action === "stop") {
    requestStop(); setControl({ paused: true, running: false });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
