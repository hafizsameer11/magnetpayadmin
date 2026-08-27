import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Plus, Star, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/rfq/inbox")({
  head: () => ({ meta: [{ title: "RFQ inbox — MagnetPay" }] }),
  component: RFQInbox,
});

type Tab = "open" | "closed";

const RFQS = [
  {
    id: "R-441",
    title: "Cast-iron pump bodies PB-A2 · 200 units",
    sent: "Today · 14:02",
    status: "open" as Tab,
    quotes: [
      { s: "Guangzhou Huayi", r: 4.8, p: 54, lead: "21d", note: "FOB GZ, SGS OK", best: true },
      { s: "Wenzhou Marine", r: 4.6, p: 58, lead: "18d", note: "FOB NB" },
      { s: "Shanghai PumpCo", r: 4.9, p: 49, lead: "30d", note: "CIF Lagos" },
    ],
  },
  {
    id: "R-438",
    title: "LED panels 600×600 · 500 units",
    sent: "Yesterday · 11:18",
    status: "open" as Tab,
    quotes: [
      { s: "Shenzhen Lumica", r: 4.9, p: 88, lead: "14d", note: "FOB SZ, samples ready", best: true },
      { s: "Zhongshan Lights", r: 4.5, p: 92, lead: "21d", note: "FOB ZS" },
    ],
  },
  {
    id: "R-422",
    title: "Polyester woven bags · 50k",
    sent: "Mar 12",
    status: "closed" as Tab,
    quotes: [
      { s: "Yiwu Trade", r: 4.7, p: 2.9, lead: "10d", note: "EXW · accepted", best: true },
    ],
  },
];

function RFQInbox() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const [tab, setTab] = useState<Tab>("open");
  const list = RFQS.filter((r) => r.status === tab);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>RFQ inbox</p>
              <p className="text-[13px] font-bold">Your quotes</p>
            </div>
            <Link to="/market/rfq" className="size-9 grid place-items-center rounded-full text-white" style={{ background: t.accent }}>
              <Plus className="size-4" strokeWidth={2.6} />
            </Link>
          </header>

          <section className="px-4 mt-2">
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {(["open", "closed"] as Tab[]).map((x) => {
                const on = tab === x;
                return (
                  <button key={x} onClick={() => setTab(x)}
                    className="flex-1 h-8 rounded-xl text-[11px] font-bold uppercase tracking-[0.12em]"
                    style={{ background: on ? t.navy : "transparent", color: on ? "#fff" : t.sub }}>
                    {x}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4 space-y-3">
            {list.map((r) => (
              <article key={r.id} className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="p-3.5 border-b" style={{ borderColor: t.border }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>#{r.id} · {r.sent}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]"
                      style={{ background: r.status === "open" ? `${t.warn}15` : `${t.success}15`, color: r.status === "open" ? t.warn : t.success }}>
                      {r.status === "open" ? <Clock className="size-2.5" strokeWidth={3} /> : <CheckCircle2 className="size-2.5" strokeWidth={3} />}
                      {r.status === "open" ? `${r.quotes.length} quotes` : "Closed"}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] font-bold leading-tight">{r.title}</p>
                </div>
                <div>
                  {r.quotes.map((q, i, a) => (
                    <Link key={q.s} to="/market/quote/$id" params={{ id: `${r.id}-${i}` }}
                      className={`flex items-center gap-3 px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12.5px] font-bold truncate">{q.s}</p>
                          {q.best && (
                            <span className="inline-flex items-center px-1.5 py-px rounded-full text-[8.5px] font-bold uppercase tracking-[0.12em]" style={{ background: `${t.accent}15`, color: t.accent }}>
                              Best
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px]" style={{ color: t.muted }}>
                          <span className="inline-flex items-center gap-0.5"><Star className="size-2.5 fill-current" style={{ color: t.warn }} />{q.r}</span>
                          <span>·</span><span>{q.lead}</span>
                          <span>·</span><span className="truncate">{q.note}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: q.best ? t.accent : t.ink }}>¥{q.p}</p>
                        <p className="text-[9px]" style={{ color: t.muted }}>/unit</p>
                      </div>
                      <ArrowRight className="size-3.5 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                    </Link>
                  ))}
                </div>
              </article>
            ))}
            {list.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[12px]" style={{ color: t.muted }}>No {tab} RFQs yet</p>
              </div>
            )}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
