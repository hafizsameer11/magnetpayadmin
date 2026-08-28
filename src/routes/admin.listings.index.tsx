import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, EyeOff, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { statusPillCatalog, Thumb } from "@/components/admin/Catalog";
import { listingCatalogStatus } from "@/components/admin/ListingProfile";
import type { AdminProduct } from "@/lib/api";
import { fetchAdminProducts, fmtMoney, moderateProduct, resolveApiFileUrl } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/")({
  head: () => ({ meta: [{ title: "Listings — MagnetPay Admin" }] }),
  component: Page,
});

function primarySku(p: AdminProduct) {
  return p.variants?.find((v) => v.sku)?.sku ?? "—";
}

function Page() {
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setRows((await fetchAdminProducts()) as AdminProduct[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load products");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.store?.name ?? "").toLowerCase().includes(q) ||
      (r.category?.name ?? "").toLowerCase().includes(q) ||
      primarySku(r).toLowerCase().includes(q)
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

  const activeCount = rows.filter((r) => r.active).length;

  return (
    <AdminShell
      title="Listings"
      description="Marketplace products — approve or hide."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Listings" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", val: rows.length },
          { label: "Active", val: activeCount, tone: T.success },
          { label: "Hidden / pending", val: rows.length - activeCount, tone: T.warn },
          { label: "Reported", val: rows.filter((r) => listingCatalogStatus(r) === "reported").length, tone: T.danger },
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
            placeholder="Title, SKU, store…"
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
            gridTemplateColumns: "2.2fr 1fr 0.8fr 0.7fr 0.7fr 0.8fr 1.3fr",
          }}
        >
          <span>Product</span>
          <span>Store</span>
          <span className="text-right">Price</span>
          <span>Stock</span>
          <span>Rating</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {filtered.map((r, i) => {
          const id = r.id;
          const status = listingCatalogStatus(r);
          const img = r.imageUrl ? resolveApiFileUrl(r.imageUrl) : "";
          return (
            <div
              key={id}
              className="grid items-center px-4 min-h-[58px] py-2 text-[12px]"
              style={{
                gridTemplateColumns: "2.2fr 1fr 0.8fr 0.7fr 0.7fr 0.8fr 1.3fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {img ? <Thumb src={img} alt={r.title} size={36} /> : null}
                <div className="min-w-0">
                  <Link to="/admin/listings/$id" params={{ id }} className="font-semibold truncate hover:underline block" style={{ color: T.navy }}>
                    {r.title}
                  </Link>
                  <p className="text-[10.5px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {primarySku(r)} · {id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <span className="truncate">{r.store?.name ?? "—"}</span>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(r.currency, r.priceMinor)}
              </span>
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {r.stock ?? "—"}
              </span>
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {r.rating != null ? r.rating.toFixed(1) : "—"}
              </span>
              {statusPillCatalog(status)}
              <div className="flex gap-1.5">
                {!r.active ? (
                  <button
                    disabled={busyId === id}
                    onClick={() => void moderate(id, "APPROVED")}
                    className="h-7 px-2 rounded-md text-[10.5px] font-bold flex items-center gap-1 disabled:opacity-50"
                    style={{ background: `${T.success}18`, color: T.success }}
                  >
                    <Check className="size-3" /> Approve
                  </button>
                ) : null}
                {r.active ? (
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
