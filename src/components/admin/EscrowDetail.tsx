import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  GitBranch,
  MessageSquare,
  RotateCcw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import { Card, fmtCNY, fmtNGN, LISTINGS, Thumb } from "./Catalog";
import { FlagEmoji } from "./Orders";
import { StatusBadgeCustom } from "./StatusBadge";
import { fromMinor, releaseAdminEscrowMilestone, resolveEscrow, resolveApiFileUrl, type AdminEscrow } from "@/lib/api";
import type { EscrowStatus } from "./Escrow";

type MilestoneView = {
  id: string;
  label: string;
  amountNGN: number;
  pct: number;
  status: "released" | "pending" | "disputed";
  due?: string;
  releasedAt?: string;
};

type EscrowView = {
  displayId: string;
  template: string;
  fundedAt: string;
  uiStatus: EscrowStatus;
  statusLabel: string;
  statusColor: string;
  autoReleaseAt: string;
  daysLeft: number;
  totalNGN: number;
  totalCNY: number;
  heldNGN: number;
  releasedNGN: number;
  refundedNGN: number;
  milestones: MilestoneView[];
  buyerCountry: "NG" | "GH" | "KE";
  buyerId: string;
  sellerId: string;
};

function buyerCountry(phone?: string): "NG" | "GH" | "KE" {
  const p = phone?.replace(/\s+/g, "") ?? "";
  if (p.startsWith("+233") || p.startsWith("233")) return "GH";
  if (p.startsWith("+254") || p.startsWith("254")) return "KE";
  return "NG";
}

function fmtShortDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapEscrow(row: AdminEscrow): EscrowView {
  const currencyCode = (row.currency ?? "CNY").toUpperCase();
  const fx = row.fxCnyNgn ?? 229.04;
  const major = fromMinor(row.amountMinor);
  const totalNGN = currencyCode === "NGN" ? major : Math.round(major * fx);
  const totalCNY = currencyCode === "CNY" ? major : Math.round(major / fx);
  const ms = row.milestones ?? [];
  const releasedMinor = ms
    .filter((m) => String(m.status).toUpperCase() === "RELEASED")
    .reduce((s, m) => s + Number(m.amountMinor ?? 0), 0);
  const releasedNGN =
    currencyCode === "NGN" ? Math.round(releasedMinor / 100) : Math.round((releasedMinor / 100) * fx);
  const raw = row.status.toUpperCase();
  let uiStatus: EscrowStatus = "in_transit";
  if (raw === "DISPUTED") uiStatus = "disputed";
  else if (raw === "COMPLETED" || raw === "RESOLVED") uiStatus = "released";
  else if (raw === "CANCELLED") uiStatus = "refunded";
  else if (raw === "AWAITING_FUNDS" || raw === "DRAFT" || raw === "AWAITING_SELLER") uiStatus = "funded";
  else if (raw === "ACTIVE") {
    uiStatus = ms.some((m) => String(m.status).toUpperCase() === "FUNDED") ? "pending_release" : "in_transit";
  }

  const closed = ["COMPLETED", "CANCELLED", "RESOLVED"].includes(raw);
  const heldNGN = closed ? 0 : Math.max(0, totalNGN - releasedNGN);
  const refundedNGN = uiStatus === "refunded" ? totalNGN : 0;
  const autoHours = row.autoReleaseHours ?? 24 * 30;
  const releaseAt = new Date(row.createdAt).getTime() + autoHours * 3_600_000;
  const daysLeft = Math.ceil((releaseAt - Date.now()) / 86_400_000);
  const n = ms.length || 1;
  const template = n === 1 ? "Goods · single release" : `Goods · ${n}-milestone`;

  const statusMeta: Record<EscrowStatus, { c: string; label: string }> = {
    funded: { c: T.info, label: "FUNDED" },
    in_transit: { c: "#7C3AED", label: "IN TRANSIT" },
    inspection: { c: T.warn, label: "QC INSPECTION" },
    pending_release: { c: T.warn, label: "PENDING RELEASE" },
    released: { c: T.success, label: "RELEASED" },
    disputed: { c: T.danger, label: "DISPUTED" },
    refunded: { c: T.accent, label: "REFUNDED" },
    expired: { c: T.muted, label: "EXPIRED" },
  };
  const meta = statusMeta[uiStatus];

  return {
    displayId: row.id.startsWith("ESC-") ? row.id : `ESC-${row.id.slice(0, 5).toUpperCase()}`,
    template,
    fundedAt: new Date(row.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    uiStatus,
    statusLabel: meta.label,
    statusColor: meta.c,
    autoReleaseAt: new Date(releaseAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    daysLeft,
    totalNGN,
    totalCNY,
    heldNGN,
    releasedNGN,
    refundedNGN,
    milestones: ms.map((m, i) => {
      const amountNGN =
        currencyCode === "NGN"
          ? Math.round(Number(m.amountMinor ?? 0) / 100)
          : Math.round((Number(m.amountMinor ?? 0) / 100) * fx);
      const pct = totalNGN > 0 ? Math.round((amountNGN / totalNGN) * 100) : Math.round(100 / n);
      const st = String(m.status).toUpperCase();
      return {
        id: m.id,
        label: m.label ?? m.title ?? `Milestone ${i + 1}`,
        amountNGN,
        pct,
        status: st === "RELEASED" ? "released" : st === "DISPUTED" ? "disputed" : "pending",
        due: st === "PENDING" && m.releaseRequestedAt ? `requested ${fmtShortDate(m.releaseRequestedAt)}` : undefined,
        releasedAt:
          st === "RELEASED"
            ? `released ${fmtShortDate(m.releaseRequestedAt) ?? fmtShortDate(row.createdAt) ?? "—"}`
            : undefined,
      };
    }),
    buyerCountry: buyerCountry(row.buyer?.phone),
    buyerId: `USR-${(row.buyer?.id ?? row.id).slice(0, 5).toUpperCase()}`,
    sellerId: `SLR-${(row.seller?.id ?? "0000").slice(0, 4).toUpperCase()}`,
  };
}

function SideCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
        {label}
      </p>
      {children}
    </Card>
  );
}

