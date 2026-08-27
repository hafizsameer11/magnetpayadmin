import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, Ship, Package, MapPin, Building2, FileText, CheckCircle2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/checkout/review")({
  head: () => ({ meta: [{ title: "Checkout · Review — MagnetPay" }] }),
  component: CheckoutReview,
});

function CheckoutReview() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();

  const units = 200;
  const cbmPerUnit = 0.012;
  const cbm = +(units * cbmPerUnit).toFixed(2);
  const freightRate = 320;
  const clearingRate = 180;

  const goods = 12400;
  const freight = Math.round(cbm * freightRate);
  const clearing = Math.round(cbm * clearingRate);
  const insurance = Math.round(goods * 0.01);
  const inspect = 180;
  const escrowFee = goods * 0.009;
  const total = goods + freight + clearing + insurance + inspect + escrowFee;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/checkout/shipping" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Checkout · 2 of 3</p>
              <p className="text-[13px] font-bold">Bundle review</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex items-center gap-1.5">
              {["Shipping", "Review", "Pay"].map((l, i) => (
                <div key={l} className="flex-1 flex flex-col gap-1">
                  <div className="h-1 rounded-full" style={{ background: i === 0 ? t.success : i === 1 ? t.accent : t.border }} />
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-center" style={{ color: i === 1 ? t.accent : i === 0 ? t.success : t.muted }}>{l}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>1 — Escrow agreement</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="px-3.5 py-3 border-b" style={{ borderColor: t.border }}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.success}15`, color: t.success }}>
                    <ShieldCheck className="size-5" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12.5px] font-bold">MagnetPay escrow #E-NEW</p>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>Held until delivery confirmed</p>
                  </div>
                </div>
              </div>
              {[
                { I: Building2, l: "Supplier", v: "Guangzhou Huayi Co." },
                { I: Package, l: "Order", v: "200 × pump body PB-A2" },
                { I: FileText, l: "Milestones", v: "4 stages · 20/30/20/30%" },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-start gap-3 px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <r.I className="size-4 mt-0.5 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>{r.l}</p>
                    <p className="text-[12px] font-semibold">{r.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>2 — Logistics bundle</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="px-3.5 py-3 border-b flex items-center gap-3" style={{ borderColor: t.border }}>
                <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Ship className="size-5" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Door-to-warehouse · MagnetPay-handled</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>Sea LCL · Guangzhou → Apapa, Lagos</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ background: `${t.success}15`, color: t.success }}>
                  <CheckCircle2 className="size-2.5" strokeWidth={3} /> Insured
                </span>
              </div>
              {[
                { I: Package, l: "Cargo volume", v: `${cbm} CBM · ${units} units × ${cbmPerUnit} CBM` },
                { I: MapPin, l: "ETA", v: "26–32 days · arriving by Apr 28" },
                { I: ShieldCheck, l: "Inspection", v: "SGS Lagos · pre-release" },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-start gap-3 px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <r.I className="size-4 mt-0.5 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>{r.l}</p>
                    <p className="text-[12px] font-semibold">{r.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>3 — Costs</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Goods (200 units × ¥62)", v: goods, c: t.ink },
                { l: `Sea freight · ${cbm} CBM × ¥${freightRate}`, v: freight, c: t.ink },
                { l: `Customs & clearing · ${cbm} CBM × ¥${clearingRate}`, v: clearing, c: t.ink },
                { l: "Cargo insurance · 1%", v: insurance, c: t.ink },
                { l: "SGS pre-release inspection", v: inspect, c: t.ink },
                { l: "Escrow fee · 0.9%", v: escrowFee, c: t.warn },
                { l: "Total locked in escrow", v: total, c: t.accent, bold: true },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-center justify-between px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className={`text-[12px] ${r.bold ? "font-bold" : "font-semibold"}`}>{r.l}</p>
                  <p className={`text-[13px] tabular-nums ${r.bold ? "font-bold" : "font-semibold"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: r.c }}>¥{r.v.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-center" style={{ color: t.muted }}>≈ ₦{Math.round(total * 229).toLocaleString()} at today's mid-rate</p>
            <div className="mt-3 rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}33` }}>
              <ShieldCheck className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                <span className="font-bold" style={{ color: t.ink }}>Freight, customs & clearing are estimates.</span> Final amount is set once goods are cleared. Extra costs are added to this order; overpayments are credited to your ₦ wallet before pickup.
              </p>
            </div>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/market/checkout/pay" })}
                className="h-13 w-full rounded-2xl flex items-center justify-between px-4 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" strokeWidth={2.6} /> Continue to pay</span>
                <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
