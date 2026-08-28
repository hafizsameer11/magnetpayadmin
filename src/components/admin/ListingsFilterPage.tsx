import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminProducts, fmtMoney, moderateProduct } from "@/lib/api";
import { toast } from "sonner";

type Mode = "pending" | "reported";

export function ListingsFilterPage({ mode }: { mode: Mode }) {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setRows(await fetchAdminProducts());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((raw) => {
    const r = raw as Record<string, unknown>;
    const active = r.active === true;
    if (mode === "pending" && active) return false;
    if (mode === "reported" && active) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    const store = (r.store ?? {}) as Record<string, unknown>;
    return String(r.title ?? "").toLowerCase().includes(q) || String(store.name ?? "").toLowerCase().includes(q);
  });

  const title = mode === "pending" ? "Pending listings" : "Reported listings";
  const desc = mode === "pending" ? "Products awaiting moderation approval." : "Flagged or hidden listings.";

  const moderate = async (id: string, status: "APPROVED" | "HIDDEN") => {
    setBusyId(id);
    try {
      await moderateProduct(id, status);
      toast.success(status === "APPROVED" ? "Approved" : "Hidden");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell title={title} description={desc} breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: title }]}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "In queue", val: filtered.length },
          { label: "Total catalog", val: rows.length },
          { label: "Active", val: rows.filter((r) => (r as Record<string, unknown>).active === true).length, tone: T.success },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{s.label}</p>
            <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.tone ?? T.ink }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search listing…" className="bg-transparent text-[12px] outline-none flex-1" style={{ color: T.ink }} />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr" }}>
          <span>Product</span><span>Store</span><span className="text-right">Price</span><span>Status</span><span>Actions</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const store = (r.store ?? {}) as Record<string, unknown>;
          const id = String(r.id);
          return (
            <div key={id} className="grid items-center px-4 h-[52px] text-[12px]" style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <Link to="/admin/listings/$id" params={{ id }} className="font-semibold truncate hover:underline" style={{ color: T.navy }}>{String(r.title)}</Link>
              <span className="truncate" style={{ color: T.sub }}>{String(store.name ?? "—")}</span>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtMoney(String(r.currency ?? "NGN"), r.priceMinor as string | number)}</span>
              <Pill tone={r.active ? "success" : "warn"}>{r.active ? "Active" : "Pending"}</Pill>
              <div className="flex gap-1">
                <button disabled={busyId === id} onClick={() => void moderate(id, "APPROVED")} className="h-7 px-2 rounded text-[10px] font-bold text-white disabled:opacity-50" style={{ background: T.navy }}>Approve</button>
                <button disabled={busyId === id} onClick={() => void moderate(id, "HIDDEN")} className="h-7 px-2 rounded text-[10px] font-semibold" style={{ border: `1px solid ${T.border}` }}>Hide</button>
              </div>
            </div>
          );
        })}
        {!filtered.length ? <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No listings in this queue.</p> : null}
      </div>
    </AdminShell>
  );
}
