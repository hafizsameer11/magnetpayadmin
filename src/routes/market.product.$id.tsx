import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Heart, Share2, Star, ShieldCheck, Clock, Package, Truck, MessageCircle, Building2, CheckCircle2, Info, Minus, Plus, AlertCircle, Play, ChevronDown, Check } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { isWished, toggleWish, subscribeWishlist } from "@/lib/wishlist";

import pump1 from "@/assets/market/pd-pump-1.jpg";
import pump2 from "@/assets/market/pd-pump-2.jpg";
import pump3 from "@/assets/market/pd-pump-3.jpg";
import pump4 from "@/assets/market/pd-pump-4.jpg";
import pump5 from "@/assets/market/pd-pump-5.jpg";
import pump6 from "@/assets/market/pd-pump-6.jpg";
import promoVideo from "@/assets/market/promo-video.mp4.asset.json";

export const Route = createFileRoute("/market/product/$id")({
  head: () => ({ meta: [{ title: "Product — MagnetPay" }] }),
  component: ProductDetail,
});

const TIERS = [
  { range: "50 – 199", price: 58 },
  { range: "200 – 999", price: 52 },
  { range: "1,000+", price: 46 },
];
const MOQ = 50;
type Media = { type: "video"; src: string; poster: string } | { type: "image"; src: string };
const GALLERY: Media[] = [
  { type: "video", src: promoVideo.url, poster: pump1 },
  { type: "image", src: pump1 },
  { type: "image", src: pump2 },
  { type: "image", src: pump3 },
  { type: "image", src: pump5 },
  { type: "image", src: pump6 },
];

