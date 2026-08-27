import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Ship, FileText, MapPin, Search, Bell,
  ArrowRight, Clock, ShieldCheck, Plus, Anchor, Package,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { BottomNav } from "@/components/magnetpay/BottomNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/")({
  head: () => ({ meta: [{ title: "Logistics — MagnetPay" }] }),
  component: LogisticsHome,
});

const ACTIVE = [
  { id: "SHP-204711", lane: "Guangzhou → Lagos", mode: "Sea LCL", eta: "Aug 28", status: "In transit", pct: 62 },
  { id: "SHP-204693", lane: "Shenzhen → Apapa", mode: "Sea LCL", eta: "Jul 02", status: "At customs", pct: 88 },
  { id: "SHP-204658", lane: "Yiwu → Lagos", mode: "Sea FCL", eta: "Sep 14", status: "Booked", pct: 12 },
];

function LogisticsHome() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<BottomNav active="logistics" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Logistics</p>
              <p className="text-[18px] font-extrabold leading-tight">China → Nigeria</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Search className="size-4" strokeWidth={2.4} />
              </button>
              <Link to="/notifications" aria-label="Notifications" className="size-9 grid place-items-center rounded-full relative" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Bell className="size-4" strokeWidth={2.4} />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full" style={{ background: t.accent }} />
              </Link>
            </div>
          </header>

          {/* Hero card */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.navy}, #0a2a20)` }}>
              <div className="absolute -right-8 -bottom-8 opacity-10"><Ship className="size-40" strokeWidth={1.5} /></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">Get a sea freight quote</p>
              <p className="mt-1 text-[16px] font-extrabold leading-snug">Sea LCL & FCL from 12+ carriers in under 60 seconds.</p>
              <Link to="/logistics/quote" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold" style={{ background: t.accent }}>
                <Plus className="size-3.5" strokeWidth={2.6} /> New quote
              </Link>
            </div>
          </section>

          {/* Quick tiles */}
          <section className="px-4 mt-4 grid grid-cols-3 gap-2">
            {[
              { I: Ship, l: "Sea LCL" },
              { I: Anchor, l: "Sea FCL" },
              { I: Package, l: "Consolidate" },
            ].map((x) => (
              <Link to="/logistics/quote" key={x.l} className="rounded-2xl py-2.5 flex flex-col items-center gap-1.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <x.I className="size-4" strokeWidth={2.3} />
                </div>
                <p className="text-[10.5px] font-bold">{x.l}</p>
              </Link>
            ))}
          </section>

          {/* Active shipments */}
          <section className="px-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Active shipments</p>
              <Link to="/logistics/shipments" className="text-[11px] font-bold flex items-center gap-0.5" style={{ color: t.accent }}>
                See all <ArrowRight className="size-3" strokeWidth={2.6} />
              </Link>
            </div>
            <div className="space-y-2">
              {ACTIVE.map((s) => (
                <Link key={s.id} to="/logistics/shipments/$id" params={{ id: s.id }} className="block rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold truncate">{s.lane}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{s.id} · {s.mode}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${t.info}15`, color: t.info }}>{s.status}</span>
                  </div>
                  <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: t.border }}>
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: t.accent }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10.5px]" style={{ color: t.muted }}>
                    <span className="flex items-center gap-1"><Clock className="size-3" strokeWidth={2.5} /> ETA {s.eta}</span>
                    <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.ink }}>{s.pct}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Helper strip */}
          <section className="px-4 mt-5">
            <button onClick={() => toast("Cargo insurance auto-added", { description: "Up to ¥120,000 per shipment. Top-up at booking." })} className="w-full text-left rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${t.accent}15`, color: t.accent }}>
                <ShieldCheck className="size-4" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">Cargo insurance included</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Up to ¥120,000 per shipment, optional top-up.</p>
              </div>
              <ArrowRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
            </button>
          </section>

          <section className="px-4 mt-3">
            <Link to="/logistics/quote" className="w-full text-left rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${t.info}15`, color: t.info }}>
                <FileText className="size-4" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">HS code helper</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Find duty rates before you book.</p>
              </div>
              <ArrowRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
            </Link>
          </section>

          <section className="px-4 mt-3">
            <button onClick={() => toast("Warehouse pickup · Apapa, Lagos", { description: "Mon–Sat 8am–6pm · select at booking step" })} className="w-full text-left rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${t.success}15`, color: t.success }}>
                <MapPin className="size-4" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">Warehouse pickup</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Apapa, Lagos · open Mon–Sat 8am–6pm.</p>
              </div>
              <ArrowRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
