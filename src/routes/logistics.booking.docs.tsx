import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, FileText, Upload, CheckCircle2, AlertCircle, ShieldCheck, Info } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/booking/docs")({
  head: () => ({ meta: [{ title: "Booking · Docs — Logistics" }] }),
  component: BookingDocs,
});

function BookingDocs() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [docs, setDocs] = useState({ ci: true, pl: true, hs: false });

  const items = [
    { k: "ci", l: "Commercial invoice", d: "PDF · supplier issued", req: true, file: "CI-204711.pdf" },
    { k: "pl", l: "Packing list", d: "PDF · weight & dimensions per carton", req: true, file: "PL-204711.pdf" },
    { k: "hs", l: "HS code declaration", d: "8413.70 · Centrifugal pumps · 5% duty", req: true, file: null },
  ] as const;

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Step 2 of 2</p>
              <p className="text-[13px] font-bold">Shipping documents</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex items-center gap-1.5">
              {["Pickup", "Docs", "Confirm"].map((l, i) => (
                <div key={l} className="flex-1 flex flex-col gap-1">
                  <div className="h-1 rounded-full" style={{ background: i <= 1 ? t.accent : t.border }} />
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-center" style={{ color: i === 1 ? t.accent : i < 1 ? t.success : t.muted }}>{l}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5 space-y-2">
            {items.map((x) => {
              const on = docs[x.k as keyof typeof docs];
              return (
                <div key={x.k} className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${on ? t.success : t.border}` }}>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: on ? `${t.success}15` : `${t.muted}15`, color: on ? t.success : t.muted }}>
                      <FileText className="size-4" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12.5px] font-bold">{x.l}</p>
                        {x.req && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${t.accent}15`, color: t.accent }}>REQUIRED</span>}
                      </div>
                      <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>{on && x.file ? x.file : x.d}</p>
                    </div>
                    {on ? (
                      <CheckCircle2 className="size-5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
                    ) : (
                      <button onClick={() => setDocs((d) => ({ ...d, [x.k]: true }))}
                        className="rounded-xl px-2.5 py-1.5 flex items-center gap-1 text-[11px] font-bold"
                        style={{ background: t.accent, color: "#fff" }}>
                        <Upload className="size-3" strokeWidth={2.6} /> Upload
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}33` }}>
              <AlertCircle className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Missing the HS declaration can delay customs. Add it now or our team will help on pickup.
              </p>
            </div>
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Documents are stored against this shipment and shared with customs on arrival.
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/logistics/booking/confirmation" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <ShieldCheck className="size-4" strokeWidth={2.6} /> Confirm booking
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
