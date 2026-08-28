import { Link } from "@tanstack/react-router";
import {
  ShieldCheck, Copy, MoreHorizontal, ChevronLeft, Building2, Star, Award, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import { Pill, initials } from "./UserProfile";
import type { AdminSeller } from "@/lib/api";

function copyId(id: string) {
  void navigator.clipboard.writeText(id).then(
    () => toast.success("Store ID copied"),
    () => toast.error("Could not copy"),
  );
}

function tierLabel(verified: boolean, productCount: number) {
  if (verified && productCount >= 50) return "Verified Pro";
  if (verified) return "Verified";
  if (productCount > 0) return "New";
  return "Pending KYB";
}

function tierTone(label: string): "success" | "warn" | "info" | "neutral" {
  if (label === "Verified Pro" || label === "Verified") return "success";
  if (label === "New") return "info";
  return "warn";
}

export function SellerHeader({ seller, tab }: { seller: AdminSeller; tab?: string }) {
  const activeTab = tab ?? "overview";
  const owner = seller.user;
  const productCount = seller._count?.products ?? seller.products?.length ?? 0;
  const tier = tierLabel(seller.verified, productCount);
  const avgRating =
    seller.products?.length
      ? seller.products.reduce((s, p) => s + (p.rating ?? 0), 0) / seller.products.length
      : 0;

  const tabs: { id: string; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Products" },
    { id: "owner", label: "Owner" },
  ];

  return (
    <>
      <Link
        to="/admin/sellers"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3"
        style={{ color: T.sub }}
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> All sellers
      </Link>

      <div
        className="rounded-xl p-4 flex items-start gap-4"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div
          className="size-14 rounded-xl grid place-items-center shrink-0"
          style={{ background: `${T.navy}10`, color: T.navy }}
        >
          {seller.logoUrl ? (
            <img src={seller.logoUrl} alt="" className="size-14 rounded-xl object-cover" />
          ) : (
            <Building2 className="size-6" strokeWidth={2.2} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-bold leading-tight">{seller.name}</h2>
            {seller.verified ? (
              <Pill tone="success">
                <ShieldCheck className="size-2.5" strokeWidth={3} /> Verified
              </Pill>
            ) : (
              <Pill tone="warn">Unverified</Pill>
            )}
            <Pill tone={tierTone(tier)}>
              <Award className="size-2.5" strokeWidth={3} /> {tier}
            </Pill>
            {avgRating > 0 ? (
              <Pill tone="neutral">
                <Star className="size-2.5 fill-current" strokeWidth={2} /> {avgRating.toFixed(1)}
              </Pill>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
            <span
              className="tabular-nums font-semibold inline-flex items-center gap-1"
              style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {seller.id.slice(0, 8)}
              <button type="button" aria-label="Copy ID" className="opacity-60 hover:opacity-100" onClick={() => copyId(seller.id)}>
                <Copy className="size-3" strokeWidth={2.2} />
              </button>
            </span>
            {owner ? (
              <>
                <span>·</span>
                <Link to="/admin/users/$id" params={{ id: owner.id }} className="hover:underline font-semibold" style={{ color: T.navy }}>
                  {owner.name}
                </Link>
                <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{owner.phone}</span>
              </>
            ) : null}
            <span>·</span>
            <span>{productCount} products</span>
            <span>·</span>
            <span>Since {new Date(seller.createdAt).toLocaleDateString()}</span>
          </div>
          {seller.description ? (
            <p className="mt-2 text-[12px] line-clamp-2" style={{ color: T.sub }}>{seller.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {owner ? (
            <Link
              to="/admin/users/$id"
              params={{ id: owner.id }}
              className="h-9 px-3 rounded-lg text-[12px] font-bold text-white inline-flex items-center"
              style={{ background: T.navy }}
            >
              View owner
            </Link>
          ) : null}
          <button
            type="button"
            className="size-9 grid place-items-center rounded-lg"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.sub }}
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(seller.verified
          ? ["Verified license", "Trade Assurance", "Factory audited"]
          : ["Pending verification"]
        ).map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: seller.verified ? `${T.success}10` : `${T.warn}10`,
              color: seller.verified ? T.success : T.warn,
            }}
          >
            <CheckCircle2 className="size-2.5" strokeWidth={3} /> {b}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-1 border-b overflow-x-auto" style={{ borderColor: T.border }}>
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <Link
              key={t.id}
              to="/admin/sellers/$id"
              params={{ id: seller.id }}
              search={{ tab: t.id }}
              className="px-3 h-10 inline-flex items-center text-[12.5px] font-semibold transition relative shrink-0"
              style={{ color: active ? T.ink : T.sub }}
            >
              {t.label}
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-t" style={{ background: T.navy }} />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function sellerInitials(name: string) {
  return initials(name);
}
