import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import {
  fetchAdminAnalytics,
  fetchAdminWallets,
  fmtMoney,
  fromMinor,
  type AdminAnalytics,
  type AdminWallet,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fx/liquidity")({
  head: () => ({ meta: [{ title: "FX liquidity — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, w] = await Promise.all([fetchAdminAnalytics(), fetchAdminWallets()]);
      setAnalytics(a);
      setWallets(w);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load liquidity");
      setAnalytics(null);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const byCurrency = useMemo(() => {
    const map = new Map<string, { balance: number; hold: number; count: number }>();
    for (const w of wallets) {
      const cur = w.currency;
      const prev = map.get(cur) ?? { balance: 0, hold: 0, count: 0 };
      prev.balance += fromMinor(w.balanceMinor);
      prev.hold += fromMinor(w.holdMinor);
      prev.count += 1;
      map.set(cur, prev);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [wallets]);

  return (
    <AdminShell
      title="FX liquidity"
      description="Live platform wallet balances and analytics — not simulated LP pools."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX" }, { label: "Liquidity" }]}
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
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Users", value: analytics?.users ?? 0 },
              { label: "Transfers", value: analytics?.transfers ?? 0 },
              { label: "Escrows", value: analytics?.escrows ?? 0 },
              { label: "Wallet rows", value: wallets.length },
            ].map((k) => (
              <div key={k.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                  {k.label}
                </p>
                <p className="mt-1.5 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {k.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {(analytics?.wallets?.balanceMinorSum != null || analytics?.wallets?.holdMinorSum != null) && (
            <div className="mb-5 rounded-xl p-4 flex flex-wrap gap-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Aggregate balance (all currencies, minor)
                </p>
                <p className="mt-1 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {String(analytics.wallets?.balanceMinorSum ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Aggregate hold (minor)
                </p>
                <p className="mt-1 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {String(analytics.wallets?.holdMinorSum ?? 0)}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div
              className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{
                color: T.muted,
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                gridTemplateColumns: "1fr 1.4fr 1.4fr 0.8fr",
              }}
            >
              <span>Currency</span>
              <span>Available</span>
              <span>On hold</span>
              <span>Wallets</span>
            </div>

            {byCurrency.length === 0 ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                No wallet balances.
              </p>
            ) : (
              byCurrency.map(([cur, v], i) => (
                <div
                  key={cur}
                  className="grid items-center px-4 h-[52px] text-[12px]"
                  style={{
                    gridTemplateColumns: "1fr 1.4fr 1.4fr 0.8fr",
                    borderBottom: i < byCurrency.length - 1 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <Pill tone="info">{cur}</Pill>
                  <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtMoney(cur, Math.round(v.balance * 100))}
                  </span>
                  <span className="tabular-nums" style={{ color: T.warn, fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtMoney(cur, Math.round(v.hold * 100))}
                  </span>
                  <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {v.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}
