import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, Users, Coins, Lock, ShieldCheck } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, ListEmpty, ListToolbar, FilterTabs } from "@/components/admin/ListPageKit";
import { initials, countryFromPhone } from "@/components/admin/UserProfile";
import { walletRefId, walletStatusPill } from "@/components/admin/WalletProfile";
import { fetchAdminWalletHolders, fmtMoney, type AdminWalletAccessStatus, type AdminWalletHolder } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/wallets/")({
  head: () => ({ meta: [{ title: "Wallets — MagnetPay Admin" }] }),
  component: Page,
});

type Tab = "all" | "active" | "limited" | "frozen" | "holds";

function Page() {
  const [rows, setRows] = useState<AdminWalletHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminWalletHolders());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load wallets");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    let holdCount = 0;
    let currencies = new Set<string>();
    let escrowNgn = 0;
    for (const h of rows) {
      for (const w of h.wallets) {
        currencies.add(w.currency);
        if (Number(w.holdMinor) > 0) holdCount++;
      }
      escrowNgn += Number(h.stats.escrowMinorNgn);
    }
    return {
      holders: rows.length,
      walletRows: rows.reduce((s, h) => s + h.wallets.length, 0),
      holdCount,
      currencyCount: currencies.size,
      escrowNgn,
      frozen: rows.filter((h) => h.status === "frozen").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((h) => {
      if (tab === "active" && h.status !== "active") return false;
      if (tab === "limited" && h.status !== "limited") return false;
      if (tab === "frozen" && h.status !== "frozen") return false;
      if (tab === "holds" && Number(h.stats.totalHoldMinor) <= 0) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        h.user.name.toLowerCase().includes(q) ||
        h.user.phone.toLowerCase().includes(q) ||
        (h.user.email ?? "").toLowerCase().includes(q) ||
        h.user.id.toLowerCase().includes(q)
      );
    });
  }, [rows, query, tab]);

  return (
    <AdminShell
      title="Wallets"
      description="User wallet balances, holds, escrow exposure, and admin actions."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Wallets" }]}
    >
      <KpiStrip
        items={[
          { label: "Users with wallets", value: loading ? "…" : stats.holders, Icon: Users, tone: T.navy, delta: "Unique holders" },
          { label: "Wallet rows", value: loading ? "…" : stats.walletRows, Icon: Wallet, tone: T.info, delta: "Per currency account" },
          { label: "Escrow (est.)", value: loading ? "…" : fmtMoney("NGN", stats.escrowNgn), Icon: ShieldCheck, tone: T.accent, delta: "Funded milestones" },
          { label: "With holds", value: loading ? "…" : stats.holdCount, Icon: Lock, tone: T.warn, delta: `${stats.frozen} frozen` },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="User, phone, email, id…" onRefresh={() => void load()} refreshing={loading}>
        <FilterTabs
          active={tab}
          onChange={(id) => setTab(id as Tab)}
          tabs={[
            { id: "all", label: "All", count: rows.length },
            { id: "active", label: "Active", count: rows.filter((h) => h.status === "active").length },
            { id: "limited", label: "Limited", count: rows.filter((h) => h.status === "limited").length },
            { id: "frozen", label: "Frozen", count: rows.filter((h) => h.status === "frozen").length },
            { id: "holds", label: "With holds", count: rows.filter((h) => Number(h.stats.totalHoldMinor) > 0).length },
          ]}
        />
      </ListToolbar>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "2fr 0.8fr 0.8fr 1.6fr 1fr 1fr 0.9fr",
          }}
        >
          <span>User</span>
          <span>Status</span>
          <span>Type</span>
          <span>Balances</span>
          <span className="text-right">Escrow</span>
          <span className="text-right">Lifetime</span>
          <span>Last txn</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <ListEmpty message="No wallets found." />
        ) : (
          filtered.map((h, i) => {
            const country = countryFromPhone(h.user.phone);
            return (
              <div
                key={h.user.id}
                className="grid items-center px-4 py-3 text-[12px]"
                style={{
                  gridTemplateColumns: "2fr 0.8fr 0.8fr 1.6fr 1fr 1fr 0.9fr",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <Link to="/admin/wallets/$userId" params={{ userId: h.user.id }} className="flex items-center gap-2.5 min-w-0 hover:underline">
                  <div
                    className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold shrink-0"
                    style={{ background: `${T.navy}10`, color: T.navy }}
                  >
                    {initials(h.user.name || "?")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: T.ink }}>
                      {h.user.name}
                    </p>
                    <p className="text-[10.5px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {walletRefId(h.user.id)} · {country.flag} {h.user.phone}
                    </p>
                  </div>
                </Link>
                <div>{walletStatusPill(h.status)}</div>
                <span className="text-[11px] capitalize" style={{ color: T.sub }}>
                  {h.user.role.toLowerCase().replace("_", " ")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {h.wallets.map((w) => (
                    <span
                      key={w.id}
                      className="text-[10.5px] tabular-nums px-1.5 h-6 rounded inline-flex items-center font-semibold"
                      style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {fmtMoney(w.currency, w.balanceMinor)}
                      {Number(w.holdMinor) > 0 ? ` (+${fmtMoney(w.currency, w.holdMinor)})` : ""}
                    </span>
                  ))}
                </div>
                <span className="text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {Number(h.stats.escrowMinorNgn) > 0 ? fmtMoney("NGN", h.stats.escrowMinorNgn) : "—"}
                </span>
                <span className="text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {Number(h.stats.lifetimeMinorNgn) > 0 ? fmtMoney("NGN", h.stats.lifetimeMinorNgn) : "—"}
                </span>
                <span className="text-[10.5px] truncate" style={{ color: T.muted }}>
                  {h.stats.lastTxnAt
                    ? new Date(h.stats.lastTxnAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : "—"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
