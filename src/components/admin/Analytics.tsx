import { T } from "./AdminShell";
import type { ReactNode } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

// ============== Types ==============
export type SeriesPoint = { d: string; v: number; v2?: number; v3?: number };

export type ReportJob = {
  id: string;
  name: string;
  category: "Finance" | "Compliance" | "Operations" | "Growth" | "Logistics";
  schedule: "Daily 06:00" | "Weekly Mon 07:00" | "Monthly 1st 07:00" | "Quarterly" | "On-demand";
  format: "CSV" | "XLSX" | "PDF" | "Parquet";
  recipients: string[];
  lastRun: string;
  lastStatus: "Success" | "Failed" | "Running" | "Queued";
  durationSec: number;
  rows: number;
  sizeMb: number;
  owner: string;
  description: string;
  history: { ranAt: string; status: "Success" | "Failed"; rows: number; sizeMb: number; durationSec: number; downloadedBy?: string }[];
};

// ============== Mock data ==============
const days = (n: number, start = new Date("2026-05-29")): string[] => {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    out.push(d.toISOString().slice(5, 10));
  }
  return out;
};

const DAYS_30 = days(30);

const wave = (base: number, amp: number, phase = 0, jitter = 0.08) =>
  DAYS_30.map((d, i) => ({
    d,
    v: Math.round(base + Math.sin((i + phase) / 3) * amp + (Math.sin(i * 2.3) * amp * jitter)),
  }));

export const KPI_OVERVIEW = {
  gmv30d:        { value: "┬Ñ42.18M", delta: "+12.4%", tone: "success" as const },
  orders30d:     { value: "8,142",   delta: "+9.1%",  tone: "success" as const },
  takeRate:      { value: "1.84%",   delta: "+0.06pp", tone: "success" as const },
  activeBuyers:  { value: "14,820",  delta: "+5.2%",  tone: "success" as const },
  activeSellers: { value: "1,408",   delta: "+3.0%",  tone: "success" as const },
  disputeRate:   { value: "0.62%",   delta: "-0.04pp", tone: "success" as const },
  payoutSlaP95:  { value: "47 min",  delta: "-12 min", tone: "success" as const },
  fxSpreadAvg:   { value: "0.38%",   delta: "+0.02pp", tone: "warn" as const },
};

export const GMV_SERIES: SeriesPoint[] = DAYS_30.map((d, i) => ({
  d,
  v: Math.round(1.05e6 + Math.sin(i / 3) * 220000 + i * 14000),  // CNY
  v2: Math.round(820000 + Math.sin((i + 1) / 3) * 180000 + i * 11000), // prev period
}));

export const GMV_BY_CATEGORY = [
  { k: "Apparel & textiles", v: 12_840_000 },
  { k: "Electronics",        v:  9_220_000 },
  { k: "Home & furniture",   v:  6_410_000 },
  { k: "Auto parts",         v:  4_980_000 },
  { k: "Beauty & wellness",  v:  3_620_000 },
  { k: "Other",              v:  5_110_000 },
];

export const GMV_BY_CORRIDOR = [
  { k: "Guangzhou ΓåÆ Lagos",   v: 14_280_000 },
  { k: "Yiwu ΓåÆ Nairobi",      v:  8_410_000 },
  { k: "Shenzhen ΓåÆ Accra",    v:  6_120_000 },
  { k: "Shanghai ΓåÆ Lagos",    v:  5_700_000 },
  { k: "Foshan ΓåÆ Mombasa",    v:  4_220_000 },
  { k: "Other corridors",     v:  3_450_000 },
];

export const USERS_GROWTH = DAYS_30.map((d, i) => ({
  d,
  v: 14_500 + i * 35 + Math.round(Math.sin(i / 4) * 40),   // active buyers DAU
  v2: 1_360 + Math.round(i * 1.6) + Math.round(Math.sin(i / 3) * 6), // active sellers DAU
}));

