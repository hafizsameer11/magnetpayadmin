import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Lock,
  Megaphone,
  Globe2,
  FileText,
  AlertTriangle,
  Activity,
  ArrowRight,
  Gavel,
  Coins,
  Truck,
  Wallet,
  Tag,
  Shield,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { T } from "@/components/admin/AdminShell";
import { ClientSparkline } from "@/components/admin/ClientCharts";
import { fmtMoney, type AdminAnalytics } from "@/lib/api";

const FX_TEAL = "#0F766E";

function fmtCompact(amount: number, currency = "USD") {
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

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function severityColor(severity: "critical" | "high" | "medium") {
  if (severity === "critical") return T.danger;
  if (severity === "high") return T.warn;
  return T.sub;
}

function activityDot(tone: "success" | "danger" | "info" | "warn" | "neutral") {
  if (tone === "success") return T.success;
  if (tone === "danger") return T.danger;
  if (tone === "warn") return T.warn;
  if (tone === "neutral") return T.muted;
  return T.info;
}

const ALERT_ICON: Record<string, LucideIcon> = {
  gavel: Gavel,
  shield: Shield,
  coins: Coins,
  truck: Truck,
  wallet: Wallet,
  file: FileText,
  tag: Tag,
};

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
      <div className="size-7 rounded-lg grid place-items-center shrink-0" style={{ background: `${tone}14`, color: tone }}>
        <Icon className="size-3.5" strokeWidth={2.35} absoluteStrokeWidth />
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </p>
      <p className="mt-1 text-[20px] font-bold tabular-nums leading-none truncate" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
        {value}
      </p>
      <div className="mt-auto pt-2 flex items-end justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          {trend !== "neutral" ? <TrendIcon className="size-3 shrink-0" strokeWidth={2.6} absoluteStrokeWidth style={{ color: tone }} /> : null}
          <p className="text-[10.5px] font-bold tabular-nums truncate" style={{ color: tone, fontFamily: "'JetBrains Mono', monospace" }}>
            {delta}
          </p>
        </div>
        {spark && spark.length > 1 ? (
          <div className="w-[72px] shrink-0 opacity-90">
            <ClientSparkline data={spark} color={tone} height={36} linear normalize />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  badge,
  linkTo,
  linkLabel,
  iconTone = T.danger,
}: {
  icon: LucideIcon;
  title: string;
  badge?: number;
  linkTo: string;
  linkLabel: string;
  iconTone?: string;
}) {
  return (
    <header className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="size-4 shrink-0" strokeWidth={2.3} style={{ color: iconTone }} />
        <p className="text-[12px] font-bold">{title}</p>
        {badge != null && badge > 0 ? (
          <span
            className="text-[10px] font-bold tabular-nums px-1.5 h-5 rounded-full inline-flex items-center"
            style={{ background: `${T.danger}18`, color: T.danger, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <Link to={linkTo} className="text-[11px] font-bold hover:underline shrink-0 flex items-center gap-0.5" style={{ color: T.navy }}>
        {linkLabel} <ArrowRight className="size-3" strokeWidth={2.4} />
      </Link>
    </header>
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
      Icon: TrendingUp,
      trend: gmv24h >= gmvPrev ? ("up" as const) : ("down" as const),
    },
    {
      label: "New signups",
      value: String(data.signups24h ?? data.users30d ?? data.users),
      delta: data.signupsToday != null ? `+${data.signupsToday} today` : `+${data.signups7d ?? 0} this week`,
      tone: T.info,
      spark: data.sparklines?.signups,
      Icon: Users,
      trend: "up" as const,
    },
    {
      label: "Escrow held",
      value: escrowHeld,
      delta: `${data.escrows} active escrows`,
      tone: T.navy,
      spark: data.sparklines?.gmv,
      Icon: Lock,
      trend: "up" as const,
    },
    {
      label: "Open disputes",
      value: String(disputes),
      delta: disputesPrev > 0 ? `+${disputesPrev} vs ystd` : disputes > 0 ? "Needs review" : "All clear",
      tone: T.danger,
      spark: data.sparklines?.disputes,
      Icon: Megaphone,
      trend: disputes > 0 ? ("up" as const) : ("down" as const),
    },
    {
      label: "FX 24h volume",
      value: fmtCompact(fxVol),
      delta: deltaPct(fxVol, fxPrev),
      tone: FX_TEAL,
      spark: data.sparklines?.fx,
      Icon: Globe2,
      trend: fxVol >= fxPrev ? ("up" as const) : ("down" as const),
    },
    {
      label: "Pending KYC",
      value: String(kyc),
      delta: data.kycOverSla ? `${data.kycOverSla} over SLA` : kyc > 0 ? "In queue" : "All clear",
      tone: T.warn,
      spark: data.sparklines?.kyc,
      Icon: FileText,
      trend: data.kycOverSla ? ("up" as const) : kyc > 0 ? ("neutral" as const) : ("down" as const),
    },
  ];

  const alerts = data.alerts ?? [];
  const activity = data.liveActivity ?? [];
  const corridors = data.fxCorridors ?? [];
  const queues = data.operationalQueues ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KpiSparkCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <SectionHeader
            icon={AlertTriangle}
            title="Alerts requiring action"
            badge={alerts.length}
            linkTo="/admin/disputes"
            linkLabel="See all"
            iconTone={T.danger}
          />
          {alerts.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px]" style={{ color: T.muted }}>
              No alerts right now — platform looks healthy.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: T.border }}>
              {alerts.map((a) => {
                const AIcon = ALERT_ICON[a.icon ?? "file"] ?? FileText;
                const color = severityColor(a.severity);
                return (
                  <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="size-9 rounded-full grid place-items-center shrink-0" style={{ background: `${color}14`, color }}>
                      <AIcon className="size-4" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold truncate" style={{ color: T.ink }}>
                        {a.title}
                      </p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: T.sub }}>
                        {a.detail}
                      </p>
                    </div>
                    <span
                      className="text-[9.5px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded shrink-0"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}26` }}
                    >
                      {a.severity}
                    </span>
                    <Link
                      to={a.href as never}
                      className="h-8 px-3 rounded-lg text-[11px] font-bold shrink-0 inline-flex items-center gap-0.5"
                      style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                    >
                      Review <ArrowRight className="size-3" strokeWidth={2.4} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <SectionHeader icon={Activity} title="Live activity" linkTo="/admin/audit" linkLabel="Audit log" iconTone={T.success} />
          {activity.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px]" style={{ color: T.muted }}>
              No recent activity logged yet.
            </p>
          ) : (
            <ul className="divide-y max-h-[320px] overflow-y-auto" style={{ borderColor: T.border }}>
              {activity.map((row) => (
                <li key={row.id} className="px-4 py-2.5 flex items-start gap-2.5">
                  <span className="size-2 rounded-full mt-1.5 shrink-0" style={{ background: activityDot(row.tone) }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] leading-snug" style={{ color: T.ink }}>
                      {row.text}
                    </p>
                    <p className="text-[10px] mt-0.5 tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {relativeTime(row.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <SectionHeader icon={Globe2} title="FX corridor" linkTo="/admin/fx/rates" linkLabel="Manage rates" iconTone={FX_TEAL} />
          {corridors.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px]" style={{ color: T.muted }}>
              No FX rates configured yet.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: T.border }}>
              {corridors.map((c) => (
                <div key={c.pair} className="px-4 py-3 flex items-center gap-3 text-[12px]">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold" style={{ color: T.ink }}>
                      {c.pair}
                    </p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>
                      {c.orders24h} conversion{c.orders24h === 1 ? "" : "s"} · 24h
                    </p>
                  </div>
                  <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: FX_TEAL }}>
                    {c.rate.toFixed(c.rate < 10 ? 4 : 2)}
                  </span>
                  <span className="text-[10.5px] tabular-nums w-16 text-right" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.spreadPct != null ? `${c.spreadPct.toFixed(2)}% spread` : "—"}
                  </span>
                  <span className="text-[10.5px] tabular-nums w-20 text-right font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.volume24h > 0 ? fmtCompact(c.volume24h) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <SectionHeader icon={ClipboardList} title="Operational queues" linkTo="/admin/kyc" linkLabel="Open queues" iconTone={T.navy} />
          {queues.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px]" style={{ color: T.muted }}>
              All operational queues are clear.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: T.border }}>
              {queues.map((q) => (
                <Link
                  key={q.id}
                  to={q.href as never}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-[rgba(14,59,46,0.02)] transition text-[12px]"
                >
                  <p className="flex-1 font-medium" style={{ color: T.ink }}>
                    {q.label}
                  </p>
                  <span className="tabular-nums font-bold text-[15px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.navy }}>
                    {q.count}
                  </span>
                  <span className="text-[11px] font-bold flex items-center gap-0.5 shrink-0" style={{ color: T.navy }}>
                    Review <ArrowRight className="size-3" strokeWidth={2.4} />
                  </span>
                </Link>
              ))}
            </div>
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
      <Link to="/admin/disputes" className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white" style={{ background: T.navy }}>
        View alerts
      </Link>
    </div>
  );
}
