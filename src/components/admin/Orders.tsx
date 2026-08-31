import { T } from "@/components/admin/AdminShell";
import { StatusBadgeCustom } from "@/components/admin/StatusBadge";
import { LISTINGS, fmtCNY, fmtNGN, Thumb, Card, Pill } from "@/components/admin/Catalog";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

export { fmtCNY, fmtNGN, Thumb, Card, Pill };

export type OrderStatus =
  | "pending" | "processing" | "shipped" | "delivered"
  | "cancelled" | "refunded" | "exception";

export type Order = {
  id: string;
  buyer: string;
  buyerId: string;
  buyerCountry: "NG" | "GH" | "KE";
  seller: string;
  sellerId: string;
  sellerCountry: "CN";
  listingId: string;
  qty: number;
  subtotalCNY: number;
  subtotalNGN: number;
  shippingNGN: number;
  totalNGN: number;
  currency: "CNY\u2192NGN" | "CNY\u2192GHS" | "CNY\u2192KES";
  payment: "Wallet" | "Card" | "Bank transfer" | "USSD";
  status: OrderStatus;
  escrowId: string;
  shipmentId?: string;
  tracking?: string;
  carrier?: string;
  placed: string;
  updated: string;
  eta?: string;
  exception?: string;
  refundedNGN?: number;
  itemTitle?: string;
  itemImage?: string;
  updatedAt?: string;
};

const L = (idx: number) => LISTINGS[idx % LISTINGS.length];

