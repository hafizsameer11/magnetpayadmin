import { T } from "./AdminShell";
import type { ReactNode, CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Database, Globe,
  Webhook, Key, Lock, Cpu, Server, Calendar, FileText, Flag,
  Palette, Languages, Plug, Mail, MessageSquare, Truck, ShieldCheck,
  CreditCard, Copy, Eye, EyeOff, RefreshCw, Play, Pause, MoreHorizontal,
  ChevronRight, X,
} from "lucide-react";

// ===== Types =====
export type WebhookEndpoint = {
  id: string;
  url: string;
  description: string;
  events: string[];
  status: "active" | "paused" | "failing";
  successRate: number;
  lastDelivery: string;
  signingSecret: string;
  createdAt: string;
  deliveries: WebhookDelivery[];
};

export type WebhookDelivery = {
  id: string;
  event: string;
  status: "200" | "401" | "500" | "timeout";
  attempts: number;
  duration: number;
  at: string;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scope: "read" | "read-write" | "admin";
  env: "live" | "test";
  createdBy: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
};

export type Job = {
  id: string;
  name: string;
  queue: string;
  status: "queued" | "running" | "completed" | "failed" | "retrying";
  priority: "low" | "normal" | "high" | "critical";
  attempts: number;
  maxAttempts: number;
  durationMs?: number;
  enqueuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  payload: Record<string, unknown>;
  error?: string;
};

export type CronJob = {
  id: string;
  name: string;
  schedule: string;
  schedulePretty: string;
  lastRun: string;
  lastStatus: "success" | "failed" | "skipped";
  nextRun: string;
  durationMs: number;
  owner: string;
  enabled: boolean;
};

export type Incident = {
  id: string;
  title: string;
  severity: "SEV1" | "SEV2" | "SEV3" | "SEV4";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  startedAt: string;
  resolvedAt?: string;
  affected: string[];
  commander: string;
  summary: string;
  timeline: { at: string; author: string; note: string }[];
  postmortem?: string;
};

export type FeatureFlag = {
  id: string;
  key: string;
  description: string;
  envs: { dev: number; staging: number; prod: number }; // rollout %
  type: "boolean" | "percentage" | "targeted";
  owner: string;
  updatedAt: string;
};

export type Integration = {
  id: string;
  name: string;
  category: "PSP" | "Carrier" | "KYC" | "SMS" | "Email" | "FX" | "Analytics";
  vendor: string;
  status: "connected" | "disconnected" | "error";
  env: "live" | "sandbox";
  health: number;
  configuredAt: string;
};

// ===== Mocks =====
/** Placeholder only — real webhook secrets live in server env, never in source. */
const MOCK_SIGNING_SECRET = "••••••••••••••••";

export const WEBHOOKS: WebhookEndpoint[] = [
  {
    id: "wh_01HX9",
    url: "https://hooks.alibaba-ng.com/magnetpay/orders",
    description: "Order lifecycle → Alibaba seller dashboard",
    events: ["order.created", "order.paid", "order.released", "order.refunded"],
    status: "active",
    successRate: 99.4,
    lastDelivery: "12s ago",
    signingSecret: MOCK_SIGNING_SECRET,
    createdAt: "2025-09-12",
    deliveries: [
      { id: "d_001", event: "order.paid", status: "200", attempts: 1, duration: 142, at: "12s ago" },
      { id: "d_002", event: "order.released", status: "200", attempts: 1, duration: 89, at: "1m ago" },
      { id: "d_003", event: "order.created", status: "500", attempts: 3, duration: 30001, at: "4m ago" },
      { id: "d_004", event: "order.paid", status: "200", attempts: 1, duration: 167, at: "7m ago" },
      { id: "d_005", event: "order.refunded", status: "401", attempts: 1, duration: 88, at: "12m ago" },
    ],
  },
  {
    id: "wh_02JK4",
    url: "https://ledger.magnetpay.internal/escrow-events",
    description: "Escrow state machine → internal ledger",
    events: ["escrow.held", "escrow.released", "escrow.refunded"],
    status: "active",
    successRate: 100,
    lastDelivery: "3s ago",
    signingSecret: MOCK_SIGNING_SECRET,
    createdAt: "2025-08-01",
    deliveries: [],
  },
  {
    id: "wh_03MN8",
    url: "https://api.heshunda.cn/magnetpay/shipments",
    description: "Shipment updates → Heshunda freight tracker",
    events: ["shipment.created", "shipment.in_transit", "shipment.delivered"],
    status: "failing",
    successRate: 73.2,
    lastDelivery: "2m ago",
    signingSecret: MOCK_SIGNING_SECRET,
    createdAt: "2025-10-22",
    deliveries: [],
  },
  {
    id: "wh_04PQ1",
    url: "https://ops.magnetpay.com/disputes",
    description: "Dispute lifecycle → ops Slack bridge",
    events: ["dispute.opened", "dispute.evidence_added", "dispute.ruled"],
    status: "paused",
    successRate: 96.8,
    lastDelivery: "3h ago",
    signingSecret: MOCK_SIGNING_SECRET,
    createdAt: "2025-07-14",
    deliveries: [],
  },
];

