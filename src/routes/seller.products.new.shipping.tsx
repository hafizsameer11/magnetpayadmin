import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, CheckCircle2, Ship, Package, Clock, MapPin, Info } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { ProductStepper } from "@/components/magnetpay/ProductStepper";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/products/new/shipping")({
  head: () => ({ meta: [{ title: "Add product · Shipping — Seller" }] }),
  component: AddShipping,
});

const ORIGINS = ["Guangzhou", "Yiwu", "Shenzhen", "Ningbo"];

function AddShipping() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("Guangzhou");
  const [leadMin, setLeadMin] = useState("5");
  const [leadMax, setLeadMax] = useState("10");
  const [cbm, setCbm] = useState("0.012");
  const [weight, setWeight] = useState("2.1");
  const [pkg, setPkg] = useState("Carton");

  const SEA = 320;
  const cbmNum = parseFloat(cbm) || 0;
  const estPerUnit = Math.round(cbmNum * SEA);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/products/new/media" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Add product · 4 of 4</p>
              <p className="text-[13px] font-bold">Lead time & shipping</p>
            </div>
            <div className="size-9" />
          </header>

          <ProductStepper step={4} />

          {/* MagnetPay handles freight */}
          <section className="px-4 mt-5">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.success}10`, border: `1px solid ${t.success}30` }}>
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <div>
                <p className="text-[12px] font-bold">MagnetPay handles freight, customs & clearing</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.sub }}>You only drop the goods at our city hub. CBM you enter is used to estimate buyer shipping.</p>
              </div>
            </div>
          </section>

          {/* Origin */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-1" style={{ color: t.muted }}>
              <MapPin className="size-3" strokeWidth={2.6} /> Drop-off city
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ORIGINS.map((o) => {
                const on = origin === o;
                return (
                  <button key={o} onClick={() => setOrigin(o)} className="rounded-2xl p-2.5 text-left"
                    style={{ background: t.surface, border: `1.5px solid ${on ? t.accent : t.border}` }}>
                    <p className="text-[12.5px] font-extrabold" style={{ color: on ? t.accent : t.ink }}>{o}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>MagnetPay hub</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Lead time */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-1" style={{ color: t.muted }}>
              <Clock className="size-3" strokeWidth={2.6} /> Production lead time
            </p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <NumField v={leadMin} setV={setLeadMin} suffix="days" />
              <p className="text-[12px] font-bold" style={{ color: t.muted }}>to</p>
              <NumField v={leadMax} setV={setLeadMax} suffix="days" />
            </div>
          </section>

          {/* Package */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-1" style={{ color: t.muted }}>
              <Package className="size-3" strokeWidth={2.6} /> Per-unit packaging
            </p>
            <div className="rounded-2xl p-3 space-y-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex flex-wrap gap-1.5">
                {["Carton", "Pallet", "Crate", "Drum", "Bag"].map((p) => {
                  const on = pkg === p;
                  return (
                    <button key={p} onClick={() => setPkg(p)} className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: on ? t.accent : t.bg, color: on ? "#fff" : t.ink, border: `1px solid ${on ? t.accent : t.border}` }}>{p}</button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumField v={cbm} setV={setCbm} suffix="CBM / unit" />
                <NumField v={weight} setV={setWeight} suffix="kg / unit" />
              </div>
            </div>
          </section>

          {/* Estimate */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Buyer sees · sea LCL</p>
                <Ship className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} />
              </div>
              <p className="mt-1 text-[20px] font-extrabold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>≈ ¥{estPerUnit} <span className="text-[11px] font-bold" style={{ color: t.muted }}>/ unit</span></p>
              <p className="mt-1 text-[10.5px]" style={{ color: t.muted }}>¥{SEA}/CBM · {origin} → Apapa, Lagos · 26–32 days</p>
              <div className="mt-2 pt-2 flex items-start gap-1.5" style={{ borderTop: `1px dashed ${t.border}` }}>
                <Info className="size-3 mt-0.5 shrink-0" strokeWidth={2.6} style={{ color: t.muted }} />
                <p className="text-[10px]" style={{ color: t.muted }}>Customs & clearing added on top by MagnetPay. Final amount locked in escrow.</p>
              </div>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/seller/catalog" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <CheckCircle2 className="size-4" strokeWidth={2.6} /> Publish product
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function NumField({ v, setV, suffix }: { v: string; setV: (s: string) => void; suffix: string }) {
  const t = escrowTheme;
  return (
    <label className="rounded-xl px-2.5 py-2 flex-1 flex items-center gap-2" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <input value={v} onChange={(e) => setV(e.target.value)} inputMode="decimal"
        className="w-full bg-transparent text-[14px] font-bold tabular-nums outline-none"
        style={{ fontFamily: "'JetBrains Mono', monospace" }} />
      <span className="text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: t.muted }}>{suffix}</span>
    </label>
  );
}