export const USERS_SIGNUPS = DAYS_30.map((d, i) => ({
  d,
  v: 180 + Math.round(Math.sin(i / 3) * 28) + (i > 22 ? 40 : 0), // signups
  v2: 132 + Math.round(Math.sin(i / 3) * 22) + (i > 22 ? 30 : 0), // activated (KYC ok + first deposit)
}));

export const USERS_BY_COUNTRY = [
  { k: "Nigeria",      v: 8420 },
  { k: "China",        v: 3120 },
  { k: "Kenya",        v: 1680 },
  { k: "Ghana",        v:  920 },
  { k: "UAE",          v:  410 },
  { k: "South Africa", v:  270 },
];

export const SELLERS_TIERS = [
  { k: "Verified Pro",  v: 142, c: T.success },
  { k: "Verified",      v: 612, c: T.info },
  { k: "New",           v: 482, c: T.warn },
  { k: "Suspended",     v:  28, c: T.danger },
  { k: "Pending KYB",   v: 144, c: T.muted },
];

export const SELLERS_TOP = [
  { k: "Guangzhou Lin Apparel Co.",  gmv: 1_820_000, orders: 412, rating: 4.92, disputes: 0.4 },
  { k: "Shenzhen Hua Electronics",   gmv: 1_410_000, orders: 188, rating: 4.85, disputes: 0.9 },
  { k: "Yiwu Trade Hub",             gmv: 1_280_000, orders: 612, rating: 4.78, disputes: 1.2 },
  { k: "Foshan Bright Furniture",    gmv:   980_000, orders:  96, rating: 4.90, disputes: 0.6 },
  { k: "Hangzhou Silk House",        gmv:   820_000, orders: 142, rating: 4.88, disputes: 0.5 },
  { k: "Quanzhou Footwear Group",    gmv:   720_000, orders: 308, rating: 4.71, disputes: 1.8 },
];

export const FX_SPREAD = DAYS_30.map((d, i) => ({
  d,
  v: +(0.34 + Math.sin(i / 4) * 0.04 + (i > 24 ? 0.02 : 0)).toFixed(3),  // realised spread %
  v2: +(0.30 + Math.sin(i / 4) * 0.03).toFixed(3),                        // mid-market reference
}));

export const FX_VOLUME_PAIR = [
  { k: "CNY ΓåÆ NGN", v: 28_420_000, hedged: 18_900_000 },
  { k: "CNY ΓåÆ KES", v:  7_120_000, hedged:  3_800_000 },
  { k: "CNY ΓåÆ GHS", v:  3_420_000, hedged:  1_900_000 },
  { k: "USD ΓåÆ NGN", v:  2_410_000, hedged:    810_000 },
  { k: "AED ΓåÆ NGN", v:    980_000, hedged:    420_000 },
];

export const LOGISTICS_DELIVERY = DAYS_30.map((d, i) => ({
  d,
  v: +(18.4 + Math.sin(i / 5) * 1.4 - i * 0.04).toFixed(1),   // avg delivery days
  v2: +(22.2 + Math.sin(i / 5) * 1.2 - i * 0.05).toFixed(1),  // previous period
}));

export const LOGISTICS_CARRIERS = [
  { k: "DHL Express",    onTime: 96.4, exceptions: 1.2, volume: 1820, c: T.success },
  { k: "FedEx Intl",     onTime: 94.1, exceptions: 1.8, volume: 1240, c: T.info },
  { k: "Maersk (sea)",   onTime: 88.6, exceptions: 3.4, volume:  610, c: T.warn },
  { k: "COSCO (sea)",    onTime: 85.2, exceptions: 4.1, volume:  482, c: T.warn },
  { k: "Aramex",         onTime: 91.3, exceptions: 2.2, volume:  328, c: T.info },
  { k: "Local last-mile",onTime: 78.4, exceptions: 6.8, volume: 2841, c: T.danger },
];

export const FUNNEL_CHECKOUT = [
  { k: "Viewed listing",    v: 124_820, color: T.info },
  { k: "Added to cart",     v:  54_220, color: T.info },
  { k: "Initiated checkout",v:  31_460, color: T.warn },
  { k: "Quote accepted",    v:  21_810, color: T.warn },
  { k: "Escrow funded",     v:  16_240, color: T.success },
  { k: "Order completed",   v:  14_982, color: T.success },
];

