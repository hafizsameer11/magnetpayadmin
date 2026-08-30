import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ArrowLeftRight, TrendingUp, Users, Calendar } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { fetchAdminFxConversions, fmtMoney, type AdminFxConversion } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fx/orders/")({
  head: () => ({ meta: [{ title: "FX orders — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminFxConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminFxConversions());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load FX conversions");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = rows.filter((r) => new Date(r.createdAt) >= today).length;
    const users = new Set(rows.map((r) => r.user?.id).filter(Boolean)).size;
    const avgRate = rows.length ? rows.reduce((s, r) => s + Number(r.rateApplied), 0) / rows.length : 0;
    return { total: rows.length, todayCount, users, avgRate };
  }, [rows]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const n = query.toLowerCase();
    return rows.filter(
      (o) =>
        o.id.toLowerCase().includes(n) ||
        (o.user?.name ?? "").toLowerCase().includes(n) ||
        o.fromCurrency.toLowerCase().includes(n) ||
        o.toCurrency.toLowerCase().includes(n),
    );
  }, [rows, query]);

  return (
    <AdminShell
      title="FX orders"
      description="Live wallet FX conversions across the NG–CN corridor."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX" }, { label: "Orders" }]}
    >
      <KpiStrip
        items={[
          { label: "Total conversions", value: loading ? "…" : stats.total, Icon: ArrowLeftRight, tone: T.navy, delta: "All time" },
          { label: "Today", value: loading ? "…" : stats.todayCount, Icon: Calendar, tone: T.warn, delta: "Since midnight" },
          { label: "Unique users", value: loading ? "…" : stats.users, Icon: Users, tone: T.info, delta: "Converted at least once" },
          { label: "Avg rate", value: loading ? "…" : stats.avgRate.toFixed(4), Icon: TrendingUp, tone: T.success, delta: "Applied corridor rate" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="ID, user, currency…" onRefresh={() => void load()} refreshing={loading} />

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1fr 1.2fr 1.2fr 1fr 1.4fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>From</span>
          <span>To</span>
          <span>Rate</span>
          <span>User</span>
          <span>When</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <ListEmpty message="No FX conversions match this filter." />
        ) : (
          filtered.map((o, i) => (
            <Link
              key={o.id}
              to="/admin/fx/orders/$id"
              params={{ id: o.id }}
              className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
              style={{
                gridTemplateColumns: "1fr 1.2fr 1.2fr 1fr 1.4fr 1.2fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                {o.id.slice(0, 8)}
              </span>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(o.fromCurrency, o.fromMinor)}
              </span>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(o.toCurrency, o.toMinor)}
              </span>
              <span className="tabular-nums" style={{ color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                {Number(o.rateApplied).toFixed(4)}
              </span>
              <span className="truncate">{o.user?.name ?? "—"}</span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(o.createdAt).toLocaleString()}
              </span>
            </Link>
          ))
        )}
      </div>
    </AdminShell>
  );
}
