import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Loader2,
  Lock,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminAnalytics, fetchAdminHealth, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — MagnetPay Admin" }] }),
  component: AdminDashboard,
});

type Overview = {
  users?: number;
  transfers?: number;
  escrows?: number;
  orders?: number;
  shipments?: number;
  wallets?: { balanceMinorSum?: string | number; holdMinorSum?: string | number };
};

function fmtCount(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString();
}

function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Overview | null>(null);
  const [health, setHealth] = useState<{ ok: boolean; time: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [a, h] = await Promise.all([
          fetchAdminAnalytics() as Promise<Overview>,
          fetchAdminHealth(),
        ]);
        if (!cancelled) {
          setAnalytics(a);
          setHealth(h);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load dashboard");
          setAnalytics(null);
          setHealth(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = [
    { label: "Users", val: fmtCount(analytics?.users), I: Users, href: "/admin/users", color: T.info },
    {
      label: "Wallet balance",
      val: analytics?.wallets ? fmtMoney("NGN", analytics.wallets.balanceMinorSum) : "—",
      I: Wallet,
      href: "/admin/wallets",
      color: T.navy,
    },
    {
      label: "Wallet holds",
      val: analytics?.wallets ? fmtMoney("NGN", analytics.wallets.holdMinorSum) : "—",
      I: Lock,
      href: "/admin/escrow",
      color: T.warn,
    },
    { label: "Transfers", val: fmtCount(analytics?.transfers), I: Activity, href: "/admin/transactions", color: T.success },
    { label: "Escrows", val: fmtCount(analytics?.escrows), I: Lock, href: "/admin/escrow", color: T.accent },
    { label: "Orders", val: fmtCount(analytics?.orders), I: ShoppingBag, href: "/admin/orders", color: T.info },
    { label: "Shipments", val: fmtCount(analytics?.shipments), I: AlertTriangle, href: "/admin/shipments", color: T.warn },
  ];

  return (
    <AdminShell
      title="Overview"
      description="Live pulse of the MagnetPay platform."
      breadcrumbs={[{ label: "Admin" }]}
      actions={
        health ? (
          <Pill tone={health.ok ? "success" : "danger"}>
            {health.ok ? "API healthy" : "API degraded"} · {new Date(health.time).toLocaleTimeString()}
          </Pill>
        ) : null
      }
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : !analytics ? (
        <p className="text-center text-[12px] py-10" style={{ color: T.muted }}>
          No analytics data available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <Link
              key={k.label}
              to={k.href}
              className="rounded-xl p-3.5 hover:shadow-sm transition"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-7 rounded-md grid place-items-center"
                  style={{ background: `${k.color}14`, color: k.color }}
                >
                  <k.I className="size-3.5" strokeWidth={2.4} />
                </div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                  {k.label}
                </p>
              </div>
              <p
                className="mt-2 text-[22px] font-bold tabular-nums leading-none"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {k.val}
              </p>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