export const API_KEYS: ApiKey[] = [
  { id: "k_1", name: "Production · Ledger writer", prefix: "mp_live_7f2c…",  scope: "read-write", env: "live", createdBy: "ada.lin@magnetpay.com",   createdAt: "2025-04-08", lastUsed: "12s ago",  status: "active" },
  { id: "k_2", name: "Production · Reporting (read)", prefix: "mp_live_3a8f…",  scope: "read",       env: "live", createdBy: "analytics-bot",            createdAt: "2025-05-22", lastUsed: "2m ago",   status: "active" },
  { id: "k_3", name: "Sandbox · Mobile QA",          prefix: "mp_test_1b9d…",  scope: "read-write", env: "test", createdBy: "qa@magnetpay.com",         createdAt: "2025-09-03", lastUsed: "1h ago",   status: "active" },
  { id: "k_4", name: "Sandbox · Carrier integration",prefix: "mp_test_6e4a…",  scope: "read-write", env: "test", createdBy: "ops.tunde@magnetpay.com",  createdAt: "2025-10-19", lastUsed: "4h ago",   status: "active" },
  { id: "k_5", name: "Legacy · Internal admin",     prefix: "mp_live_9c1e…",  scope: "admin",      env: "live", createdBy: "founders",                 createdAt: "2024-11-30", lastUsed: "2d ago",   status: "revoked" },
];

