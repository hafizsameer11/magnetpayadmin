import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Camera, CheckCircle2, User, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/shipments/$id/pod")({
  head: () => ({ meta: [{ title: "POD — Logistics" }] }),
  component: POD,
});

function POD() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [signed, setSigned] = useState(false);
  const [photos, setPhotos] = useState<number>(2);

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Proof of delivery</p>
              <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 space-y-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Row icon={MapPin} l="Delivered to" v="Apapa Warehouse · Bay 3" />
              <Row icon={User} l="Received by" v="Adaeze Okafor · Warehouse manager" />
              <Row icon={Calendar} l="Date / time" v="Jul 28, 10:42 WAT" />
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Photos ({photos})</p>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1].map((i) => (
                <div key={i} className="aspect-square rounded-xl" style={{ background: `linear-gradient(135deg, ${t.navy}30, ${t.accent}30)`, border: `1px solid ${t.border}` }} />
              ))}
              <button onClick={() => setPhotos((n) => n + 1)} className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1" style={{ background: t.surface, border: `1.5px dashed ${t.border}`, color: t.muted }}>
                <Camera className="size-5" strokeWidth={2.2} />
                <p className="text-[10px] font-bold">Add photo</p>
              </button>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Signature</p>
            <button onClick={() => setSigned(true)}
              className="w-full h-32 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {signed ? (
                <svg viewBox="0 0 200 60" className="w-3/4 h-3/4">
                  <path d="M10,40 Q30,10 50,35 T100,25 T150,40 T190,20" fill="none" stroke={t.ink} strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              ) : (
                <p className="text-[12px]" style={{ color: t.muted }}>Tap to sign</p>
              )}
            </button>
            {signed && (
              <button onClick={() => setSigned(false)} className="mt-2 text-[11px] font-bold" style={{ color: t.accent }}>Clear signature</button>
            )}
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.success}10`, border: `1px solid ${t.success}33` }}>
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Confirming POD releases escrow funds to the supplier and closes this shipment.
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button disabled={!signed} onClick={() => navigate({ to: "/logistics/shipments" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: signed ? t.accent : t.muted, boxShadow: signed ? `0 12px 28px -10px ${t.accent}80` : "none" }}>
              <ShieldCheck className="size-4" strokeWidth={2.6} /> Confirm delivery
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ icon: Icon, l, v }: { icon: any; l: string; v: string }) {
  const t = escrowTheme;
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
      <div className="flex-1 min-w-0">
        <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>{l}</p>
        <p className="text-[12px] font-semibold truncate">{v}</p>
      </div>
    </div>
  );
}
