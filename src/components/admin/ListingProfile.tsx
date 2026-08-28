import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ChevronLeft, Copy, EyeOff, Package, Star, Store } from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import { DetailTabNav } from "./DetailTabNav";
import { Pill, flaggedPill } from "./UserProfile";
import { Card, SectionLabel, Thumb, statusPillCatalog } from "./Catalog";
import { fmtMoney, resolveApiFileUrl, type AdminProduct } from "@/lib/api";

export type ListingCatalogStatus = "active" | "pending" | "reported" | "draft" | "delisted";

export function listingCatalogStatus(product: AdminProduct): ListingCatalogStatus {
  if (product.active) return "active";
  const flagged = (product.reviews ?? []).some((r) => r.rating <= 2);
  if (flagged) return "reported";
  return "pending";
}

function copyId(id: string) {
  void navigator.clipboard.writeText(id).then(
    () => toast.success("Listing ID copied"),
    () => toast.error("Could not copy"),
  );
}

function productImages(product: AdminProduct) {
  const urls: string[] = [];
  if (product.imageUrl) urls.push(resolveApiFileUrl(product.imageUrl));
  for (const m of product.media ?? []) {
    const u = resolveApiFileUrl(m.url);
    if (!urls.includes(u)) urls.push(u);
  }
  for (const v of product.variants ?? []) {
    if (v.imageUrl) {
      const u = resolveApiFileUrl(v.imageUrl);
      if (!urls.includes(u)) urls.push(u);
    }
  }
  return urls;
}

function primarySku(product: AdminProduct) {
  return product.variants?.find((v) => v.sku)?.sku ?? "—";
}

function leadTimeLabel(product: AdminProduct) {
  const min = product.leadTimeMin;
  const max = product.leadTimeMax;
  if (min != null && max != null) return `${min}–${max} days`;
  if (min != null) return `${min}+ days`;
  if (max != null) return `≤${max} days`;
  return "—";
}

function specStrip(product: AdminProduct) {
  const parts = [
    leadTimeLabel(product) !== "—" ? `Lead ${leadTimeLabel(product)}` : null,
    product.originHub ? `${product.originHub} hub` : null,
    product.packagingType ?? null,
    product.cbmPerUnit != null ? `${product.cbmPerUnit} CBM` : null,
    product.weightKgPerUnit != null ? `${product.weightKgPerUnit} kg` : null,
    product.defaultIncoterm ?? null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No shipping specs";
}

const LISTING_TABS = [
  { to: "/admin/listings/$id/", label: "Overview", exact: true },
  { to: "/admin/listings/$id/history", label: "History" },
  { to: "/admin/listings/$id/edit", label: "Edit" },
] as const;

export function ListingTabNav({ id }: { id: string }) {
  return <DetailTabNav tabs={[...LISTING_TABS]} params={{ id }} />;
}

export function ListingHeader({
  product,
  busy,
  onModerate,
}: {
  product: AdminProduct;
  busy?: boolean;
  onModerate?: (status: "APPROVED" | "HIDDEN" | "REJECTED") => void;
}) {
  const status = listingCatalogStatus(product);
  const images = productImages(product);
  const cat = product.category?.name ?? "Uncategorized";

  return (
    <>
      <Link
        to="/admin/listings"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3"
        style={{ color: T.sub }}
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> All listings
      </Link>

      <div
        className="rounded-xl p-4 flex flex-col md:flex-row gap-4"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex gap-2 shrink-0 overflow-x-auto">
          {images.length ? (
            images.slice(0, 4).map((src, i) => (
              <Thumb key={i} src={src} alt={product.title} size={i === 0 ? 96 : 72} />
            ))
          ) : (
            <div
              className="size-24 rounded-lg grid place-items-center text-[11px] shrink-0"
              style={{ background: T.bg, color: T.muted, border: `1px solid ${T.border}` }}
            >
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-bold leading-tight">{product.title}</h2>
                {statusPillCatalog(status)}
                {status === "reported" ? flaggedPill() : null}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
                <span
                  className="tabular-nums font-semibold inline-flex items-center gap-1"
                  style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {product.id}
                  <button type="button" aria-label="Copy ID" className="opacity-60 hover:opacity-100" onClick={() => copyId(product.id)}>
                    <Copy className="size-3" strokeWidth={2.2} />
                  </button>
                </span>
                <span>·</span>
                <span>{cat}</span>
                <span>·</span>
                <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  SKU {primarySku(product)}
                </span>
              </div>
              <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(product.currency, product.priceMinor)}
              </p>
              <p className="mt-1 text-[11.5px]" style={{ color: T.muted }}>
                {specStrip(product)}
              </p>
            </div>

            {onModerate ? (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {!product.active ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onModerate("APPROVED")}
                    className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: T.success }}
                  >
                    <Check className="size-3.5" /> Approve
                  </button>
                ) : null}
                {product.active ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onModerate("HIDDEN")}
                    className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.warn }}
                  >
                    <EyeOff className="size-3.5" /> Hide
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ListingTabNav id={product.id} />
    </>
  );
}

export function ListingKPIs({ product }: { product: AdminProduct }) {
  const items = [
    { I: Package, label: "Stock", val: product.stock != null ? String(product.stock) : "—", tone: T.navy },
    { I: Package, label: "MOQ", val: product.moq ?? "—", tone: T.info },
    { I: Star, label: "Rating", val: product.rating != null ? product.rating.toFixed(1) : "—", tone: T.success },
    { I: Package, label: "Orders", val: product._count?.orderItems != null ? String(product._count.orderItems) : "—", tone: T.accent },
    { I: Package, label: "Views 30d", val: "—", tone: T.muted },
  ];

  return (
    <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
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
          <p className="mt-2 text-[18px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {s.val}
          </p>
        </div>
      ))}
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

export function ListingOverview({ product }: { product: AdminProduct }) {
  const store = product.store;

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
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
      </div>

      <div className="space-y-4">
        {store ? (
          <Card>
            <SectionLabel>Store</SectionLabel>
            <div className="mt-2 flex items-center gap-2.5">
              <div className="size-9 rounded-lg grid place-items-center" style={{ background: `${T.navy}10`, color: T.navy }}>
                <Store className="size-4" />
              </div>
              <div className="min-w-0">
                <Link
                  to="/admin/sellers/$id"
                  params={{ id: store.id }}
                  className="font-semibold text-[13px] hover:underline block truncate"
                  style={{ color: T.navy }}
                >
                  {store.name}
                </Link>
                {store.verified ? <Pill tone="success">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
              </div>
            </div>
          </Card>
        ) : null}

        <Card>
          <SectionLabel>Catalog</SectionLabel>
          <dl className="mt-2 space-y-2 text-[12px]">
            <KVRow label="Category" value={product.category?.name ?? "—"} />
            <KVRow label="Incoterm" value={product.defaultIncoterm ?? "—"} />
            <KVRow label="Packaging" value={product.packagingType ?? "—"} />
            <KVRow label="Origin hub" value={product.originHub ?? "—"} />
            <KVRow label="Created" value={new Date(product.createdAt).toLocaleString()} />
          </dl>
        </Card>

        <ListingModerationPanel product={product} />
      </div>
    </div>
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

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt style={{ color: T.muted }}>{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
