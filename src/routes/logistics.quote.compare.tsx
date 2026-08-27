import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Ship, Clock, Shield, Leaf, CheckCircle2, Star, ArrowRight, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/quote/compare")({
  head: () => ({ meta: [{ title: "Compare quotes — Logistics" }] }),
  component: QuoteCompare,
});

const CARRIERS = [
  { id: "Q1", name: "ChinaSea Express · LCL", badge: "Best value", price: 482, eta: "26–32 days", svc: "Door-to-port", rating: 4.7, includes: ["Insurance", "Customs paperwork"], green: true },
  { id: "Q2", name: "Pacific Direct · LCL", badge: "Fastest sea", price: 612, eta: "22–26 days", svc: "Door-to-door", rating: 4.8, includes: ["Priority handling", "Insurance"], green: false },
  { id: "Q3", name: "Maersk Consolidated · FCL", badge: "Best for bulk", price: 1180, eta: "28–34 days", svc: "Port-to-port", rating: 4.5, includes: ["Insurance"], green: true },
];

function QuoteCompare() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [pick, setPick] = useState("Q1");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/logistics/quote" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>3 carriers matched</p>
              <p className="text-[13px] font-bold">Compare quotes</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Ship className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.navy }} />
              <p className="text-[11.5px] flex-1 min-w-0 truncate">
                <span className="font-bold">Guangzhou → Lagos</span>
                <span style={{ color: t.muted }}> · 420kg · 1.8 CBM · FOB</span>
              </p>
            </div>
          </section>

          <section className="px-4 mt-3 space-y-2.5">
            {CARRIERS.map((c) => {
              const on = pick === c.id;
              return (
                <button key={c.id} onClick={() => setPick(c.id)}
                  className="w-full text-left rounded-2xl p-3.5"
                  style={{ background: t.surface, border: `1.5px solid ${on ? t.accent : t.border}`, boxShadow: on ? `0 8px 24px -12px ${t.accent}60` : "none" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-extrabold">{c.name}</p>
                        {on && <CheckCircle2 className="size-4" strokeWidth={2.6} style={{ color: t.accent }} />}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10.5px]" style={{ color: t.muted }}>
                        <span className="flex items-center gap-0.5"><Star className="size-3 fill-current" style={{ color: t.warn }} /> {c.rating}</span>
                        <span>·</span>
                        <span>{c.svc}</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${t.accent}15`, color: t.accent }}>{c.badge}</span>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>All-in</p>
                      <p className="text-[20px] font-extrabold leading-none tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{c.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>ETA</p>
                      <p className="text-[12.5px] font-bold flex items-center gap-1"><Clock className="size-3" strokeWidth={2.5} />{c.eta}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {c.includes.map((x) => (
                      <span key={x} className="text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: t.bg, color: t.sub, border: `1px solid ${t.border}` }}>
                        <Shield className="size-2.5" strokeWidth={2.6} /> {x}
                      </span>
                    ))}
                    {c.green && (
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: `${t.success}15`, color: t.success }}>
                        <Leaf className="size-2.5" strokeWidth={2.6} /> Lower CO₂
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}33` }}>
              <Sparkles className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Freight, customs & clearing shown are <span className="font-bold" style={{ color: t.ink }}>estimates</span>. Final amount is set once cleared; any difference is credited to your ₦ wallet.
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/logistics/booking" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              Book {pick} <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
