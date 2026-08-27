import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, AlertTriangle, Camera, Info, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/shipments/$id/claim")({
  head: () => ({ meta: [{ title: "Claim — Logistics" }] }),
  component: Claim,
});

const TYPES = [
  { k: "damage", l: "Damage", d: "Goods arrived damaged" },
  { k: "loss", l: "Loss", d: "Cartons missing or lost" },
  { k: "short", l: "Shortage", d: "Quantity less than declared" },
  { k: "delay", l: "Delay", d: "Service-level breach" },
];

function Claim() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [type, setType] = useState("damage");
  const [amount, setAmount] = useState("12500");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState(1);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/logistics/shipments/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>File a claim</p>
              <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}33` }}>
              <AlertTriangle className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                File within 7 days of delivery. Cargo insurance covers up to <span className="font-bold" style={{ color: t.ink }}>¥120,000</span> per shipment.
              </p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Claim type</p>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((x) => {
                const on = type === x.k;
                return (
                  <button key={x.k} onClick={() => setType(x.k)} className="rounded-2xl p-3 text-left"
                    style={{ background: t.surface, border: `1.5px solid ${on ? t.accent : t.border}` }}>
                    <p className="text-[12px] font-bold" style={{ color: on ? t.accent : t.ink }}>{x.l}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>{x.d}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Estimated loss</p>
            <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <span className="text-[14px] font-bold" style={{ color: t.muted }}>¥</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-transparent text-[18px] font-extrabold outline-none tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Evidence photos</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: photos }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl" style={{ background: `linear-gradient(135deg, ${t.warn}30, ${t.accent}30)`, border: `1px solid ${t.border}` }} />
              ))}
              <button onClick={() => setPhotos((n) => n + 1)} className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1" style={{ background: t.surface, border: `1.5px dashed ${t.border}`, color: t.muted }}>
                <Camera className="size-5" strokeWidth={2.2} />
                <p className="text-[10px] font-bold">Add</p>
              </button>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Description</p>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4}
              placeholder="Describe what happened, when you noticed it, and which cartons are affected."
              className="w-full rounded-2xl p-3 text-[12.5px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Most claims are resolved in 5–10 business days. Approved payouts are credited to your ₦ wallet.
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/logistics/shipments" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <ShieldCheck className="size-4" strokeWidth={2.6} /> Submit claim
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