export function EscrowDetailView({
  row,
  busy,
  onReload,
}: {
  row: AdminEscrow;
  busy: boolean;
  onReload: () => Promise<void>;
}) {
  const view = mapEscrow(row);
  const order = row.order;
  const firstItem = order?.items?.[0];
  const productTitle = firstItem?.title ?? firstItem?.product?.title ?? row.title ?? "Order item";
  const productImage = firstItem?.product?.imageUrl
    ? resolveApiFileUrl(firstItem.product.imageUrl)
    : LISTINGS[0]?.image;
  const listingId = firstItem?.product?.id
    ? `LST-${firstItem.product.id.slice(0, 5).toUpperCase()}`
    : "LST-90412";
  const orderDisplayId = order?.id
    ? order.id.startsWith("ORD-")
      ? order.id
      : `ORD-${order.id.slice(0, 6).toUpperCase()}`
    : row.orderId ?? "—";

  const releaseMilestone = async (milestoneId: string) => {
    try {
      await releaseAdminEscrowMilestone(row.id, milestoneId);
      toast.success("Milestone released");
      await onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Release failed");
    }
  };

  const resolve = async (outcome: string, label: string) => {
    try {
      await resolveEscrow(row.id, outcome);
      toast.success(label);
      await onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  const releaseNext = async () => {
    const next = view.milestones.find((m) => m.status === "pending");
    if (!next) {
      toast.info("No pending milestones to release");
      return;
    }
    await releaseMilestone(next.id);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: T.ink }}>
            Escrow {view.displayId}
          </h1>
          <p className="mt-1 text-[12.5px]" style={{ color: T.sub }}>
            {view.template} · funded {view.fundedAt}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/escrow"
            className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            <ArrowLeft className="size-3.5" /> Back
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void releaseNext()}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: T.navy }}
          >
            <Shield className="size-3.5" /> Release funds
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Contract status
                </p>
                <div className="mt-2">
                  <StatusBadgeCustom color={view.statusColor} label={view.statusLabel} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Auto-release
                </p>
                <p className="text-[12px] font-semibold mt-1" style={{ color: T.ink }}>
                  {view.autoReleaseAt}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: T.sub }}>
                  {view.daysLeft > 0 ? `${view.daysLeft} days left` : view.daysLeft === 0 ? "Today" : "Expired"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
              {[
                { label: "Total", value: fmtNGN(view.totalNGN), sub: fmtCNY(view.totalCNY), tone: T.ink },
                { label: "Held", value: fmtNGN(view.heldNGN), tone: T.accent },
                { label: "Released", value: fmtNGN(view.releasedNGN), tone: T.success },
                { label: "Refunded", value: fmtNGN(view.refundedNGN), tone: T.danger },
              ].map((k) => (
                <div key={k.label}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                    {k.label}
                  </p>
                  <p className="text-[16px] font-bold tabular-nums mt-1" style={{ color: k.tone, fontFamily: "'JetBrains Mono', monospace" }}>
                    {k.value}
                  </p>
                  {k.sub ? (
                    <p className="text-[10px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {k.sub}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <Card padded={false}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                Milestones
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: T.border }}>
              {view.milestones.map((m, i) => (
                <div key={m.id} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className="size-7 rounded-full grid place-items-center shrink-0 text-[11px] font-bold"
                    style={{
                      background: m.status === "released" ? T.navy : T.bg,
                      border: `1.5px solid ${m.status === "released" ? T.navy : T.border}`,
                      color: m.status === "released" ? "#fff" : T.muted,
                    }}
                  >
                    {m.status === "released" ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold" style={{ color: T.ink }}>
                      {m.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                      {m.pct}% · {m.releasedAt ?? m.due ?? "Pending"}
                    </p>
                  </div>
                  <p className="text-[12px] font-bold tabular-nums shrink-0 hidden sm:block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtNGN(m.amountNGN)}
                  </p>
                  {m.status === "pending" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void releaseMilestone(m.id)}
                      className="h-8 px-3 rounded-lg text-[11px] font-bold text-white shrink-0 disabled:opacity-60"
                      style={{ background: T.navy }}
                    >
                      Release
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold shrink-0" style={{ color: T.success }}>
                      Released
                    </span>
                  )}
                </div>
              ))}
              {!view.milestones.length ? (
                <p className="px-4 py-6 text-center text-[12px]" style={{ color: T.muted }}>
                  Single-release escrow — use Release funds above.
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
              Manual overrides — requires 2nd approver
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void resolve("RELEASE_TO_SELLER", "Release all requested")}
                className="h-10 px-3 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{ background: `${T.success}14`, color: T.success, border: `1px solid ${T.success}33` }}
              >
                <Shield className="size-3.5" /> Release all ({fmtNGN(view.heldNGN)})
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void resolve("REFUND_TO_BUYER", "Refund all requested")}
                className="h-10 px-3 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{ background: `${T.danger}12`, color: T.danger, border: `1px solid ${T.danger}30` }}
              >
                <RotateCcw className="size-3.5" /> Refund all
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void resolve("SPLIT", "Split decision recorded")}
                className="h-10 px-3 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{ background: `${T.info}12`, color: T.info, border: `1px solid ${T.info}30` }}
              >
                <GitBranch className="size-3.5" /> Split decision
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {order ? (
            <SideCard label="Order">
              <Link
                to="/admin/orders/$id"
                params={{ id: order.id }}
                className="text-[13px] font-bold tabular-nums hover:underline"
                style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {orderDisplayId}
              </Link>
              <div className="mt-3 flex gap-2.5">
                <Thumb src={productImage} alt={productTitle} size={44} />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold leading-snug" style={{ color: T.ink }}>
                    {productTitle}
                  </p>
                  <p className="text-[10.5px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {listingId}
                  </p>
                </div>
              </div>
            </SideCard>
          ) : null}

          {row.buyer ? (
            <SideCard label="Buyer">
              <p className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: T.ink }}>
                <FlagEmoji c={view.buyerCountry} /> {row.buyer.name}
              </p>
              <Link
                to="/admin/users/$id"
                params={{ id: row.buyer.id }}
                className="text-[11px] tabular-nums mt-1 inline-block hover:underline"
                style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {view.buyerId}
              </Link>
            </SideCard>
          ) : null}

          {row.seller ? (
            <SideCard label="Seller">
              <p className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: T.ink }}>
                <FlagEmoji c="CN" /> {row.seller.name}
              </p>
              <Link
                to="/admin/users/$id"
                params={{ id: row.seller.id }}
                className="text-[11px] tabular-nums mt-1 inline-block hover:underline"
                style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {view.sellerId}
              </Link>
            </SideCard>
          ) : null}

          <SideCard label="Quick actions">
            <div className="space-y-2">
              {order ? (
                <Link
                  to="/admin/orders/$id/notes"
                  params={{ id: order.id }}
                  className="w-full h-9 px-3 rounded-lg text-[11.5px] font-semibold flex items-center gap-2"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <MessageSquare className="size-3.5" /> Add internal note
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full h-9 px-3 rounded-lg text-[11.5px] font-semibold flex items-center gap-2 opacity-50"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <MessageSquare className="size-3.5" /> Add internal note
                </button>
              )}
              <button
                type="button"
                className="w-full h-9 px-3 rounded-lg text-[11.5px] font-semibold flex items-center gap-2"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                onClick={() => {
                  const doc = row.documents?.[0];
                  if (doc?.url) window.open(resolveApiFileUrl(doc.url), "_blank");
                  else toast.info("No contract document on file yet");
                }}
              >
                <Download className="size-3.5" /> Download contract
              </button>
              {(row.documents?.length ?? 0) > 0 ? (
                <div className="pt-2 flex items-center gap-2 text-[11px]" style={{ color: T.sub }}>
                  <FileText className="size-3.5" />
                  {row.documents!.length} document{row.documents!.length === 1 ? "" : "s"} on file
                </div>
              ) : null}
            </div>
          </SideCard>
        </div>
      </div>
    </>
  );
}
