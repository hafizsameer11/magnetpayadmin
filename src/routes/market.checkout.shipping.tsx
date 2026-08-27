import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Ship, Info, ShieldCheck, Warehouse, Home, MapPin, Package, FileCheck2, Truck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/checkout/shipping")({
  head: () => ({ meta: [{ title: "Checkout · Shipping — MagnetPay" }] }),
  component: CheckoutShipping,
});

// Demo numbers — driven by product CBM × quantity.
const UNITS = 200;
const CBM_PER_UNIT = 0.012;
const CBM = +(UNITS * CBM_PER_UNIT).toFixed(2); // 2.4 CBM
const FREIGHT_PER_CBM = 320; // ¥ — sea LCL Guangzhou → Lagos
const CLEARING_PER_CBM = 180; // ¥ — customs duty + port + clearing
const FREIGHT = Math.round(CBM * FREIGHT_PER_CBM);
const CLEARING = Math.round(CBM * CLEARING_PER_CBM);

function CheckoutShipping() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<"pickup" | "doorstep">("pickup");
  const [address, setAddress] = useState("");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/cart" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Checkout · 1 of 3</p>
              <p className="text-[13px] font-bold">Shipping & delivery</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex items-center gap-1.5">
              {["Shipping", "Review", "Pay"].map((l, i) => (
                <div key={l} className="flex-1 flex flex-col gap-1">
                  <div className="h-1 rounded-full" style={{ background: i === 0 ? t.accent : t.border }} />
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-center" style={{ color: i === 0 ? t.accent : t.muted }}>{l}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MagnetPay handles everything */}
          <section className="px-4 mt-5">
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.success}15`, color: t.success }}>
                <ShieldCheck className="size-4" strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold">We handle freight, customs & clearing</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Sea LCL · Guangzhou → Apapa · 26–32 days · insured</p>
              </div>
            </div>
          </section>

          {/* CBM-driven quote */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Your shipment</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="px-3.5 py-3 flex items-center gap-3 border-b" style={{ borderColor: t.border }}>
                <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Package className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold">200 × pump body PB-A2</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>0.012 CBM / unit · seller-declared</p>
                </div>
                <p className="text-[15px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{CBM} CBM</p>
              </div>
              {[
                { I: Ship, l: "Sea freight", s: `${CBM} CBM × ¥${FREIGHT_PER_CBM}/CBM`, v: `¥${FREIGHT.toLocaleString()}` },
                { I: FileCheck2, l: "Customs & clearing", s: `${CBM} CBM × ¥${CLEARING_PER_CBM}/CBM`, v: `¥${CLEARING.toLocaleString()}` },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-center gap-3 px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <r.I className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold">{r.l}</p>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>{r.s}</p>
                  </div>
                  <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.v}</p>
                </div>
              ))}
              <div className="flex items-center justify-between px-3.5 py-3" style={{ background: `${t.accent}08` }}>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: t.muted }}>Logistics total</p>
                <p className="text-[15px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}>¥{(FREIGHT + CLEARING).toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Nigeria delivery */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>After clearing · Nigeria delivery</p>
            <div className="space-y-1.5">
              {[
                { k: "pickup", I: Warehouse, l: "Pickup at our warehouse", d: "Apapa, Lagos · free · ready in 1–2 days after clearing", price: "Free" },
                { k: "doorstep", I: Home, l: "Doorstep delivery", d: "We'll quote final cost once goods reach our warehouse", price: "Quote" },
              ].map((m) => {
                const on = delivery === m.k;
                return (
                  <button key={m.k} onClick={() => setDelivery(m.k as "pickup" | "doorstep")}
                    className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
                    style={{ background: t.surface, border: `1px solid ${on ? t.accent : t.border}` }}>
                    <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                      <m.I className="size-4" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold">{m.l}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{m.d}</p>
                    </div>
                    <p className="text-[11.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: on ? t.accent : t.ink }}>{m.price}</p>
                  </button>
                );
              })}
            </div>

            {delivery === "doorstep" && (
              <div className="mt-2 rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <label className="text-[10.5px] font-bold uppercase tracking-[0.14em] flex items-center gap-1.5" style={{ color: t.muted }}>
                  <MapPin className="size-3" strokeWidth={2.6} /> Delivery address
                </label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, state, contact phone"
                  className="mt-1.5 w-full bg-transparent text-[12px] outline-none resize-none"
                  rows={2} style={{ color: t.ink }} />
                <p className="mt-1 text-[10.5px]" style={{ color: t.muted }}>
                  We'll contact you with the final doorstep cost when your goods arrive our warehouse.
                </p>
              </div>
            )}
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}33` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Estimates — final cost set on clearing. Overpayments credited to your ₦ wallet. All charges locked in escrow.
              </p>
            </div>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/market/checkout/review" })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <ShieldCheck className="size-4" strokeWidth={2.6} /> Continue to review
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
