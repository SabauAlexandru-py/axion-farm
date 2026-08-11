import { v4 as uuid } from "uuid";
import { getControl, setControl, log, createBatch, updateJob, updateBatch, setProgress, clearProgress, markRegistrationComplete, initAccountState, addOutlookAccount, getSheetRow, assignContainer, releaseContainer, addSheetRow } from "./store";
import type { AutomationMode, SignupScreen } from "../types";

let stopFlag = false;
export function requestStop() { stopFlag = true; setControl({ paused: true, last_message: "stop requested…" }); log("stop requested"); }
export function clearStop() { stopFlag = false; }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const FIRST = ["James","Oliver","Emma","Olivia","Liam","Sophia","Noah","Ava"];
const LAST = ["Smith","Johnson","Williams","Brown","Garcia","Miller","Davis"];
function randomName() { return { first: FIRST[rand(0, FIRST.length - 1)], last: LAST[rand(0, LAST.length - 1)] }; }
function randomEmail() {
  const a = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = ""; for (let i = 0; i < 14; i++) s += a[rand(0, a.length - 1)];
  return s + "@outlook.com";
}
function randomPassword() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
  let p = ""; for (let i = 0; i < 14; i++) p += c[rand(0, c.length - 1)];
  return p;
}
async function progress(jobId: string, username: string, screen: SignupScreen, index: number, message: string) {
  setProgress({ job_id: jobId, username, current_screen: screen, screen_index: index, message, terms_accepted: index >= 8, sms_charged: false, started_at: new Date().toISOString(), last_log: message });
  log(`[${username}] ${message}`);
}
export async function startAutomation(opts: { mode: AutomationMode; count: number; usernames?: string[] }) {
  clearStop();
  setControl({ mode: opts.mode, running: true, paused: false, target_count: opts.count, created_count: 0, last_message: `starting ${opts.mode} × ${opts.count}` });
  log(`automation start · mode=${opts.mode} · target=${opts.count}`);
  log("Cloud demo mode — real phone needs DEVICE_UDID on your Mac");
  const names = opts.usernames?.length ? opts.usernames.slice(0, opts.count) : Array.from({ length: opts.count }, (_, i) => { const n = randomName(); return `${n.first.toLowerCase()}${n.last.toLowerCase()}${100 + i}`; });
  for (const u of names) { if (!getSheetRow(u)) { const n = randomName(); addSheetRow(u, `${n.first} ${n.last}`); } }
  const { batch, jobs } = createBatch(names, opts.mode);
  updateBatch(batch.id, { status: "running" });
  let completed = 0, failed = 0;
  for (const job of jobs) {
    if (stopFlag || getControl().paused) { updateJob(job.id, { status: "cancelled", finished_at: new Date().toISOString() }); continue; }
    const containerName = assignContainer();
    updateJob(job.id, { status: "running", container_name: containerName, started_at: new Date().toISOString() });
    try {
      const steps: [SignupScreen, number, string, number][] = [
        ["proxy_check", 1, "Shadowrocket connectivity test…", 800],
        ["proxy_rotate", 2, "Notes → proxy rotation · wait 5s", 1000],
        ["crane_outlook", 3, 'Crane → New Container "actual account"', 900],
        ["outlook_signup", 4, "Creating Outlook account (human typing)", 1500],
        ["note_creds", 5, "Saving email : password", 600],
      ];
      if (opts.mode !== "outlook_only") {
        steps.push(["crane_instagram", 6, "Crane → Instagram container", 900], ["landing", 7, "Instagram signup · paste email", 1200], ["otp_email", 8, "OTP from Outlook inbox", 1000], ["home", 9, "Home feed reached", 700], ["cleanup", 10, "Delete container · rotate IP", 800]);
      } else {
        steps.push(["cleanup", 6, "Delete container · rotate", 800]);
      }
      const email = randomEmail(), password = randomPassword(), name = randomName();
      for (const [screen, index, message, ms] of steps) {
        if (stopFlag) throw new Error("stopped by operator");
        await progress(job.id, job.username, screen, index, message);
        await sleep(ms);
      }
      addOutlookAccount({ id: uuid(), email, password, first_name: name.first, last_name: name.last, proxy_used: `198.51.100.${rand(10, 250)}`, status: "success", created_at: new Date().toISOString() });
      if (opts.mode !== "outlook_only") {
        markRegistrationComplete(job.username, password, undefined, undefined, containerName, "active", undefined, email);
        initAccountState({ username: job.username, final_username: job.username, password, email, container_name: containerName, session_valid: true, last_successful_step: "register_account", created_at: new Date().toISOString() });
      }
      updateJob(job.id, { status: "success", email, password, finished_at: new Date().toISOString() });
      completed++; setControl({ created_count: completed });
      log(`✓ success ${job.username} → ${email}`);
    } catch (err: any) {
      failed++;
      updateJob(job.id, { status: "failed", error: String(err?.message || err).slice(0, 500), finished_at: new Date().toISOString() });
      log(`✗ failed ${job.username}: ${err?.message || err}`);
    } finally {
      releaseContainer(containerName); clearProgress(job.id); updateBatch(batch.id, { completed, failed });
    }
  }
  updateBatch(batch.id, { status: failed && !completed ? "failed" : "success", completed, failed, finished_at: new Date().toISOString() });
  const label = opts.mode === "outlook_only" ? "Outlook Accounts have been created" : "Instagram Accounts have been created";
  log(`${label} · count=${completed}`);
  setControl({ running: false, paused: false, last_message: `${label} (${completed})` });
}
