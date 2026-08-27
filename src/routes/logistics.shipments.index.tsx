import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Ship, Plane, Truck, Clock, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { BottomNav } from "@/components/magnetpay/BottomNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/shipments/")({
  head: () => ({ meta: [{ title: "Shipments — Logistics" }] }),
  component: Shipments,
});

const SHIPMENTS = [
  { id: "SHP-204732", lane: "Guangzhou → Lagos", mode: "sea", eta: "Jul 28 – Aug 03", status: "Booked", pct: 8 },
  { id: "SHP-204711", lane: "Guangzhou → Lagos", mode: "sea", eta: "Aug 28", status: "In transit", pct: 62 },
  { id: "SHP-204693", lane: "Shenzhen → Apapa", mode: "air", eta: "Jul 02", status: "At customs", pct: 88 },
  { id: "SHP-204658", lane: "Yiwu → Lagos", mode: "rail", eta: "Sep 14", status: "Booked", pct: 12 },
  { id: "SHP-204612", lane: "Ningbo → Lagos", mode: "sea", eta: "Jun 18", status: "Delivered", pct: 100 },
  { id: "SHP-204588", lane: "Shanghai → Lagos", mode: "air", eta: "Jun 05", status: "Delivered", pct: 100 },
];

const TABS = ["All", "Active", "Customs", "Delivered"] as const;
const MODE_ICON = { sea: Ship, air: Plane, rail: Truck };

function statusStyle(s: string, t: typeof escrowTheme) {
  if (s === "Delivered") return { bg: `${t.success}15`, fg: t.success };
  if (s === "At customs") return { bg: `${t.warn}15`, fg: t.warn };
  if (s === "In transit") return { bg: `${t.info}15`, fg: t.info };
  return { bg: `${t.muted}20`, fg: t.sub };
}

function Shipments() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const [tab, setTab] = useState<typeof TABS[number]>("All");
  const list = SHIPMENTS.filter((s) => {
    if (tab === "All") return true;
    if (tab === "Active") return s.status === "In transit" || s.status === "Booked";
    if (tab === "Customs") return s.status === "At customs";
    return s.status === "Delivered";
  });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<BottomNav active="logistics" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Logistics</p>
            <p className="text-[20px] font-extrabold leading-tight">Shipments</p>
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-2xl px-3 py-2.5 flex items-center gap-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input placeholder="Search by ID, lane, supplier" className="flex-1 bg-transparent text-[12.5px] outline-none" />
            </div>
          </section>

          <section className="px-4 mt-3 flex items-center gap-1.5 overflow-x-auto">
            {TABS.map((x) => {
              const on = tab === x;
              return (
                <button key={x} onClick={() => setTab(x)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0"
                  style={{ background: on ? t.accent : t.surface, color: on ? "#fff" : t.ink, border: `1px solid ${on ? t.accent : t.border}` }}>
                  {x}
                </button>
              );
            })}
          </section>

          <section className="px-4 mt-4 space-y-2">
            {list.map((s) => {
              const Icon = MODE_ICON[s.mode as keyof typeof MODE_ICON];
              const st = statusStyle(s.status, t);
              return (
                <Link key={s.id} to="/logistics/shipments/$id" params={{ id: s.id }}
                  className="block rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                      <Icon className="size-4" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12.5px] font-bold truncate">{s.lane}</p>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: st.bg, color: st.fg }}>{s.status}</span>
                      </div>
                      <p className="text-[10.5px] mt-0.5 tabular-nums" style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>{s.id}</p>
                    </div>
                    <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                  </div>
                  <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: t.border }}>
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.status === "Delivered" ? t.success : t.accent }} />
                  </div>
                  <p className="mt-1.5 text-[10.5px] flex items-center gap-1" style={{ color: t.muted }}>
                    <Clock className="size-3" strokeWidth={2.5} /> ETA {s.eta}
                  </p>
                </Link>
              );
            })}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
