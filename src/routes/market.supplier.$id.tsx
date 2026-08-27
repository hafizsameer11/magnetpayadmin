import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Star, ShieldCheck, MessageCircle, Building2, MapPin, Calendar, CheckCircle2, Award, Factory, Share2, Heart } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import pPump from "@/assets/market/p-pump.jpg";
import pFittings from "@/assets/market/p-fittings.jpg";
import pMotor from "@/assets/market/p-motor.jpg";
import pPipes from "@/assets/market/p-pipes.jpg";

const TABS = ["Products", "About", "Certs", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/market/supplier/$id")({
  head: () => ({ meta: [{ title: "Supplier — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => {
    const v = s.tab;
    return { tab: TABS.includes(v as Tab) ? (v as Tab) : undefined };
  },
  component: SupplierStorefront,
});

const PRODUCTS = [
  { id: "P-410", img: pPump,     t: "Cast-iron pump body PB-A2 · DN50 flanged",     p: "¥58",  was: "¥84", moq: 50,  sold: "1.2k", tag: "Feature", fav: true  },
  { id: "P-416", img: pPipes,    t: "Steel pipes and brass fittings bundle kit",    p: "¥36",  was: null,  moq: 50,  sold: "1.8k", tag: "Feature", fav: true  },
  { id: "P-415", img: pMotor,    t: "AC gear motor 1.5kW 3-phase 380V industrial",  p: "¥680", was: null,  moq: 5,   sold: "320",  tag: "New",     fav: false },
  { id: "P-220", img: pFittings, t: "Brass compression fittings · 1/2\" assorted",   p: "¥12",  was: "¥18", moq: 100, sold: "4.6k", tag: "Sale",    fav: false },
];

const CNY_NGN = 215;
const cnyToNgn = (p: string) => {
  const n = parseFloat(p.replace(/[^\d.]/g, ""));
  if (!isFinite(n)) return "";
  return "₦" + Math.round(n * CNY_NGN).toLocaleString();
};

const mp = {
  surface: "var(--mp-surface)",
  surface2: "var(--mp-surface-2)",
  border: "var(--mp-border)",
  ink: "var(--mp-ink)",
  sub: "var(--mp-sub)",
  muted: "var(--mp-muted)",
  navy: "var(--mp-navy)",
  accent: "var(--mp-accent)",
  success: "var(--mp-success)",
};

function SupplierStorefront() {
  const t = escrowTheme;
  const { id } = useParams({ from: "/market/supplier/$id" });
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(search.tab ?? "Products");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-2 flex items-center justify-between">
            <Link to="/market" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex gap-1.5">
              <button className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Share2 className="size-4" strokeWidth={2.4} />
              </button>
              <button className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Heart className="size-4" strokeWidth={2.4} />
              </button>
            </div>
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-2xl grid place-items-center" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <Building2 className="size-7" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold leading-tight">Guangzhou Huayi Co., Ltd</p>
                  <p className="text-[10.5px]" style={{ color: "#C8C2B0" }}>Supplier #{id} · Manufacturer</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ background: "rgba(253,186,116,0.18)", color: "#FDBA74" }}>
                  <Award className="size-2.5" strokeWidth={3} /> Gold
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px]" style={{ color: "#C8C2B0" }}>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3" strokeWidth={2.6} /> Guangdong, CN</span>
                <span className="inline-flex items-center gap-1"><Calendar className="size-3" strokeWidth={2.6} /> 11 yrs</span>
                <span className="inline-flex items-center gap-1"><Star className="size-3 fill-current" style={{ color: "#FDBA74" }} /> 4.8 (240)</span>
              </div>
            </div>
          </section>

          <section className="px-4 mt-4 grid grid-cols-3 gap-2">
            {[
              { l: "On-time", v: "98%", c: t.success },
              { l: "Response", v: "< 4h", c: t.navy },
              { l: "Repeat", v: "62%", c: t.accent },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl py-3 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.c }}>{s.v}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: t.muted }}>{s.l}</p>
              </div>
            ))}
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-center gap-2 flex-wrap" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {["Verified license", "Factory audited", "ISO 9001", "Trade Assurance"].map((b) => (
                <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${t.success}10`, color: t.success }}>
                  <CheckCircle2 className="size-2.5" strokeWidth={3} /> {b}
                </span>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {TABS.map((x) => {
                const on = tab === x;
                return (
                  <button key={x} onClick={() => setTab(x)}
                    className="flex-1 h-8 rounded-xl text-[11px] font-bold"
                    style={{ background: on ? t.navy : "transparent", color: on ? "#fff" : t.sub }}>
                    {x}
                  </button>
                );
              })}
            </div>
          </section>

          {tab === "Products" && (
            <section className="px-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {PRODUCTS.map((p) => {
                  const tagColor = p.tag === "Sale" ? mp.accent : p.tag === "New" ? mp.success : mp.navy;
                  return (
                    <Link key={p.id} to="/market/product/$id" params={{ id: p.id }} className="rounded-[22px] overflow-hidden flex flex-col"
                      style={{ background: mp.surface, boxShadow: "var(--mp-shadow-card)", border: `1px solid ${mp.border}` }}>
                      <div className="relative m-2 rounded-[16px] overflow-hidden aspect-square" style={{ background: mp.surface2 }}>
                        <img src={p.img} alt={p.t} className="size-full object-cover" loading="lazy" width={512} height={512} />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide text-white"
                          style={{ background: tagColor }}>{p.tag}</span>
                        <button className="absolute top-2 right-2 size-7 rounded-full grid place-items-center" style={{ background: "color-mix(in oklab, white 92%, transparent)" }}>
                          <Heart className={`size-3.5 ${p.fav ? "fill-current" : ""}`} strokeWidth={2.2} style={{ color: p.fav ? mp.accent : mp.muted }} />
                        </button>
                      </div>
                      <div className="px-3 pb-3 pt-1 flex-1 flex flex-col">
                        <p className="text-[12px] font-semibold leading-tight line-clamp-2 min-h-[30px]" style={{ color: mp.ink }}>{p.t}</p>
                        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                          <p className="text-[15px] font-bold tabular-nums font-mono" style={{ color: mp.ink }}>{p.p}</p>
                          {p.was && <p className="text-[10.5px] line-through tabular-nums font-mono" style={{ color: mp.muted }}>{p.was}</p>}
                          <p className="text-[10.5px] font-semibold tabular-nums font-mono" style={{ color: mp.sub }}>≈ {cnyToNgn(p.p)}</p>
                        </div>
                        <div className="mt-2 pt-2 flex items-center justify-between text-[10px] font-semibold" style={{ borderTop: `1px solid ${mp.border}`, color: mp.muted }}>
                          <span>MOQ <span className="tabular-nums font-mono" style={{ color: mp.sub }}>{p.moq}</span></span>
                          <span style={{ color: mp.border }}>|</span>
                          <span>Sold <span className="tabular-nums font-mono" style={{ color: mp.sub }}>{p.sold}</span></span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {tab === "About" && (
            <section className="px-4 mt-4 rounded-2xl p-4 space-y-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: t.muted }}>Company</p>
                <p className="text-[12px]" style={{ color: t.sub }}>
                  Established 2013. Specialist manufacturer of industrial pumps and cast-iron fittings serving West African importers since 2018.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ["Staff", "180+"],
                  ["Factory", "12,000 m²"],
                  ["Export %", "78%"],
                  ["Main markets", "NG · KE · GH"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl p-2.5" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: t.muted }}>{k}</p>
                    <p className="font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "Certs" && (
            <section className="px-4 mt-4 rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                ["ISO 9001:2015", "Quality management · valid to 2027"],
                ["CE marking", "Pressure equipment directive"],
                ["SGS factory audit", "Passed Mar 2025"],
                ["Business license", "Verified by MagnetPay"],
              ].map(([k, v], i, a) => (
                <div key={k} className={`flex items-center gap-3 px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <Factory className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold">{k}</p>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>{v}</p>
                  </div>
                  <CheckCircle2 className="size-4 shrink-0" strokeWidth={2.6} style={{ color: t.success }} />
                </div>
              ))}
            </section>
          )}

          {tab === "Reviews" && (
            <section className="px-4 mt-4 space-y-2">
              {[
                { n: "Chidi O.", c: "NG", r: 5, txt: "On time, packaging was excellent. Will reorder.", o: "¥18,400 · 2 mo ago" },
                { n: "Amaka N.", c: "NG", r: 4, txt: "Good quality but lead time slipped 4 days.", o: "¥6,200 · 3 mo ago" },
                { n: "Kwame B.", c: "GH", r: 5, txt: "Smooth comms, escrow released same day.", o: "¥9,800 · 5 mo ago" },
                { n: "Tunde A.", c: "NG", r: 5, txt: "Third reorder. Consistent flange tolerance, no rework needed.", o: "¥42,000 · 7 mo ago" },
                { n: "Fatima S.", c: "NG", r: 5, txt: "Packaging held up through Lagos port handling. Zero damage.", o: "¥8,100 · 8 mo ago" },
                { n: "Kojo M.", c: "GH", r: 4, txt: "Surface finish slightly under spec on one batch but supplier replaced free.", o: "¥15,300 · 9 mo ago" },
                { n: "Ngozi E.", c: "NG", r: 5, txt: "QC photos sent daily during production. Felt in control the whole time.", o: "¥31,500 · 10 mo ago" },
                { n: "Samuel A.", c: "KE", r: 5, txt: "Bore tolerances held across all 500 units. Engineering team responsive.", o: "¥52,000 · 11 mo ago" },
                { n: "Adaeze I.", c: "NG", r: 4, txt: "Solid product. Would prefer faster sample turnaround next time.", o: "¥7,400 · 1 y ago" },
                { n: "Yaw D.", c: "GH", r: 5, txt: "Best supplier I've worked with on this part. Pricing fair, quality high.", o: "¥22,800 · 1 y ago" },
                { n: "Bisi K.", c: "NG", r: 5, txt: "CE docs and MTRs delivered without chasing. Procurement loved it.", o: "¥14,600 · 1 y ago" },
                { n: "Mensah T.", c: "GH", r: 4, txt: "One missed dimension on first article, corrected before mass production.", o: "¥19,200 · 1 y ago" },
                { n: "Ibrahim Y.", c: "NG", r: 5, txt: "Stable pricing across three POs. No surprise surcharges.", o: "¥36,900 · 1 y ago" },
                { n: "Esther O.", c: "NG", r: 5, txt: "Inspection access granted same week. Very transparent operation.", o: "¥11,200 · 1 y ago" },
                { n: "Akosua P.", c: "GH", r: 5, txt: "Reorder #5. They know our spec by heart now.", o: "¥48,700 · 1 y ago" },
              ].map((r, i) => (
                <div key={i} className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-bold">{r.n} <span className="text-[10px] font-semibold" style={{ color: t.muted }}>· {r.c}</span></p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, x) => (
                        <Star key={x} className="size-2.5" strokeWidth={2.4} style={{ color: x < r.r ? t.warn : t.border, fill: x < r.r ? t.warn : "transparent" }} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-[11.5px]" style={{ color: t.sub }}>{r.txt}</p>
                  <p className="mt-1 text-[10px]" style={{ color: t.muted }}>{r.o}</p>
                </div>
              ))}
            </section>
          )}

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto grid grid-cols-[auto_1fr] gap-2">
              <Link to="/messages/$id" params={{ id: "t1" }} className="h-13 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold py-3.5"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}>
                <MessageCircle className="size-4" strokeWidth={2.4} /> Chat
              </Link>
              <Link to="/market/rfq" search={{ supplier: id }} className="h-13 rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <ShieldCheck className="size-4" strokeWidth={2.6} /> Request a quote
              </Link>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
