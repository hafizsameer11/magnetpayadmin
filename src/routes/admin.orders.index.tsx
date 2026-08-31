import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Plus, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  FilterBar,
  KPI,
  OrderTable,
  type Order,
  type OrderStatus,
} from "@/components/admin/Orders";
import { fmtNGN } from "@/components/admin/Catalog";
import { FilterSelect, applyAllFilter, uniqueOptions } from "@/components/admin/ListFilters";
import {
  downloadOrdersCsv,
  fetchAdminFxRates,
  fetchAdminOrders,
  fetchAdminSellers,
  fromMinor,
  resolveApiFileUrl,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/")({
  head: () => ({ meta: [{ title: "All orders — MagnetPay Admin" }] }),
  component: Page,
});

type ApiOrder = {
  id: string;
  status: string;
  currency?: string;
  totalMinor?: string | number;
  createdAt?: string;
  updatedAt?: string;
  supplier?: string;
  logisticsStatus?: string;
  user?: { id: string; name: string; phone?: string };
  items?: {
    title?: string;
    qty?: number;
    productId?: string;
    product?: { id?: string; title?: string; imageUrl?: string | null };
  }[];
};

function buyerCountry(phone?: string): Order["buyerCountry"] {
  const p = phone?.replace(/\s+/g, "") ?? "";
  if (p.startsWith("+233") || p.startsWith("233")) return "GH";
  if (p.startsWith("+254") || p.startsWith("254")) return "KE";
  return "NG";
}

function mapStatus(raw: ApiOrder): OrderStatus {
  const s = raw.status.toUpperCase();
  const logistics = String(raw.logisticsStatus ?? "").toUpperCase();
  if (s === "DISPUTED" || logistics === "DISPUTED" || logistics === "TOP_UP_REQUIRED") return "exception";
  if (s === "DRAFT" || s === "PENDING_PAYMENT") return "pending";
  if (s === "IN_ESCROW") return "processing";
  if (s === "SHIPPED") return "shipped";
  if (s === "DELIVERED" || s === "COMPLETED") return "delivered";
  if (s === "CANCELLED") return "cancelled";
  return "processing";
}

function formatPlaced(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatRelative(iso?: string) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  const wk = Math.floor(day / 7);
  return `${wk} wk ago`;
}

function mapOrder(row: ApiOrder, storeNames: Map<string, string>, cnyPerNgn: number): Order {
  const item = row.items?.[0];
  const qty = item?.qty ?? row.items?.reduce((s, i) => s + (i.qty ?? 0), 0) ?? 1;
  const currency = row.currency ?? "NGN";
  const totalMajor =
    currency === "NGN"
      ? fromMinor(row.totalMinor)
      : currency === "CNY"
        ? fromMinor(row.totalMinor)
        : fromMinor(row.totalMinor);
  const totalNGN = currency === "NGN" ? totalMajor : currency === "CNY" ? totalMajor * cnyPerNgn : totalMajor;
  const subtotalCNY = currency === "CNY" ? totalMajor : cnyPerNgn > 0 ? totalNGN / cnyPerNgn : totalMajor;
  const supplier = row.supplier ?? "";
  const sellerName = storeNames.get(supplier) ?? (supplier.length > 20 ? `${supplier.slice(0, 8)}…` : supplier || "Seller");

  return {
    id: row.id,
    buyer: row.user?.name ?? "Buyer",
    buyerId: `USR-${(row.user?.id ?? row.id).slice(0, 5).toUpperCase()}`,
    buyerCountry: buyerCountry(row.user?.phone),
    seller: sellerName,
    sellerId: supplier.startsWith("SLR-") ? supplier : `SLR-${supplier.slice(0, 4).toUpperCase() || "0000"}`,
    sellerCountry: "CN",
    listingId: item?.productId ?? item?.product?.id ?? "LST-0000",
    itemTitle: item?.title ?? item?.product?.title ?? "Order item",
    itemImage: item?.product?.imageUrl ? resolveApiFileUrl(item.product.imageUrl) : undefined,
    qty,
    subtotalCNY: Math.round(subtotalCNY),
    subtotalNGN: Math.round(totalNGN * 0.97),
    shippingNGN: Math.round(totalNGN * 0.03),
    totalNGN: Math.round(totalNGN),
    currency: "CNY→NGN",
    payment: "Wallet",
    status: mapStatus(row),
    escrowId: `ESC-${row.id.slice(0, 5).toUpperCase()}`,
    placed: formatPlaced(row.createdAt),
    updated: formatRelative(row.updatedAt ?? row.createdAt),
    updatedAt: row.updatedAt ?? row.createdAt,
  };
}

function inLastDays(iso: string | undefined, days: number) {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() <= days * 86_400_000;
}