export const FUNNEL_ONBOARDING = [
  { k: "Downloaded app",     v: 48_210, color: T.info },
  { k: "Signed up",          v: 22_140, color: T.info },
  { k: "KYC submitted",      v: 16_820, color: T.warn },
  { k: "KYC approved",       v: 14_910, color: T.warn },
  { k: "First wallet top-up",v:  9_280, color: T.success },
  { k: "First order",        v:  6_420, color: T.success },
];

// 12-week cohort retention (% of original)
export const COHORTS: { cohort: string; size: number; weeks: number[] }[] = [
  { cohort: "2026-W14", size: 1820, weeks: [100, 62, 48, 41, 36, 33, 31, 30, 29, 28, 27, 27] },
  { cohort: "2026-W15", size: 1742, weeks: [100, 64, 51, 44, 39, 36, 34, 32, 31, 30, 29, 28] },
  { cohort: "2026-W16", size: 1980, weeks: [100, 66, 53, 46, 41, 38, 35, 33, 32, 31, 30] },
  { cohort: "2026-W17", size: 2104, weeks: [100, 68, 55, 48, 43, 40, 37, 35, 34, 32] },
  { cohort: "2026-W18", size: 2210, weeks: [100, 69, 57, 50, 45, 41, 39, 37, 35] },
  { cohort: "2026-W19", size: 2342, weeks: [100, 70, 58, 52, 46, 43, 40, 38] },
  { cohort: "2026-W20", size: 2418, weeks: [100, 71, 60, 53, 48, 44, 42] },
  { cohort: "2026-W21", size: 2510, weeks: [100, 72, 61, 54, 49, 45] },
  { cohort: "2026-W22", size: 2622, weeks: [100, 73, 62, 55, 50] },
  { cohort: "2026-W23", size: 2740, weeks: [100, 74, 63, 56] },
  { cohort: "2026-W24", size: 2812, weeks: [100, 75, 64] },
  { cohort: "2026-W25", size: 2904, weeks: [100, 76] },
];

