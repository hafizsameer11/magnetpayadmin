import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, RotateCw } from "lucide-react";
import { AdminShell, T } from "./AdminShell";
import { KPI, Panel, TrendArea, BarBreakdown } from "./Analytics";
import {
  fetchAdminAnalytics,
  fetchAdminAnalyticsGmv,
  fetchAdminAnalyticsUsers,
  fetchAdminAnalyticsSellers,
  fetchAdminAnalyticsFx,
  fetchAdminAnalyticsLogistics,
  fetchAdminAnalyticsFunnels,
  fetchAdminAnalyticsCohorts,
  type AdminAnalytics,
} from "@/lib/api";
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
    <div className="flex items-center gap-1 rounded-lg p-0.5 mb-4 w-fit flex-wrap" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      {SUBNAV.map((s) => {
        const on = active === s.to;
        return (
          <Link
            key={s.to}
            to={s.to}
            className="px-3 py-1.5 rounded-md text-[11.5px] font-bold transition"
            style={{ background: on ? T.bg : "transparent", color: on ? T.ink : T.sub, boxShadow: on ? `inset 0 0 0 1px ${T.border}` : "none" }}
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
        <button onClick={() => void load()} disabled={loading} className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-60" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
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
    { label: "GMV 30d", value: data.gmv30d != null ? `¥${Math.round(data.gmv30d).toLocaleString()}` : "—", tone: "success" as const },
    { label: "Orders 30d", value: String(data.orders30d ?? data.orders), tone: "success" as const },
    { label: "Active buyers 30d", value: String(data.activeBuyers30d ?? "—"), tone: "info" as const },
    { label: "Dispute rate", value: data.disputeRate != null ? `${data.disputeRate}%` : "—", tone: "warn" as const },
    { label: "Listings live", value: String(data.listingsLive ?? "—"), tone: "success" as const },
    { label: "KYC pending", value: String(data.kycPending ?? "—"), tone: "warn" as const },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <KPI key={c.label} label={c.label} value={c.value} tone={c.tone} />
      ))}
    </div>
  );
}

export function AnalyticsGmvBody() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminAnalyticsGmv>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchAdminAnalyticsGmv().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingBlock />;
  if (!data) return <EmptyBlock />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KPI label="GMV 30d" value={`¥${Math.round(data.gmv30d).toLocaleString()}`} tone="success" />
        <KPI label="Take rate" value="0.9%" tone="success" />
        <KPI label="Categories" value={String(data.byCategory.length)} tone="info" />
      </div>
      <Panel title="GMV trend" subtitle="14-day series from orders">
        <div className="p-4"><TrendArea data={data.series.map((p) => ({ d: p.label, v: p.value }))} label="GMV" color={T.success} /></div>
      </Panel>
      <Panel title="By category" subtitle="Share of marketplace GMV">
        <div className="p-4"><BarBreakdown data={data.byCategory.map((c) => ({ k: c.name, v: c.value }))} /></div>
      </Panel>
    </div>
  );
}

export function AnalyticsUsersBody() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminAnalyticsUsers>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchAdminAnalyticsUsers().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingBlock />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Total users" value={String(data?.total ?? "—")} tone="success" />
        <KPI label="Growth 30d" value={String(data?.growth30d ?? "—")} tone="info" />
        <KPI label="By country" value={String(data?.byCountry.length ?? 0)} tone="success" />
        <KPI label="Signups trend" value={String(data?.series.length ?? 0)} tone="warn" />
      </div>
      <Panel title="Signups" subtitle="Daily registrations (30d)">
        <div className="p-4"><TrendArea data={(data?.series ?? []).map((p) => ({ d: p.label, v: p.value }))} label="Users" color={T.info} /></div>
      </Panel>
    </div>
  );
}

export function AnalyticsSellersBody() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminAnalyticsSellers>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchAdminAnalyticsSellers().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingBlock />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(data?.tiers ?? []).map((t) => (
          <KPI key={t.name} label={t.name} value={String(t.value)} tone="success" />
        ))}
      </div>
      <Panel title="Top sellers by orders" subtitle="Live platform data">
        <div className="divide-y" style={{ borderColor: T.border }}>
          {(data?.top ?? []).map((s) => (
            <div key={s.id} className="px-4 py-3 flex justify-between text-[12px]">
              <Link to="/admin/sellers/$id" params={{ id: s.id }} className="font-semibold hover:underline" style={{ color: T.navy }}>{s.name}</Link>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.orders} orders</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function AnalyticsFxBody() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminAnalyticsFx>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchAdminAnalyticsFx().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingBlock />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Avg spread" value={`${data?.spreadAvg ?? 0}%`} tone="warn" />
      <KPI label="FX orders 24h" value={String(data?.orders24h ?? 0)} tone="success" />
      <KPI label="Pairs traded" value={String(data?.volumeByPair.length ?? 0)} tone="info" />
      <KPI label="Top pair vol." value={String(data?.volumeByPair[0]?.value ?? 0)} tone="success" />
    </div>
  );
}

export function AnalyticsLogisticsBody() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminAnalyticsLogistics>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchAdminAnalyticsLogistics().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingBlock />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Shipments 30d" value={String(data?.shipments30d ?? 0)} tone="info" />
      <KPI label="In transit" value={String(data?.inTransit ?? 0)} tone="warn" />
      <KPI label="Delivered 30d" value={String(data?.delivered30d ?? 0)} tone="success" />
      <KPI label="Exceptions" value={String(data?.exceptions ?? 0)} tone="danger" />
    </div>
  );
}

export function AnalyticsFunnelsBody() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminAnalyticsFunnels>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchAdminAnalyticsFunnels().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingBlock />;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {(["checkout", "onboarding"] as const).map((key) => (
        <Panel key={key} title={key === "checkout" ? "Checkout funnel" : "Onboarding funnel"} subtitle="Live counts">
          <div className="p-4 space-y-3">
            {(data?.[key] ?? []).map((s, i, arr) => (
              <div key={s.step}>
                <div className="flex justify-between text-[12px] mb-1"><span>{s.step}</span><span className="font-bold tabular-nums">{s.count.toLocaleString()}</span></div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                  <div className="h-full" style={{ width: `${arr[0]?.count ? Math.min(100, (s.count / arr[0].count) * 100) : 0}%`, background: T.navy }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function AnalyticsCohortsBody() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminAnalyticsCohorts>> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetchAdminAnalyticsCohorts().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingBlock />;
  return (
    <Panel title="Retention cohorts" subtitle="Monthly buyer retention (%)">
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead><tr style={{ color: T.muted }}><th className="text-left py-1">Cohort</th><th>Size</th><th>W0</th><th>W1</th><th>W2</th><th>W3</th></tr></thead>
          <tbody>
            {(data?.cohorts ?? []).map((c) => (
              <tr key={c.month} className="border-t" style={{ borderColor: T.border }}>
                <td className="py-2 font-semibold">{c.month}</td>
                <td className="text-center tabular-nums">{c.size}</td>
                {c.retention.map((r, i) => (
                  <td key={i} className="text-center tabular-nums">{r}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function LoadingBlock() {
  return <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>;
}

function EmptyBlock() {
  return <p className="text-[13px]" style={{ color: T.muted }}>No analytics data.</p>;
}
