import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  History,
  Pause,
  Pencil,
  ShoppingCart,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import { Pill, flaggedPill } from "./UserProfile";
import { StatusBadge, StatusBadgeFromRaw, formatStatusLabel } from "./StatusBadge";
import { fmtMoney, fromMinor, resolveApiFileUrl, type AdminProduct, type AdminProductStats } from "@/lib/api";
import { fmtCNY, fmtNGN } from "./Catalog";

const WEB_BASE = import.meta.env.VITE_WEB_URL ?? import.meta.env.VITE_API_URL ?? "https://magnetpay.amctraders.online";

export type ListingCatalogStatus = "active" | "pending" | "reported" | "draft" | "delisted";

const CNY_NGN_RATE = 229.04;

export function listingCatalogStatus(product: AdminProduct): ListingCatalogStatus {
  if (product.active) return "active";
  const flagged = (product.reviews ?? []).some((r) => r.rating <= 2);
  if (flagged) return "reported";
  return "pending";
}

export function listingRefId(id: string) {
  return `LST-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

export function sellerRefId(id: string) {
  return `SLR-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

function copyText(label: string, value: string) {
  void navigator.clipboard.writeText(value).then(
    () => toast.success(`${label} copied`),
    () => toast.error("Could not copy"),
  );
}

function productImage(product: AdminProduct) {
  if (product.imageUrl) return resolveApiFileUrl(product.imageUrl);
  const media = product.media?.[0]?.url;
  if (media) return resolveApiFileUrl(media);
  const variant = product.variants?.find((v) => v.imageUrl)?.imageUrl;
  return variant ? resolveApiFileUrl(variant) : "";
}

function primarySku(product: AdminProduct) {
  return product.variants?.find((v) => v.sku)?.sku ?? "—";
}

function brandLabel(product: AdminProduct) {
  if (product.brand?.name) return product.brand.name;
  const storeName = product.store?.name ?? "";
  const words = storeName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return words[words.length - 1];
  return storeName || "—";
}

function categoryLabel(product: AdminProduct) {
  return product.category?.name ?? "Uncategorized";
}

function priceBlock(product: AdminProduct) {
  const major = fromMinor(product.priceMinor);
  const currency = product.currency?.toUpperCase() ?? "CNY";

  if (currency === "CNY") {
    const ngn = Math.round(major * CNY_NGN_RATE);
    return (
      <p className="mt-3 text-[22px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {fmtCNY(major)}{" "}
        <span className="text-[14px] font-semibold" style={{ color: T.muted }}>
          ≈ {fmtNGN(ngn)}
        </span>
      </p>
    );
  }

  return (
    <p className="mt-3 text-[22px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {fmtMoney(currency, product.priceMinor)}
    </p>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function listingMetrics(product: AdminProduct, stats?: AdminProductStats | null) {
  const orders = stats?.orders30d ?? product._count?.orderItems ?? 0;
  const views = stats?.views30d ?? 0;
  const rating = stats?.rating ?? product.rating;
  const conv =
    stats?.conversionRate != null
      ? `${stats.conversionRate.toFixed(2)}%`
      : views > 0 && orders > 0
        ? `${((orders / views) * 100).toFixed(2)}%`
        : "0.00%";

  return [
    { I: Eye, label: "30D views", val: views > 0 ? views.toLocaleString("en-US") : "0", tone: T.navy },
    { I: ShoppingCart, label: "30D orders", val: orders > 0 ? orders.toLocaleString("en-US") : "0", tone: T.info },
    { I: TrendingUp, label: "Conv. rate", val: conv, tone: T.accent },
    { I: Star, label: "Rating", val: rating != null ? rating.toFixed(1) : "—", tone: T.success },
  ];
}

export function ListingPageActions({
  id,
  active = "overview",
}: {
  id: string;
  active?: "overview" | "history" | "edit";
}) {
  return (
    <>
      <Link
        to="/admin/listings/$id/history"
        params={{ id }}
        className="h-9 px-3 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5"
        style={{
          background: active === "history" ? `${T.navy}10` : T.surface,
          border: `1px solid ${active === "history" ? T.navy : T.border}`,
          color: active === "history" ? T.navy : T.ink,
        }}
      >
        <History className="size-3.5" strokeWidth={2.2} /> History
      </Link>
      <Link
        to="/admin/listings/$id/edit"
        params={{ id }}
        className="h-9 px-3 rounded-lg text-[12px] font-bold text-white inline-flex items-center gap-1.5"
        style={{ background: active === "edit" ? T.accent : T.navy }}
      >
        <Pencil className="size-3.5" strokeWidth={2.2} /> Edit
      </Link>
    </>
  );
}

export function ListingHeroCard({ product, stats }: { product: AdminProduct; stats?: AdminProductStats | null }) {
  const status = listingCatalogStatus(product);
  const img = productImage(product);
  const metrics = listingMetrics(product, stats);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 flex gap-4">
        {img ? (
          <Thumb src={img} alt={product.title} size={112} />
        ) : (
          <div
            className="size-28 rounded-xl grid place-items-center text-[11px] shrink-0"
            style={{ background: T.bg, color: T.muted, border: `1px solid ${T.border}` }}
          >
            No image
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {statusPillCatalog(status)}
            {status === "reported" ? flaggedPill() : null}
            <span
              className="text-[11px] tabular-nums font-semibold"
              style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {listingRefId(product.id)}
            </span>
            <span style={{ color: T.muted }}>·</span>
            <span
              className="text-[11px] tabular-nums font-semibold"
              style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {primarySku(product)}
            </span>
          </div>

          <h2 className="mt-2 text-[17px] font-bold leading-snug">{product.title}</h2>

          <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
            {categoryLabel(product)} · Brand{" "}
            <span className="font-semibold" style={{ color: T.ink }}>
              {brandLabel(product)}
            </span>
          </p>

          {priceBlock(product)}
        </div>
      </div>

      <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg px-3 py-2.5"
            style={{ background: T.bg, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-1.5">
              <m.I className="size-3.5" strokeWidth={2.2} style={{ color: m.tone }} />
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                {m.label}
              </p>
            </div>
            <p
              className="mt-1.5 text-[17px] font-bold tabular-nums leading-none"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}
            >
              {m.val}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ListingSidebar({
  product,
  busy,
  onModerate,
  onReport,
}: {
  product: AdminProduct;
  busy?: boolean;
  onModerate?: (status: "APPROVED" | "HIDDEN" | "REJECTED") => void;
  onReport?: () => void;
}) {
  const store = product.store;

  return (
    <div className="space-y-3">
      {store ? (
        <Card>
          <SectionLabel>Seller</SectionLabel>
          <Link
            to="/admin/sellers/$id"
            params={{ id: store.id }}
            className="mt-2 block text-[14px] font-bold hover:underline"
            style={{ color: T.ink }}
          >
            {store.name}
          </Link>
          <button
            type="button"
            onClick={() => copyText("Seller ID", store.id)}
            className="mt-1 text-[11px] tabular-nums inline-flex items-center gap-1 hover:opacity-80"
            style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {sellerRefId(store.id)}
            <Copy className="size-3" strokeWidth={2.2} />
          </button>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {store.verified ? <Pill tone="success">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
            {store.verified && (product.rating ?? 0) >= 4.5 ? <Pill tone="info">Gold tier</Pill> : null}
          </div>
        </Card>
      ) : null}

      <Card>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <QuickAction
            I={ExternalLink}
            label="View public"
            onClick={() => window.open(`${WEB_BASE}/market/product/${product.id}`, "_blank", "noopener,noreferrer")}
          />
          <QuickAction
            I={Pause}
            label="Pause"
            disabled={busy || !product.active || !onModerate}
            onClick={() => onModerate?.("HIDDEN")}
          />
          <QuickAction
            I={Flag}
            label="Report"
            disabled={busy || !onReport}
            onClick={() => onReport?.()}
          />
          <QuickAction
            I={Trash2}
            label="Delist"
            danger
            disabled={busy || !onModerate}
            onClick={() => onModerate?.("REJECTED")}
          />
        </div>
        {!product.active && onModerate ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onModerate("APPROVED")}
            className="mt-3 w-full h-9 rounded-lg text-[12px] font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: T.success }}
          >
            <Check className="size-3.5" /> Approve listing
          </button>
        ) : null}
      </Card>

      <Card>
        <SectionLabel>Inventory</SectionLabel>
        <dl className="mt-2 space-y-2.5 text-[12px]">
          <InvRow label="Stock" value={product.stock != null ? product.stock.toLocaleString("en-US") : "—"} />
          <InvRow label="MOQ" value={product.moq ?? "—"} />
          <InvRow label="Updated" value={timeAgo(product.updatedAt ?? product.createdAt)} />
        </dl>
      </Card>
    </div>
  );
}

function QuickAction({
  I,
  label,
  onClick,
  disabled,
  danger,
}: {
  I: typeof ExternalLink;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-10 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
      style={{
        background: T.surface,
        border: `1px solid ${danger ? `${T.danger}40` : T.border}`,
        color: danger ? T.danger : T.ink,
      }}
    >
      <I className="size-3.5" strokeWidth={2.2} /> {label}
    </button>
  );
}

function InvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt style={{ color: T.muted }}>{label}</dt>
      <dd className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </dd>
    </div>
  );
}

/** @deprecated Use ListingHeroCard + ListingPageActions — kept for history/edit sub-routes */
export function ListingHeader({
  product,
  busy,
  onModerate,
  onReport,
}: {
  product: AdminProduct;
  busy?: boolean;
  onModerate?: (status: "APPROVED" | "HIDDEN" | "REJECTED") => void;
  onReport?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <ListingHeroCard product={product} />
      </div>
      <ListingSidebar product={product} busy={busy} onModerate={onModerate} onReport={onReport} />
    </div>
  );
}

export function ListingModerationPanel({ product }: { product: AdminProduct }) {
  const status = listingCatalogStatus(product);
  if (status === "active") return null;

  const flaggedReview = (product.reviews ?? []).find((r) => r.rating <= 2);
  const reason =
    status === "reported" && flaggedReview
      ? `Low rating review: ${(flaggedReview.comment ?? flaggedReview.body)?.slice(0, 80) ?? "Flagged content"}`
      : status === "pending"
        ? "Awaiting moderation approval"
        : "Listing hidden from marketplace";

  return (
    <div className="mt-4 rounded-xl overflow-hidden" style={{ borderLeft: `4px solid ${status === "reported" ? T.danger : T.warn}` }}>
      <Card>
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" style={{ color: status === "reported" ? T.danger : T.warn }} />
          <div>
            <p className="text-[12px] font-bold">Moderation</p>
            <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
              {reason}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ListingOverview({
  product,
  stats,
  busy,
  onModerate,
  onReport,
}: {
  product: AdminProduct;
  stats?: AdminProductStats | null;
  busy?: boolean;
  onModerate?: (status: "APPROVED" | "HIDDEN" | "REJECTED") => void;
  onReport?: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ListingHeroCard product={product} stats={stats} />

          <Card>
            <SectionLabel>Description</SectionLabel>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: T.sub }}>
              {product.description?.trim() || "No description provided."}
            </p>
          </Card>

          {(product.variants?.length ?? 0) > 0 ? (
            <Card padded={false}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
                <p className="text-[12px] font-bold">Variants</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
                      <th className="px-4 py-2">SKU</th>
                      <th className="px-2 py-2">Options</th>
                      <th className="px-2 py-2 text-right">Price</th>
                      <th className="px-2 py-2 text-right">Stock</th>
                      <th className="px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants!.map((v) => (
                      <tr key={v.id} className="border-t" style={{ borderColor: T.border }}>
                        <td className="px-4 py-2.5 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {v.sku ?? "—"}
                        </td>
                        <td className="px-2 py-2.5" style={{ color: T.sub }}>
                          {v.options ? JSON.stringify(v.options) : "—"}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {fmtMoney(product.currency, v.priceMinor)}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {v.stock ?? "—"}
                        </td>
                        <td className="px-2 py-2.5">
                          <Pill tone={v.active ? "success" : "neutral"}>{v.active ? "Active" : "Off"}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          <ListingReviews product={product} />
          <ListingModerationPanel product={product} />
        </div>

        <ListingSidebar product={product} busy={busy} onModerate={onModerate} onReport={onReport} />
      </div>
    </>
  );
}

export function ListingReviews({ product }: { product: AdminProduct }) {
  const reviews = product.reviews ?? [];
  return (
    <Card padded={false}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
        <p className="text-[12px] font-bold">Reviews ({product._count?.reviews ?? reviews.length})</p>
      </div>
      {reviews.length ? (
        reviews.map((r, i) => (
          <div
            key={r.id}
            className="px-4 py-3 text-[12px]"
            style={{ borderBottom: i < reviews.length - 1 ? `1px solid ${T.border}` : "none" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{r.user?.name ?? "Buyer"}</span>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.success }}>
                ★ {r.rating}
              </span>
            </div>
            {(r.comment ?? r.body) ? (
              <p className="mt-1" style={{ color: T.sub }}>
                {r.comment ?? r.body}
              </p>
            ) : null}
            <p className="mt-1 text-[10.5px]" style={{ color: T.muted }}>
              {new Date(r.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
          No reviews yet.
        </p>
      )}
    </Card>
  );
}