export const REPORTS: ReportJob[] = [
  {
    id: "rep_gmv_daily", name: "GMV daily snapshot", category: "Finance",
    schedule: "Daily 06:00", format: "CSV",
    recipients: ["finance@magnetpay.com", "ceo@magnetpay.com"],
    lastRun: "2026-06-28 06:00:12", lastStatus: "Success", durationSec: 18, rows: 1842, sizeMb: 0.84,
    owner: "Finance ┬╖ Sade O.",
    description: "Per-corridor GMV, take rate, refund rate and net revenue with previous-period comparison.",
    history: [
      { ranAt: "2026-06-28 06:00", status: "Success", rows: 1842, sizeMb: 0.84, durationSec: 18, downloadedBy: "finance@magnetpay.com" },
      { ranAt: "2026-06-27 06:00", status: "Success", rows: 1812, sizeMb: 0.83, durationSec: 17 },
      { ranAt: "2026-06-26 06:00", status: "Success", rows: 1790, sizeMb: 0.82, durationSec: 19 },
      { ranAt: "2026-06-25 06:00", status: "Failed",  rows: 0,    sizeMb: 0,    durationSec: 4  },
      { ranAt: "2026-06-24 06:00", status: "Success", rows: 1781, sizeMb: 0.81, durationSec: 18 },
    ],
  },
  {
    id: "rep_payouts_recon", name: "Payouts reconciliation", category: "Finance",
    schedule: "Daily 06:00", format: "XLSX",
    recipients: ["finance@magnetpay.com", "treasury@magnetpay.com"],
    lastRun: "2026-06-28 06:01:42", lastStatus: "Success", durationSec: 41, rows: 8_142, sizeMb: 4.21,
    owner: "Treasury ┬╖ Idris M.",
    description: "Bank statement vs ledger reconciliation across CNY, NGN, KES and GHS settlement accounts.",
    history: [
      { ranAt: "2026-06-28 06:01", status: "Success", rows: 8142, sizeMb: 4.21, durationSec: 41 },
      { ranAt: "2026-06-27 06:01", status: "Success", rows: 7980, sizeMb: 4.12, durationSec: 39 },
      { ranAt: "2026-06-26 06:01", status: "Success", rows: 7842, sizeMb: 4.04, durationSec: 38 },
    ],
  },
  {
    id: "rep_sar_monthly", name: "SAR filings summary", category: "Compliance",
    schedule: "Monthly 1st 07:00", format: "PDF",
    recipients: ["mlro@magnetpay.com", "nfiu-liaison@magnetpay.com"],
    lastRun: "2026-06-01 07:00:08", lastStatus: "Success", durationSec: 92, rows: 142, sizeMb: 1.92,
    owner: "Compliance ┬╖ Idris M.",
    description: "Monthly SAR filings, status, recovered amounts and ageing across NFIU and FinCEN regulators.",
    history: [
      { ranAt: "2026-06-01 07:00", status: "Success", rows: 142, sizeMb: 1.92, durationSec: 92 },
      { ranAt: "2026-05-01 07:00", status: "Success", rows: 138, sizeMb: 1.88, durationSec: 90 },
    ],
  },
  {
    id: "rep_kyc_aging", name: "KYC backlog ageing", category: "Compliance",
    schedule: "Weekly Mon 07:00", format: "XLSX",
    recipients: ["ops@magnetpay.com"],
    lastRun: "2026-06-23 07:00:21", lastStatus: "Success", durationSec: 22, rows: 412, sizeMb: 0.21,
    owner: "Ops ┬╖ Adaeze N.",
    description: "Pending KYC/KYB cases bucketed by 0ΓÇô24h, 24ΓÇô48h, 48ΓÇô72h and 72h+ with assigned reviewer.",
    history: [
      { ranAt: "2026-06-23 07:00", status: "Success", rows: 412, sizeMb: 0.21, durationSec: 22 },
      { ranAt: "2026-06-16 07:00", status: "Success", rows: 488, sizeMb: 0.24, durationSec: 24 },
    ],
  },
  {
    id: "rep_dispute_sla", name: "Dispute SLA breach", category: "Operations",
    schedule: "Daily 06:00", format: "CSV",
    recipients: ["disputes@magnetpay.com"],
    lastRun: "2026-06-28 06:02:11", lastStatus: "Success", durationSec: 9, rows: 18, sizeMb: 0.02,
    owner: "Disputes ┬╖ Mei L.",
    description: "Open disputes exceeding their stage SLA, with buyer, seller, value and assigned agent.",
    history: [
      { ranAt: "2026-06-28 06:02", status: "Success", rows: 18, sizeMb: 0.02, durationSec: 9 },
      { ranAt: "2026-06-27 06:02", status: "Success", rows: 21, sizeMb: 0.02, durationSec: 8 },
    ],
  },
  {
    id: "rep_carrier_perf", name: "Carrier performance", category: "Logistics",
    schedule: "Weekly Mon 07:00", format: "XLSX",
    recipients: ["logistics@magnetpay.com"],
    lastRun: "2026-06-23 07:01:08", lastStatus: "Success", durationSec: 33, rows: 1820, sizeMb: 0.92,
    owner: "Logistics ┬╖ Olu A.",
    description: "On-time %, exception rate and average transit time per carrier and corridor.",
    history: [
      { ranAt: "2026-06-23 07:01", status: "Success", rows: 1820, sizeMb: 0.92, durationSec: 33 },
      { ranAt: "2026-06-16 07:01", status: "Success", rows: 1748, sizeMb: 0.88, durationSec: 31 },
    ],
  },
  {
    id: "rep_cohort_growth", name: "Cohort retention export", category: "Growth",
    schedule: "Weekly Mon 07:00", format: "Parquet",
    recipients: ["data@magnetpay.com"],
    lastRun: "2026-06-23 07:02:42", lastStatus: "Running", durationSec: 0, rows: 0, sizeMb: 0,
    owner: "Data ┬╖ Wei Z.",
    description: "Buyer and seller cohort retention up to 12 weeks for the analytics warehouse.",
    history: [
      { ranAt: "2026-06-16 07:02", status: "Success", rows: 24_120, sizeMb: 14.2, durationSec: 184 },
      { ranAt: "2026-06-09 07:02", status: "Success", rows: 23_410, sizeMb: 13.8, durationSec: 178 },
    ],
  },
  {
    id: "rep_fx_recon", name: "FX hedging reconciliation", category: "Finance",
    schedule: "Daily 06:00", format: "XLSX",
    recipients: ["treasury@magnetpay.com"],
    lastRun: "2026-06-28 06:01:18", lastStatus: "Failed", durationSec: 6, rows: 0, sizeMb: 0,
    owner: "Treasury ┬╖ Idris M.",
    description: "Hedged vs unhedged FX exposure per currency pair, with realised P&L.",
    history: [
      { ranAt: "2026-06-28 06:01", status: "Failed",  rows: 0,    sizeMb: 0,    durationSec: 6 },
      { ranAt: "2026-06-27 06:01", status: "Success", rows: 1240, sizeMb: 0.62, durationSec: 28 },
    ],
  },
  {
    id: "rep_gdpr_log", name: "GDPR requests log", category: "Compliance",
    schedule: "Monthly 1st 07:00", format: "CSV",
    recipients: ["dpo@magnetpay.com"],
    lastRun: "2026-06-01 07:00:42", lastStatus: "Success", durationSec: 8, rows: 28, sizeMb: 0.04,
    owner: "Compliance ┬╖ Idris M.",
    description: "All data subject requests, status, SLA and artifact delivery method.",
    history: [
      { ranAt: "2026-06-01 07:00", status: "Success", rows: 28, sizeMb: 0.04, durationSec: 8 },
      { ranAt: "2026-05-01 07:00", status: "Success", rows: 22, sizeMb: 0.03, durationSec: 7 },
    ],
  },
];

