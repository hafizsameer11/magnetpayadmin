import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/order/$id/release")({
  head: () => ({ meta: [{ title: "Release milestone — MagnetPay" }] }),
  component: OrderRelease,
});

function OrderRelease() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const { id } = useParams({ from: "/market/order/$id/release" });
  const [confirmed, setConfirmed] = useState(false);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/order/$id/escrow" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>● Release funds</p>
              <p className="text-[13px] font-bold">Production milestone</p>
            </div>
            <span className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-3xl p-5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Releasing to Guangzhou Huayi</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}>¥2,659.52</p>
              <p className="mt-1 text-[11px]" style={{ color: t.sub }}>20% · Production complete milestone</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Confirm before releasing</p>
            <div className="rounded-2xl divide-y" style={{ background: t.surface, border: `1px solid ${t.border}`, borderColor: t.border }}>
              {[
                "QC photos received and reviewed",
                "Spec sheet matches purchase order",
                "Supplier has confirmed shipment readiness",
              ].map((l) => (
                <label key={l} className="flex items-center gap-3 px-3.5 py-3 cursor-pointer">
                  <span className="size-5 rounded-md grid place-items-center shrink-0" style={{ background: `${t.success}15`, color: t.success, border: `1.5px solid ${t.success}` }}>
                    <CheckCircle2 className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[12px]">{l}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}30` }}>
              <AlertTriangle className="size-4 shrink-0 mt-0.5" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[10.5px]" style={{ color: t.warn }}>Released funds cannot be recalled. If goods don't match, raise a dispute instead.</p>
            </div>
          </section>

          <section className="px-4 mt-4 space-y-2">
            <button onClick={() => { setConfirmed(true); setTimeout(() => navigate({ to: "/market/order/$id/escrow", params: { id } }), 1200); }}
              disabled={confirmed}
              className="w-full h-13 rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: confirmed ? t.success : t.accent, boxShadow: `0 12px 28px -10px ${(confirmed ? t.success : t.accent)}80` }}>
              {confirmed ? <><ShieldCheck className="size-4" strokeWidth={2.6} /> Released</> : <><CheckCircle2 className="size-4" strokeWidth={2.6} /> Release ¥2,659.52</>}
            </button>
            <Link to="/market/order/$id/dispute" params={{ id }}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[12px] font-semibold"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.danger }}>
              Raise a dispute instead
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
