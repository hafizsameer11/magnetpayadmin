import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  Loader2,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { fmtCNY, fmtNGN, statusPillCatalog, Thumb } from "@/components/admin/Catalog";
import { listingCatalogStatus, listingRefId, sellerRefId } from "@/components/admin/ListingProfile";
import { FilterSelect, applyAllFilter, uniqueOptions } from "@/components/admin/ListFilters";
import { FilterTabs, ListEmpty } from "@/components/admin/ListPageKit";
import type { AdminProduct } from "@/lib/api";
import { fetchAdminProducts, fmtMoney, fromMinor, moderateProduct, resolveApiFileUrl } from "@/lib/api";
import { downloadClientCsv } from "@/lib/csv";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/")({
  head: () => ({ meta: [{ title: "Listings — MagnetPay Admin" }] }),
  component: Page,
});

const CNY_NGN_RATE = 229.04;
const GRID =
  "36px minmax(220px,2.4fr) minmax(140px,1.2fr) minmax(120px,1fr) minmax(90px,0.9fr) 0.6fr 0.7fr 0.8fr 52px";

type Tab = "all" | "active" | "pending" | "reported" | "oos";

function primarySku(p: AdminProduct) {
  return p.variants?.find((v) => v.sku)?.sku ?? "—";
}

function productImage(p: AdminProduct) {
  if (p.imageUrl) return resolveApiFileUrl(p.imageUrl);
  const media = p.media?.[0]?.url;
  if (media) return resolveApiFileUrl(media);
  const variant = p.variants?.find((v) => v.imageUrl)?.imageUrl;
  return variant ? resolveApiFileUrl(variant) : "";
}

function orders30d(p: AdminProduct) {
  return p.orders30d ?? p._count?.orderItems ?? 0;
}

function PriceCell({ product }: { product: AdminProduct }) {
  const major = fromMinor(product.priceMinor);
  const currency = product.currency?.toUpperCase() ?? "CNY";
  if (currency === "CNY") {
    const ngn = Math.round(major * CNY_NGN_RATE);
    return (
      <div>
        <p className="font-bold tabular-nums leading-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
          {fmtCNY(major)}
        </p>
        <p className="text-[10.5px] tabular-nums mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>
          {fmtNGN(ngn)}
        </p>
      </div>
    );
  }
  return (
    <span className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {fmtMoney(currency, product.priceMinor)}
    </span>
  );
}

function stockTone(stock: number | null | undefined) {
  if (stock == null) return T.sub;
  if (stock === 0) return T.danger;
  if (stock < 100) return T.warn;
  return T.ink;
}