export const ORDERS: Order[] = [
  { id: "ORD-528104", buyer: "Adaeze Okafor", buyerId: "USR-10241", buyerCountry: "NG",
    seller: LISTINGS[0].seller, sellerId: LISTINGS[0].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[0].id, qty: 80, subtotalCNY: 6880, subtotalNGN: 1576000,
    shippingNGN: 42000, totalNGN: 1618000, currency: "CNY→NGN", payment: "Wallet",
    status: "processing", escrowId: "ESC-77120", shipmentId: "SHP-44120",
    carrier: "MagnetExpress Air", tracking: "MEX1Z9920411NG",
    placed: "Jun 24, 09:14", updated: "12 min ago", eta: "Jul 04", notes: 2 },

  { id: "ORD-528098", buyer: "Tolu Bankole", buyerId: "USR-10182", buyerCountry: "NG",
    seller: LISTINGS[1].seller, sellerId: LISTINGS[1].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[1].id, qty: 24, subtotalCNY: 3408, subtotalNGN: 780600,
    shippingNGN: 28500, totalNGN: 809100, currency: "CNY→NGN", payment: "Card",
    status: "shipped", escrowId: "ESC-77108", shipmentId: "SHP-44108",
    carrier: "CN-Post Sea", tracking: "CNP552980411NG",
    placed: "Jun 22, 14:02", updated: "1 hr ago", eta: "Jul 09", notes: 0 },

  { id: "ORD-528077", buyer: "Kwame Asante", buyerId: "USR-09812", buyerCountry: "GH",
    seller: LISTINGS[3].seller, sellerId: LISTINGS[3].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[3].id, qty: 12, subtotalCNY: 7344, subtotalNGN: 1683000,
    shippingNGN: 51000, totalNGN: 1734000, currency: "CNY→GHS", payment: "Bank transfer",
    status: "delivered", escrowId: "ESC-77091", shipmentId: "SHP-44091",
    carrier: "DHL Express", tracking: "DHL44102239GH",
    placed: "Jun 18, 11:42", updated: "2 days ago", eta: "Jun 27", notes: 1 },

  { id: "ORD-528060", buyer: "Ngozi Eze", buyerId: "USR-09701", buyerCountry: "NG",
    seller: LISTINGS[4].seller, sellerId: LISTINGS[4].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[4].id, qty: 2, subtotalCNY: 5680, subtotalNGN: 1302000,
    shippingNGN: 78000, totalNGN: 1380000, currency: "CNY→NGN", payment: "Wallet",
    status: "exception", escrowId: "ESC-77074", shipmentId: "SHP-44074",
    carrier: "MagnetExpress Sea", tracking: "MEX2X8810044NG",
    placed: "Jun 14, 08:00", updated: "3 hr ago", eta: "Jul 12", notes: 4,
    exception: "Customs hold — NCC compliance docs requested" },

  { id: "ORD-528041", buyer: "Femi Adeyemi", buyerId: "USR-09584", buyerCountry: "NG",
    seller: LISTINGS[5].seller, sellerId: LISTINGS[5].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[5].id, qty: 60, subtotalCNY: 3240, subtotalNGN: 742800,
    shippingNGN: 22000, totalNGN: 764800, currency: "CNY→NGN", payment: "USSD",
    status: "pending", escrowId: "ESC-77055",
    placed: "Jun 28, 06:48", updated: "8 min ago", notes: 0 },

  { id: "ORD-528022", buyer: "Mary Wanjiru", buyerId: "USR-09410", buyerCountry: "KE",
    seller: LISTINGS[6].seller, sellerId: LISTINGS[6].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[6].id, qty: 15, subtotalCNY: 2970, subtotalNGN: 681000,
    shippingNGN: 34000, totalNGN: 715000, currency: "CNY→KES", payment: "Card",
    status: "delivered", escrowId: "ESC-77036", shipmentId: "SHP-44036",
    carrier: "DHL Express", tracking: "DHL44102241KE",
    placed: "Jun 10, 16:30", updated: "5 days ago", eta: "Jun 22", notes: 0 },

  { id: "ORD-527990", buyer: "Ibrahim Yusuf", buyerId: "USR-09221", buyerCountry: "NG",
    seller: LISTINGS[7].seller, sellerId: LISTINGS[7].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[7].id, qty: 8, subtotalCNY: 2496, subtotalNGN: 572400,
    shippingNGN: 31000, totalNGN: 603400, currency: "CNY→NGN", payment: "Wallet",
    status: "cancelled", escrowId: "ESC-77011",
    placed: "Jun 20, 10:14", updated: "4 days ago", notes: 1,
    exception: "Cancelled by buyer — wrong language variant" },

  { id: "ORD-527964", buyer: "Chiamaka Obi", buyerId: "USR-09080", buyerCountry: "NG",
    seller: LISTINGS[2].seller, sellerId: LISTINGS[2].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[2].id, qty: 100, subtotalCNY: 3800, subtotalNGN: 871000,
    shippingNGN: 38000, totalNGN: 909000, currency: "CNY→NGN", payment: "Card",
    status: "refunded", escrowId: "ESC-76988", shipmentId: "SHP-43988",
    carrier: "CN-Post Sea", tracking: "CNP552980388NG",
    placed: "May 30, 09:00", updated: "1 wk ago", notes: 3,
    refundedNGN: 909000, exception: "Full refund — items damaged on arrival" },

  { id: "ORD-527940", buyer: "Aisha Bello", buyerId: "USR-08902", buyerCountry: "NG",
    seller: LISTINGS[0].seller, sellerId: LISTINGS[0].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[0].id, qty: 200, subtotalCNY: 17200, subtotalNGN: 3940000,
    shippingNGN: 88000, totalNGN: 4028000, currency: "CNY→NGN", payment: "Bank transfer",
    status: "processing", escrowId: "ESC-76960",
    placed: "Jun 26, 12:48", updated: "44 min ago", notes: 0 },

  { id: "ORD-527918", buyer: "Joy Mensah", buyerId: "USR-08741", buyerCountry: "GH",
    seller: LISTINGS[3].seller, sellerId: LISTINGS[3].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[3].id, qty: 4, subtotalCNY: 2448, subtotalNGN: 561000,
    shippingNGN: 24000, totalNGN: 585000, currency: "CNY→GHS", payment: "Wallet",
    status: "pending", escrowId: "ESC-76940",
    placed: "Jun 28, 04:20", updated: "22 min ago", notes: 0 },
];

