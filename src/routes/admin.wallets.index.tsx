import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Wallet } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminWallets();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load wallets");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
      description="User wallets across all currencies."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Wallets" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md grid place-items-center" style={{ background: `${T.navy}14`, color: T.navy }}>
              <Wallet className="size-3.5" strokeWidth={2.4} />
            </div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              Users with wallets
            </p>
          </div>
          <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {loading ? "…" : groups.length}
          </p>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Wallet rows
          </p>
          <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {loading ? "…" : rows.length}
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Search className="size-3.5" style={{ color: T.muted }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="User, phone, id…"
          className="bg-transparent text-[12px] outline-none flex-1"
          style={{ color: T.ink }}
        />
      </div>

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
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No wallets found.
          </p>
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
