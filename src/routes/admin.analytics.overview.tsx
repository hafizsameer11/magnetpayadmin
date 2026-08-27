import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminAnalytics, type AdminAnalytics } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/analytics/overview")({
  head: () => ({ meta: [{ title: "Analytics overview — MagnetPay Admin" }] }),
  component: Page,
});

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

function Page() {
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

  const cards = [
    { label: "Users", value: data?.users },
    { label: "Transfers", value: data?.transfers },
    { label: "Escrows", value: data?.escrows },
    { label: "Orders", value: data?.orders },
    { label: "Shipments", value: data?.shipments },
    { label: "Wallet balance Σ (minor)", value: data?.wallets?.balanceMinorSum },
    { label: "Wallet hold Σ (minor)", value: data?.wallets?.holdMinorSum },
  ];

  return (
    <AdminShell
      title="Analytics overview"
      description="Live platform counts from /admin/analytics/overview."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Analytics" }]}
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
      <AnalyticsSubnav active="/admin/analytics/overview" />

      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-[13px]" style={{ color: T.muted }}>
          No analytics data.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                {c.label}
              </p>
              <p className="mt-1.5 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {c.value == null ? "—" : Number(c.value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
