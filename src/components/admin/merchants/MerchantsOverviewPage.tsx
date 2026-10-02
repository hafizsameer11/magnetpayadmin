import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, Clock, HandCoins, TrendingUp, Users, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, FilterTabs, ListEmpty } from "@/components/admin/ListPageKit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { merchantStatusTone, tierTone, capitalize } from "@/components/admin/merchants/merchantUi";
import {
  fetchMerchantOverview,
  fmtNgn,
  type AdminMerchantOverview,
} from "@/lib/merchant-admin-api";

export function MerchantsOverviewPage() {
  const [range, setRange] = useState("today");
  const [data, setData] = useState<AdminMerchantOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMerchantOverview(range === "custom" ? "today" : range)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          toast.error(e instanceof Error ? e.message : "Failed to load overview");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const k = data;

  return (
    <AdminShell
      title="Merchants"
      description="Agent network overview — float, KYB, settlements and till volume."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Merchants" }]}
    >
      <MerchantsSubnav />
      <FilterTabs
        tabs={[
          { id: "today", label: "Today" },
          { id: "7d", label: "7d" },
          { id: "30d", label: "30d" },
          { id: "custom", label: "Custom" },
        ]}
        active={range}
        onChange={setRange}
      />
      <div className="mt-4" />
      {loading && !k ? (
        <p className="text-[13px] py-8 text-center" style={{ color: T.muted }}>
          Loading overview…
        </p>
      ) : !k ? (
        <ListEmpty message="Could not load merchant overview." />
      ) : (
        <>
          <KpiStrip
            cols={4}
            items={[
              { label: "Active agents", value: k.counts.active, tone: T.success, Icon: Users },
              { label: "Pending KYB", value: k.counts.pending, tone: T.warn, Icon: Clock },
              { label: "Suspended", value: k.counts.suspended, tone: T.danger, Icon: AlertTriangle },
              { label: "KYB queue", value: k.kybQueue, tone: T.info, Icon: HandCoins },
            ]}
          />
          <KpiStrip
            cols={4}
            items={[
              { label: `Volume (${range})`, value: fmtNgn(k.volumeMinor), tone: T.navy, Icon: TrendingUp },
              { label: "Transactions", value: k.txCount, tone: T.info, Icon: Activity },
              { label: "Platform fees", value: fmtNgn(k.platformFeeMinor), tone: T.success, Icon: Wallet },
              { label: "Agent earnings", value: fmtNgn(k.agentEarningsMinor), tone: T.warn, Icon: HandCoins },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl p-4 lg:col-span-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Top agents (unpaid earnings)
                </p>
                <Link to="/admin/merchants/list" className="text-[11px] font-semibold hover:underline" style={{ color: T.info }}>
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {k.topAgents.map((m) => (
                  <Link
                    key={m.id}
                    to="/admin/merchants/$id"
                    params={{ id: m.id }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:opacity-90 transition"
                    style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold truncate" style={{ color: T.ink }}>
                        {m.businessName}
                      </p>
                      <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                        {m.agentId}
                      </p>
                    </div>
                    <StatusBadge tone={tierTone(m.tier)}>{capitalize(m.tier)}</StatusBadge>
                    <span className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmtNgn(m.unpaidEarningsMinor)}
                    </span>
                  </Link>
                ))}
                {!k.topAgents.length ? (
                  <p className="text-[12px] py-4 text-center" style={{ color: T.muted }}>
                    No active agents yet.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
                  Attention
                </p>
                <ul className="space-y-2 text-[12px]">
                  <li className="flex justify-between gap-2">
                    <span style={{ color: T.sub }}>Failed / pending tx</span>
                    <Link to="/admin/merchants/transactions" className="font-bold tabular-nums" style={{ color: T.danger }}>
                      {k.failedOrPendingTx}
                    </Link>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span style={{ color: T.sub }}>Low-float agents</span>
                    <Link to="/admin/merchants/float" className="font-bold tabular-nums" style={{ color: T.warn }}>
                      {k.lowFloatAgents}
                    </Link>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span style={{ color: T.sub }}>KYB queue</span>
                    <Link to="/admin/merchants/kyb" className="font-bold tabular-nums" style={{ color: T.info }}>
                      {k.kybQueue}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
                  Status mix
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["ACTIVE", k.counts.active],
                      ["PENDING", k.counts.pending],
                      ["SUSPENDED", k.counts.suspended],
                      ["CLOSED", k.counts.closed],
                    ] as const
                  ).map(([s, n]) => (
                    <StatusBadge key={s} tone={merchantStatusTone(s)}>
                      {capitalize(s)} ({n})
                    </StatusBadge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