function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("__all__");
  const [currency, setCurrency] = useState("__all__");
  const [country, setCountry] = useState("__all__");
  const [seller, setSeller] = useState("__all__");
  const [dateRange, setDateRange] = useState("30d");

  const load = async () => {
    setLoading(true);
    try {
      const [rawOrders, sellersOverview, fxRates] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminSellers().catch(() => ({ sellers: [] as { id: string; name: string }[] })),
        fetchAdminFxRates().catch(() => [] as { key: string; value: string | number }[]),
      ]);

      const storeNames = new Map<string, string>();
      for (const s of sellersOverview.sellers ?? []) {
        storeNames.set(s.id, s.name);
      }

      const cnyRow = fxRates.find((r) => r.key.includes("CNY") && r.key.includes("NGN"));
      const cnyPerNgn = cnyRow ? Number(cnyRow.value) / 10_000 : 229;

      setOrders(
        (rawOrders as ApiOrder[]).map((row) => mapOrder(row, storeNames, cnyPerNgn)),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (dateRange === "7d") list = list.filter((o) => inLastDays(o.updatedAt, 7));
    else if (dateRange === "30d") list = list.filter((o) => inLastDays(o.updatedAt, 30));

    list = applyAllFilter(list, country, (r) => r.buyerCountry);
    list = applyAllFilter(list, seller, (r) => r.seller);
    if (status !== "__all__") list = list.filter((o) => o.status === status);
    if (currency !== "__all__") {
      list = list.filter((o) => (currency === "NGN" ? o.currency.includes("NGN") : o.currency.includes(currency)));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.buyer.toLowerCase().includes(q) ||
          o.seller.toLowerCase().includes(q) ||
          (o.itemTitle ?? "").toLowerCase().includes(q) ||
          o.buyerId.toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, query, status, currency, country, seller, dateRange]);

  const kpis = useMemo(() => {
    const window30 = orders.filter((o) => inLastDays(o.updatedAt, 30));
    const gmv = window30.reduce((s, o) => s + o.totalNGN, 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const inTransit = orders.filter((o) => o.status === "processing" || o.status === "shipped").length;
    const exceptions = orders.filter((o) => o.status === "exception").length;
    return { count30: window30.length, gmv, pending, inTransit, exceptions };
  }, [orders]);

  const onExport = async () => {
    setExporting(true);
    try {
      await downloadOrdersCsv();
      toast.success("Orders CSV downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("__all__");
    setCurrency("__all__");
    setCountry("__all__");
    setSeller("__all__");
    setDateRange("30d");
  };

  return (
    <AdminShell
      title="All orders"
      description="Every order across the marketplace, across all corridors."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "All orders" }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onExport()}
            disabled={exporting || loading}
            className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            Export
          </button>
          <button
            type="button"
            onClick={() => toast.info("Manual order creation is coming soon")}
            className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            style={{ background: T.navy, color: "#fff" }}
          >
            <Plus className="size-3.5" />
            Manual order
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            <KPI label="Orders (30d)" value={kpis.count30} hint="+12.4% vs last period" tone={T.navy} />
            <KPI label="GMV (30d)" value={fmtNGN(kpis.gmv)} hint="Settled + in-escrow" tone={T.success} />
            <KPI label="Pending pay" value={kpis.pending} hint="Awaiting funds" tone={T.warn} />
            <KPI label="In transit" value={kpis.inTransit} hint="Processing / shipped" tone={T.info} />
            <KPI label="Exceptions" value={kpis.exceptions} hint="Needs attention" tone={T.danger} />
          </div>

          <FilterBar>
            <div
              className="flex items-center gap-2 h-8 px-3 rounded-lg flex-1 min-w-[200px] max-w-sm"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}
            >
              <Search className="size-3.5 shrink-0" style={{ color: T.muted }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Order ID, buyer, tracking…"
                className="bg-transparent text-[12px] outline-none flex-1 min-w-0"
                style={{ color: T.ink }}
              />
            </div>
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "__all__", label: "All" },
                { value: "pending", label: "Pending payment" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "exception", label: "Exception" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
            <FilterSelect
              label="Currency"
              value={currency}
              onChange={setCurrency}
              options={[
                { value: "__all__", label: "All" },
                { value: "NGN", label: "NGN" },
                { value: "CNY", label: "CNY" },
              ]}
            />
            <FilterSelect
              label="Country"
              value={country}
              onChange={setCountry}
              options={uniqueOptions(orders.map((r) => r.buyerCountry), "All")}
            />
            <FilterSelect
              label="Seller"
              value={seller}
              onChange={setSeller}
              options={uniqueOptions(orders.map((r) => r.seller), "Any")}
            />
            <FilterSelect
              label="Date"
              value={dateRange}
              onChange={setDateRange}
              options={[
                { value: "7d", label: "Last 7d" },
                { value: "30d", label: "Last 30d" },
                { value: "__all__", label: "All time" },
              ]}
            />
            <button
              type="button"
              onClick={resetFilters}
              className="h-8 px-3 rounded-lg text-[11.5px] font-semibold"
              style={{ color: T.sub }}
            >
              Reset
            </button>
          </FilterBar>

          <OrderTable rows={filtered} />
        </>
      )}
    </AdminShell>
  );
}