export const JOBS: Job[] = [
  { id: "job_8f4a2c", name: "settle.escrow.batch",      queue: "settlement",  status: "running",    priority: "critical", attempts: 1, maxAttempts: 3, enqueuedAt: "14:02:11", startedAt: "14:02:12", payload: { batchId: "stl_2026_07_28_a", entries: 1842 } },
  { id: "job_2b9e1d", name: "kyc.vendor.refresh",       queue: "compliance",  status: "completed",  priority: "high",     attempts: 1, maxAttempts: 5, durationMs: 4218, enqueuedAt: "14:01:50", startedAt: "14:01:51", finishedAt: "14:01:55", payload: { vendor: "smile_id", count: 47 } },
  { id: "job_5c7f3a", name: "fx.rate.snapshot",         queue: "fx",          status: "completed",  priority: "normal",   attempts: 1, maxAttempts: 3, durationMs: 612,  enqueuedAt: "14:00:00", startedAt: "14:00:00", finishedAt: "14:00:01", payload: { pairs: ["CNY/NGN","USD/NGN","CNY/USD"] } },
  { id: "job_9d2a6e", name: "shipment.tracking.poll",   queue: "logistics",   status: "retrying",   priority: "normal",   attempts: 2, maxAttempts: 5, enqueuedAt: "13:58:33", startedAt: "13:59:04", payload: { carrier: "heshunda", shipmentId: "shp_OPQ821" }, error: "Upstream 504 — retry in 30s" },
  { id: "job_1e8b4f", name: "notify.email.dispatch",    queue: "notify",      status: "completed",  priority: "low",      attempts: 1, maxAttempts: 3, durationMs: 287,  enqueuedAt: "13:58:01", startedAt: "13:58:01", finishedAt: "13:58:02", payload: { template: "order_released", recipients: 12 } },
  { id: "job_6a3c9d", name: "ledger.reconcile",         queue: "settlement",  status: "failed",     priority: "high",     attempts: 5, maxAttempts: 5, durationMs: 8104, enqueuedAt: "13:55:11", startedAt: "13:55:12", finishedAt: "13:55:20", payload: { day: "2026-06-27" }, error: "BalanceMismatch: expected ₦14,238,019.42 actual ₦14,238,012.07 (Δ 7.35)" },
  { id: "job_4f1d7b", name: "report.scheduled.run",     queue: "reports",     status: "queued",     priority: "low",      attempts: 0, maxAttempts: 3, enqueuedAt: "14:02:05", payload: { reportId: "rep_gmv_daily" } },
  { id: "job_3e9c2a", name: "webhook.deliver",          queue: "webhooks",    status: "running",    priority: "high",     attempts: 1, maxAttempts: 5, enqueuedAt: "14:02:14", startedAt: "14:02:14", payload: { endpoint: "wh_01HX9", event: "order.paid" } },
];

export const CRONS: CronJob[] = [
  { id: "cron_1", name: "settle.escrow.batch",       schedule: "0 */15 * * * *", schedulePretty: "every 15 minutes",  lastRun: "2m ago",  lastStatus: "success", nextRun: "in 13m",  durationMs: 4218, owner: "settlement",   enabled: true },
  { id: "cron_2", name: "fx.rate.snapshot",          schedule: "0 0 * * * *",    schedulePretty: "hourly on the hour",lastRun: "2m ago",  lastStatus: "success", nextRun: "in 58m",  durationMs: 612,  owner: "fx-desk",      enabled: true },
  { id: "cron_3", name: "report.gmv.daily",          schedule: "0 0 7 * * *",    schedulePretty: "daily 07:00 WAT",   lastRun: "7h ago",  lastStatus: "success", nextRun: "in 17h",  durationMs: 12480,owner: "analytics",    enabled: true },
  { id: "cron_4", name: "compliance.sanctions.sync", schedule: "0 0 3 * * *",    schedulePretty: "daily 03:00 UTC",   lastRun: "11h ago", lastStatus: "success", nextRun: "in 13h",  durationMs: 38201,owner: "compliance",   enabled: true },
  { id: "cron_5", name: "ledger.reconcile",          schedule: "0 30 23 * * *",  schedulePretty: "daily 23:30 WAT",   lastRun: "14h ago", lastStatus: "failed",  nextRun: "in 9h",   durationMs: 8104, owner: "treasury",     enabled: true },
  { id: "cron_6", name: "warehouse.inventory.sync",  schedule: "0 0 * * * *",    schedulePretty: "hourly",            lastRun: "2m ago",  lastStatus: "success", nextRun: "in 58m",  durationMs: 2391, owner: "logistics",    enabled: true },
  { id: "cron_7", name: "kyc.vendor.refresh",        schedule: "0 0 */6 * * *",  schedulePretty: "every 6 hours",     lastRun: "4h ago",  lastStatus: "success", nextRun: "in 2h",   durationMs: 4218, owner: "compliance",   enabled: true },
  { id: "cron_8", name: "session.cleanup",           schedule: "0 */30 * * * *", schedulePretty: "every 30 minutes",  lastRun: "12m ago", lastStatus: "success", nextRun: "in 18m",  durationMs: 184,  owner: "platform",     enabled: true },
  { id: "cron_9", name: "report.fraud.weekly",       schedule: "0 0 8 * * 1",    schedulePretty: "Mondays 08:00 WAT", lastRun: "3d ago",  lastStatus: "skipped", nextRun: "in 4d",   durationMs: 0,    owner: "risk",         enabled: false },
];

