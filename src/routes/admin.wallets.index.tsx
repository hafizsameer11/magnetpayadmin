import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, Users, Coins, Lock } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { initials } from "@/components/admin/UserProfile";
import { fetchAdminWallets, fmtMoney, type AdminWallet } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/wallets/")({
  head: () => ({ meta: [{ title: "Wallets — MagnetPay Admin" }] }),
  component: Page,
});

type UserGroup = {
  userId: string;
  name: string;
  phone: string;
  wallets: AdminWallet[];
};

function Page() {
  const [rows, setRows] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminWallets());
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

  const groups = useMemo(() => {
    const map = new Map<string, UserGroup>();
    for (const w of rows) {
      const id = w.user.id;
      const existing = map.get(id);
      if (existing) {
        existing.wallets.push(w);
      } else {
        map.set(id, {
          userId: id,
          name: w.user.name,
          phone: w.user.phone,
          wallets: [w],
        });
      }
    }
    return Array.from(map.values());
  }, [rows]);

  const stats = useMemo(() => {
    let holdCount = 0;
    let currencies = new Set<string>();
    for (const w of rows) {
      currencies.add(w.currency);
      if (Number(w.holdMinor) > 0) holdCount++;
    }
    return { walletRows: rows.length, holdCount, currencyCount: currencies.size };
  }, [rows]);

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const n = query.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(n) ||
        g.phone.toLowerCase().includes(n) ||
        g.userId.toLowerCase().includes(n),
    );
  }, [groups, query]);

  return (
    <AdminShell
      title="Wallets"
      description="User wallet balances across NGN, CNY, and USD."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Wallets" }]}
    >
      <KpiStrip
        items={[
          { label: "Users with wallets", value: loading ? "…" : groups.length, Icon: Users, tone: T.navy, delta: "Unique holders" },
          { label: "Wallet rows", value: loading ? "…" : stats.walletRows, Icon: Wallet, tone: T.info, delta: "Per currency account" },
          { label: "Currencies", value: loading ? "…" : stats.currencyCount, Icon: Coins, tone: T.success, delta: "Active in system" },
          { label: "With holds", value: loading ? "…" : stats.holdCount, Icon: Lock, tone: T.warn, delta: "Escrow or pending" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="User, phone, id…" onRefresh={() => void load()} refreshing={loading} />

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "2fr 2.5fr",
          }}
        >
          <span>User</span>
          <span>Balances</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <ListEmpty message="No wallets found." />
        ) : (
          filtered.map((g, i) => (
            <div
              key={g.userId}
              className="grid items-center px-4 py-3 text-[12px]"
              style={{
                gridTemplateColumns: "2fr 2.5fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <Link to="/admin/wallets/$userId" params={{ userId: g.userId }} className="flex items-center gap-2.5 min-w-0 hover:underline">
                <div
                  className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold shrink-0"
                  style={{ background: `${T.navy}10`, color: T.navy }}
                >
                  {initials(g.name || "?")}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate" style={{ color: T.ink }}>
                    {g.name}
                  </p>
                  <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {g.userId.slice(0, 8)} · {g.phone}
                  </p>
                </div>
              </Link>
              <div className="flex flex-wrap gap-1.5">
                {g.wallets.map((w) => (
                  <span
                    key={w.id}
                    className="text-[11px] tabular-nums px-1.5 h-6 rounded inline-flex items-center font-semibold"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {fmtMoney(w.currency, w.balanceMinor)}
                    {Number(w.holdMinor) > 0 ? ` (+${fmtMoney(w.currency, w.holdMinor)} hold)` : ""}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
