import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Send, CheckCircle2, Clock } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/quotes")({
  head: () => ({ meta: [{ title: "Quotations — Seller" }] }),
  component: Quotes,
});

const Q = [
  { id: "QT-3318", rfq: "RFQ-9265", buyer: "Lagos Pumps Ltd", item: "Coil set CS-7 · 200 units", total: 49600, sent: "2h ago", status: "sent" as const, expires: "in 6d" },
  { id: "QT-3316", rfq: "RFQ-9241", buyer: "Accra Spares", item: "Magnet MG-9 · 1,200 units", total: 93600, sent: "1d ago", status: "accepted" as const, expires: "Order #4831" },
  { id: "QT-3309", rfq: "RFQ-9230", buyer: "Tema Industrial", item: "Pump body PB-A2 · 400 units", total: 91200, sent: "3d ago", status: "sent" as const, expires: "in 4d" },
  { id: "QT-3294", rfq: "RFQ-9215", buyer: "Cotonou Mfg", item: "Shaft SH-3 · 600 units", total: 34800, sent: "8d ago", status: "expired" as const, expires: "Expired 1d" },
  { id: "QT-3287", rfq: "RFQ-9210", buyer: "Abidjan Pumps", item: "Bearing B-22 · 3,000 units", total: 78000, sent: "10d ago", status: "accepted" as const, expires: "Order #4810" },
];

function Quotes() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [tab, setTab] = useState<"sent" | "accepted" | "expired" | "all">("all");
  const list = Q.filter((q) => tab === "all" ? true : q.status === tab);
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<SellerNav active="home" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Seller</p>
              <p className="text-[13px] font-bold">Quotations</p>
            </div>
            <Link to="/seller/rfq" className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.accent }}>RFQ inbox</Link>
          </header>

          {/* Summary */}
          <section className="px-4 mt-2 grid grid-cols-3 gap-2">
            <Kpi label="Sent" v={String(Q.filter(q => q.status === "sent").length)} c={t.info} />
            <Kpi label="Accepted" v={String(Q.filter(q => q.status === "accepted").length)} c={t.success} />
            <Kpi label="Win rate" v="62%" c={t.accent} />
          </section>

          <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
            {[
              { k: "all" as const, l: `All · ${Q.length}` },
              { k: "sent" as const, l: "Awaiting" },
              { k: "accepted" as const, l: "Accepted" },
              { k: "expired" as const, l: "Expired" },
            ].map((c) => {
              const on = tab === c.k;
              return (
                <button key={c.k} onClick={() => setTab(c.k)} className="text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: on ? t.accent : t.surface, color: on ? "#fff" : t.ink, border: `1px solid ${on ? t.accent : t.border}` }}>{c.l}</button>
              );
            })}
          </section>

          <section className="px-4 mt-3 space-y-2">
            {list.map((q) => {
              const c = q.status === "sent" ? t.info : q.status === "accepted" ? t.success : t.muted;
              const I = q.status === "sent" ? Send : q.status === "accepted" ? CheckCircle2 : Clock;
              return (
                <Link key={q.id} to="/seller/rfq/$id/quote" params={{ id: q.rfq }}
                  className="block rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-2">
                    <p className="text-[10.5px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>{q.id}</p>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: `${c}15`, color: c }}>
                      <I className="size-2.5" strokeWidth={2.6} />{q.status}
                    </span>
                    <p className="ml-auto text-[10.5px]" style={{ color: t.muted }}>{q.sent}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-extrabold">{q.buyer}</p>
                      <p className="text-[11px] truncate" style={{ color: t.sub }}>{q.item}</p>
                      <p className="text-[10.5px] mt-0.5" style={{ color: c }}>{q.expires}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{q.total.toLocaleString()}</p>
                      <ChevronRight className="size-4 ml-auto mt-0.5" strokeWidth={2.4} style={{ color: t.muted }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Kpi({ label, v, c }: { label: string; v: string; c: string }) {
  const t = escrowTheme;
  return (
    <div className="rounded-2xl p-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <p className="text-[18px] font-extrabold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: c }}>{v}</p>
      <p className="text-[9.5px] font-bold uppercase tracking-wider mt-1" style={{ color: t.muted }}>{label}</p>
    </div>
  );
}
