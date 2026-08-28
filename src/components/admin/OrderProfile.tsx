import { Link } from "@tanstack/react-router";
import { ChevronLeft, Copy, Package, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import { DetailTabNav } from "./DetailTabNav";
import { Pill, initials } from "./UserProfile";
import { Card } from "./Catalog";
import { statusPillOrder, STATUS_META, type OrderStatus } from "./Orders";
import { fmtMoney } from "@/lib/api";

export type AdminOrderRow = Record<string, unknown> & {
  id: string;
  status: string;
  currency?: string;
  totalMinor?: string | number;
  createdAt?: string;
  supplier?: string;
  escrowId?: string | null;
  tracking?: string | null;
  user?: { id: string; name: string; phone: string };
  items?: {
    id?: string;
    title?: string;
    qty?: number;
    priceMinor?: string | number;
    productId?: string;
    product?: { id?: string; title?: string; imageUrl?: string | null };
  }[];
};

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function copyId(id: string) {
  void navigator.clipboard.writeText(id).then(
    () => toast.success("Order ID copied"),
    () => toast.error("Could not copy"),
  );
}

function mapOrderStatus(status: string): OrderStatus {
  const s = status.toLowerCase();
  if (s in STATUS_META) return s as OrderStatus;
  if (s === "paid" || s === "confirmed") return "processing";
  if (s === "awaiting_payment") return "pending";
  return "processing";
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

export function OrderHeader({ row, actions }: { row: AdminOrderRow; actions?: React.ReactNode }) {
  const user = row.user;
  const currency = str(row.currency, "USD");
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

      <div className="rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {row.id}
            </h2>
            {statusPillOrder(mapped)}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
            <button type="button" onClick={() => copyId(row.id)} className="inline-flex items-center gap-1 opacity-80 hover:opacity-100">
              <Copy className="size-3" /> Copy ID
            </button>
            <span>·</span>
            <span className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
              {fmtMoney(currency, row.totalMinor)}
            </span>
            <span>·</span>
            <span>{row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : "—"}</span>
          </div>
          {user ? (
            <p className="mt-2 text-[12px]">
              Buyer{" "}
              <Link to="/admin/users/$id" params={{ id: user.id }} className="font-semibold hover:underline" style={{ color: T.navy }}>
                {user.name}
              </Link>
              <span className="tabular-nums ml-1" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {user.phone}
              </span>
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div> : null}
      </div>

      <OrderTabNav id={row.id} />
    </>
  );
}

export function OrderKPIs({ row }: { row: AdminOrderRow }) {
  const items = [
    { I: Package, label: "Line items", val: String((row.items ?? []).length), tone: T.navy },
    { I: Wallet, label: "Escrow", val: row.escrowId ? row.escrowId.slice(0, 8) : "—", tone: T.info },
    { I: Truck, label: "Supplier", val: str(row.supplier, "—").slice(0, 12), tone: T.accent },
    { I: Truck, label: "Tracking", val: row.tracking ? str(row.tracking).slice(0, 14) : "—", tone: T.success },
  ];

  return (
    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md grid place-items-center" style={{ background: `${s.tone}14`, color: s.tone }}>
              <s.I className="size-3.5" strokeWidth={2.4} />
            </div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {s.label}
            </p>
          </div>
          <p className="mt-2 text-[16px] font-bold tabular-nums leading-none truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {s.val}
          </p>
        </div>
      ))}
    </div>
  );
}

export function OrderItemsTable({ row }: { row: AdminOrderRow }) {
  const currency = str(row.currency, "USD");
  const items = row.items ?? [];

  return (
    <Card padded={false} className="mt-4">
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <p className="text-[12.5px] font-bold">Items</p>
      </div>
      {items.length ? (
        items.map((it, i) => {
          const product = it.product ?? {};
          const productId = str(it.productId, str(product.id));
          return (
            <div
              key={str(it.id, String(i))}
              className="px-4 py-3 flex items-center justify-between gap-3 text-[12px]"
              style={{ borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{str(it.title, str(product.title))}</p>
                <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {productId ? (
                    <Link to="/admin/listings/$id" params={{ id: productId }} className="hover:underline">
                      {productId.slice(0, 8)}
                    </Link>
                  ) : (
                    "—"
                  )}{" "}
                  · qty {str(it.qty)}
                </p>
              </div>
              <span className="tabular-nums font-bold shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(currency, it.priceMinor)}
              </span>
            </div>
          );
        })
      ) : (
        <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
          No line items.
        </p>
      )}
    </Card>
  );
}

export function OrderLinkedEntities({ row }: { row: AdminOrderRow }) {
  const user = row.user;
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {user ? (
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
            Buyer
          </p>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold" style={{ background: `${T.navy}10`, color: T.navy }}>
              {initials(user.name || "?")}
            </div>
            <div>
              <p className="font-semibold text-[12px]">{user.name}</p>
              <Link to="/admin/users/$id" params={{ id: user.id }} className="text-[11px] tabular-nums hover:underline" style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}>
                {user.id.slice(0, 8)}
              </Link>
            </div>
          </div>
        </Card>
      ) : null}
      {row.escrowId ? (
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
            Escrow
          </p>
          <Link to="/admin/escrow/$id" params={{ id: row.escrowId }} className="font-bold tabular-nums hover:underline text-[13px]" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
            {row.escrowId}
          </Link>
        </Card>
      ) : null}
    </div>
  );
}

export function toneForOrderStatus(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "DELIVERED" || s === "COMPLETED" || s === "PAID") return "success";
  if (s === "PENDING" || s === "PROCESSING" || s === "DRAFT" || s === "SHIPPED") return "warn";
  if (s === "CANCELLED" || s === "REFUNDED" || s === "FAILED") return "danger";
  return "info";
}

export function canCancelOrder(status: string) {
  const s = status.toUpperCase();
  return s !== "CANCELLED" && s !== "DELIVERED" && s !== "REFUNDED";
}
