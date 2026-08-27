import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowDownToLine, Filter, Wallet } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/payouts/")({
  head: () => ({ meta: [{ title: "Payouts — Seller" }] }),
  component: Payouts,
});

const ROWS = [
  { id: "PO-2412", date: "Mon · Dec 9", v: 112220, s: "Scheduled", c: "#1D4ED8", orders: 14 },
  { id: "PO-2411", date: "Dec 2", v: 86400, s: "Paid", c: "#0F766E", orders: 11 },
  { id: "PO-2410", date: "Nov 25", v: 94800, s: "Paid", c: "#0F766E", orders: 13 },
  { id: "PO-2409", date: "Nov 18", v: 71200, s: "Paid", c: "#0F766E", orders: 9 },
  { id: "PO-2408", date: "Nov 11", v: 58900, s: "Paid", c: "#0F766E", orders: 8 },
  { id: "PO-2407", date: "Nov 4", v: 102400, s: "Paid", c: "#0F766E", orders: 12 },
];

function Payouts() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
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
              <p className="text-[13px] font-bold">Payouts</p>
            </div>
            <button className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Filter className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          {/* Summary */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4" style={{ background: t.navy, color: "#fff" }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.65)" }}>Available now</p>
              <p className="mt-1 text-[30px] font-extrabold leading-none tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥112,220<span className="text-[15px] opacity-60">.40</span></p>
              <p className="text-[10.5px] mt-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>Auto-payout Mon · ICBC ····3821</p>
              <button className="mt-3 w-full rounded-2xl py-2.5 text-[12.5px] font-bold flex items-center justify-center gap-1.5" style={{ background: t.accent, color: "#fff" }}>
                <Wallet className="size-4" strokeWidth={2.6} /> Withdraw now
              </button>
            </div>
          </section>

          {/* Filter chips */}
          <section className="px-4 mt-4 flex gap-1.5">
            {["All", "Paid", "Scheduled", "Failed"].map((c, i) => (
              <button key={c} className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: i === 0 ? t.accent : t.surface, color: i === 0 ? "#fff" : t.ink, border: `1px solid ${i === 0 ? t.accent : t.border}` }}>{c}</button>
            ))}
          </section>

          {/* List */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {ROWS.map((r, i, a) => (
                <Link key={r.id} to="/seller/payouts/$id" params={{ id: r.id }}
                  className={`px-3.5 py-3 flex items-center gap-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                    <ArrowDownToLine className="size-4" strokeWidth={2.4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.id}</p>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${r.c}15`, color: r.c }}>{r.s}</span>
                    </div>
                    <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>{r.date} · {r.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{r.v.toLocaleString()}</p>
                    <ChevronRight className="size-3.5 ml-auto mt-0.5" strokeWidth={2.4} style={{ color: t.muted }} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
