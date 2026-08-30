import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminWithdrawals, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sellers/payouts")({
  head: () => ({ meta: [{ title: "Seller payouts — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setRows(await fetchAdminWithdrawals());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load payouts");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = rows.filter((raw) => {
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const user = (r.user ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return String(user.name ?? "").toLowerCase().includes(q) || String(r.id ?? "").toLowerCase().includes(q);
  });

  return (
    <AdminShell
      title="Seller payouts"
      description="Withdrawals and seller settlement payouts."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Sellers", to: "/admin/sellers" }, { label: "Payouts" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Payouts", val: loading ? "…" : String(rows.length) },
          { label: "Pending", val: loading ? "…" : String(rows.filter((r) => String((r as Record<string, unknown>).status).toUpperCase() === "PENDING").length), tone: T.warn },
          { label: "Completed", val: loading ? "…" : String(rows.filter((r) => String((r as Record<string, unknown>).status).toUpperCase() === "COMPLETED").length), tone: T.success },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.ink }}>{s.label}</p>
            <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payout…" className="bg-transparent text-[12px] outline-none flex-1" style={{ color: T.ink }} />
        </div>
        <Link to="/admin/withdrawals" className="text-[12px] font-semibold hover:underline" style={{ color: T.navy }}>All withdrawals →</Link>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1fr" }}>
          <span>Payout</span><span>Seller</span><span className="text-right">Amount</span><span>Rail</span><span>Status</span>
        </div>
        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>
        ) : (
          filtered.map((raw, i) => {
            const r = raw as Record<string, unknown>;
            const user = (r.user ?? {}) as Record<string, unknown>;
            const id = String(r.id);
            return (
              <Link key={id} to="/admin/withdrawals/$id" params={{ id }} className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)]" style={{ gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1fr", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span className="font-semibold tabular-nums" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>{id.slice(0, 8)}</span>
                <span className="truncate">{String(user.name ?? "—")}</span>
                <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtMoney(String(r.currency ?? "NGN"), r.amountMinor as string | number)}</span>
                <span style={{ color: T.sub }}>{String(r.rail ?? "—")}</span>
                <Pill tone={String(r.status).toUpperCase() === "COMPLETED" ? "success" : "warn"}>{String(r.status)}</Pill>
              </Link>
            );
          })
        )}
        {!loading && !filtered.length ? <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No payouts yet.</p> : null}
      </div>
    </AdminShell>
  );
}
