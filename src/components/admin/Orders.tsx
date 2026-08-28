import { T } from "@/components/admin/AdminShell";
import { LISTINGS, fmtCNY, fmtNGN, Thumb, Card, Pill } from "@/components/admin/Catalog";
import type { ReactNode } from "react";

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
  currency: "CNYΓåÆNGN" | "CNYΓåÆGHS" | "CNYΓåÆKES";
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
  notes?: number;
};

const L = (idx: number) => LISTINGS[idx % LISTINGS.length];

export const ORDERS: Order[] = [
  { id: "ORD-528104", buyer: "Adaeze Okafor", buyerId: "USR-10241", buyerCountry: "NG",
    seller: LISTINGS[0].seller, sellerId: LISTINGS[0].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[0].id, qty: 80, subtotalCNY: 6880, subtotalNGN: 1576000,
    shippingNGN: 42000, totalNGN: 1618000, currency: "CNYΓåÆNGN", payment: "Wallet",
    status: "processing", escrowId: "ESC-77120", shipmentId: "SHP-44120",
    carrier: "MagnetExpress Air", tracking: "MEX1Z9920411NG",
    placed: "Jun 24, 09:14", updated: "12 min ago", eta: "Jul 04", notes: 2 },

  { id: "ORD-528098", buyer: "Tolu Bankole", buyerId: "USR-10182", buyerCountry: "NG",
    seller: LISTINGS[1].seller, sellerId: LISTINGS[1].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[1].id, qty: 24, subtotalCNY: 3408, subtotalNGN: 780600,
    shippingNGN: 28500, totalNGN: 809100, currency: "CNYΓåÆNGN", payment: "Card",
    status: "shipped", escrowId: "ESC-77108", shipmentId: "SHP-44108",
    carrier: "CN-Post Sea", tracking: "CNP552980411NG",
    placed: "Jun 22, 14:02", updated: "1 hr ago", eta: "Jul 09", notes: 0 },

  { id: "ORD-528077", buyer: "Kwame Asante", buyerId: "USR-09812", buyerCountry: "GH",
    seller: LISTINGS[3].seller, sellerId: LISTINGS[3].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[3].id, qty: 12, subtotalCNY: 7344, subtotalNGN: 1683000,
    shippingNGN: 51000, totalNGN: 1734000, currency: "CNYΓåÆGHS", payment: "Bank transfer",
    status: "delivered", escrowId: "ESC-77091", shipmentId: "SHP-44091",
    carrier: "DHL Express", tracking: "DHL44102239GH",
    placed: "Jun 18, 11:42", updated: "2 days ago", eta: "Jun 27", notes: 1 },

  { id: "ORD-528060", buyer: "Ngozi Eze", buyerId: "USR-09701", buyerCountry: "NG",
    seller: LISTINGS[4].seller, sellerId: LISTINGS[4].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[4].id, qty: 2, subtotalCNY: 5680, subtotalNGN: 1302000,
    shippingNGN: 78000, totalNGN: 1380000, currency: "CNYΓåÆNGN", payment: "Wallet",
    status: "exception", escrowId: "ESC-77074", shipmentId: "SHP-44074",
    carrier: "MagnetExpress Sea", tracking: "MEX2X8810044NG",
    placed: "Jun 14, 08:00", updated: "3 hr ago", eta: "Jul 12", notes: 4,
    exception: "Customs hold ΓÇö NCC compliance docs requested" },

  { id: "ORD-528041", buyer: "Femi Adeyemi", buyerId: "USR-09584", buyerCountry: "NG",
    seller: LISTINGS[5].seller, sellerId: LISTINGS[5].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[5].id, qty: 60, subtotalCNY: 3240, subtotalNGN: 742800,
    shippingNGN: 22000, totalNGN: 764800, currency: "CNYΓåÆNGN", payment: "USSD",
    status: "pending", escrowId: "ESC-77055",
    placed: "Jun 28, 06:48", updated: "8 min ago", notes: 0 },

  { id: "ORD-528022", buyer: "Mary Wanjiru", buyerId: "USR-09410", buyerCountry: "KE",
    seller: LISTINGS[6].seller, sellerId: LISTINGS[6].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[6].id, qty: 15, subtotalCNY: 2970, subtotalNGN: 681000,
    shippingNGN: 34000, totalNGN: 715000, currency: "CNYΓåÆKES", payment: "Card",
    status: "delivered", escrowId: "ESC-77036", shipmentId: "SHP-44036",
    carrier: "DHL Express", tracking: "DHL44102241KE",
    placed: "Jun 10, 16:30", updated: "5 days ago", eta: "Jun 22", notes: 0 },

  { id: "ORD-527990", buyer: "Ibrahim Yusuf", buyerId: "USR-09221", buyerCountry: "NG",
    seller: LISTINGS[7].seller, sellerId: LISTINGS[7].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[7].id, qty: 8, subtotalCNY: 2496, subtotalNGN: 572400,
    shippingNGN: 31000, totalNGN: 603400, currency: "CNYΓåÆNGN", payment: "Wallet",
    status: "cancelled", escrowId: "ESC-77011",
    placed: "Jun 20, 10:14", updated: "4 days ago", notes: 1,
    exception: "Cancelled by buyer ΓÇö wrong language variant" },

  { id: "ORD-527964", buyer: "Chiamaka Obi", buyerId: "USR-09080", buyerCountry: "NG",
    seller: LISTINGS[2].seller, sellerId: LISTINGS[2].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[2].id, qty: 100, subtotalCNY: 3800, subtotalNGN: 871000,
    shippingNGN: 38000, totalNGN: 909000, currency: "CNYΓåÆNGN", payment: "Card",
    status: "refunded", escrowId: "ESC-76988", shipmentId: "SHP-43988",
    carrier: "CN-Post Sea", tracking: "CNP552980388NG",
    placed: "May 30, 09:00", updated: "1 wk ago", notes: 3,
    refundedNGN: 909000, exception: "Full refund ΓÇö items damaged on arrival" },

  { id: "ORD-527940", buyer: "Aisha Bello", buyerId: "USR-08902", buyerCountry: "NG",
    seller: LISTINGS[0].seller, sellerId: LISTINGS[0].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[0].id, qty: 200, subtotalCNY: 17200, subtotalNGN: 3940000,
    shippingNGN: 88000, totalNGN: 4028000, currency: "CNYΓåÆNGN", payment: "Bank transfer",
    status: "processing", escrowId: "ESC-76960",
    placed: "Jun 26, 12:48", updated: "44 min ago", notes: 0 },

  { id: "ORD-527918", buyer: "Joy Mensah", buyerId: "USR-08741", buyerCountry: "GH",
    seller: LISTINGS[3].seller, sellerId: LISTINGS[3].sellerId, sellerCountry: "CN",
    listingId: LISTINGS[3].id, qty: 4, subtotalCNY: 2448, subtotalNGN: 561000,
    shippingNGN: 24000, totalNGN: 585000, currency: "CNYΓåÆGHS", payment: "Wallet",
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
  return (
    <span
      className="inline-flex items-center gap-1 px-2 h-5 rounded-md text-[10.5px] font-bold uppercase tracking-wider"
      style={{ background: `${m.c}14`, color: m.c }}
    >
      <span className="size-1.5 rounded-full" style={{ background: m.c }} /> {m.label}
    </span>
  );
}

export function KPI({ label, value, hint, tone = T.ink }: { label: string; value: ReactNode; hint?: string; tone?: string }) {
  return (
    <Card>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>{label}</p>
      <p className="mt-1.5 text-[20px] font-bold tabular-nums" style={{ color: tone, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px]" style={{ color: T.sub }}>{hint}</p>}
    </Card>
  );
}

export function FlagEmoji({ c }: { c: "NG" | "GH" | "KE" | "CN" }) {
  const m = { NG: "≡ƒç│≡ƒç¼", GH: "≡ƒç¼≡ƒç¡", KE: "≡ƒç░≡ƒç¬", CN: "≡ƒç¿≡ƒç│" };
  return <span className="text-[12px] leading-none">{m[c]}</span>;
}

import { Link } from "@tanstack/react-router";
import { demo } from "@/components/admin/useDemoAction";
import { MoreHorizontal } from "lucide-react";

export function OrderTable({ rows, dense = false }: { rows: Order[]; dense?: boolean }) {
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
              <th className="px-4 py-2.5 w-8"><input type="checkbox" onChange={() => demo("Select all on page", "info")} /></th>
              <th className="px-2 py-2.5">Order</th>
              <th className="px-2 py-2.5">Item</th>
              <th className="px-2 py-2.5">Buyer</th>
              <th className="px-2 py-2.5">Seller</th>
              <th className="px-2 py-2.5 text-right">Total</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">Updated</th>
              <th className="px-2 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const l = findListing(o.listingId);
              return (
                <tr key={o.id} className="border-t hover:bg-black/[0.015] transition" style={{ borderColor: T.border }}>
                  <td className="px-4 py-3"><input type="checkbox" onClick={(e) => e.stopPropagation()} onChange={() => demo(`Selected ${o.id}`, "info")} /></td>
                  <td className="px-2 py-3">
                    <Link to="/admin/orders/$id" params={{ id: o.id }} className="font-bold tabular-nums hover:underline" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</Link>
                    <p className="text-[10.5px]" style={{ color: T.muted }}>{o.placed}</p>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Thumb src={l.image} alt={l.title} size={dense ? 28 : 32} />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[220px]" style={{ color: T.ink }}>{l.title}</p>
                        <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>Qty {o.qty} ┬╖ {o.payment}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-medium flex items-center gap-1"><FlagEmoji c={o.buyerCountry} /> {o.buyer}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{o.buyerId}</p>
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-medium truncate max-w-[140px]">{o.seller}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{o.sellerId}</p>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <p className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtNGN(o.totalNGN)}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{fmtCNY(o.subtotalCNY)}</p>
                  </td>
                  <td className="px-2 py-3">{statusPillOrder(o.status)}</td>
                  <td className="px-2 py-3 text-[11px] tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{o.updated}</td>
                  <td className="px-2 py-3">
                    <button onClick={() => demo(`Actions for ${o.id}`, "info")} className="size-7 grid place-items-center rounded-md hover:bg-black/5">
                      <MoreHorizontal className="size-4" style={{ color: T.muted }} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-[12px]" style={{ color: T.muted }}>No orders match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 flex items-center justify-between text-[11px]" style={{ color: T.sub, borderTop: `1px solid ${T.border}` }}>
        <span className="tabular-nums">Showing {rows.length} of {ORDERS.length}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => demo("Previous page", "info")} className="h-7 px-2.5 rounded-md font-medium" style={{ border: `1px solid ${T.border}`, background: T.surface }}>Prev</button>
          <button onClick={() => demo("Next page", "info")} className="h-7 px-2.5 rounded-md font-medium" style={{ border: `1px solid ${T.border}`, background: T.surface }}>Next</button>
        </div>
      </div>
    </Card>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">{children}</div>
  );
}

export function FilterChip({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick ?? (() => demo(`Filter: ${label}`, "info"))}
      className="h-8 px-3 rounded-lg text-[11.5px] font-medium flex items-center gap-1.5"
      style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
    >
      <span style={{ color: T.muted }}>{label}:</span> <span className="font-bold">{value}</span>
    </button>
  );
}

import { Download } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";

export function StatusPage({ status, title, description }: { status: OrderStatus; title: string; description: string }) {
  const rows = ORDERS.filter((o) => o.status === status);
  const value = rows.reduce((s, o) => s + o.totalNGN, 0);
  return (
    <AdminShell
      title={title}
      description={description}
      actions={
        <button onClick={() => demo("Export started", "success")} className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}>
          <Download className="size-3.5" /> Export
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Count" value={rows.length} />
        <KPI label="Value" value={fmtNGN(value)} tone={T.success} />
        <KPI label="Avg order" value={rows.length ? fmtNGN(Math.round(value / rows.length)) : "ΓÇö"} />
        <KPI label="Oldest" value={rows[0]?.placed.split(",")[0] ?? "ΓÇö"} />
      </div>
      <FilterBar>
        <FilterChip label="Currency" value="All" />
        <FilterChip label="Country" value="All" />
        <FilterChip label="Seller" value="Any" />
        <FilterChip label="Date" value="Last 30d" />
      </FilterBar>
      <OrderTable rows={rows} />
    </AdminShell>
  );
}