// Used to suppress wave / unused warning
void wave;

// ============== UI primitives ==============

export function KPI({
  label, value, delta, tone = "default", mono = true,
}: { label: string; value: string; delta?: string; tone?: "default" | "success" | "warn" | "danger" | "info"; mono?: boolean }) {
  const c =
    tone === "success" ? T.success :
    tone === "warn"    ? T.warn :
    tone === "danger"  ? T.danger :
    tone === "info"    ? T.info  : T.ink;
  return (
    <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>{label}</p>
      <p className="mt-1.5 text-[20px] font-bold tabular-nums"
        style={{ color: T.ink, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}>
        {value}
      </p>
      {delta && (
        <p className="mt-0.5 text-[11px] font-bold tabular-nums" style={{ color: c, fontFamily: "'JetBrains Mono', monospace" }}>
          {delta}
        </p>
      )}
    </div>
  );
}

export function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <header className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div>
          <p className="text-[12px] font-bold">{title}</p>
          {subtitle && <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function RangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = ["24h", "7d", "30d", "90d", "QTD", "YTD"];
  return (
    <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
      {opts.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className="px-2.5 py-1 rounded-md text-[11px] font-bold transition"
          style={{
            background: value === o ? T.surface : "transparent",
            color: value === o ? T.ink : T.sub,
            boxShadow: value === o ? `0 0 0 1px ${T.border}` : "none",
          }}>
          {o}
        </button>
      ))}
    </div>
  );
}

