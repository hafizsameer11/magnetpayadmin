import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, FileText, CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/shipments/$id/customs")({
  head: () => ({ meta: [{ title: "Customs status — Logistics" }] }),
  component: Customs,
});

const STAGES = [
  { l: "Manifest filed", d: "Jul 24, 14:22", done: true },
  { l: "Duty assessed", d: "Jul 25, 09:10 · ₦318,400", done: true },
  { l: "Inspection scheduled", d: "Jul 26, 11:00", done: false, active: true },
  { l: "Released", d: "Pending", done: false },
];

function Customs() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const { id } = Route.useParams();
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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Customs</p>
              <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy}, #0a2a20)` }}>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Status</p>
              <p className="mt-1 text-[18px] font-extrabold">Inspection scheduled</p>
              <p className="text-[11px] opacity-80">Apapa Customs · Jul 26, 11:00</p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Stat l="Duty est." v="₦318,400" />
                <Stat l="VAT" v="₦94,200" />
                <Stat l="Total est." v="₦412,600" />
              </div>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Stages</p>
            <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {STAGES.map((s, i) => {
                const c = s.done ? t.success : s.active ? t.accent : t.border;
                return (
                  <div key={s.l} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-7 rounded-full grid place-items-center" style={{ background: s.done || s.active ? `${c}15` : t.bg, border: `1.5px solid ${c}`, color: c }}>
                        {s.done ? <CheckCircle2 className="size-3.5" strokeWidth={2.6} /> : <Clock className="size-3.5" strokeWidth={2.6} />}
                      </div>
                      {i < STAGES.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ background: s.done ? t.success : t.border }} />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-[12px] font-bold" style={{ color: s.active ? t.accent : t.ink }}>{s.l}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{s.d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Documents</p>
            <div className="rounded-2xl divide-y" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Bill of lading", d: "BOL-204711.pdf" },
                { l: "Commercial invoice", d: "CI-204711.pdf" },
                { l: "Customs assessment", d: "ASMT-99441.pdf" },
              ].map((x, i) => (
                <div key={x.l} className="p-3 flex items-center gap-3" style={i > 0 ? { borderTop: `1px solid ${t.border}` } : undefined}>
                  <FileText className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate">{x.l}</p>
                    <p className="text-[10.5px] truncate" style={{ color: t.muted }}>{x.d}</p>
                  </div>
                  <button className="text-[11px] font-bold" style={{ color: t.accent }}>View</button>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}33` }}>
              <AlertCircle className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Customs & clearing shown are <span className="font-bold" style={{ color: t.ink }}>estimates</span>. Final amount is set on release; any difference is credited to your ₦ wallet before pickup.
              </p>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl py-2" style={{ background: "#ffffff10", border: "1px solid #ffffff20" }}>
      <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{l}</p>
      <p className="mt-0.5 text-[12px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</p>
    </div>
  );
}
