import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, Bell, Heart, ChevronLeft, ShoppingCart, SlidersHorizontal, ArrowRight,
  Sparkles, Package, ShieldCheck, Star,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { BottomNav } from "@/components/magnetpay/BottomNav";

import promoMachinery from "@/assets/market/promo-machinery.jpg";
import promoShipping from "@/assets/market/promo-shipping.jpg";
import promoVideo from "@/assets/market/promo-video.mp4.asset.json";
import pPump from "@/assets/market/p-pump.jpg";
import pLed from "@/assets/market/p-led.jpg";
import pBags from "@/assets/market/p-bags.jpg";
import pTiles from "@/assets/market/p-tiles.jpg";
import pFittings from "@/assets/market/p-fittings.jpg";
import pMailers from "@/assets/market/p-mailers.jpg";
import pCharger from "@/assets/market/p-charger.jpg";
import pPipes from "@/assets/market/p-pipes.jpg";
import pSolar from "@/assets/market/p-solar.jpg";
import pMotor from "@/assets/market/p-motor.jpg";
import pBoxes from "@/assets/market/p-boxes.jpg";
import cMachinery from "@/assets/market/c-machinery.jpg";
import cApparel from "@/assets/market/c-apparel.jpg";
import cElectronics from "@/assets/market/c-electronics.jpg";
import cBeauty from "@/assets/market/c-beauty.jpg";
import cIndustrial from "@/assets/market/c-industrial.jpg";

export const Route = createFileRoute("/market/")({
  head: () => ({ meta: [{ title: "Marketplace — MagnetPay" }] }),
  component: MarketHome,
});

const t = {
  bg: "var(--mp-bg)",
  surface: "var(--mp-surface)",
  surface2: "var(--mp-surface-2)",
  border: "var(--mp-border)",
  ink: "var(--mp-ink)",
  sub: "var(--mp-sub)",
  muted: "var(--mp-muted)",
  navy: "var(--mp-navy)",
  navy2: "var(--mp-navy-2)",
  accent: "var(--mp-accent)",
  warn: "var(--mp-warn)",
  success: "var(--mp-success)",
  onNavy: "var(--mp-on-navy)",
  onNavySub: "var(--mp-on-navy-sub)",
};

const CATS = [
  { l: "Machinery", img: cMachinery },
  { l: "Apparel", img: cApparel },
  { l: "Electronics", img: cElectronics },
  { l: "Beauty", img: cBeauty },
  { l: "Industrial", img: cIndustrial },
];

// CNY → NGN approx rate (display only)
const CNY_NGN = 215;
const cnyToNgn = (p: string) => {
  const n = parseFloat(p.replace(/[^\d.]/g, ""));
  if (!isFinite(n)) return "";
  const v = Math.round(n * CNY_NGN);
  return "₦" + v.toLocaleString();
};


const RECS = [
  { id: "P-410", img: pPump, t: "Cast-iron pump body PB-A2 · DN50 flanged", p: "¥58", was: "¥84", moq: 50, sold: "1.2k", tag: "Feature", fav: true },
  { id: "P-411", img: pLed, t: "LED panel 600×600 · 40W neutral white", p: "¥92", was: null, moq: 20, sold: "860", tag: "New", fav: false },
  { id: "P-412", img: pBags, t: "Polyester woven bags · 500 pack heavy duty", p: "¥3.20", was: "¥4.80", moq: 500, sold: "5.4k", tag: "Sale", fav: false },
  { id: "P-413", img: pTiles, t: "Ceramic floor tiles 60×60cm matte porcelain", p: "¥18", was: null, moq: 100, sold: "2.1k", tag: "Feature", fav: true },
  { id: "P-414", img: pSolar, t: "Solar panel 450W monocrystalline module", p: "¥420", was: "¥520", moq: 10, sold: "640", tag: "Sale", fav: false },
  { id: "P-415", img: pMotor, t: "AC gear motor 1.5kW 3-phase 380V industrial", p: "¥680", was: null, moq: 5, sold: "320", tag: "New", fav: false },
  { id: "P-416", img: pPipes, t: "Steel pipes and brass fittings bundle kit", p: "¥36", was: null, moq: 50, sold: "1.8k", tag: "Feature", fav: true },
  { id: "P-417", img: pBoxes, t: "Corrugated shipping boxes assorted sizes", p: "¥1.40", was: "¥2.10", moq: 1000, sold: "12k", tag: "Sale", fav: false },
];