const axisProps = {
  tick: { fill: T.muted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
  axisLine: { stroke: T.border },
  tickLine: { stroke: T.border },
};

export function TrendArea({ data, color = T.info, label = "Value", height = 220, format }: { data: SeriesPoint[]; color?: string; label?: string; height?: number; format?: (n: number) => string }) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="d" {...axisProps} />
          <YAxis {...axisProps} width={56} tickFormatter={(n) => fmt(n)} />
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [fmt(v), label]}
          />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#g-${label})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendCompare({ data, label = "Current", labelPrev = "Previous", color = T.info, colorPrev = T.muted, height = 240, format }: { data: SeriesPoint[]; label?: string; labelPrev?: string; color?: string; colorPrev?: string; height?: number; format?: (n: number) => string }) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="d" {...axisProps} />
          <YAxis {...axisProps} width={56} tickFormatter={(n) => fmt(n)} />
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number, name) => [fmt(v as number), name === "v" ? label : labelPrev]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" formatter={(name) => (name === "v" ? label : labelPrev)} />
          <Line type="monotone" dataKey="v2" stroke={colorPrev} strokeWidth={1.6} strokeDasharray="4 4" dot={false} />
          <Line type="monotone" dataKey="v"  stroke={color} strokeWidth={2.4} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarBreakdown({ data, color = T.navy, height = 260, format }: { data: { k: string; v: number }[]; color?: string; height?: number; format?: (n: number) => string }) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" {...axisProps} tickFormatter={(n) => fmt(n)} />
          <YAxis type="category" dataKey="k" {...axisProps} width={150} />
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [fmt(v), "Value"]}
          />
          <Bar dataKey="v" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, height = 220, format }: { data: { k: string; v: number; c?: string }[]; height?: number; format?: (n: number) => string }) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  const palette = [T.navy, T.info, T.success, T.warn, T.accent, T.muted];
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="v" nameKey="k" innerRadius="58%" outerRadius="88%" paddingAngle={1.5}>
            {data.map((d, i) => (
              <Cell key={d.k} fill={d.c ?? palette[i % palette.length]} stroke={T.surface} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number, name) => [fmt(v as number), name as string]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelChart({ steps }: { steps: { k: string; v: number; color?: string }[] }) {
  const top = steps[0]?.v ?? 1;
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pct = (s.v / top) * 100;
        const stepRate = i === 0 ? 100 : (s.v / steps[i - 1].v) * 100;
        const drop    = i === 0 ? 0 : 100 - stepRate;
        return (
          <div key={s.k} className="relative">
            <div className="flex items-center justify-between text-[11.5px] mb-1">
              <span className="font-bold">{s.k}</span>
              <span className="tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {s.v.toLocaleString()} ┬╖ {pct.toFixed(1)}% of top
                {i > 0 && <> ┬╖ <span style={{ color: drop > 30 ? T.warn : T.muted }}>ΓêÆ{drop.toFixed(1)}%</span> step drop</>}
              </span>
            </div>
            <div className="h-7 rounded-md overflow-hidden" style={{ background: T.bg }}>
              <div className="h-full flex items-center px-2 text-[10.5px] font-bold text-white"
                style={{ width: `${Math.max(pct, 6)}%`, background: s.color ?? T.info, fontFamily: "'JetBrains Mono', monospace" }}>
                {stepRate.toFixed(1)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Color a cohort cell from cold ΓåÆ hot
export function cohortColor(v: number) {
  if (v >= 70) return "#0E3B2E"; // dark navy
  if (v >= 55) return "#155E47";
  if (v >= 45) return "#1F7A5C";
  if (v >= 35) return "#3F9B7C";
  if (v >= 28) return "#6BB89C";
  if (v >= 20) return "#9BD0BC";
  if (v >  0)  return "#CFE6DB";
  return "transparent";
}

export function statusPillReport(s: ReportJob["lastStatus"]) {
  const map: Record<string, { bg: string; fg: string }> = {
    Success: { bg: `${T.success}14`, fg: T.success },
    Failed:  { bg: `${T.danger}14`,  fg: T.danger },
    Running: { bg: `${T.info}14`,    fg: T.info },
    Queued:  { bg: `${T.muted}1F`,   fg: T.sub },
  };
  const c = map[s] ?? map.Queued;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.fg }}>
      <span className="size-1.5 rounded-full" style={{ background: c.fg }} />
      {s}
    </span>
  );
}

// Formatters
export const fmtCny = (n: number) => `┬Ñ${(n / 1e6).toFixed(2)}M`;
export const fmtCnyK = (n: number) => `┬Ñ${Math.round(n / 1000)}k`;
export const fmtInt = (n: number) => n.toLocaleString();
export const fmtPct = (n: number) => `${n.toFixed(2)}%`;
