import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  Lock,
  MessageSquare,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import { DetailTabNav } from "./DetailTabNav";
import { Card, fmtCNY, fmtNGN, Thumb } from "./Catalog";
import { FlagEmoji, statusPillOrder, STATUS_META, type OrderStatus } from "./Orders";
import { fromMinor, resolveApiFileUrl } from "@/lib/api";

export type AdminOrderRow = Record<string, unknown> & {
  id: string;
  status: string;
  currency?: string;
  totalMinor?: string | number;
  createdAt?: string;
  updatedAt?: string;
  supplier?: string;
  escrowId?: string | null;
  tracking?: string | null;
  carrier?: string | null;
  shipmentId?: string | null;
  fxCnyNgn?: number;
  platformFeeBps?: number;
  user?: { id: string; name: string; phone?: string };
  _count?: { notes?: number };
  items?: {
    id?: string;
    title?: string;
    qty?: number;
    priceMinor?: string | number;
    productId?: string;
    product?: {
      id?: string;
      title?: string;
      imageUrl?: string | null;
      store?: { id: string; name: string };
      category?: { name: string } | null;
      brand?: { name: string } | null;
    };
  }[];
  escrow?: {
    id: string;
    amountMinor?: string | number;
    currency?: string;
    status?: string;
    seller?: { id: string; name: string };
  } | null;
  shipment?: {
    id: string;
    ref?: string;
    route?: string;
    eta?: string | null;
    status?: string;
  } | null;
};

function str(v: unknown, fallback = "—") {
  if (v == null || v === "") return fallback;
  return String(v);
}

function displayOrderId(id: string) {
  return id.startsWith("ORD-") ? id : `ORD-${id.slice(0, 6).toUpperCase()}`;
}

function buyerCountry(phone?: string): "NG" | "GH" | "KE" {
  const p = phone?.replace(/\s+/g, "") ?? "";
  if (p.startsWith("+233") || p.startsWith("233")) return "GH";
  if (p.startsWith("+254") || p.startsWith("254")) return "KE";
  return "NG";
}

function mapOrderStatus(status: string): OrderStatus {
  const s = status.toLowerCase();
  if (s in STATUS_META) return s as OrderStatus;
  if (["paid", "confirmed", "in_escrow", "shipped"].includes(s)) return s === "shipped" ? "shipped" : "processing";
  if (s === "awaiting_payment" || s === "draft" || s === "pending_payment") return "pending";
  if (s === "delivered" || s === "completed") return "delivered";
  if (s === "cancelled") return "cancelled";
  if (s === "disputed") return "exception";
  return "processing";
}

function formatPlaced(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ORDER_TABS = [
  { to: "/admin/orders/$id/", label: "Overview", exact: true },
  { to: "/admin/orders/$id/notes", label: "Notes" },
  { to: "/admin/orders/$id/cancel", label: "Cancel" },
  { to: "/admin/orders/$id/refund", label: "Refund" },
] as const;

export function OrderTabNav({ id }: { id: string }) {
  return <DetailTabNav tabs={[...ORDER_TABS]} params={{ id }} />;
}

export function toneForOrderStatus(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const mapped = mapOrderStatus(status);
  if (mapped === "delivered") return "success";
  if (mapped === "pending" || mapped === "processing" || mapped === "shipped") return "info";
  if (mapped === "cancelled" || mapped === "refunded" || mapped === "exception") return "danger";
  return "neutral";
}

export function canCancelOrder(status: string) {
  const mapped = mapOrderStatus(status);
  return mapped !== "cancelled" && mapped !== "delivered" && mapped !== "refunded";
}

function orderFinancials(row: AdminOrderRow) {
  const fx = row.fxCnyNgn ?? 229.04;
  const feeBps = row.platformFeeBps ?? 250;
  const items = row.items ?? [];
  const subtotalCNY = items.reduce((s, it) => s + fromMinor(it.priceMinor) * (it.qty ?? 1), 0);
  const subtotalNGN = Math.round(subtotalCNY * fx);
  const totalNGN = fromMinor(row.totalMinor);
  const shippingNGN = Math.max(0, totalNGN - subtotalNGN);
  const platformFeeNGN = Math.round(((subtotalNGN + shippingNGN) * feeBps) / 10_000);
  const buyerTotalNGN = subtotalNGN + shippingNGN;
  return { fx, subtotalCNY, subtotalNGN, shippingNGN, platformFeeNGN, buyerTotalNGN, feeBps };
}

function orderTimeline(row: AdminOrderRow) {
  const created = row.createdAt ? new Date(row.createdAt) : null;
  const status = mapOrderStatus(str(row.status));
  const steps: { label: string; detail: string; done: boolean; active?: boolean }[] = [
    { label: "Order placed", detail: formatPlaced(row.createdAt), done: true },
    { label: "Payment captured", detail: created ? "+8 min" : "—", done: status !== "pending" },
    { label: "Funds escrowed", detail: created ? "+9 min" : "—", done: ["processing", "shipped", "delivered"].includes(status) },
    {
      label: "Shipped",
      detail: row.shipment?.eta ? formatShortDate(row.updatedAt) : "Pending",
      done: ["shipped", "delivered"].includes(status),
      active: status === "shipped",
    },
  ];
  return steps;
}

function SideCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
          {label}
        </p>
        {icon}
      </div>
      {children}
    </Card>
  );
}

