import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search, X, SlidersHorizontal, Star, ShieldCheck, Clock } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/market/search")({
  head: () => ({ meta: [{ title: "Search — MagnetPay" }] }),
  component: SearchScreen,
});

const RESULTS = [
  { id: "P-220", title: "Cast-iron pump bodies PB-A2", supplier: "Guangzhou Huayi Co.", price: "¥58", moq: 50, rating: 4.8, lead: "21d", incoterm: "FOB" },
  { id: "P-221", title: "Pump impeller cast steel", supplier: "Wenzhou Marine", price: "¥34", moq: 100, rating: 4.6, lead: "18d", incoterm: "EXW" },
  { id: "P-223", title: "Centrifugal pump assembly", supplier: "Shanghai PumpCo", price: "¥420", moq: 10, rating: 4.9, lead: "30d", incoterm: "CIF" },
];

const FILTERS = [
  { k: "Category", v: "Industrial" },
  { k: "Price", v: "¥10–¥500" },
  { k: "MOQ", v: "≤ 100" },
  { k: "Rating", v: "4.5★+" },
  { k: "Incoterm", v: "FOB" },
];

function SearchScreen() {
  const t = escrowTheme;
  const [q, setQ] = useState("pump");
  const [open, setOpen] = useState(false);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-2">
            <Link to="/market" className="size-9 grid place-items-center rounded-full shrink-0" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent outline-none text-[12.5px]" />
              {q && <button onClick={() => setQ("")}><X className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} /></button>}
            </div>
            <button onClick={() => setOpen(!open)} className="size-10 grid place-items-center rounded-full shrink-0" style={{ background: open ? t.navy : t.surface, color: open ? "#fff" : t.ink, border: `1px solid ${t.border}` }}>
              <SlidersHorizontal className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          <section className="px-4 mt-1">
            <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "none" }}>
              {FILTERS.map((f) => (
                <span key={f.k} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap" style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.sub }}>
                  <span style={{ color: t.muted }}>{f.k}:</span> {f.v}
                  <X className="size-2.5" strokeWidth={3} style={{ color: t.muted }} />
                </span>
              ))}
            </div>
          </section>

          {open && (
            <section className="px-4 mt-3">
              <div className="rounded-2xl p-4 space-y-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                {[
                  { l: "Category", opts: ["All", "Industrial", "Machinery", "Electronics", "Apparel"] },
                  { l: "Price (¥)", opts: ["Any", "<10", "10–100", "100–500", "500+"] },
                  { l: "MOQ", opts: ["Any", "≤50", "≤100", "≤500", "≤1000"] },
                  { l: "Supplier rating", opts: ["Any", "3.5★+", "4.0★+", "4.5★+", "4.8★+"] },
                  { l: "Incoterm", opts: ["EXW", "FOB", "CIF", "DDP"] },
                ].map((g) => (
                  <div key={g.l}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>{g.l}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.opts.map((o, i) => (
                        <button key={o} className="px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                          style={{ background: i === 1 ? t.navy : "transparent", color: i === 1 ? "#fff" : t.sub, border: `1px solid ${i === 1 ? t.navy : t.border}` }}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="w-full h-11 rounded-xl text-[12px] font-bold text-white mt-1" style={{ background: t.accent }}>
                  Apply filters
                </button>
              </div>
            </section>
          )}

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>
              {RESULTS.length} results · sorted by relevance
            </p>
            <div className="space-y-2">
              {RESULTS.map((p) => (
                <Link key={p.id} to="/market/product/$id" params={{ id: p.id }}
                  className="block rounded-2xl p-3 flex gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="size-20 rounded-xl shrink-0" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 100%)` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold leading-tight line-clamp-2">{p.title}</p>
                    <p className="mt-0.5 text-[10.5px]" style={{ color: t.muted }}>{p.supplier}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px]" style={{ color: t.sub }}>
                      <span className="inline-flex items-center gap-0.5 font-bold"><Star className="size-2.5 fill-current" style={{ color: t.warn }} />{p.rating}</span>
                      <span className="inline-flex items-center gap-0.5"><Clock className="size-2.5" strokeWidth={2.6} />{p.lead}</span>
                      <span className="inline-flex items-center gap-0.5"><ShieldCheck className="size-2.5" strokeWidth={2.6} style={{ color: t.success }} />{p.incoterm}</span>
                    </div>
                    <div className="mt-1.5 flex items-end justify-between">
                      <p className="text-[14px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.price}<span className="text-[10px] font-semibold" style={{ color: t.muted }}> /unit</span></p>
                      <p className="text-[10px]" style={{ color: t.muted }}>MOQ {p.moq}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
