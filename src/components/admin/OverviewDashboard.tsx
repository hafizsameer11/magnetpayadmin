import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  LineChart,
  UserPlus,
  Lock,
  Gavel,
  Coins,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { T } from "@/components/admin/AdminShell";
import { StatusBadgeCustom } from "@/components/admin/StatusBadge";
import { ClientSparkline } from "@/components/admin/ClientCharts";
import { fmtMoney, type AdminAnalytics } from "@/lib/api";

function fmtCompact(amount: number, currency = "NGN") {
  const sym = currency === "NGN" ? "₦" : currency === "CNY" ? "¥" : "$";
  const n = Math.abs(amount);
  if (n >= 1_000_000) return `${sym}${(amount / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${sym}${(amount / 1_000).toFixed(1)}K`;
  return `${sym}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function deltaPct(current: number, prev: number) {
  if (prev <= 0) return current > 0 ? "+100%" : "—";
  const p = ((current - prev) / prev) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;
}

function alertColor(severity: "critical" | "high" | "medium") {
  if (severity === "critical") return T.danger;
  if (severity === "high") return T.warn;
  return T.sub;
}

function activityDot(tone: "success" | "danger" | "info") {
  if (tone === "success") return T.success;
  if (tone === "danger") return T.danger;
  return T.info;
}

function KpiSparkCard({
  label,
  value,
  delta,
  tone,
  spark,
  Icon,
  trend = "neutral",
}: {
  label: string;
  value: string;
  delta: string;
  tone: string;
  spark?: { label: string; value: number }[];
  Icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;

  return (
    <div className="rounded-xl p-3.5 flex flex-col min-h-[128px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <div
        className="size-7 rounded-lg grid place-items-center shrink-0"
        style={{ background: `${tone}14`, color: tone }}
      >
        <Icon className="size-3.5" strokeWidth={2.4} />
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </p>
      <p
        className="mt-1 text-[20px] font-bold tabular-nums leading-none truncate"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}
      >
        {value}
      </p>
      <div className="mt-auto pt-2 flex items-end justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          {trend !== "neutral" ? (
            <TrendIcon className="size-3 shrink-0" strokeWidth={2.6} style={{ color: tone }} />
          ) : null}
          <p className="text-[10.5px] font-bold tabular-nums truncate" style={{ color: tone, fontFamily: "'JetBrains Mono', monospace" }}>
            {delta}
          </p>
        </div>
        {spark && spark.length > 1 ? (
          <div className="w-[72px] shrink-0 opacity-90">
            <ClientSparkline data={spark} color={tone} height={36} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function OverviewDashboard({ data }: { data: AdminAnalytics }) {
  const escrowHeld = fmtMoney("NGN", data.wallets?.holdMinorSum);
  const gmv24h = data.gmv24h ?? 0;
  const gmvPrev = data.gmvPrev24h ?? 0;
  const fxVol = data.fxVolume24h ?? 0;
  const fxPrev = data.fxVolumePrev24h ?? 0;
  const disputes = data.disputesOpen ?? 0;
  const disputesPrev = data.disputesOpenPrev ?? 0;
  const kyc = data.kycPending ?? 0;

  const kpis = [
    {
      label: "GMV · 24h",
      value: fmtCompact(gmv24h),
      delta: deltaPct(gmv24h, gmvPrev),
      tone: T.success,
      spark: data.sparklines?.gmv,
      Icon: LineChart,
      trend: gmv24h >= gmvPrev ? ("up" as const) : ("down" as const),
    },
    {
      label: "New signups",
      value: String(data.signups24h ?? data.users30d ?? data.users),
      delta: data.signupsToday != null ? `+${data.signupsToday} today` : `+${data.signups7d ?? 0} this week`,
      tone: T.info,
      spark: data.sparklines?.signups,
      Icon: UserPlus,
      trend: "up" as const,
    },
    {
      label: "Escrow held",
      value: escrowHeld,
      delta: `${data.escrows} active escrows`,
      tone: T.navy,
      spark: undefined,
      Icon: Lock,
      trend: "neutral" as const,
    },
    {
      label: "Open disputes",
      value: String(disputes),
      delta: disputesPrev > 0 ? `+${disputesPrev} vs ystd` : disputes > 0 ? "Needs review" : "All clear",
      tone: disputes > 0 ? T.danger : T.success,
      spark: data.sparklines?.disputes,
      Icon: Gavel,
      trend: disputes > 0 ? ("up" as const) : ("down" as const),
    },
    {
      label: "FX 24h volume",
      value: fmtCompact(fxVol),
      delta: deltaPct(fxVol, fxPrev),
      tone: T.info,
      spark: data.sparklines?.fx,
      Icon: Coins,
      trend: fxVol >= fxPrev ? ("up" as const) : ("down" as const),
    },
    {
      label: "Pending KYC",
      value: String(kyc),
      delta: data.kycOverSla ? `${data.kycOverSla} over SLA` : kyc > 0 ? "In queue" : "All clear",
      tone: data.kycOverSla ? T.warn : kyc > 0 ? T.warn : T.success,
      spark: undefined,
      Icon: ShieldCheck,
      trend: data.kycOverSla ? ("up" as const) : kyc > 0 ? ("neutral" as const) : ("down" as const),
    },
  ];

  const alerts = data.alerts ?? [];
  const activity = data.liveActivity ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KpiSparkCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <header className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div>
              <p className="text-[12px] font-bold">Alerts requiring action</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>
                Operational queue from live platform data
              </p>
            </div>
            <Link
              to="/admin/disputes"
              className="text-[11px] font-bold hover:underline"
              style={{ color: T.navy }}
            >
              View all
            </Link>
          </header>
          {alerts.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px]" style={{ color: T.muted }}>
              No alerts right now — platform looks healthy.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: T.border }}>
              {alerts.map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold truncate" style={{ color: T.ink }}>
                      {a.title}
                    </p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: T.sub }}>
                      {a.detail}
                    </p>
                  </div>
                  <StatusBadgeCustom color={alertColor(a.severity)} label={a.severity.toUpperCase()} />
                  <Link
                    to={a.href as never}
                    className="h-8 px-3 rounded-lg text-[11px] font-bold shrink-0 grid place-items-center"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <header className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <p className="text-[12px] font-bold">Live activity</p>
            <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>
              Latest admin & platform events
            </p>
          </header>
          {activity.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px]" style={{ color: T.muted }}>
              No recent activity logged yet.
            </p>
          ) : (
            <ul className="divide-y max-h-[320px] overflow-y-auto" style={{ borderColor: T.border }}>
              {activity.map((row) => (
                <li key={row.id} className="px-4 py-2.5 flex items-start gap-2.5">
                  <span
                    className="size-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: activityDot(row.tone) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] leading-snug" style={{ color: T.ink }}>
                      {row.text}
                    </p>
                    <p className="text-[10px] mt-0.5 tabular-nums" style={{ color: T.muted }}>
                      {new Date(row.at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export function OverviewToolbar() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
      >
        <Filter className="size-3.5" strokeWidth={2.2} />
        Last 24h
        <ChevronDown className="size-3.5" strokeWidth={2.4} />
      </button>
      <button
        type="button"
        className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
      >
        <Download className="size-3.5" strokeWidth={2.4} />
        Export
      </button>
      <Link
        to="/admin/disputes"
        className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
        style={{ background: T.navy }}
      >
        View alerts
      </Link>
    </div>
  );
}
