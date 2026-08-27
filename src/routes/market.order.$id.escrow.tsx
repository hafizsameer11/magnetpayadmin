import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, CheckCircle2, Clock, Factory, Package, Ship, MapPin } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/order/$id/escrow")({
  head: () => ({ meta: [{ title: "Order escrow — MagnetPay" }] }),
  component: OrderEscrow,
});

const MS = [
  { I: ShieldCheck, l: "Funds in escrow", pct: 0, v: "¥0", s: "Released on deposit", state: "done" as const },
  { I: Factory, l: "Production complete", pct: 20, v: "¥2,659.52", s: "Held · awaiting QC photos", state: "active" as const },
  { I: Ship, l: "Shipped + BL uploaded", pct: 30, v: "¥3,989.28", s: "Held", state: "pending" as const },
  { I: MapPin, l: "Arrived at Apapa", pct: 20, v: "¥2,659.52", s: "Held", state: "pending" as const },
  { I: CheckCircle2, l: "Inspection passed", pct: 30, v: "¥3,989.28", s: "Held · SGS Lagos", state: "pending" as const },
];

function OrderEscrow() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const { id } = useParams({ from: "/market/order/$id/escrow" });
  const tone = (s: string) => (s === "done" ? t.success : s === "active" ? t.accent : t.muted);
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/order/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.success }}>● Funds protected</p>
              <p className="text-[13px] font-bold">Order #{id} · escrow</p>
            </div>
            <span className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 100%)` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Total in escrow</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥13,297.60</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-[10px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>5</p><p className="text-[9px]" style={{ color: "#C8C2B0" }}>milestones</p></div>
                <div><p className="text-[10px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>1</p><p className="text-[9px]" style={{ color: "#C8C2B0" }}>released</p></div>
                <div><p className="text-[10px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>4</p><p className="text-[9px]" style={{ color: "#C8C2B0" }}>held</p></div>
              </div>
            </div>
          </section>

          <section className="px-4 mt-4 space-y-2">
            {MS.map((m) => {
              const c = tone(m.state);
              return (
                <div key={m.l} className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: t.surface, border: `1px solid ${m.state === "active" ? t.accent : t.border}` }}>
                  <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${c}15`, color: c }}>
                    <m.I className="size-5" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[12.5px] font-bold leading-tight">{m.l}</p>
                      <p className="text-[12px] font-bold tabular-nums shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.v}</p>
                    </div>
                    <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>{m.s} · {m.pct}%</p>
                    {m.state === "active" && (
                      <Link to="/market/order/$id/release" params={{ id }}
                        className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold text-white"
                        style={{ background: t.accent }}>
                        <CheckCircle2 className="size-3.5" strokeWidth={2.6} /> Release this milestone
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Clock className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[10.5px]" style={{ color: t.info }}>Funds auto-release 72h after inspection unless you raise a dispute.</p>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