function Page() {
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState("__all__");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const stats = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 86_400_000;
    const monthMs = 30 * 86_400_000;
    const dayMs = 86_400_000;
    const slaMs = 24 * 3_600_000;

    let pending = 0;
    let reported = 0;
    let active = 0;
    let oos = 0;
    let newThisWeek = 0;
    let pendingOverSla = 0;
    let reportedToday = 0;
    let approved30d = 0;
    let approvedPrev30d = 0;

    for (const r of rows) {
      const status = listingCatalogStatus(r);
      if (r.active) active++;
      if (status === "pending") {
        pending++;
        if (r.updatedAt && now - new Date(r.updatedAt).getTime() > slaMs) pendingOverSla++;
      }
      if (status === "reported") {
        reported++;
        if (r.updatedAt && now - new Date(r.updatedAt).getTime() < dayMs) reportedToday++;
      }
      if (r.stock === 0) oos++;
      const created = new Date(r.createdAt).getTime();
      if (now - created <= weekMs) newThisWeek++;
      if (r.active && now - created <= monthMs) approved30d++;
      if (r.active && now - created > monthMs && now - created <= monthMs * 2) approvedPrev30d++;
    }

    const pctChange =
      approvedPrev30d > 0
        ? `${(((approved30d - approvedPrev30d) / approvedPrev30d) * 100).toFixed(1)}% vs prior 30D`
        : approved30d > 0
          ? "New this period"
          : "No new approvals";

    return {
      total: rows.length,
      active,
      pending,
      reported,
      oos,
      newThisWeek,
      pendingOverSla,
      reportedToday,
      approved30d,
      pctChange,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "active") list = list.filter((r) => r.active);
    else if (tab === "pending") list = list.filter((r) => listingCatalogStatus(r) === "pending");
    else if (tab === "reported") list = list.filter((r) => listingCatalogStatus(r) === "reported");
    else if (tab === "oos") list = list.filter((r) => r.stock === 0);

    list = applyAllFilter(list, category, (r) => r.category?.name ?? "");

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          listingRefId(r.id).toLowerCase().includes(q) ||
          (r.store?.name ?? "").toLowerCase().includes(q) ||
          (r.category?.name ?? "").toLowerCase().includes(q) ||
          primarySku(r).toLowerCase().includes(q),
      );
    }
    return list;
  }, [rows, tab, category, query]);

  const categoryOptions = useMemo(
    () => uniqueOptions(rows.map((r) => r.category?.name ?? ""), "All"),
    [rows],
  );

  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const moderate = async (id: string, status: "APPROVED" | "HIDDEN") => {
    setBusyId(id);
    try {
      await moderateProduct(id, status);
      toast.success(status === "APPROVED" ? "Listing approved" : "Listing hidden");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Moderation failed");
    } finally {
      setBusyId(null);
    }
  };

  const onExport = () => {
    setExporting(true);
    try {
      const exportRows = (selected.size ? filtered.filter((r) => selected.has(r.id)) : filtered).map((r) => ({
        listingId: listingRefId(r.id),
        title: r.title,
        sku: primarySku(r),
        seller: r.store?.name ?? "",
        sellerId: r.store ? sellerRefId(r.store.id) : "",
        category: r.category?.name ?? "",
        price: fmtMoney(r.currency, r.priceMinor),
        stock: r.stock ?? "",
        orders30d: orders30d(r),
        status: listingCatalogStatus(r),
        rating: r.rating ?? "",
      }));
      downloadClientCsv(
        `listings-${new Date().toISOString().slice(0, 10)}.csv`,
        ["listingId", "title", "sku", "seller", "sellerId", "category", "price", "stock", "orders30d", "status", "rating"],
        exportRows,
      );
      toast.success(`Exported ${exportRows.length} listing${exportRows.length === 1 ? "" : "s"}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminShell
      title="Listings"
      description="All products across the marketplace — moderate, edit, or delist."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Listings" }]}
      actions={
        <>
          <Link
            to="/admin/listings/pending"
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Pending queue
            {stats.pending > 0 ? (
              <span
                className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                style={{ background: `${T.warn}18`, color: T.warn }}
              >
                {stats.pending}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting || loading || !filtered.length}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold disabled:opacity-50"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" strokeWidth={2.4} />}
            Export
          </button>
          <button
            type="button"
            onClick={() => toast.info("Listings are created by sellers in the seller portal.")}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
            style={{ background: T.navy }}
          >
            <Plus className="size-3.5" strokeWidth={2.6} /> New listing
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            I: Package,
            label: "Total listings",
            val: loading ? "…" : stats.total.toLocaleString("en-US"),
            delta: loading ? "" : stats.newThisWeek ? `+${stats.newThisWeek} this week` : "No new listings this week",
            tone: T.navy,
          },
          {
            I: Clock,
            label: "Pending review",
            val: loading ? "…" : String(stats.pending),
            delta: stats.pendingOverSla ? `${stats.pendingOverSla} over SLA` : stats.pending ? "Within SLA" : "Queue clear",
            tone: T.warn,
          },
          {
            I: AlertTriangle,
            label: "Reported",
            val: loading ? "…" : String(stats.reported),
            delta: stats.reportedToday ? `+${stats.reportedToday} today` : stats.reported ? "Needs review" : "None flagged",
            tone: T.danger,
          },
          {
            I: ShieldCheck,
            label: "30D new approved",
            val: loading ? "…" : stats.approved30d.toLocaleString("en-US"),
            delta: stats.pctChange,
            tone: T.info,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md grid place-items-center shrink-0" style={{ background: `${s.tone}14`, color: s.tone }}>
                <s.I className="size-3.5" strokeWidth={2.4} />
              </div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.ink }}>
                {s.label}
              </p>
            </div>
            <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
              {s.val}
            </p>
            {s.delta ? (
              <p className="mt-1 text-[10.5px]" style={{ color: T.muted }}>
                {s.delta}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <FilterTabs
          active={tab}
          onChange={(id) => setTab(id as Tab)}
          tabs={[
            { id: "all", label: "All", count: stats.total },
            { id: "active", label: "Active", count: stats.active },
            { id: "pending", label: "Pending", count: stats.pending },
            { id: "reported", label: "Reported", count: stats.reported },
            { id: "oos", label: "Out of stock", count: stats.oos },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-2 h-9 px-3 rounded-lg w-[220px]"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <Search className="size-3.5 shrink-0" style={{ color: T.muted }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or ID…"
              className="bg-transparent text-[12px] outline-none flex-1 min-w-0"
              style={{ color: T.ink }}
            />
          </div>
          <FilterSelect label="Category" value={category} onChange={setCategory} options={categoryOptions} />
        </div>
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ minWidth: 1080 }}>
          <div
            className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              color: T.muted,
              background: T.bg,
              borderBottom: `1px solid ${T.border}`,
              gridTemplateColumns: GRID,
            }}
          >
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAll}
              aria-label="Select all visible listings"
              className="size-3.5 rounded accent-[#0E3B2E]"
            />
            <span>Product</span>
            <span>Seller</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span className="text-right">30D orders</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <p className="p-8 text-center text-[12px]" style={{ color: T.muted }}>
              Loading listings…
            </p>
          ) : null}

          {!loading &&
            filtered.map((r, i) => {
              const id = r.id;
              const status = listingCatalogStatus(r);
              const img = productImage(r);
              const checked = selected.has(id);
              return (
                <div
                  key={id}
                  className="grid items-center px-4 min-h-[62px] py-2 text-[12px]"
                  style={{
                    gridTemplateColumns: GRID,
                    borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      })
                    }
                    aria-label={`Select ${r.title}`}
                    className="size-3.5 rounded accent-[#0E3B2E]"
                  />
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {img ? <Thumb src={img} alt={r.title} size={40} /> : null}
                    <div className="min-w-0">
                      <Link to="/admin/listings/$id" params={{ id }} className="font-semibold truncate hover:underline block" style={{ color: T.ink }}>
                        {r.title}
                      </Link>
                      <p className="text-[10px] tabular-nums truncate mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                        {listingRefId(id)} · {primarySku(r)}
                        {r.rating != null && r.rating > 0 ? (
                          <>
                            {" · "}
                            <Star className="inline size-2.5 -mt-0.5" strokeWidth={2.4} style={{ color: T.warn }} />
                            {r.rating.toFixed(1)}
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 pr-2">
                    {r.store ? (
                      <Link to="/admin/sellers/$id" params={{ id: r.store.id }} className="font-semibold truncate hover:underline block" style={{ color: T.ink }}>
                        {r.store.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">—</span>
                    )}
                    <p className="text-[10px] tabular-nums truncate mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {r.store ? sellerRefId(r.store.id) : "—"}
                    </p>
                  </div>
                  <span className="truncate pr-2" style={{ color: T.sub }}>
                    {r.category?.name ?? "Uncategorized"}
                  </span>
                  <PriceCell product={r} />
                  <span
                    className="tabular-nums font-semibold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: stockTone(r.stock) }}
                  >
                    {r.stock ?? "—"}
                  </span>
                  <span className="text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
                    {orders30d(r).toLocaleString("en-US")}
                  </span>
                  {statusPillCatalog(status)}
                  <div className="sticky right-0 z-[1] flex justify-end shrink-0 pl-2" style={{ background: T.surface }}>
                    <ActionMenu
                    label={`Actions for ${r.title}`}
                    items={[
                      {
                        id: "view",
                        label: "View listing",
                        onClick: () => {
                          window.location.href = `/admin/listings/${id}`;
                        },
                      },
                      {
                        id: "edit",
                        label: "Edit listing",
                        onClick: () => {
                          window.location.href = `/admin/listings/${id}/edit`;
                        },
                      },
                      ...(!r.active
                        ? [
                            {
                              id: "approve",
                              label: "Approve",
                              disabled: busyId === id,
                              onClick: () => void moderate(id, "APPROVED"),
                            },
                          ]
                        : []),
                      ...(r.active
                        ? [
                            {
                              id: "hide",
                              label: "Hide listing",
                              disabled: busyId === id,
                              onClick: () => void moderate(id, "HIDDEN"),
                            },
                          ]
                        : []),
                      ...(r.store
                        ? [
                            {
                              id: "seller",
                              label: "View seller",
                              onClick: () => {
                                window.location.href = `/admin/sellers/${r.store!.id}`;
                              },
                            },
                          ]
                        : []),
                    ]}
                    />
                  </div>
                </div>
              );
            })}

          {!loading && !filtered.length ? <ListEmpty message="No listings match this filter." /> : null}
        </div>
      </div>
    </AdminShell>
  );
}
