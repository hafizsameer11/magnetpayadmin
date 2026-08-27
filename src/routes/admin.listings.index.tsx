import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, EyeOff, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminProducts, fmtMoney, moderateProduct } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/")({
  head: () => ({ meta: [{ title: "Listings — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setRows(await fetchAdminProducts());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load products");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((raw) => {
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const store = (r.store ?? {}) as Record<string, unknown>;
    const cat = (r.category ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return (
      str(r.title).toLowerCase().includes(q) ||
      str(r.id).toLowerCase().includes(q) ||
      str(store.name).toLowerCase().includes(q) ||
      str(cat.name).toLowerCase().includes(q)
    );
  });

  const moderate = async (id: string, status: "APPROVED" | "HIDDEN") => {
    setBusyId(id);
    try {
      await moderateProduct(id, status);
      toast.success(status === "APPROVED" ? "Product approved" : "Product hidden");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Moderation failed");
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = rows.filter((raw) => (raw as Record<string, unknown>).active === true).length;

  return (
    <AdminShell
      title="Listings"
      description="Marketplace products — approve or hide."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Listings" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total", val: rows.length },
          { label: "Active", val: activeCount, tone: T.success },
          { label: "Hidden", val: rows.length - activeCount, tone: T.warn },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {s.label}
            </p>
            <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.tone ?? T.ink }}>
              {s.val}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, store, category…"
            className="bg-transparent text-[12px] outline-none flex-1"
            style={{ color: T.ink }}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "2fr 1.2fr 1fr 0.9fr 0.9fr 1.4fr",
          }}
        >
          <span>Product</span>
          <span>Store</span>
          <span className="text-right">Price</span>
          <span>Rating</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const store = (r.store ?? {}) as Record<string, unknown>;
          const cat = (r.category ?? {}) as Record<string, unknown>;
          const id = str(r.id);
          const active = r.active === true;
          const tone: Tone = active ? "success" : "warn";
          return (
            <div
              key={id}
              className="grid items-center px-4 h-[58px] text-[12px]"
              style={{
                gridTemplateColumns: "2fr 1.2fr 1fr 0.9fr 0.9fr 1.4fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div className="min-w-0">
                <Link
                  to="/admin/listings/$id"
                  params={{ id }}
                  className="font-semibold truncate hover:underline block"
                  style={{ color: T.navy }}
                >
                  {str(r.title)}
                </Link>
                <p className="text-[10.5px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {id.slice(0, 8)} · {str(cat.name, "Uncategorized")}
                </p>
              </div>
              <span className="truncate">{str(store.name)}</span>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(str(r.currency, "USD"), r.priceMinor as string | number)}
              </span>
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {typeof r.rating === "number" ? r.rating.toFixed(1) : str(r.rating)}
              </span>
              <Pill tone={tone}>{active ? "Active" : "Hidden"}</Pill>
              <div className="flex gap-1.5">
                {!active ? (
                  <button
                    disabled={busyId === id}
                    onClick={() => void moderate(id, "APPROVED")}
                    className="h-7 px-2 rounded-md text-[10.5px] font-bold flex items-center gap-1 disabled:opacity-50"
                    style={{ background: `${T.success}18`, color: T.success }}
                  >
                    <Check className="size-3" /> Approve
                  </button>
                ) : null}
                {active ? (
                  <button
                    disabled={busyId === id}
                    onClick={() => void moderate(id, "HIDDEN")}
                    className="h-7 px-2 rounded-md text-[10.5px] font-bold flex items-center gap-1 disabled:opacity-50"
                    style={{ background: `${T.warn}18`, color: T.warn }}
                  >
                    <EyeOff className="size-3" /> Hide
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {!filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No listings yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