export function OrderDetailView({
  row,
  onCancel,
  busy,
}: {
  row: AdminOrderRow;
  onCancel?: () => void;
  busy?: boolean;
}) {
  const mapped = mapOrderStatus(str(row.status));
  const displayId = displayOrderId(row.id);
  const user = row.user;
  const firstItem = row.items?.[0];
  const product = firstItem?.product;
  const sellerName = product?.store?.name ?? str(row.supplier, "Seller");
  const sellerId = product?.store?.id ? `SLR-${product.store.id.slice(0, 4).toUpperCase()}` : "SLR-0000";
  const qty = firstItem?.qty ?? row.items?.reduce((s, i) => s + (i.qty ?? 0), 0) ?? 1;
  const title = str(firstItem?.title, str(product?.title, "Order item"));
  const notesCount = row._count?.notes ?? 0;
  const fin = orderFinancials(row);
  const timeline = orderTimeline(row);
  const listingId = product?.id ? `LST-${product.id.slice(0, 5).toUpperCase()}` : "—";
  const sku = product?.brand?.name ? `${product.brand.name.slice(0, 3).toUpperCase()}-SKU` : "SKU";
  const category = product?.category?.name ?? "Marketplace";
  const escrowHeld = row.escrow ? fromMinor(row.escrow.amountMinor) : fin.subtotalNGN;

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold" style={{ color: T.ink }}>
            Order {displayId}
          </h1>
          <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: T.sub }}>
            {title} · {qty} unit{qty === 1 ? "" : "s"} · {user?.name ?? "Buyer"} → {sellerName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {statusPillOrder(mapped)}
          <Link
            to="/admin/orders/$id/notes"
            params={{ id: row.id }}
            className="h-9 px-3 rounded-lg text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Notes ({notesCount})
          </Link>
          <Link
            to="/admin/orders/$id/refund"
            params={{ id: row.id }}
            className="h-9 px-3 rounded-lg text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Refund
          </Link>
          {canCancelOrder(str(row.status)) && onCancel ? (
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: T.danger }}
            >
              <XCircle className="size-3.5" />
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <Card padded={false}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
              <p className="text-[13px] font-bold" style={{ color: T.ink }}>
                Items
              </p>
              <button type="button" className="text-[11.5px] font-semibold" style={{ color: T.sub }}>
                Edit
              </button>
            </div>
            {(row.items ?? []).map((it, i) => {
              const p = it.product ?? {};
              const image = p.imageUrl ? resolveApiFileUrl(p.imageUrl) : undefined;
              const lineCNY = fromMinor(it.priceMinor) * (it.qty ?? 1);
              const unitCNY = fromMinor(it.priceMinor);
              const pid = str(it.productId, str(p.id));
              const rowListing = pid ? `LST-${pid.slice(0, 5).toUpperCase()}` : listingId;
              return (
                <div
                  key={str(it.id, String(i))}
                  className="px-4 py-4 flex gap-3"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <Thumb src={image} alt={str(it.title)} size={56} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold leading-snug" style={{ color: T.ink }}>
                      {str(it.title, str(p.title))}
                    </p>
                    <p className="mt-1 text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {sku} · {rowListing}
                    </p>
                    <p className="text-[11px]" style={{ color: T.sub }}>
                      Sold by {p.store?.name ?? sellerName} · {category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {it.qty ?? 1} × {fmtCNY(unitCNY)}
                    </p>
                    <p className="text-[13px] font-bold tabular-nums mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmtCNY(lineCNY)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="px-4 py-3 space-y-2 text-[12px]">
              {[
                ["Subtotal (CNY)", fmtCNY(fin.subtotalCNY)],
                [`FX → NGN @ ${fin.fx.toFixed(2)}`, fmtNGN(fin.subtotalNGN)],
                ["Shipping", fmtNGN(fin.shippingNGN)],
                [`Platform fee (${(fin.feeBps / 100).toFixed(1)}%)`, fmtNGN(fin.platformFeeNGN)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span style={{ color: T.sub }}>{k}</span>
                  <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {v}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
                <span className="font-bold" style={{ color: T.ink }}>
                  Buyer total
                </span>
                <span className="text-[14px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtNGN(fin.buyerTotalNGN)}
                </span>
              </div>
            </div>
          </Card>

          <Card padded={false}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <p className="text-[13px] font-bold" style={{ color: T.ink }}>
                Timeline
              </p>
            </div>
            <div className="px-4 py-4 space-y-4">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="size-6 rounded-full grid place-items-center shrink-0"
                      style={{
                        background: step.done ? `${T.success}18` : T.bg,
                        border: `1.5px solid ${step.done ? T.success : step.active ? T.info : T.border}`,
                        color: step.done ? T.success : step.active ? T.info : T.muted,
                      }}
                    >
                      {step.done ? <Check className="size-3" strokeWidth={3} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                    </div>
                    {i < timeline.length - 1 ? <div className="w-px flex-1 mt-1" style={{ background: T.border, minHeight: 16 }} /> : null}
                  </div>
                  <div className="pb-1">
                    <p className="text-[12.5px] font-semibold" style={{ color: T.ink }}>
                      {step.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {user ? (
            <SideCard label="Buyer">
              <p className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: T.ink }}>
                <FlagEmoji c={buyerCountry(user.phone)} /> {user.name}
              </p>
              <p className="text-[11px] tabular-nums mt-1" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                USR-{user.id.slice(0, 5).toUpperCase()}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <MessageSquare className="size-3" /> Message
                </button>
                <Link
                  to="/admin/users/$id"
                  params={{ id: user.id }}
                  className="h-8 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <User className="size-3" /> View as
                </Link>
              </div>
            </SideCard>
          ) : null}

          <SideCard label="Seller">
            <p className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: T.ink }}>
              <FlagEmoji c="CN" /> {sellerName}
            </p>
            <p className="text-[11px] tabular-nums mt-1" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              {sellerId}
            </p>
          </SideCard>

          {row.escrowId ? (
            <SideCard label="Escrow" icon={<Lock className="size-3.5" style={{ color: T.info }} />}>
              <Link
                to="/admin/escrow/$id"
                params={{ id: row.escrowId }}
                className="text-[13px] font-bold tabular-nums hover:underline"
                style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}
              >
                ESC-{row.escrowId.slice(0, 5).toUpperCase()}
              </Link>
              <p className="text-[12px] mt-1 tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                Held: {fmtNGN(escrowHeld)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg text-[11px] font-bold text-white"
                  style={{ background: T.success }}
                  onClick={() => toast.info("Release flow coming soon")}
                >
                  Release
                </button>
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg text-[11px] font-semibold"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                  onClick={() => toast.info("Hold updated")}
                >
                  Hold
                </button>
              </div>
            </SideCard>
          ) : null}

          {row.shipment || row.tracking ? (
            <SideCard label="Shipment" icon={<Truck className="size-3.5" style={{ color: T.info }} />}>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {row.shipment?.ref ? `SHP-${row.shipment.ref.slice(0, 5).toUpperCase()}` : row.shipmentId ? `SHP-${String(row.shipmentId).slice(0, 5).toUpperCase()}` : "—"}
              </p>
              <p className="text-[12px] mt-1" style={{ color: T.sub }}>
                {row.carrier ?? "Carrier pending"}
              </p>
              {row.tracking ? (
                <p className="text-[11px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {row.tracking}
                </p>
              ) : null}
              {row.shipment?.eta ? (
                <p className="text-[12px] font-bold mt-2" style={{ color: T.ink }}>
                  ETA {row.shipment.eta}
                </p>
              ) : null}
            </SideCard>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** Sub-routes (notes / cancel / refund) — compact header with tabs */
export function OrderHeader({ row, actions }: { row: AdminOrderRow; actions?: React.ReactNode }) {
  const mapped = mapOrderStatus(str(row.status));

  return (
    <>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3"
        style={{ color: T.sub }}
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> All orders
      </Link>

      <div className="rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-bold" style={{ color: T.ink }}>
              Order {displayOrderId(row.id)}
            </h2>
            {statusPillOrder(mapped)}
          </div>
          <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
            {row.user?.name ?? "Buyer"} · {formatPlaced(row.createdAt)}
          </p>
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div> : null}
      </div>

      <OrderTabNav id={row.id} />
    </>
  );
}

/** @deprecated Use OrderDetailView */
export function OrderKPIs({ row }: { row: AdminOrderRow }) {
  void row;
  return null;
}

/** @deprecated Use OrderDetailView */
export function OrderItemsTable({ row }: { row: AdminOrderRow }) {
  void row;
  return null;
}

/** @deprecated Use OrderDetailView */
export function OrderLinkedEntities({ row }: { row: AdminOrderRow }) {
  void row;
  return null;
}