export const INCIDENTS: Incident[] = [
  {
    id: "INC-2026-0142",
    title: "Heshunda webhook delivery degraded",
    severity: "SEV2",
    status: "monitoring",
    startedAt: "2026-06-28 13:14 WAT",
    affected: ["Shipments", "Tracking events"],
    commander: "Tunde O.",
    summary: "Heshunda upstream API returning 504s on ~27% of shipment polling requests. Retries succeed within 30s but tracking events lag.",
    timeline: [
      { at: "13:14", author: "PagerDuty", note: "Alert: shipment.tracking.poll error rate > 5% (5m)" },
      { at: "13:17", author: "Tunde O.",  note: "Acknowledged. Investigating upstream — Heshunda status page green but error pattern is 504." },
      { at: "13:28", author: "Tunde O.",  note: "Identified: Heshunda regional gateway (cn-shenzhen-2) degraded. Confirmed via carrier rep on WeChat." },
      { at: "13:41", author: "Ada L.",    note: "Rolled traffic to cn-shanghai-1 gateway. Error rate dropping (now 4.1%)." },
      { at: "14:02", author: "Ada L.",    note: "Monitoring: backlog draining at ~120 events/min, ETA clear in ~22 min." },
    ],
  },
  {
    id: "INC-2026-0141",
    title: "FX rate snapshot stale — CNY/NGN",
    severity: "SEV3",
    status: "resolved",
    startedAt: "2026-06-27 09:02 WAT",
    resolvedAt: "2026-06-27 09:41 WAT",
    affected: ["FX desk", "Checkout pricing"],
    commander: "Folake A.",
    summary: "Provider (CurrencyLayer) returned cached payload for 38 minutes — checkout briefly priced using stale 229.18 vs. live 229.04 (Δ 6 bps).",
    timeline: [],
    postmortem: "Root cause: provider failover did not trigger because health check accepted 200 + cached body. Action items: add freshness assertion (timestamp ≤ 90s) before accepting rate; add Wise as tertiary fallback. Owner: fx-desk · Due: 2026-07-04.",
  },
  {
    id: "INC-2026-0140",
    title: "Admin login slow (p95 > 4s)",
    severity: "SEV4",
    status: "resolved",
    startedAt: "2026-06-25 18:33 WAT",
    resolvedAt: "2026-06-25 19:10 WAT",
    affected: ["Admin console"],
    commander: "Ada L.",
    summary: "Auth0 East-Asia edge node added latency on /authorize. Mitigation: pinned to EU-West.",
    timeline: [],
  },
];

export const FLAGS: FeatureFlag[] = [
  { id: "f_1", key: "checkout.split_shipping_v2",     description: "New combined shipping breakdown UI",                envs: { dev: 100, staging: 100, prod: 35 }, type: "percentage", owner: "@growth",     updatedAt: "12m ago" },
  { id: "f_2", key: "wallet.cny_topup_via_alipay",    description: "Allow CNY top-ups funded by Alipay",                envs: { dev: 100, staging: 100, prod: 100 }, type: "boolean",    owner: "@payments",   updatedAt: "2d ago" },
  { id: "f_3", key: "seller.bulk_listing_csv",        description: "CSV bulk upload for sellers with > 50 SKUs",         envs: { dev: 100, staging: 100, prod: 0 },   type: "targeted",   owner: "@sellers",    updatedAt: "1h ago" },
  { id: "f_4", key: "risk.adaptive_velocity_v3",      description: "ML-tuned velocity rules (replaces static thresholds)", envs: { dev: 100, staging: 50, prod: 0 },  type: "percentage", owner: "@risk",       updatedAt: "4h ago" },
  { id: "f_5", key: "disputes.evidence_ai_summary",   description: "Auto-summarize dispute evidence for ops reviewers",  envs: { dev: 100, staging: 100, prod: 10 },  type: "percentage", owner: "@support",    updatedAt: "yesterday" },
  { id: "f_6", key: "logistics.consolidation_v2",     description: "Multi-order consolidation at Guangzhou warehouse",   envs: { dev: 100, staging: 100, prod: 100 }, type: "boolean",    owner: "@logistics",  updatedAt: "3d ago" },
];

