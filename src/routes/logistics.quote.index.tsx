import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, MapPin, Package, Ship, Info, ArrowRight,
  Home, Warehouse, ShieldCheck, Boxes,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/quote/")({
  head: () => ({ meta: [{ title: "New shipment — Logistics" }] }),
  component: QuoteRequest,
});

const ORIGINS = [
  { k: "GZ", city: "Guangzhou", hub: "Baiyun · MagnetPay HQ" },
  { k: "YW", city: "Yiwu", hub: "Futian Market hub" },
  { k: "SZ", city: "Shenzhen", hub: "Yantian gateway" },
  { k: "NB", city: "Ningbo", hub: "Beilun port hub" },
];

const PKG_TYPES = ["Carton", "Pallet", "Crate", "Drum", "Bag"];
const SEA_RATE = 320;     // ¥ / CBM
const CUSTOMS_RATE = 180; // ¥ / CBM

function QuoteRequest() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("GZ");
  const [delivery, setDelivery] = useState<"pickup" | "door">("pickup");
  const [pkgType, setPkgType] = useState("Pallet");
  const [units, setUnits] = useState("");
  const [cbm, setCbm] = useState("");
  const [weight, setWeight] = useState("");
  const [desc, setDesc] = useState("");
  const [pickupNote, setPickupNote] = useState("");

  const cbmNum = Math.max(0, parseFloat(cbm) || 0);
  const freight = Math.round(cbmNum * SEA_RATE);
  const customs = Math.round(cbmNum * CUSTOMS_RATE);
  const total = freight + customs;

  const originRow = ORIGINS.find((o) => o.k === origin)!;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/logistics" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Standalone shipping</p>
              <p className="text-[13px] font-bold">New shipment</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Hero */}
          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: `${t.success}10`, border: `1px solid ${t.success}30` }}>
              <ShieldCheck className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <div className="min-w-0">
                <p className="text-[12px] font-bold leading-tight">We handle freight, customs & clearing</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.sub }}>Sea LCL · CN → Apapa, Lagos · 26–32 days · insured</p>
              </div>
            </div>
          </section>

          {/* Pickup city */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Pickup city (China)</p>
            <div className="grid grid-cols-2 gap-2">
              {ORIGINS.map((o) => {
                const on = origin === o.k;
                return (
                  <button key={o.k} onClick={() => setOrigin(o.k)} className="rounded-2xl p-2.5 text-left"
                    style={{ background: t.surface, border: `1.5px solid ${on ? t.accent : t.border}` }}>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" strokeWidth={2.6} style={{ color: on ? t.accent : t.muted }} />
                      <p className="text-[12.5px] font-extrabold" style={{ color: on ? t.accent : t.ink }}>{o.city}</p>
                    </div>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: t.muted }}>{o.hub}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Delivery method */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Delivery in Lagos</p>
            <div className="space-y-2">
              {[
                { k: "pickup" as const, I: Warehouse, l: "Pickup at our Lagos warehouse", d: "Free · ready 26–32 days after pickup" },
                { k: "door" as const, I: Home, l: "Door delivery", d: "Quoted on arrival at HQ · added to order for payment" },
              ].map((o) => {
                const on = delivery === o.k;
                return (
                  <button key={o.k} onClick={() => setDelivery(o.k)} className="w-full rounded-2xl p-3 flex items-center gap-3 text-left"
                    style={{ background: t.surface, border: `1.5px solid ${on ? t.accent : t.border}` }}>
                    <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: on ? `${t.accent}15` : `${t.muted}15`, color: on ? t.accent : t.muted }}>
                      <o.I className="size-4" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold">{o.l}</p>
                      <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>{o.d}</p>
                    </div>
                    <span className="size-4 rounded-full shrink-0" style={{ background: on ? t.accent : "transparent", border: `2px solid ${on ? t.accent : t.border}` }} />
                  </button>
                );
              })}
            </div>

            {delivery === "pickup" ? (
              <div className="mt-2 rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Pickup at</p>
                <p className="text-[12px] font-bold mt-0.5">MagnetPay Apapa Warehouse</p>
                <p className="text-[11px] mt-0.5" style={{ color: t.sub }}>12 Wharf Road, Apapa, Lagos · Mon–Sat 8am–6pm</p>
                <p className="text-[10.5px] mt-1.5" style={{ color: t.muted }}>Bring shipment ID and a valid ID. SMS sent when ready.</p>
              </div>
            ) : (
              <div className="mt-2 rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
                <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
                <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                  Door delivery is <span className="font-bold" style={{ color: t.ink }}>quoted on arrival at HQ</span> based on your Lagos address. The fee is added to this shipment for payment before dispatch.
                </p>
              </div>
            )}
          </section>

          {/* Pickup instructions */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Pickup instructions (optional)</p>
            <textarea value={pickupNote} onChange={(e) => setPickupNote(e.target.value)} rows={3}
              placeholder={`Contact, address & access notes for ${originRow.city} pickup…`}
              className="w-full rounded-2xl p-3 text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          {/* Package info */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Package info</p>
            <div className="rounded-2xl p-3 space-y-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center gap-2.5">
                <Package className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's inside?"
                  className="flex-1 bg-transparent text-[13px] font-semibold outline-none" />
              </div>
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.muted }}>Package type</p>
                <div className="flex flex-wrap gap-1.5">
                  {PKG_TYPES.map((p) => {
                    const on = pkgType === p;
                    return (
                      <button key={p} onClick={() => setPkgType(p)} className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: on ? t.accent : t.bg, color: on ? "#fff" : t.ink, border: `1px solid ${on ? t.accent : t.border}` }}>{p}</button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field l="Units" v={units} setV={setUnits} icon={Boxes} />
                <Field l="CBM (total)" v={cbm} setV={setCbm} icon={Ship} />
                <Field l="Weight (kg)" v={weight} setV={setWeight} />
              </div>
            </div>
          </section>

          {/* Estimate */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Estimated cost</p>
                <span className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full" style={{ background: t.bg, color: t.sub, fontFamily: "'JetBrains Mono', monospace" }}>{cbmNum.toFixed(2)} CBM</span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-[12px]">
                <Line l={`Sea freight · ${originRow.city} → Apapa`} v={`¥${freight.toLocaleString()}`} sub={`¥${SEA_RATE}/CBM`} />
                <Line l="Customs & clearing" v={`¥${customs.toLocaleString()}`} sub={`¥${CUSTOMS_RATE}/CBM`} />
                <Line l="Lagos pickup" v={delivery === "pickup" ? "Free" : "On arrival"} sub={delivery === "pickup" ? undefined : "Door fee added at HQ"} muted />
              </div>
              <div className="mt-3 pt-3 flex items-end justify-between" style={{ borderTop: `1px dashed ${t.border}` }}>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Locked in escrow</p>
                  <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>Overpayments credited to ₦ wallet</p>
                </div>
                <p className="text-[22px] font-extrabold leading-none tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{total.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="sticky bottom-4 left-0 right-0 px-4 mt-5">
            <button onClick={() => navigate({ to: "/logistics/booking/docs" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              Continue to docs <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Field({ l, v, setV, icon: Icon }: { l: string; v: string; setV: (s: string) => void; icon?: any }) {
  const t = escrowTheme;
  return (
    <label className="rounded-xl p-2.5 block" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="size-3" strokeWidth={2.6} style={{ color: t.muted }} />}
        <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>{l}</p>
      </div>
      <input value={v} onChange={(e) => setV(e.target.value)} inputMode="decimal"
        className="w-full bg-transparent text-[14px] font-bold outline-none tabular-nums mt-0.5"
        style={{ fontFamily: "'JetBrains Mono', monospace" }} />
    </label>
  );
}

function Line({ l, v, sub, muted }: { l: string; v: string; sub?: string; muted?: boolean }) {
  const t = escrowTheme;
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold" style={{ color: muted ? t.muted : t.ink }}>{l}</p>
        {sub && <p className="text-[10px]" style={{ color: t.muted }}>{sub}</p>}
      </div>
      <p className="font-extrabold tabular-nums shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", color: muted ? t.muted : t.ink }}>{v}</p>
    </div>
  );
}
