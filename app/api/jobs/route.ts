import { NextResponse } from "next/server";
import { getJobs } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(getJobs());
}
