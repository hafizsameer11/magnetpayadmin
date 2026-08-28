import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, RotateCw } from "lucide-react";
import { AdminShell, T } from "./AdminShell";
import { KPI, Panel, TrendArea, GMV_SERIES, GMV_BY_CATEGORY, BarBreakdown } from "./Analytics";
import { fetchAdminAnalytics, type AdminAnalytics } from "@/lib/api";
import { toast } from "sonner";

const SUBNAV = [
  { to: "/admin/analytics/overview", label: "Overview" },
  { to: "/admin/analytics/gmv", label: "GMV" },
  { to: "/admin/analytics/users", label: "Users" },
  { to: "/admin/analytics/sellers", label: "Sellers" },
  { to: "/admin/analytics/fx", label: "FX" },
  { to: "/admin/analytics/logistics", label: "Logistics" },
  { to: "/admin/analytics/funnels", label: "Funnels" },
  { to: "/admin/analytics/cohorts", label: "Cohorts" },
] as const;

export function AnalyticsSubnav({ active }: { active: string }) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg p-0.5 mb-4 w-fit flex-wrap"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      {SUBNAV.map((s) => {
        const on = active === s.to;
        return (
          <Link
            key={s.to}
            to={s.to}
            className="px-3 py-1.5 rounded-md text-[11.5px] font-bold transition"
            style={{
              background: on ? T.bg : "transparent",
              color: on ? T.ink : T.sub,
              boxShadow: on ? `inset 0 0 0 1px ${T.border}` : "none",
            }}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AnalyticsSectionShell({
  active,
  title,
  description,
  children,
}: {
  active: string;
  title: string;
  description: string;
  children: (data: AdminAnalytics | null, loading: boolean, reload: () => void) => ReactNode;
}) {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await fetchAdminAnalytics());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminShell
      title={title}
      description={description}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Analytics" }, { label: title }]}
      actions={
        <button
          onClick={() => void load()}
          disabled={loading}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCw className="size-3.5" />}
          Refresh
        </button>
      }
    >
      <AnalyticsSubnav active={active} />
      {children(data, loading, load)}
    </AdminShell>
  );
}

export function AnalyticsOverviewBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  if (!data) return <EmptyBlock />;
  const cards = [
    { label: "Users", value: String(data.users), tone: "success" as const },
    { label: "Orders", value: String(data.orders), tone: "success" as const },
    { label: "Transfers", value: String(data.transfers), tone: "info" as const },
    { label: "Escrows", value: String(data.escrows), tone: "warn" as const },
    { label: "Shipments", value: String(data.shipments), tone: "info" as const },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <KPI key={c.label} label={c.label} value={c.value} tone={c.tone} />
      ))}
    </div>
  );
}

export function AnalyticsGmvBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  const scale = data?.orders ? Math.max(0.01, data.orders / 8142) : 0.5;
  const series = GMV_SERIES.map((p) => ({ ...p, v: Math.round(p.v * scale) }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KPI label="Orders (live)" value={String(data?.orders ?? "—")} tone="success" />
        <KPI label="GMV est." value={`¥${Math.round(42180000 * scale).toLocaleString()}`} tone="success" />
        <KPI label="Take rate" value="1.84%" delta="+0.06pp" tone="success" />
      </div>
      <Panel title="GMV trend (scaled to live order volume)" subtitle="30-day series">
        <div className="p-4">
          <TrendArea data={series} label="GMV" color={T.success} />
        </div>
      </Panel>
      <Panel title="By category" subtitle="Share of marketplace GMV">
        <div className="p-4">
          <BarBreakdown data={GMV_BY_CATEGORY.map((c) => ({ ...c, v: Math.round(c.v * scale) }))} />
        </div>
      </Panel>
    </div>
  );
}

export function AnalyticsUsersBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Total users" value={String(data?.users ?? "—")} tone="success" />
      <KPI label="Active buyers 30d" value="—" tone="info" />
      <KPI label="New signups 7d" value="—" tone="success" />
      <KPI label="KYC pending" value="—" tone="warn" />
    </div>
  );
}

export function AnalyticsSellersBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Active sellers" value="—" tone="success" />
      <KPI label="Orders" value={String(data?.orders ?? "—")} tone="info" />
      <KPI label="Listings live" value="—" tone="success" />
      <KPI label="Verified stores" value="—" tone="warn" />
    </div>
  );
}

export function AnalyticsFxBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Transfers" value={String(data?.transfers ?? "—")} tone="info" />
      <KPI label="Avg spread" value="0.38%" delta="+0.02pp" tone="warn" />
      <KPI label="CNY/NGN mid" value="229.04" tone="success" />
      <KPI label="FX orders 24h" value="—" tone="success" />
    </div>
  );
}

export function AnalyticsLogisticsBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Shipments" value={String(data?.shipments ?? "—")} tone="info" />
      <KPI label="In transit" value="—" tone="warn" />
      <KPI label="Delivered 30d" value="—" tone="success" />
      <KPI label="Exceptions" value="—" tone="danger" />
    </div>
  );
}

export function AnalyticsFunnelsBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  const u = data?.users ?? 0;
  const o = data?.orders ?? 0;
  const steps = [
    { label: "Registered", val: u },
    { label: "KYC approved", val: Math.round(u * 0.62) },
    { label: "First order", val: o },
    { label: "Repeat buyer", val: Math.round(o * 0.4) },
  ];
  return (
    <Panel title="Checkout funnel" subtitle="Estimated from live counts">
      <div className="p-4 space-y-3">
        {steps.map((s, i) => (
          <div key={s.label}>
            <div className="flex justify-between text-[12px] mb-1">
              <span>{s.label}</span>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {s.val.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
              <div className="h-full" style={{ width: `${u ? Math.min(100, (s.val / u) * 100) : 0}%`, background: T.navy }} />
            </div>
            {i < steps.length - 1 ? (
              <p className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                {steps[i + 1].val && s.val ? `${Math.round((steps[i + 1].val / s.val) * 100)}% → next` : ""}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function AnalyticsCohortsBody({ data, loading }: { data: AdminAnalytics | null; loading: boolean }) {
  if (loading) return <LoadingBlock />;
  return (
    <Panel title="Retention cohorts" subtitle="Placeholder — wire cohort API for live data">
      <div className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
        Live platform has {data?.users ?? 0} users and {data?.orders ?? 0} orders. Cohort matrix requires historical aggregation.
      </div>
    </Panel>
  );
}

function LoadingBlock() {
  return (
    <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

function EmptyBlock() {
  return (
    <p className="text-[13px]" style={{ color: T.muted }}>
      No analytics data.
    </p>
  );
}