function ProductDetail() {
  const t = escrowTheme;
  const { id } = useParams({ from: "/market/product/$id" });
  const [img, setImg] = useState(0);
  const [tier, setTier] = useState(1);
  const [qty, setQty] = useState(MOQ);
  const [qtyText, setQtyText] = useState(String(MOQ));
  const [descOpen, setDescOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const belowMoq = qty < MOQ;

  useEffect(() => {
    setSaved(isWished(id));
    return subscribeWishlist(() => setSaved(isWished(id)));
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: "Cast-iron pump body PB-A2 · DN50", text: "Found this on MagnetPay", url };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(data);
        return;
      }
    } catch {
      // user cancelled or share failed → fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      showToast("Couldn't copy link");
    }
  };

  const onToggleWish = () => {
    const nowSaved = toggleWish({
      id,
      title: "Cast-iron pump body PB-A2 · DN50",
      price: `¥${TIERS[tier].price}`,
      img: pump1,
      moq: MOQ,
      supplierId: "S-100",
    });
    setSaved(nowSaved);
    showToast(nowSaved ? "Saved to wishlist" : "Removed from wishlist");
  };

  const setQtyClamped = (n: number) => {
    const v = Math.max(MOQ, Math.floor(n) || MOQ);
    setQty(v);
    setQtyText(String(v));
  };

  return (
    <>
      <PhoneFrame
        background={t.navy}
        overlay={
          reviewsOpen ? (
            <div className="absolute inset-0 pointer-events-auto flex items-end" onClick={() => setReviewsOpen(false)}>
              <div className="absolute inset-0" style={{ background: "rgba(15,25,20,0.45)" }} />
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full rounded-t-3xl max-h-[78%] flex flex-col animate-[reveal_320ms_var(--ease-out-expo)_both]"
                style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: "0 -12px 40px -8px rgba(15,25,20,0.25)" }}
              >
                <div className="pt-2 pb-1 grid place-items-center">
                  <span className="block h-1 w-10 rounded-full" style={{ background: t.border }} />
                </div>
                <div className="px-4 pt-2 pb-3 flex items-start gap-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                  <div className="text-center shrink-0">
                    <p className="text-[28px] leading-none font-bold tabular-nums font-mono">4.8</p>
                    <div className="mt-1 flex gap-0.5 justify-center">
                      {Array.from({ length: 5 }).map((_, x) => (
                        <Star key={x} className="size-3" strokeWidth={2.4} style={{ color: x < 5 ? t.warn : t.border, fill: x < 5 ? t.warn : "transparent" }} />
                      ))}
                    </div>
                    <p className="mt-1 text-[10px]" style={{ color: t.muted }}>240 reviews</p>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {[
                      { n: 5, c: 198, pct: 82 },
                      { n: 4, c: 28, pct: 12 },
                      { n: 3, c: 9, pct: 4 },
                      { n: 2, c: 3, pct: 1 },
                      { n: 1, c: 2, pct: 1 },
                    ].map((r) => (
                      <div key={r.n} className="flex items-center gap-2 text-[10.5px]">
                        <span className="w-3 font-bold tabular-nums" style={{ color: t.sub }}>{r.n}</span>
                        <Star className="size-2.5 fill-current" style={{ color: t.warn }} strokeWidth={2.4} />
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: t.bg }}>
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: t.warn }} />
                        </div>
                        <span className="w-7 text-right tabular-nums font-mono" style={{ color: t.muted }}>{r.c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overflow-y-auto px-4 py-3 space-y-2.5">
                  {[
                    { n: "Chidi O.", c: "NG", r: 5, txt: "Pump bodies arrived clean, machining was spot on. Will reorder.", o: "Verified · 200 units · 2 mo ago" },
                    { n: "Amaka N.", c: "NG", r: 4, txt: "Good quality but lead time slipped 4 days. Comms were solid throughout.", o: "Verified · 50 units · 3 mo ago" },
                    { n: "Kwame B.", c: "GH", r: 5, txt: "Smooth comms, escrow released same day after BOL upload.", o: "Verified · 120 units · 5 mo ago" },
                    { n: "Tunde A.", c: "NG", r: 5, txt: "Third reorder. Consistent flange tolerance, no rework needed.", o: "Verified · 400 units · 7 mo ago" },
                    { n: "Fatima S.", c: "NG", r: 5, txt: "Packaging held up through Lagos port handling. Zero damage.", o: "Verified · 80 units · 8 mo ago" },
                    { n: "Kojo M.", c: "GH", r: 4, txt: "Surface finish slightly under spec on one batch but supplier replaced free.", o: "Verified · 150 units · 9 mo ago" },
                    { n: "Ngozi E.", c: "NG", r: 5, txt: "QC photos sent daily during production. Felt in control the whole time.", o: "Verified · 300 units · 10 mo ago" },
                    { n: "Samuel A.", c: "KE", r: 5, txt: "Bore tolerances held across all 500 units. Engineering team responsive.", o: "Verified · 500 units · 11 mo ago" },
                    { n: "Adaeze I.", c: "NG", r: 4, txt: "Solid product. Would prefer faster sample turnaround next time.", o: "Verified · 60 units · 1 y ago" },
                    { n: "Yaw D.", c: "GH", r: 5, txt: "Best supplier I've worked with on this part. Pricing fair, quality high.", o: "Verified · 220 units · 1 y ago" },
                  ].map((r, i) => (
                    <div key={i} className="rounded-2xl p-3" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                      <div className="flex items-center justify-between">
                        <p className="text-[11.5px] font-bold">{r.n} <span className="text-[10px] font-semibold" style={{ color: t.muted }}>· {r.c}</span></p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, x) => (
                            <Star key={x} className="size-2.5" strokeWidth={2.4} style={{ color: x < r.r ? t.warn : t.border, fill: x < r.r ? t.warn : "transparent" }} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug" style={{ color: t.sub }}>{r.txt}</p>
                      <p className="mt-1 text-[9.5px]" style={{ color: t.muted }}>{r.o}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3" style={{ borderTop: `1px solid ${t.border}` }}>
                  <Link
                    to="/market/supplier/$id"
                    params={{ id: "S-100" }}
                    search={{ tab: "Reviews" }}
                    onClick={() => setReviewsOpen(false)}
                    className="block w-full h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-white"
                    style={{ background: t.navy }}
                  >
                    See all 240 reviews
                  </Link>
                </div>
              </div>
            </div>
          ) : undefined
        }
      >
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-2 flex items-center justify-between">
            <Link to="/market" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex gap-1.5">
              <button onClick={onShare} aria-label="Share product" className="size-9 grid place-items-center rounded-full active:scale-95 transition" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Share2 className="size-4" strokeWidth={2.4} />
              </button>
              <button onClick={onToggleWish} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={saved} className="size-9 grid place-items-center rounded-full active:scale-95 transition" style={{ background: t.surface, border: `1px solid ${saved ? t.accent : t.border}` }}>
                <Heart className={`size-4 ${saved ? "fill-current" : ""}`} strokeWidth={2.4} style={{ color: saved ? t.accent : t.ink }} />
              </button>
            </div>
          </header>

          {toast && (
            <div className="pointer-events-none absolute top-[60px] inset-x-0 z-40 flex justify-center px-4">
              <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold text-white animate-[reveal_220ms_var(--ease-out-expo)_both]"
                style={{ background: t.navy, boxShadow: "0 8px 24px -8px rgba(15,25,20,0.35)" }}>
                <Check className="size-3" strokeWidth={3} /> {toast}
              </div>
            </div>
          )}

          <section className="px-4 mt-2">
            <div className="rounded-3xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="aspect-square overflow-hidden relative" style={{ background: t.bg }}>
                {GALLERY[img].type === "video" ? (
                  <video src={GALLERY[img].src} poster={(GALLERY[img] as any).poster} autoPlay loop muted playsInline className="size-full object-cover" />
                ) : (
                  <img src={GALLERY[img].src} alt="Product" className="size-full object-cover" width={1024} height={1024} />
                )}
              </div>
              <div className="grid grid-cols-6 gap-1.5 px-3 py-2.5">
                {GALLERY.map((m, i) => (
                  <button key={i} onClick={() => setImg(i)}
                    className="aspect-square rounded-lg overflow-hidden relative"
                    style={{ border: `2px solid ${img === i ? t.accent : t.border}` }}>
                    <img src={m.type === "video" ? (m as any).poster : m.src} alt="" className="size-full object-cover" loading="lazy" width={96} height={96} />
                    {m.type === "video" && (
                      <span className="absolute inset-0 grid place-items-center" style={{ background: "rgba(0,0,0,0.35)" }}>
                        <Play className="size-3 text-white fill-white" strokeWidth={2} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>


          <section className="px-4 mt-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ background: `${t.success}15`, color: t.success }}>
              <ShieldCheck className="size-2.5" strokeWidth={3} /> Escrow-protected
            </span>
            <h1 className="mt-2 text-[18px] font-bold leading-tight">Cast-iron pump body PB-A2 · DN50</h1>
            <div className="mt-1 flex items-center gap-2 text-[11.5px]" style={{ color: t.muted }}>
              <button
                type="button"
                onClick={() => setReviewsOpen(true)}
                className="inline-flex items-center gap-1 active:opacity-70"
                aria-label="See reviews"
              >
                <Star className="size-3 fill-current" style={{ color: t.warn }} strokeWidth={2.4} />
                <span className="font-bold tabular-nums" style={{ color: t.ink }}>4.8</span>
                <span style={{ color: t.sub }}>(240 reviews)</span>
              </button>
              <span>·</span>
              <span>SKU {id} · HS 8413.91</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-[28px] leading-none font-bold tabular-nums font-mono">¥{TIERS[tier].price}</p>
              <p className="text-[11px]" style={{ color: t.muted }}>per unit · ≈ ₦{(TIERS[tier].price * 229).toLocaleString()}</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Price tiers</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {TIERS.map((r, i, a) => {
                const on = tier === i;
                return (
                  <button key={r.range} onClick={() => setTier(i)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: t.border, background: on ? `${t.accent}08` : "transparent" }}>
                    <div className="flex items-center gap-2">
                      <span className="size-3.5 rounded-full" style={{ background: on ? t.accent : "transparent", border: `1.5px solid ${on ? t.accent : t.border}` }} />
                      <p className="text-[12px] font-semibold">{r.range} units</p>
                    </div>
                    <p className="text-[13px] font-bold tabular-nums font-mono" style={{ color: on ? t.accent : t.ink }}>¥{r.price}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Description</p>
            <button onClick={() => setDescOpen((o) => !o)} aria-expanded={descOpen}
              className="w-full text-left rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="relative">
                <p className="text-[11.5px] leading-[1.3rem]" style={{ color: t.sub, display: "-webkit-box", WebkitLineClamp: descOpen ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  Heavy-duty grey cast-iron pump body for industrial centrifugal pumps. Machined flanged DN50 connection rated for 1.6 MPa working pressure and -10 to 120 °C service. Compatible with PB-A series impellers; flange face EN 1092-2 PN16. Each unit ships in wooden crates of 8 with anti-corrosion oil coating.
                </p>
                {!descOpen && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5" style={{ background: `linear-gradient(to bottom, transparent, ${t.surface})` }} />
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[10.5px] font-bold" style={{ color: t.accent }}>
                {descOpen ? "Show less" : "Read more"}
                <ChevronDown className="size-3" strokeWidth={2.8} style={{ transform: descOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </div>
            </button>
          </section>


          <section className="px-4 mt-4 grid grid-cols-3 gap-2">
            {[
              { I: Package, l: "MOQ", v: `${MOQ} units` },
              { I: Clock, l: "Lead time", v: "21 days" },
              { I: Truck, l: "Incoterm", v: "FOB GZ" },
            ].map((r) => (
              <div key={r.l} className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <r.I className="size-4" strokeWidth={2.3} style={{ color: t.navy }} />
                <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: t.muted }}>{r.l}</p>
                <p className="text-[11.5px] font-bold">{r.v}</p>
              </div>
            ))}
          </section>

          {/* Quantity selector */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Order quantity</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.sub }}>Minimum {MOQ} units (seller MOQ)</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setQtyClamped(qty - 10)}
                    className="size-9 rounded-full grid place-items-center"
                    style={{ background: t.bg, border: `1px solid ${t.border}`, color: qty <= MOQ ? t.muted : t.ink }}
                    aria-label="Decrease">
                    <Minus className="size-3.5" strokeWidth={2.4} />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={qtyText}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d]/g, "");
                      setQtyText(cleaned);
                      const n = parseInt(cleaned || "0", 10);
                      if (!Number.isNaN(n)) setQty(n);
                    }}
                    onBlur={() => setQtyClamped(qty)}
                    className="w-20 h-9 text-center rounded-lg text-[13.5px] font-bold tabular-nums font-mono outline-none"
                    style={{ background: t.bg, border: `1px solid ${belowMoq ? t.danger : t.border}`, color: belowMoq ? t.danger : t.ink }}
                  />
                  <button
                    onClick={() => setQtyClamped(qty + 10)}
                    className="size-9 rounded-full grid place-items-center"
                    style={{ background: t.bg, border: `1px solid ${t.border}` }}
                    aria-label="Increase">
                    <Plus className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              </div>
              {belowMoq ? (
                <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: t.danger }}>
                  <AlertCircle className="size-3" strokeWidth={2.6} />
                  Below MOQ — quantity must be at least {MOQ}
                </div>
              ) : (
                <div className="mt-2.5 flex items-center justify-between pt-2.5" style={{ borderTop: `1px solid ${t.border}` }}>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Subtotal</p>
                  <div className="text-right">
                    <p className="text-[15px] font-bold tabular-nums font-mono" style={{ color: t.accent }}>
                      ¥{(TIERS[tier].price * qty).toLocaleString()}
                    </p>
                    <p className="text-[10.5px] font-semibold tabular-nums font-mono mt-0.5" style={{ color: t.sub }}>
                      ≈ ₦{(TIERS[tier].price * qty * 215).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Supplier</p>
            <Link to="/market/supplier/$id" params={{ id: "S-100" }} className="block rounded-2xl p-3.5 active:opacity-80 transition" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Building2 className="size-5" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold">Guangzhou Huayi Co., Ltd</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>Guangdong, CN · 11 yrs · 240+ buyers</p>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold"><Star className="size-3 fill-current" style={{ color: t.warn }} />4.8</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "On-time", v: "98%", c: t.success },
                  { l: "Response", v: "< 4h", c: t.navy },
                  { l: "Repeat", v: "62%", c: t.accent },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl py-2" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                    <p className="text-[13px] font-bold tabular-nums font-mono" style={{ color: s.c }}>{s.v}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: t.muted }}>{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10.5px]" style={{ color: t.sub }}>
                <CheckCircle2 className="size-3" strokeWidth={3} style={{ color: t.success }} /> Business license verified
                <span style={{ color: t.muted }}>·</span>
                <CheckCircle2 className="size-3" strokeWidth={3} style={{ color: t.success }} /> Factory audited
              </div>
            </Link>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Specifications</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                ["Material", "Grey cast iron HT250"],
                ["Connection", "Flanged DN50, PN16"],
                ["Working pressure", "1.6 MPa"],
                ["Temperature", "-10 to 120 °C"],
                ["Packing", "Wooden crate, 8 pcs"],
                ["Volume per unit", "0.012 CBM"],
                ["Weight per unit", "2.1 kg"],
              ].map(([k, v], i, a) => (
                <div key={k} className={`flex items-center justify-between px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className="text-[11.5px]" style={{ color: t.muted }}>{k}</p>
                  <p className="text-[11.5px] font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Payment is held in escrow until you confirm shipment and inspection. Optional SGS pre-release inspection available.
              </p>
            </div>
          </section>

          <section className="px-4 mt-4 grid grid-cols-2 gap-2">
            <Link to="/market/rfq" search={{ supplier: "S-101", product: id }} className="rounded-2xl p-3 flex items-center gap-2.5"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.accent}12`, color: t.accent }}>
                <MessageCircle className="size-4" strokeWidth={2.3} />
              </div>
              <div className="min-w-0">
                <p className="text-[11.5px] font-bold">Request a quote</p>
                <p className="text-[9.5px] truncate" style={{ color: t.muted }}>Negotiate custom price</p>
              </div>
            </Link>
            <Link to="/market/sample" className="rounded-2xl p-3 flex items-center gap-2.5"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.info}12`, color: t.info }}>
                <Package className="size-4" strokeWidth={2.3} />
              </div>
              <div className="min-w-0">
                <p className="text-[11.5px] font-bold">Request sample</p>
                <p className="text-[9.5px] truncate" style={{ color: t.muted }}>Test before bulk order</p>
              </div>
            </Link>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto grid grid-cols-[auto_1fr] gap-2">
              <Link to="/market/quote/$id" params={{ id }} className="h-13 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold py-3.5"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}>
                <MessageCircle className="size-4" strokeWidth={2.4} /> Chat
              </Link>
              <Link
                to="/market/cart"
                disabled={belowMoq}
                aria-disabled={belowMoq}
                onClick={(e) => { if (belowMoq) e.preventDefault(); }}
                className="h-13 rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{
                  background: belowMoq ? t.muted : t.accent,
                  boxShadow: belowMoq ? "none" : `0 12px 28px -10px ${t.accent}80`,
                  opacity: belowMoq ? 0.6 : 1,
                  pointerEvents: belowMoq ? "none" : "auto",
                }}>
                <ShieldCheck className="size-4" strokeWidth={2.6} /> Add {qty} · escrow
              </Link>
            </div>
          </section>

        </div>
      </PhoneFrame>
    </>
  );
}