export const INTEGRATIONS: Integration[] = [
  { id: "i_1",  name: "Paystack",         category: "PSP",       vendor: "Paystack",        status: "connected",    env: "live",    health: 99.8, configuredAt: "2024-08-11" },
  { id: "i_2",  name: "Flutterwave",      category: "PSP",       vendor: "Flutterwave",     status: "connected",    env: "live",    health: 99.2, configuredAt: "2025-01-14" },
  { id: "i_3",  name: "Alipay (B2B)",     category: "PSP",       vendor: "Ant Group",       status: "connected",    env: "live",    health: 100,  configuredAt: "2025-03-22" },
  { id: "i_4",  name: "Heshunda Freight", category: "Carrier",   vendor: "Heshunda",        status: "error",        env: "live",    health: 73.2, configuredAt: "2025-04-09" },
  { id: "i_5",  name: "DHL eCommerce",    category: "Carrier",   vendor: "DHL",             status: "connected",    env: "live",    health: 98.4, configuredAt: "2024-12-01" },
  { id: "i_6",  name: "GIG Logistics",    category: "Carrier",   vendor: "GIG",             status: "connected",    env: "live",    health: 96.1, configuredAt: "2025-02-18" },
  { id: "i_7",  name: "Smile ID",         category: "KYC",       vendor: "Smile Identity",  status: "connected",    env: "live",    health: 99.7, configuredAt: "2024-09-04" },
  { id: "i_8",  name: "Onfido",           category: "KYC",       vendor: "Onfido",          status: "connected",    env: "sandbox", health: 100,  configuredAt: "2026-05-20" },
  { id: "i_9",  name: "Termii SMS",       category: "SMS",       vendor: "Termii",          status: "connected",    env: "live",    health: 99.5, configuredAt: "2024-10-11" },
  { id: "i_10", name: "Postmark",         category: "Email",     vendor: "Postmark",        status: "connected",    env: "live",    health: 99.9, configuredAt: "2024-08-30" },
  { id: "i_11", name: "CurrencyLayer",    category: "FX",        vendor: "apilayer",        status: "connected",    env: "live",    health: 98.1, configuredAt: "2024-09-15" },
  { id: "i_12", name: "Wise (FX backup)", category: "FX",        vendor: "Wise",            status: "disconnected", env: "live",    health: 0,    configuredAt: "—" },
  { id: "i_13", name: "PostHog",          category: "Analytics", vendor: "PostHog",         status: "connected",    env: "live",    health: 99.6, configuredAt: "2025-01-08" },
];

// ===== UI primitives =====
export const card: CSSProperties = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
};

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section style={card} className="overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
        <h3 className="text-[13px] font-bold" style={{ color: T.ink }}>{title}</h3>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function KPI({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "warn" }) {
  const color = tone === "good" ? T.success : tone === "bad" ? T.danger : tone === "warn" ? T.warn : T.ink;
  return (
    <div style={card} className="p-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{label}</p>
      <p className="mt-1.5 text-[22px] font-bold tabular-nums" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px]" style={{ color: T.sub }}>{sub}</p>}
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "good" | "bad" | "warn" | "info" | "muted" }) {
  const map: Record<string, { bg: string; fg: string }> = {
    default: { bg: T.bg, fg: T.ink },
    good:    { bg: "#E6F4F1", fg: T.success },
    bad:     { bg: "#FCE8E8", fg: T.danger },
    warn:    { bg: "#FBEBD7", fg: T.warn },
    info:    { bg: "#E0EAFC", fg: T.info },
    muted:   { bg: T.bg, fg: T.muted },
  };
  const s = map[tone];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold" style={{ background: s.bg, color: s.fg }}>
      {children}
    </span>
  );
}

