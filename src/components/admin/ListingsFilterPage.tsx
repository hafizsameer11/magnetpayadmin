import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package, CheckCircle2, Flag } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { statusPillCatalog } from "@/components/admin/Catalog";
import { listingCatalogStatus } from "@/components/admin/ListingProfile";
import { KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import type { AdminProduct } from "@/lib/api";
import { fetchAdminProducts, fmtMoney, moderateProduct } from "@/lib/api";
import { toast } from "sonner";

type Mode = "pending" | "reported";

function primarySku(p: AdminProduct) {
  return p.variants?.find((v) => v.sku)?.sku ?? "—";
}

export function ListingsFilterPage({ mode }: { mode: Mode }) {
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await fetchAdminProducts()) as AdminProduct[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const queue = useMemo(
    () => rows.filter((r) => listingCatalogStatus(r) === (mode === "pending" ? "pending" : "reported")),
    [rows, mode],
  );

  const filtered = queue.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.store?.name ?? "").toLowerCase().includes(q)
    );
  });

  const title = mode === "pending" ? "Pending listings" : "Reported listings";
  const desc =
    mode === "pending"
      ? "Products awaiting moderation approval before going live."
      : "Listings flagged by low ratings or user reports — review before re-listing.";

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

  const pendingCount = rows.filter((r) => listingCatalogStatus(r) === "pending").length;
  const reportedCount = rows.filter((r) => listingCatalogStatus(r) === "reported").length;
  const activeCount = rows.filter((r) => r.active).length;

  return (
    <AdminShell
      title={title}
      description={desc}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: title }]}
    >
      <KpiStrip
        cols={3}
        items={[
          {
            label: "In queue",
            value: loading ? "…" : queue.length,
            Icon: mode === "reported" ? Flag : Package,
            tone: mode === "reported" ? T.danger : T.warn,
            delta: mode === "reported" ? "Needs moderation" : "Awaiting approval",
          },
          { label: "Total catalog", value: loading ? "…" : rows.length, Icon: Package, tone: T.navy, delta: "All products" },
          { label: "Live listings", value: loading ? "…" : activeCount, Icon: CheckCircle2, tone: T.success, delta: `${pendingCount} pending · ${reportedCount} reported` },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Search listing…" onRefresh={() => void load()} refreshing={loading} />

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr" }}
        >
          <span>Product</span>
          <span>Store</span>
          <span className="text-right">Price</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {filtered.map((r, i) => {
          const id = r.id;
          const status = listingCatalogStatus(r);
          return (
            <div
              key={id}
              className="grid items-center px-4 h-[52px] text-[12px]"
              style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <Link to="/admin/listings/$id" params={{ id }} className="font-semibold truncate hover:underline" style={{ color: T.navy }}>
                {r.title}
              </Link>
              <span className="truncate" style={{ color: T.sub }}>
                {r.store?.name ?? "—"}
              </span>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(r.currency, r.priceMinor)}
              </span>
              {statusPillCatalog(status)}
              <div className="flex gap-1">
                <button
                  disabled={busyId === id}
                  onClick={() => void moderate(id, "APPROVED")}
                  className="h-7 px-2 rounded text-[10px] font-bold text-white disabled:opacity-50"
                  style={{ background: T.navy }}
                >
                  Approve
                </button>
                <button
                  disabled={busyId === id}
                  onClick={() => void moderate(id, "HIDDEN")}
                  className="h-7 px-2 rounded text-[10px] font-semibold"
                  style={{ border: `1px solid ${T.border}` }}
                >
                  Hide
                </button>
              </div>
            </div>
          );
        })}
        {!filtered.length ? <ListEmpty message="No listings in this queue." /> : null}
      </div>
    </AdminShell>
  );
}
