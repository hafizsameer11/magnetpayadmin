import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, SlidersHorizontal, Star, Grid3x3, List as ListIcon } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/market/category/$slug")({
  head: () => ({ meta: [{ title: "Category — MagnetPay" }] }),
  component: CategoryBrowse,
});

const SUBS = ["All", "Pumps", "Motors", "Bearings", "Valves", "Fittings", "Tools"];

const ITEMS = [
  { id: "P-220", t: "Cast-iron pump body PB-A2", s: "Guangzhou Huayi", p: "¥58", m: 50, r: 4.8 },
  { id: "P-221", t: "Pump impeller cast steel", s: "Wenzhou Marine", p: "¥34", m: 100, r: 4.6 },
  { id: "P-223", t: "Centrifugal pump assembly", s: "Shanghai PumpCo", p: "¥420", m: 10, r: 4.9 },
  { id: "P-225", t: "Submersible pump 1.5kW", s: "Hebei Pumps", p: "¥680", m: 5, r: 4.7 },
  { id: "P-227", t: "Pump shaft seal kit", s: "Ningbo Sealtech", p: "¥12", m: 200, r: 4.5 },
  { id: "P-229", t: "Diaphragm pump AODD", s: "Shanghai PumpCo", p: "¥1,240", m: 2, r: 4.9 },
];

function CategoryBrowse() {
  const t = escrowTheme;
  const { slug } = useParams({ from: "/market/category/$slug" });
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sub, setSub] = useState("Pumps");

  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Category</p>
              <p className="text-[13px] font-bold">{title}</p>
            </div>
            <Link to="/market/search" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <SlidersHorizontal className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          <section className="px-4 mt-2">
            <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "none" }}>
              {SUBS.map((s) => {
                const on = s === sub;
                return (
                  <button key={s} onClick={() => setSub(s)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                    style={{ background: on ? t.navy : t.surface, color: on ? "#fff" : t.sub, border: `1px solid ${on ? t.navy : t.border}` }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-3 flex items-center justify-between">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>
              128 products · sorted by best match
            </p>
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <button onClick={() => setView("grid")} className="size-6 grid place-items-center rounded-md"
                style={{ background: view === "grid" ? t.navy : "transparent", color: view === "grid" ? "#fff" : t.muted }}>
                <Grid3x3 className="size-3" strokeWidth={2.6} />
              </button>
              <button onClick={() => setView("list")} className="size-6 grid place-items-center rounded-md"
                style={{ background: view === "list" ? t.navy : "transparent", color: view === "list" ? "#fff" : t.muted }}>
                <ListIcon className="size-3" strokeWidth={2.6} />
              </button>
            </div>
          </section>

          <section className="px-4 mt-3">
            {view === "grid" ? (
              <div className="grid grid-cols-2 gap-2.5">
                {ITEMS.map((p) => (
                  <Link key={p.id} to="/market/product/$id" params={{ id: p.id }}
                    className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                    <div className="h-24" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 100%)` }} />
                    <div className="p-2.5">
                      <p className="text-[11.5px] font-bold leading-tight line-clamp-2 min-h-[28px]">{p.t}</p>
                      <p className="mt-0.5 text-[9.5px]" style={{ color: t.muted }}>{p.s}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.p}</p>
                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold"><Star className="size-2.5 fill-current" style={{ color: t.warn }} />{p.r}</span>
                      </div>
                      <p className="text-[9.5px]" style={{ color: t.muted }}>MOQ {p.m}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {ITEMS.map((p) => (
                  <Link key={p.id} to="/market/product/$id" params={{ id: p.id }}
                    className="rounded-2xl p-3 flex gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                    <div className="size-16 rounded-xl shrink-0" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 100%)` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold leading-tight">{p.t}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{p.s}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.p} <span className="text-[10px] font-semibold" style={{ color: t.muted }}>· MOQ {p.m}</span></p>
                        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold"><Star className="size-2.5 fill-current" style={{ color: t.warn }} />{p.r}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