export function statusDot(color: string) {
  return <span className="inline-block size-1.5 rounded-full" style={{ background: color }} />;
}

export function jobStatusTone(s: Job["status"]) {
  switch (s) {
    case "running":   return "info" as const;
    case "completed": return "good" as const;
    case "failed":    return "bad" as const;
    case "retrying":  return "warn" as const;
    default:          return "muted" as const;
  }
}

export function ToolbarBtn({ children, onClick, tone = "default" }: { children: ReactNode; onClick?: () => void; tone?: "default" | "primary" | "danger" }) {
  const styles: Record<string, CSSProperties> = {
    default: { background: T.surface, color: T.ink, border: `1px solid ${T.border}` },
    primary: { background: T.navy,    color: "#fff", border: `1px solid ${T.navy}` },
    danger:  { background: T.surface, color: T.danger, border: `1px solid ${T.border}` },
  };
  return (
    <button onClick={onClick} className="h-8 px-3 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5 hover:opacity-90 transition" style={styles[tone]}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.muted }}>{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px]" style={{ color: T.sub }}>{hint}</p>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-9 px-3 rounded-lg text-[12.5px] outline-none focus:ring-2 focus:ring-offset-0"
      style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontFamily: "'Inter', sans-serif", ...(props.style || {}) }}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 rounded-lg text-[12.5px] outline-none focus:ring-2 leading-relaxed"
      style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontFamily: "'Inter', sans-serif", ...(props.style || {}) }}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full h-9 px-2 rounded-lg text-[12.5px] outline-none"
      style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, ...(props.style || {}) }}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange?: (v: boolean) => void; label?: string }) {
  return (
    <button onClick={() => onChange?.(!checked)} className="inline-flex items-center gap-2">
      <span className="relative inline-block w-9 h-5 rounded-full transition" style={{ background: checked ? T.success : T.border }}>
        <span className="absolute top-0.5 size-4 bg-white rounded-full transition-all shadow-sm" style={{ left: checked ? 18 : 2 }} />
      </span>
      {label && <span className="text-[12px]" style={{ color: T.ink }}>{label}</span>}
    </button>
  );
}

export function Mono({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: color ?? T.ink }}>
      {children}
    </span>
  );
}

export function severityTone(s: Incident["severity"]) {
  return s === "SEV1" ? "bad" : s === "SEV2" ? "warn" : s === "SEV3" ? "info" : "muted";
}

export function incidentStatusTone(s: Incident["status"]) {
  return s === "resolved" ? "good" : s === "monitoring" ? "info" : s === "identified" ? "warn" : "bad";
}

export function IconBadge({ I, bg, fg }: { I: typeof Activity; bg: string; fg: string }) {
  return (
    <div className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: bg, color: fg }}>
      <I className="size-4" strokeWidth={2.2} />
    </div>
  );
}

export function integrationIcon(cat: Integration["category"]) {
  switch (cat) {
    case "PSP":       return CreditCard;
    case "Carrier":   return Truck;
    case "KYC":       return ShieldCheck;
    case "SMS":       return MessageSquare;
    case "Email":     return Mail;
    case "FX":        return Globe;
    case "Analytics": return Activity;
  }
}

export function LinkRow({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-[12px] font-semibold hover:underline" style={{ color: T.info }}>
      {children} <ChevronRight className="size-3.5" />
    </Link>
  );
}

// Re-exports
export {
  Activity, AlertTriangle, CheckCircle2, Clock, Database, Globe, Webhook, Key, Lock,
  Cpu, Server, Calendar, FileText, Flag, Palette, Languages, Plug, Mail, MessageSquare,
  Truck, ShieldCheck, CreditCard, Copy, Eye, EyeOff, RefreshCw, Play, Pause,
  MoreHorizontal, ChevronRight, X,
};