export function findOrder(id: string | undefined) {
  if (!id) return ORDERS[0];
  return ORDERS.find((o) => o.id === id || o.id.endsWith(id)) ?? ORDERS[0];
}

export function findListing(id: string) {
  return LISTINGS.find((l) => l.id === id) ?? LISTINGS[0];
}

export const STATUS_META: Record<OrderStatus, { c: string; label: string }> = {
  pending:    { c: T.warn,    label: "Pending payment" },
  processing: { c: T.info,    label: "Processing" },
  shipped:    { c: "#7C3AED", label: "Shipped" },
  delivered:  { c: T.success, label: "Delivered" },
  cancelled:  { c: T.muted,   label: "Cancelled" },
  refunded:   { c: T.accent,  label: "Refunded" },
  exception:  { c: T.danger,  label: "Exception" },
};

export function statusPillOrder(s: OrderStatus) {
  const m = STATUS_META[s];
  return <StatusBadgeCustom color={m.c} label={m.label.toUpperCase()} />;
}

export function KPI({ label, value, hint, tone = T.ink }: { label: string; value: ReactNode; hint?: string; tone?: string }) {
  return (
    <Card>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>{label}</p>
      <p className="mt-1.5 text-[20px] font-bold tabular-nums" style={{ color: tone, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px]" style={{ color: T.muted }}>{hint}</p>}
    </Card>
  );
}

export function FlagEmoji({ c }: { c: "NG" | "GH" | "KE" | "CN" }) {
  // Regional-indicator pairs (avoids mojibake if the file encoding is wrong)
  const m = {
    NG: "\u{1F1F3}\u{1F1EC}",
    GH: "\u{1F1EC}\u{1F1ED}",
    KE: "\u{1F1F0}\u{1F1EA}",
    CN: "\u{1F1E8}\u{1F1F3}",
  };
  return <span className="text-[12px] leading-none">{m[c]}</span>;
}

import { Link } from "@tanstack/react-router";
import { ActionMenu, TableActionTd, TableActionTh } from "@/components/admin/ActionMenu";
import { TablePagerFooter, useTablePage } from "@/components/admin/TablePager";

export function OrderTable({ rows, dense = false }: { rows: Order[]; dense?: boolean }) {
  const pager = useTablePage(rows);
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
              <th className="px-2 py-2.5 pl-4">Order</th>
              <th className="px-2 py-2.5">Item</th>
              <th className="px-2 py-2.5">Buyer</th>
              <th className="px-2 py-2.5">Seller</th>
              <th className="px-2 py-2.5 text-right">Total</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">Updated</th>
              <TableActionTh />
            </tr>
          </thead>
          <tbody>
            {pager.slice.map((o) => {
              const l = o.itemTitle
                ? { title: o.itemTitle, image: o.itemImage ?? LISTINGS[0]?.image }
                : findListing(o.listingId);
              const displayId = o.id.startsWith("ORD-") ? o.id : `ORD-${o.id.slice(0, 6).toUpperCase()}`;
              return (
                <tr key={o.id} className="border-t hover:bg-black/[0.015] transition" style={{ borderColor: T.border }}>
                  <td className="px-2 py-3 pl-4">
                    <Link to="/admin/orders/$id" params={{ id: o.id }} className="font-bold hover:underline" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>{displayId}</Link>
                    <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>{o.placed}</p>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Thumb src={l.image} alt={l.title} size={dense ? 28 : 32} />
                      <div className="min-w-0">
                        <p className="font-semibold text-[12px] truncate max-w-[220px]" style={{ color: T.ink }}>{l.title}</p>
                        <p className="text-[10.5px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>Qty {o.qty} · {o.payment}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-semibold text-[12px] flex items-center gap-1"><FlagEmoji c={o.buyerCountry} /> {o.buyer}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{o.buyerId}</p>
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-semibold text-[12px] truncate max-w-[140px]">{o.seller}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{o.sellerId}</p>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <p className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtNGN(o.totalNGN)}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{fmtCNY(o.subtotalCNY)}</p>
                  </td>
                  <td className="px-2 py-3">{statusPillOrder(o.status)}</td>
                  <td className="px-2 py-3 text-[11px] tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{o.updated}</td>
                  <TableActionTd>
                    <ActionMenu
                      label={`Actions for order ${displayId}`}
                      items={[
                        {
                          id: "view",
                          label: "View order",
                          onClick: () => {
                            window.location.href = `/admin/orders/${o.id}`;
                          },
                        },
                        ...(o.status !== "cancelled" && o.status !== "delivered" && o.status !== "refunded"
                          ? [
                              {
                                id: "cancel",
                                label: "Cancel order",
                                danger: true,
                                onClick: () => {
                                  window.location.href = `/admin/orders/${o.id}/cancel`;
                                },
                              },
                            ]
                          : []),
                      ]}
                    />
                  </TableActionTd>
                </tr>
              );
            })}
            {!pager.total && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[12px]" style={{ color: T.muted }}>No orders match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagerFooter
        from={pager.from}
        to={pager.to}
        total={pager.total}
        page={pager.page}
        pageCount={pager.pageCount}
        onPrev={() => pager.setPage((p) => Math.max(0, p - 1))}
        onNext={() => pager.setPage((p) => Math.min(pager.pageCount - 1, p + 1))}
      />
    </Card>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">{children}</div>
  );
}

export function FilterChip({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  const className = "h-8 px-3 rounded-lg text-[11.5px] font-medium flex items-center gap-1.5";
  const style = { background: T.surface, border: `1px solid ${T.border}`, color: T.ink };
  const content = (
    <>
      <span style={{ color: T.muted }}>{label}:</span> <span className="font-bold">{value}</span>
    </>
  );
  if (!onClick) {
    return (
      <span className={className} style={style}>
        {content}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} style={style}>
      {content}
    </button>
  );
}

import { Download } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { FilterSelect, applyAllFilter, uniqueOptions } from "@/components/admin/ListFilters";

export function StatusPage({ status, title, description }: { status: OrderStatus; title: string; description: string }) {
  const [country, setCountry] = useState("__all__");
  const [seller, setSeller] = useState("__all__");
  const [dateRange, setDateRange] = useState("30d");

  const baseRows = ORDERS.filter((o) => o.status === status);
  const filtered = useMemo(() => {
    let list = baseRows;
    list = applyAllFilter(list, country, (r) => r.buyerCountry);
    list = applyAllFilter(list, seller, (r) => r.seller);
    if (dateRange === "7d") list = list.slice(0, Math.max(1, Math.floor(list.length / 4)));
    else if (dateRange === "30d") list = list;
    return list;
  }, [baseRows, country, seller, dateRange]);

  const value = filtered.reduce((s, o) => s + o.totalNGN, 0);
  return (
    <AdminShell
      title={title}
      description={description}
      actions={
        <Link
          to="/admin/orders/export"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <Download className="size-3.5" /> Export
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Count" value={filtered.length} />
        <KPI label="Value" value={fmtNGN(value)} tone={T.success} />
        <KPI label="Avg order" value={filtered.length ? fmtNGN(Math.round(value / filtered.length)) : "—"} />
        <KPI label="Oldest" value={filtered[0]?.placed.split(",")[0] ?? "—"} />
      </div>
      <FilterBar>
        <FilterSelect label="Country" value={country} onChange={setCountry} options={uniqueOptions(baseRows.map((r) => r.buyerCountry), "All")} />
        <FilterSelect label="Seller" value={seller} onChange={setSeller} options={uniqueOptions(baseRows.map((r) => r.seller), "Any")} />
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
      </FilterBar>
      <OrderTable rows={filtered} />
    </AdminShell>
  );
}
