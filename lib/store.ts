import { v4 as uuid } from "uuid";
import type { SheetRow, Job, BatchJob, AccountState, Metrics, SignupProgress, OutlookAccount, ControlState, AutomationMode, PhoneNumber, AccountStatus } from "../types";

const sheet: SheetRow[] = [];
const jobs: Job[] = [];
const batches: BatchJob[] = [];
const phones: PhoneNumber[] = [];
const states: AccountState[] = [];
const outlookAccounts: OutlookAccount[] = [];
let progress: SignupProgress[] = [];
let control: ControlState = {
  mode: null, running: false, paused: false, target_count: 0, created_count: 0,
  last_message: "idle", logs: ["[system] Axion Farm online"],
};
const now = () => new Date().toISOString();
export function log(msg: string) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  control.logs = [line, ...control.logs].slice(0, 400);
  control.last_message = msg;
}
export const getControl = () => ({ ...control, logs: [...control.logs] });
export const setControl = (p: Partial<ControlState>) => { control = { ...control, ...p }; };
export function addSheetRow(username: string, name: string, supplier = "va-team"): SheetRow {
  const row: SheetRow = { id: uuid(), username, name, supplier, status: "pending", created_at: now(), updated_at: now() };
  sheet.push(row); return row;
}
export const getRegisterQueue = () => sheet.filter((r) => r.username && r.name && !r.password);
export const getSheet = () => [...sheet];
export const getSheetRow = (u: string) => sheet.find((r) => r.username === u);
export function markRegistrationComplete(username: string, password: string, phone: string | undefined, dob: string | undefined, container_name: string, status: AccountStatus = "active", new_username?: string, email?: string) {
  const row = getSheetRow(username); if (!row) return;
  row.password = password; if (phone) row.phone = phone; if (dob) row.dob = dob;
  row.container_name = container_name; row.status = status;
  if (new_username && new_username !== username) row.new_username = new_username;
  if (email) row.email = email; row.updated_at = now();
}
export function createBatch(usernames: string[], mode: AutomationMode) {
  const batch: BatchJob = { id: uuid(), status: "pending", total: usernames.length, completed: 0, failed: 0, mode, created_at: now() };
  batches.unshift(batch);
  const created: Job[] = usernames.map((u) => {
    const j: Job = { id: uuid(), batch_id: batch.id, username: u, step: mode === "outlook_only" ? "outlook_create" : "register_account", status: "pending", terms_accepted: false, sms_charged: false, username_had_suffix: false, created_at: now(), mode };
    jobs.unshift(j); return j;
  });
  return { batch, jobs: created };
}
export const getJobs = () => ({ jobs: [...jobs], batches: [...batches], progress: [...progress] });
export const getJob = (id: string) => jobs.find((j) => j.id === id);
export function updateJob(id: string, patch: Partial<Job>) { const j = getJob(id); if (j) Object.assign(j, patch); }
export function updateBatch(id: string, patch: Partial<BatchJob>) { const b = batches.find((x) => x.id === id); if (b) Object.assign(b, patch); }
export function setProgress(p: SignupProgress) { progress = [p, ...progress.filter((x) => x.job_id !== p.job_id)]; }
export function clearProgress(jobId: string) { progress = progress.filter((x) => x.job_id !== jobId); }
export function createPhoneOrder(username: string): PhoneNumber {
  const p: PhoneNumber = { id: uuid(), order_id: "", phone: "", service: "instagram/threads", status: "reserved", price_usd: 0.24, account_username: username, reserved_at: now() };
  phones.unshift(p); return p;
}
export function chargePhone(id: string) { const p = phones.find((x) => x.id === id); if (p) { p.status = "charged"; p.charged_at = now(); } }
export function promotePhoneToActive(id: string) { const p = phones.find((x) => x.id === id); if (p) { p.status = "active"; p.completed_at = now(); } }
export function cancelPhone(id: string) { const p = phones.find((x) => x.id === id); if (p) p.status = "cancelled"; }
export function initAccountState(state: AccountState) { states.unshift(state); }
export const getStates = () => [...states];
export function addOutlookAccount(acc: OutlookAccount) { outlookAccounts.unshift(acc); }
export const getOutlookAccounts = () => [...outlookAccounts];
export function getMetrics(): Metrics {
  const active = sheet.filter((r) => r.status === "active").length;
  const failed = sheet.filter((r) => r.status === "failed").length;
  const charged = phones.filter((p) => p.status === "charged" || p.status === "active").length;
  const running = jobs.filter((j) => j.status === "running").length;
  const pending = jobs.filter((j) => j.status === "pending").length;
  const total = active + failed;
  return { total_registrations: total, active_accounts: active, failed_accounts: failed, spend_usd: Number((charged * 0.24).toFixed(2)), charged_phones: charged, success_rate: total ? Number(((active / total) * 100).toFixed(1)) : 0, jobs_running: running, jobs_pending: pending, outlook_created: outlookAccounts.filter((a) => a.status === "success").length };
}
const busy = new Set<string>();
export function assignContainer() { busy.add("actual account"); return "actual account"; }
export function releaseContainer(name: string) { busy.delete(name); }
