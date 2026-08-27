import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Edit3, Star, ShieldCheck, MapPin, Award, Package, MessageCircle, Share2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/storefront/preview")({
  head: () => ({ meta: [{ title: "Storefront preview — Seller" }] }),
  component: StorefrontPreview,
});

const PRODUCTS = [
  { id: "PB-A2", n: "Pump body PB-A2", p: "¥212", s: "412 sold" },
  { id: "CS-7", n: "Coil set CS-7", p: "¥248", s: "188 sold" },
  { id: "B-22", n: "Bearing B-22", p: "¥24", s: "5.4k sold" },
  { id: "MG-9", n: "Magnet MG-9", p: "¥82", s: "720 sold" },
];

function StorefrontPreview() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          {/* Preview chrome */}
          <div className="px-4 pt-12 pb-2 flex items-center justify-between">
            <Link to="/seller/storefront" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${t.info}15`, color: t.info }}>Preview · buyer view</span>
            <Link to="/seller/storefront" className="size-9 grid place-items-center rounded-full text-white" style={{ background: t.accent }}>
              <Edit3 className="size-4" strokeWidth={2.4} />
            </Link>
          </div>

          {/* Banner */}
          <section className="px-4 mt-2">
            <div className="aspect-[16/7] rounded-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.navy}, #1a5c47)` }}>
              <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 80%, ${t.accent}40 0%, transparent 60%)` }} />
            </div>
          </section>

          {/* Identity */}
          <section className="px-4 -mt-8 relative">
            <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: `0 8px 24px -12px ${t.navy}30` }}>
              <div className="size-16 rounded-2xl grid place-items-center shrink-0 text-white text-[16px] font-extrabold" style={{ background: t.navy, border: `3px solid ${t.surface}` }}>HM</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[14px] font-extrabold truncate">Hangzhou Magnetics Co.</p>
                  <ShieldCheck className="size-3.5 shrink-0" strokeWidth={2.6} style={{ color: t.success }} />
                </div>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: t.sub }}>OEM pumps, magnets & bearings · 12 yrs export</p>
                <div className="flex items-center gap-2 mt-1 text-[10.5px]" style={{ color: t.muted }}>
                  <span className="flex items-center gap-0.5"><Star className="size-3" strokeWidth={0} fill={t.accent} />4.86</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><MapPin className="size-3" strokeWidth={2.6} />Hangzhou, CN</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <Pill v="312" l="reviews" />
              <Pill v="1.2k" l="orders" />
              <Pill v="98%" l="reply rate" />
            </div>
          </section>

          {/* CTAs */}
          <section className="px-4 mt-3 grid grid-cols-2 gap-2">
            <Link to="/messages/$id" params={{ id: "t1" }} className="rounded-2xl py-2.5 text-[12px] font-bold text-white flex items-center justify-center gap-1.5" style={{ background: t.accent }}>
              <MessageCircle className="size-3.5" strokeWidth={2.6} /> Chat seller
            </Link>
            <button className="rounded-2xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5" style={{ background: t.surface, color: t.navy, border: `1px solid ${t.border}` }}>
              <Share2 className="size-3.5" strokeWidth={2.6} /> Share shop
            </button>
          </section>

          {/* Tabs */}
          <section className="px-4 mt-4 flex gap-1.5">
            {["Featured", "Pumps", "Bearings", "Magnets", "About"].map((c, i) => (
              <button key={c} className="text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: i === 0 ? t.navy : t.surface, color: i === 0 ? "#fff" : t.ink, border: `1px solid ${i === 0 ? t.navy : t.border}` }}>{c}</button>
            ))}
          </section>

          {/* Product grid */}
          <section className="px-4 mt-3 grid grid-cols-2 gap-2">
            {PRODUCTS.map((p) => (
              <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="aspect-square grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Package className="size-8" strokeWidth={2} />
                </div>
                <div className="p-2.5">
                  <p className="text-[11.5px] font-bold truncate">{p.n}</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <p className="text-[13px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}>{p.p}</p>
                    <p className="text-[9.5px]" style={{ color: t.muted }}>from</p>
                  </div>
                  <p className="text-[9.5px] mt-0.5" style={{ color: t.muted }}>{p.s}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Trust */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Verified</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Award className="size-5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[11px]" style={{ color: t.sub }}>
                <span className="font-bold" style={{ color: t.ink }}>ISO 9001 · CE · BSCI</span> · Business license verified · Factory audit on file
              </p>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Pill({ v, l }: { v: string; l: string }) {
  const t = escrowTheme;
  return (
    <div className="rounded-xl p-2 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <p className="text-[13px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</p>
      <p className="text-[9.5px] mt-0.5" style={{ color: t.muted }}>{l}</p>
    </div>
  );
}