const TRENDING = [
  { id: "P-501", img: pFittings, t: 'Stainless fittings 1/2"', s: "Tianjin Metals", p: "¥4.80", r: 4.9 },
  { id: "P-502", img: pMailers, t: "Kraft mailer bags", s: "Dongguan Pack", p: "¥0.85", r: 4.8 },
  { id: "P-503", img: pCharger, t: "EV charger 22kW Type 2", s: "Hangzhou Volt", p: "¥1,840", r: 4.9 },
];

type Rec = (typeof RECS)[number];
function ProductGrid({ title, items }: { title: string; items: Rec[] }) {
  return (
    <section className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] font-bold" style={{ color: t.navy }}>{title}</h2>
        <Link to="/market/search" className="text-[10.5px] font-bold" style={{ color: t.navy }}>See all</Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((p) => {
          const tagColor = p.tag === "Sale" ? t.accent : p.tag === "New" ? t.success : t.navy;
          return (
            <Link key={p.id} to="/market/product/$id" params={{ id: p.id }} className="rounded-[22px] overflow-hidden flex flex-col"
              style={{ background: t.surface, boxShadow: "var(--mp-shadow-card)", border: `1px solid ${t.border}` }}>
              <div className="relative m-2 rounded-[16px] overflow-hidden aspect-square" style={{ background: t.surface2 }}>
                <img src={p.img} alt={p.t} className="size-full object-cover" loading="lazy" width={512} height={512} />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide text-white"
                  style={{ background: tagColor }}>{p.tag}</span>
                <button className="absolute top-2 right-2 size-7 rounded-full grid place-items-center" style={{ background: "color-mix(in oklab, white 92%, transparent)" }}>
                  <Heart className={`size-3.5 ${p.fav ? "fill-current" : ""}`} strokeWidth={2.2} style={{ color: p.fav ? t.accent : t.muted }} />
                </button>
              </div>
              <div className="px-3 pb-3 pt-1 flex-1 flex flex-col">
                <p className="text-[12px] font-semibold leading-tight line-clamp-2 min-h-[30px]" style={{ color: t.ink }}>{p.t}</p>
                <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                  <p className="text-[15px] font-bold tabular-nums font-mono" style={{ color: t.ink }}>{p.p}</p>
                  {p.was && <p className="text-[10.5px] line-through tabular-nums font-mono" style={{ color: t.muted }}>{p.was}</p>}
                  <p className="text-[10.5px] font-semibold tabular-nums font-mono" style={{ color: t.sub }}>≈ {cnyToNgn(p.p)}</p>
                </div>
                <div className="mt-2 pt-2 flex items-center justify-between text-[10px] font-semibold" style={{ borderTop: `1px solid ${t.border}`, color: t.muted }}>
                  <span>MOQ <span className="tabular-nums font-mono" style={{ color: t.sub }}>{p.moq}</span></span>
                  <span style={{ color: t.border }}>|</span>
                  <span>Sold <span className="tabular-nums font-mono" style={{ color: t.sub }}>{p.sold}</span></span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}


function MarketHome() {
  return (
    <PhoneFrame background="var(--mp-navy)" bottomNav={<BottomNav active="market" />}>
      <div className="relative min-h-full pb-32 font-sans" style={{ background: t.bg, color: t.ink }}>

        {/* Header — navy → cream */}
        <div className="relative" style={{ background: `linear-gradient(180deg, var(--mp-navy) 0%, var(--mp-navy-2) 55%, var(--mp-bg) 100%)`, paddingBottom: 64 }}>
          <header className="px-4 pt-12 flex items-center justify-between">
            <Link to="/home" aria-label="Back" className="size-10 rounded-full grid place-items-center" style={{ background: "color-mix(in oklab, white 18%, transparent)", backdropFilter: "blur(8px)" }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} style={{ color: t.onNavy }} />
            </Link>
            <h1 className="text-[11px] font-bold uppercase tracking-[0.32em]" style={{ color: t.onNavy }}>
              Marketplace
            </h1>
            <div className="flex items-center gap-1.5">
              <Link to="/market/cart" aria-label="Cart" className="size-10 rounded-full grid place-items-center relative" style={{ background: "color-mix(in oklab, white 18%, transparent)", backdropFilter: "blur(8px)" }}>
                <ShoppingCart className="size-4" strokeWidth={2} style={{ color: t.onNavy }} />
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold grid place-items-center text-white" style={{ background: t.accent }}>2</span>
              </Link>
              <Link to="/notifications" aria-label="Notifications" className="size-10 rounded-full grid place-items-center relative" style={{ background: "color-mix(in oklab, white 18%, transparent)", backdropFilter: "blur(8px)" }}>
                <Bell className="size-4" strokeWidth={2} style={{ color: t.onNavy }} />
                <span className="absolute top-2 right-2.5 size-1.5 rounded-full" style={{ background: t.accent }} />
              </Link>
            </div>
          </header>

          <div className="px-4 mt-6">
            <Link to="/market/search" className="flex items-center gap-2.5 h-12 px-4 rounded-full" style={{ background: "color-mix(in oklab, white 22%, transparent)", backdropFilter: "blur(8px)" }}>
              <Search className="size-4" strokeWidth={2} style={{ color: t.onNavy }} />
              <span className="text-[12.5px] flex-1 font-medium" style={{ color: t.onNavy }}>
                Search products, suppliers, HS codes
              </span>
              <button className="size-7 rounded-full grid place-items-center" style={{ background: "color-mix(in oklab, white 35%, transparent)" }}>
                <SlidersHorizontal className="size-3" strokeWidth={2.2} style={{ color: t.onNavy }} />
              </button>
            </Link>
          </div>
        </div>

        {/* Cream sheet overlap */}
        <div className="relative -mt-12 rounded-t-[36px]" style={{ background: t.bg }}>

          {/* Categories */}
          <section className="pt-7 px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Categories</h2>
              <Link to="/market/category/$slug" params={{ slug: "all" }} className="text-[10.5px] font-bold" style={{ color: t.navy }}>
                See all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "none" }}>
              {CATS.map((c) => (
                <Link key={c.l} to="/market/category/$slug" params={{ slug: c.l.toLowerCase() }} className="shrink-0 w-[68px] flex flex-col items-center gap-1.5">
                  <div className="size-[68px] rounded-full overflow-hidden ring-2 ring-offset-2"
                    style={{ boxShadow: "var(--mp-shadow-card)", "--tw-ring-color": "var(--mp-border)", "--tw-ring-offset-color": "var(--mp-bg)" } as React.CSSProperties}>
                    <img src={c.img} alt={c.l} className="size-full object-cover" loading="lazy" width={128} height={128} />
                  </div>
                  <p className="text-[10.5px] text-center leading-tight font-semibold" style={{ color: t.sub }}>{c.l}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Special promo — first card is a looping video */}
          <section className="px-4 mt-6">
            <h2 className="text-[16px] font-bold mb-3" style={{ color: t.navy }}>Special promotions</h2>
            <Link to="/market/search" className="block rounded-[28px] overflow-hidden relative h-[210px]"
              style={{ boxShadow: "var(--mp-shadow-hero)" }}>
              <video
                src={promoVideo.url}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--mp-navy) 94%, transparent) 100%)` }} />
              <div className="relative h-full p-5 flex flex-col justify-end" style={{ color: t.onNavy }}>
                <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] mb-2" style={{ background: t.accent, color: t.onNavy }}>
                  <span className="size-1.5 rounded-full bg-white animate-pulse" /> Live · Limited offer
                </span>
                <p className="text-[22px] leading-[1.05] font-bold tracking-tight">
                  Bulk deals<br />this week
                </p>
                <p className="mt-1 text-[11.5px]" style={{ color: t.onNavySub }}>Up to 40% off machinery & industrial</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full self-start"
                  style={{ background: t.surface, color: t.navy }}>
                  <span className="text-[11.5px] font-semibold">See details</span>
                  <ArrowRight className="size-3.5" strokeWidth={2.4} />
                </div>
              </div>
            </Link>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {[0,1,2,3,4].map((i) => (
                <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === 0 ? 18 : 6, background: i === 0 ? t.accent : t.border }} />
              ))}
            </div>

            {/* Secondary banners */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link to="/market/category/$slug" params={{ slug: "machinery" }}
                className="relative h-32 rounded-[22px] overflow-hidden" style={{ boxShadow: "var(--mp-shadow-card)" }}>
                <img src={promoMachinery} alt="Machinery deals" className="absolute inset-0 size-full object-cover" loading="lazy" width={1024} height={1024} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 35%, color-mix(in oklab, var(--mp-navy) 88%, transparent) 100%)` }} />
                <div className="relative h-full p-3 flex flex-col justify-end" style={{ color: t.onNavy }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: t.onNavySub }}>New arrivals</p>
                  <p className="text-[13.5px] font-bold leading-tight">CNC machinery</p>
                </div>
              </Link>
              <Link to="/market/category/$slug" params={{ slug: "industrial" }}
                className="relative h-32 rounded-[22px] overflow-hidden" style={{ boxShadow: "var(--mp-shadow-card)" }}>
                <img src={promoShipping} alt="Shipping deals" className="absolute inset-0 size-full object-cover" loading="lazy" width={1024} height={1024} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 35%, color-mix(in oklab, var(--mp-navy) 88%, transparent) 100%)` }} />
                <div className="relative h-full p-3 flex flex-col justify-end" style={{ color: t.onNavy }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: t.onNavySub }}>FOB Guangzhou</p>
                  <p className="text-[13.5px] font-bold leading-tight">Free freight quote</p>
                </div>
              </Link>
            </div>
          </section>

          {/* Recommended for you (2) */}
          <ProductGrid title="Recommended for you" items={RECS.slice(0, 2)} />

          {/* Flash deals banner */}
          <section className="px-4 mt-6">
            <Link to="/market/search" className="block relative rounded-[24px] overflow-hidden h-[120px]"
              style={{ background: `linear-gradient(110deg, var(--mp-accent) 0%, var(--mp-navy) 100%)`, boxShadow: "var(--mp-shadow-card)" }}>
              <div className="absolute -right-6 -top-6 size-32 rounded-full" style={{ background: "color-mix(in oklab, white 14%, transparent)" }} />
              <div className="absolute -right-10 bottom-[-30px] size-24 rounded-full" style={{ background: "color-mix(in oklab, white 10%, transparent)" }} />
              <div className="relative h-full p-4 flex flex-col justify-center" style={{ color: t.onNavy }}>
                <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] mb-1.5"
                  style={{ background: "color-mix(in oklab, white 22%, transparent)", color: t.onNavy }}>
                  <Sparkles className="size-2.5" strokeWidth={2.4} /> Flash deals
                </span>
                <p className="text-[18px] font-bold leading-tight tracking-tight">Ends in 04:21:58</p>
                <p className="text-[11.5px] mt-0.5" style={{ color: t.onNavySub }}>Up to 60% off · Free freight on orders over ¥5,000</p>
              </div>
            </Link>
          </section>

          {/* Top picks (4) */}
          <ProductGrid title="Top picks today" items={RECS.slice(2, 6)} />

          {/* Free shipping promo strip */}
          <section className="px-4 mt-6">
            <div className="rounded-[20px] p-4 flex items-center gap-3"
              style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: "var(--mp-shadow-card)" }}>
              <div className="size-11 rounded-2xl grid place-items-center shrink-0" style={{ background: t.surface2 }}>
                <Package className="size-5" strokeWidth={2} style={{ color: t.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-tight" style={{ color: t.navy }}>Free consolidated shipping</p>
                <p className="text-[11px] mt-0.5" style={{ color: t.muted }}>Combine multiple orders in our Guangzhou warehouse</p>
              </div>
              <ArrowRight className="size-4" strokeWidth={2.4} style={{ color: t.navy }} />
            </div>
          </section>

          {/* Just for you (2) */}
          <ProductGrid title="Just for you" items={RECS.slice(6, 8)} />

          {/* Trending */}
          <section className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold flex items-center gap-2" style={{ color: t.navy }}>
                <Sparkles className="size-4" strokeWidth={2.2} style={{ color: t.warn }} /> Trending this week
              </h2>
              <Link to="/market/search" className="text-[10.5px] font-bold" style={{ color: t.navy }}>See all</Link>
            </div>
            <div className="rounded-[24px] overflow-hidden" style={{ background: t.surface, boxShadow: "var(--mp-shadow-card)", border: `1px solid ${t.border}` }}>
              {TRENDING.map((p, i, a) => (
                <Link key={p.id} to="/market/product/$id" params={{ id: p.id }}
                  className={`flex items-center gap-3 px-4 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-12 rounded-2xl shrink-0 overflow-hidden" style={{ background: t.surface2 }}>
                    <img src={p.img} alt={p.t} className="size-full object-cover" loading="lazy" width={96} height={96} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: t.muted }}>{p.s}</p>
                    <p className="text-[12.5px] font-semibold truncate" style={{ color: t.ink }}>{p.t}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="size-2.5 fill-current" style={{ color: t.warn }} />
                      <span className="text-[10px] tabular-nums font-mono" style={{ color: t.sub }}>{p.r}</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold tabular-nums font-mono" style={{ color: t.accent }}>{p.p}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* RFQ + Orders */}
          <section className="px-4 mt-6 grid grid-cols-2 gap-3">
            <Link to="/market/rfq" className="rounded-[24px] p-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, var(--mp-accent) 0%, var(--mp-navy) 100%)`, color: t.onNavy }}>
              <div className="absolute -top-4 -right-4 size-16 rounded-full" style={{ background: "color-mix(in oklab, white 15%, transparent)" }} />
              <Sparkles className="size-4 mb-2" strokeWidth={2} style={{ color: t.onNavySub }} />
              <p className="text-[15px] font-bold leading-tight">Request<br />a quote</p>
              <p className="mt-1 text-[10px]" style={{ color: t.onNavySub }}>5+ offers in 24h</p>
            </Link>
            <Link to="/market/orders" className="rounded-[24px] p-4 relative overflow-hidden"
              style={{ background: t.surface, boxShadow: "var(--mp-shadow-card)", border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between">
                <Package className="size-4" strokeWidth={2} style={{ color: t.navy }} />
                <span className="size-5 rounded-full grid place-items-center text-[9px] font-bold" style={{ background: t.accent, color: t.onNavy }}>3</span>
              </div>
              <p className="mt-2 text-[15px] font-bold leading-tight" style={{ color: t.navy }}>My<br />orders</p>
              <p className="mt-1 text-[10px]" style={{ color: t.muted }}>2 in transit</p>
            </Link>
          </section>

          {/* Trust footer */}
          <section className="px-4 mt-6">
            <div className="rounded-[24px] p-4 flex items-center justify-around" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
              {[
                { I: ShieldCheck, l: "Escrow" },
                { I: Sparkles, l: "Verified" },
                { I: Heart, l: "Curated" },
              ].map((x) => (
                <div key={x.l} className="flex flex-col items-center gap-1">
                  <div className="size-9 rounded-full grid place-items-center" style={{ background: t.surface }}>
                    <x.I className="size-4" strokeWidth={2} style={{ color: t.accent }} />
                  </div>
                  <p className="text-[10.5px] font-semibold" style={{ color: t.sub }}>{x.l}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </PhoneFrame>
  );
}
