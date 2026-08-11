export type AccountStatus = "pending" | "queued" | "running" | "active" | "failed" | "needs_review";
export type JobStatus = "pending" | "running" | "success" | "failed" | "cancelled" | "paused";
export type PhoneStatus = "reserved" | "charged" | "active" | "cancelled" | "refunded";
export type SignupScreen = "proxy_check" | "proxy_rotate" | "crane_outlook" | "outlook_signup" | "note_creds" | "crane_instagram" | "landing" | "email_entry" | "password_entry" | "otp_email" | "fullname" | "username" | "dob" | "terms" | "onboarding" | "home" | "cleanup" | "failed";
export type AutomationMode = "outlook_only" | "instagram" | "both";

export interface SheetRow {
  id: string;
  username: string;
  new_username?: string;
  container_name?: string;
  totp_secret?: string;
  status: AccountStatus;
  supplier?: string;
  name: string;
  link_old?: string;
  link_new?: string;
  password?: string;
  phone?: string;
  dob?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  order_id: string;
  phone: string;
  service: "instagram/threads";
  status: PhoneStatus;
  price_usd: number;
  account_username?: string;
  reserved_at: string;
  charged_at?: string;
  completed_at?: string;
}

export interface Job {
  id: string;
  batch_id: string;
  username: string;
  step: "register_account" | "profile_setup" | "post_reel" | "outlook_create";
  status: JobStatus;
  container_name?: string;
  terms_accepted: boolean;
  sms_charged: boolean;
  final_username?: string;
  username_had_suffix: boolean;
  email?: string;
  password?: string;
  error?: string;
  screenshot_path?: string;
  xml_dump_path?: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  mode?: AutomationMode;
}

export interface BatchJob {
  id: string;
  status: JobStatus;
  total: number;
  completed: number;
  failed: number;
  mode: AutomationMode;
  created_at: string;
  finished_at?: string;
}

export interface AccountState {
  username: string;
  final_username: string;
  password: string;
  email?: string;
  phone?: string;
  dob?: string;
  container_name: string;
  session_valid: boolean;
  totp_secret?: string;
  last_successful_step: string;
  created_at: string;
}

export interface Metrics {
  total_registrations: number;
  active_accounts: number;
  failed_accounts: number;
  spend_usd: number;
  charged_phones: number;
  success_rate: number;
  jobs_running: number;
  jobs_pending: number;
  outlook_created: number;
}

export interface SignupProgress {
  job_id: string;
  username: string;
  current_screen: SignupScreen;
  screen_index: number;
  message: string;
  terms_accepted: boolean;
  sms_charged: boolean;
  started_at: string;
  proxy_ip?: string;
  last_log?: string;
}

export interface OutlookAccount {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  proxy_used: string;
  status: "success" | "failed" | "captcha_failed" | "phone_required";
  created_at: string;
  error?: string;
}

export interface OutlookJob {
  id: string;
  batch_id: string;
  status: JobStatus;
  concurrency: number;
  total: number;
  completed: number;
  failed: number;
  created_at: string;
}

export interface ControlState {
  mode: AutomationMode | null;
  running: boolean;
  paused: boolean;
  target_count: number;
  created_count: number;
  current_ip?: string;
  previous_ip?: string;
  last_message: string;
  logs: string[];
}

export interface DeviceInfo {
  container_name: string;
  udid: string;
  free: boolean;
  last_used?: string;
  wda_healthy: boolean;
}
