import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Ship, MapPin, Anchor, FileText, Truck, CheckCircle2, Package, MessageSquare, AlertTriangle, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/shipments/$id/")({
  head: () => ({ meta: [{ title: "Shipment tracker — Logistics" }] }),
  component: Tracker,
});

const MILESTONES = [
  { I: Package, l: "Picked up", d: "Guangzhou · Jul 02, 09:14", state: "done" },
  { I: Ship, l: "Departed origin port", d: "Nansha · Jul 05, 18:40", state: "done" },
  { I: Anchor, l: "In transit at sea", d: "South China Sea · Jul 12", state: "active" },
  { I: FileText, l: "Customs clearing", d: "Apapa · ETA Jul 26", state: "todo" },
  { I: Truck, l: "Out for delivery", d: "Lagos · ETA Jul 28", state: "todo" },
  { I: CheckCircle2, l: "Delivered", d: "—", state: "todo" },
];

function Tracker() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const { id } = Route.useParams();

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/logistics/shipments" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Tracker</p>
              <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
            </div>
            <Link to="/messages/$id" params={{ id: "t5" }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <MessageSquare className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          {/* Map */}
          <section className="px-4 mt-2">
            <div className="relative h-44 rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, #cfe5dc, #a8cdc0)`, border: `1px solid ${t.border}` }}>
              {/* lat lines */}
              <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 390 176" preserveAspectRatio="none">
                <path d="M30,130 Q150,40 360,90" stroke={t.navy} strokeWidth="2" fill="none" strokeDasharray="4 6" />
              </svg>
              {/* origin */}
              <div className="absolute" style={{ left: 24, top: 110 }}>
                <div className="size-3 rounded-full ring-2 ring-white" style={{ background: t.navy }} />
                <p className="mt-1 text-[10px] font-bold" style={{ color: t.navy }}>Guangzhou</p>
              </div>
              {/* dest */}
              <div className="absolute right-4" style={{ top: 70 }}>
                <div className="size-3 rounded-full ring-2 ring-white" style={{ background: t.accent }} />
                <p className="mt-1 text-[10px] font-bold text-right" style={{ color: t.accent }}>Lagos</p>
              </div>
              {/* ship */}
              <div className="absolute" style={{ left: "55%", top: "42%" }}>
                <div className="size-8 rounded-full grid place-items-center ring-4 ring-white/70" style={{ background: t.accent }}>
                  <Ship className="size-4 text-white" strokeWidth={2.4} />
                </div>
              </div>
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-bold" style={{ color: t.navy }}>
                <span>Day 7 of 26</span>
                <span className="flex items-center gap-1"><MapPin className="size-3" strokeWidth={2.6} /> 18.2°N, 110.4°E</span>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>ETA</p>
                <p className="text-[14px] font-extrabold">Jul 28 – Aug 03</p>
              </div>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden mx-2" style={{ background: t.border }}>
                <div className="h-full rounded-full" style={{ width: "62%", background: t.accent }} />
              </div>
              <p className="text-[13px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}>62%</p>
            </div>
          </section>

          {/* Milestones */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Milestones</p>
            <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {MILESTONES.map((m, i) => {
                const done = m.state === "done";
                const active = m.state === "active";
                const color = done ? t.success : active ? t.accent : t.border;
                return (
                  <div key={m.l} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-7 rounded-full grid place-items-center" style={{ background: done || active ? `${color}15` : t.bg, border: `1.5px solid ${color}`, color }}>
                        <m.I className="size-3.5" strokeWidth={2.5} />
                      </div>
                      {i < MILESTONES.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ background: done ? t.success : t.border }} />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-[12px] font-bold" style={{ color: active ? t.accent : t.ink }}>{m.l}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{m.d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick actions */}
          <section className="px-4 mt-4 grid grid-cols-3 gap-2">
            <Link to="/logistics/shipments/$id/customs" params={{ id }} className="rounded-2xl py-3 flex flex-col items-center gap-1.5 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <FileText className="size-4" strokeWidth={2.4} style={{ color: t.navy }} />
              <p className="text-[10.5px] font-bold">Customs</p>
            </Link>
            <Link to="/logistics/shipments/$id/pod" params={{ id }} className="rounded-2xl py-3 flex flex-col items-center gap-1.5 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <CheckCircle2 className="size-4" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[10.5px] font-bold">POD</p>
            </Link>
            <Link to="/logistics/shipments/$id/claim" params={{ id }} className="rounded-2xl py-3 flex flex-col items-center gap-1.5 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <AlertTriangle className="size-4" strokeWidth={2.4} style={{ color: t.warn }} />
              <p className="text-[10.5px] font-bold">Claim</p>
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
