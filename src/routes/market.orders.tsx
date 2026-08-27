import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Ship, Package, CheckCircle2, AlertTriangle, Factory, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/orders")({
  head: () => ({ meta: [{ title: "Orders — MagnetPay" }] }),
  component: OrdersList,
});

type State = "production" | "transit" | "inspect" | "delivered" | "dispute";

const ORDERS = [
  { id: "O-9412", t: "Pump bodies PB-A2 · 200u", s: "Guangzhou Huayi", amt: 13297.6, prog: 1, state: "production" as State, eta: "Apr 26", I: Factory },
  { id: "O-9388", t: "LED panels 600×600 · 500u", s: "Shenzhen Lumica", amt: 9420, prog: 3, state: "transit" as State, eta: "Mar 30", I: Ship },
  { id: "O-9377", t: "Polyester bags · 50k", s: "Yiwu Trade", amt: 1640, prog: 4, state: "inspect" as State, eta: "Mar 22", I: Package },
  { id: "O-9341", t: "Ceramic tiles · 2 pallets", s: "Foshan Ceramics", amt: 6820, prog: 5, state: "delivered" as State, eta: "Feb 28", I: CheckCircle2 },
  { id: "O-9302", t: "Stainless fittings · 1k", s: "Tianjin Metals", amt: 4560, prog: 3, state: "dispute" as State, eta: "Mar 12", I: AlertTriangle },
];

type Tab = "active" | "delivered" | "issues";

function OrdersList() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const [tab, setTab] = useState<Tab>("active");

  const filter = (o: typeof ORDERS[number]) =>
    tab === "delivered" ? o.state === "delivered" :
    tab === "issues" ? o.state === "dispute" :
    o.state !== "delivered" && o.state !== "dispute";

  const tone = (s: State) =>
    s === "delivered" ? t.success :
    s === "dispute" ? t.danger :
    s === "transit" || s === "inspect" ? t.warn :
    t.navy;

  const label = (s: State) =>
    s === "production" ? "In production" :
    s === "transit" ? "In transit" :
    s === "inspect" ? "At inspection" :
    s === "delivered" ? "Delivered" : "Disputed";

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Orders</p>
              <p className="text-[13px] font-bold">{ORDERS.length} total · ¥35,737.60</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {(["active", "delivered", "issues"] as Tab[]).map((x) => {
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

          <section className="px-4 mt-4 space-y-2.5">
            {ORDERS.filter(filter).map((o) => {
              const c = tone(o.state);
              return (
                <Link key={o.id} to="/market/order/$id" params={{ id: o.id }}
                  className="block rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-start gap-3">
                    <div className="size-11 rounded-2xl grid place-items-center shrink-0" style={{ background: `${c}15`, color: c }}>
                      <o.I className="size-5" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12.5px] font-bold truncate">{o.t}</p>
                        <p className="text-[13px] font-bold tabular-nums shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{o.amt.toLocaleString()}</p>
                      </div>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{o.s} · #{o.id}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ background: `${c}15`, color: c }}>
                          {label(o.state)}
                        </span>
                        <span className="text-[9.5px]" style={{ color: t.muted }}>ETA {o.eta}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {[1,2,3,4,5].map((n) => (
                          <div key={n} className="flex-1 h-1 rounded-full" style={{ background: n <= o.prog ? c : t.border }} />
                        ))}
                        <ChevronRight className="size-3.5 ml-1 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                      </div>
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
