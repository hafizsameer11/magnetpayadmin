import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, EyeOff, Package, CheckCircle2, Flag } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { statusPillCatalog, Thumb } from "@/components/admin/Catalog";
import { listingCatalogStatus } from "@/components/admin/ListingProfile";
import { FilterTabs, KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
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
  const [tab, setTab] = useState<"all" | "active" | "hidden" | "reported">("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await fetchAdminProducts()) as AdminProduct[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((r) => {
    if (tab === "active" && !r.active) return false;
    if (tab === "hidden" && (r.active || listingCatalogStatus(r) === "reported")) return false;
    if (tab === "reported" && listingCatalogStatus(r) !== "reported") return false;
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
  const hiddenCount = rows.filter((r) => !r.active && listingCatalogStatus(r) !== "reported").length;
  const reportedCount = rows.filter((r) => listingCatalogStatus(r) === "reported").length;

  return (
    <AdminShell
      title="Listings"
      description="Marketplace products — approve, hide, or review flagged listings."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Listings" }]}
    >
      <KpiStrip
        items={[
          { label: "Total", value: loading ? "…" : rows.length, Icon: Package, tone: T.navy, delta: "Full catalog" },
          { label: "Active", value: loading ? "…" : activeCount, Icon: CheckCircle2, tone: T.success, delta: "Live on marketplace" },
          { label: "Hidden / pending", value: loading ? "…" : hiddenCount, Icon: EyeOff, tone: T.warn, delta: "Awaiting moderation" },
          { label: "Reported", value: loading ? "…" : reportedCount, Icon: Flag, tone: T.danger, delta: "Flagged for review" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Title, SKU, store…" onRefresh={() => void load()} refreshing={loading}>
        <FilterTabs
          active={tab}
          onChange={(id) => setTab(id as typeof tab)}
          tabs={[
            { id: "all", label: "All", count: rows.length },
            { id: "active", label: "Active", count: activeCount },
            { id: "hidden", label: "Hidden", count: hiddenCount },
            { id: "reported", label: "Reported", count: reportedCount },
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
        {!filtered.length ? <ListEmpty message="No listings match this filter." /> : null}
      </div>
    </AdminShell>
  );
}
