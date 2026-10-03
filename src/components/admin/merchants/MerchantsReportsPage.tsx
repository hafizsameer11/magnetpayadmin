import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, KpiStrip, ListEmpty } from "@/components/admin/ListPageKit";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import {
  downloadCsv,
  fetchMerchantReports,
  fmtNgn,
  kindLabel,
  type AdminMerchantReports,
} from "@/lib/merchant-admin-api";

function daysForRange(range: string) {
  if (range === "today") return 1;
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  return 30;
}

export function MerchantsReportsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AdminMerchantReports | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMerchantReports(daysForRange(range))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          toast.error(e instanceof Error ? e.message : "Failed to load reports");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const byService = Object.entries(data?.byService ?? {}).map(([kind, s]) => ({
    kind: kindLabel(kind),
    volume: Number(s.volume),
    fees: Number(s.platformFee),
    earnings: Number(s.agentFee),
    count: s.count,
  }));

  const byState = (data?.byState ?? [])
    .map((r) => [r.state ?? "Unknown", r._count.id] as const)
    .sort((a, b) => b[1] - a[1]);

  const grossVolume = byService.reduce((s, r) => s + r.volume, 0);
  const platformFees = byService.reduce((s, r) => s + r.fees, 0);
  const agentEarnings = byService.reduce((s, r) => s + r.earnings, 0);
  const txCount = data?.totalTx ?? byService.reduce((s, r) => s + r.count, 0);

  return (
    <AdminShell
      title="Merchant reports"
      description="Volume by service, fee revenue, agent earnings and geography."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Reports" },
      ]}
      actions={
        <button
          type="button"
          onClick={() => {
            if (!data) {
              toast.message("Nothing to export yet");
              return;
            }
            const byService = Object.entries(data.byService ?? {});
            downloadCsv(
              `merchant-reports-${range}.csv`,
              ["metric", "value"],
              [
                ["days", data.days],
                ["totalTx", data.totalTx],
                ...byService.map(([k, v]) => [`${k}.count`, v.count]),
                ...byService.map(([k, v]) => [`${k}.volume`, v.volume]),
                ...byService.map(([k, v]) => [`${k}.platformFee`, v.platformFee]),
                ...byService.map(([k, v]) => [`${k}.agentFee`, v.agentFee]),
                ...(data.byState ?? []).map((s) => [`state.${s.state ?? "unknown"}`, s._count.id]),
              ],
            );
            toast.success("Report CSV downloaded");
          }}
          className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
          style={{ background: T.navy }}
        >
          <Download className="size-3.5" strokeWidth={2.4} />
          Export CSV
        </button>
      }
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
      {loading && !data ? (
        <p className="text-[12px] py-8 text-center" style={{ color: T.muted }}>
          Loading…
        </p>
      ) : !data ? (
        <ListEmpty message="Could not load reports." />
      ) : (
        <>
          <KpiStrip
            cols={4}
            items={[
              { label: "Gross volume", value: fmtNgn(grossVolume), tone: T.navy },
              { label: "Platform fees", value: fmtNgn(platformFees), tone: T.success },
              { label: "Agent earnings", value: fmtNgn(agentEarnings), tone: T.warn },
              { label: "Tx count", value: txCount, tone: T.info },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="px-4 py-3" style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  By service
                </p>
              </div>
              {byService.map((r, i) => (
                <div
                  key={r.kind}
                  className="grid grid-cols-4 gap-2 px-4 py-3 text-[12px]"
                  style={{ borderBottom: i < byService.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <span className="font-semibold">{r.kind}</span>
                  <span className="tabular-nums text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtNgn(r.volume)}
                  </span>
                  <span
                    className="tabular-nums text-right"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: T.success }}
                  >
                    {fmtNgn(r.fees)}
                  </span>
                  <span
                    className="tabular-nums text-right"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: T.warn }}
                  >
                    {fmtNgn(r.earnings)}
                  </span>
                </div>
              ))}
              {!byService.length ? (
                <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                  No completed transactions in range.
                </p>
              ) : null}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="px-4 py-3" style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  By geography (active agents)
                </p>
              </div>
              {byState.map(([state, count], i) => (
                <div
                  key={state}
                  className="flex items-center justify-between px-4 py-3 text-[12px]"
                  style={{ borderBottom: i < byState.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <span className="font-semibold">{state}</span>
                  <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {count}
                  </span>
                </div>
              ))}
              {!byState.length ? (
                <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                  No geography data.
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
