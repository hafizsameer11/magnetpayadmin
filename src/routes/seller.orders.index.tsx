import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search, ChevronRight, Package, Ship, FileCheck2, AlertCircle } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/orders/")({
  head: () => ({ meta: [{ title: "Orders — Seller" }] }),
  component: Orders,
});

const ORDERS = [
  { id: "4831", buyer: "Adekunle Trading", item: "Pump body PB-A2 · 200", v: 48600, stage: "pending" as const, badge: "Awaiting PI", badgeC: "warn" as const },
  { id: "4830", buyer: "Accra Spares", item: "Magnet MG-9 · 1,200", v: 93600, stage: "production" as const, badge: "In production", badgeC: "info" as const },
  { id: "4829", buyer: "Lagos Pumps Ltd", item: "Coil set CS-7 · 80", v: 22400, stage: "shipped" as const, badge: "Shipped", badgeC: "success" as const },
  { id: "4828", buyer: "Tema Industrial", item: "Pump body PB-A2 · 400", v: 91200, stage: "ready" as const, badge: "Ready to ship", badgeC: "accent" as const },
  { id: "4827", buyer: "Niger Industrial", item: "Bearings B-22 · 1,200", v: 31200, stage: "dispute" as const, badge: "Dispute", badgeC: "danger" as const },
  { id: "4810", buyer: "Abidjan Pumps", item: "Bearing B-22 · 3,000", v: 78000, stage: "delivered" as const, badge: "Delivered", badgeC: "muted" as const },
];

function Orders() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [tab, setTab] = useState<"all" | "pending" | "production" | "ready" | "shipped" | "issue">("all");
  const list = ORDERS.filter((o) => {
    if (tab === "all") return true;
    if (tab === "issue") return o.stage === "dispute";
    return o.stage === tab;
  });
  const colorOf = (k: typeof ORDERS[number]["badgeC"]) => ({ warn: t.warn, info: t.info, success: t.success, accent: t.accent, danger: t.danger, muted: t.muted }[k]);

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
              <p className="text-[13px] font-bold">Orders · {ORDERS.length}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input placeholder="Search order, buyer…" className="flex-1 bg-transparent text-[12.5px] outline-none" />
            </div>
          </section>

          <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
            {[
              { k: "all" as const, l: "All" },
              { k: "pending" as const, l: "PI pending" },
              { k: "production" as const, l: "Production" },
              { k: "ready" as const, l: "Ready" },
              { k: "shipped" as const, l: "Shipped" },
              { k: "issue" as const, l: "Issues" },
            ].map((c) => {
              const on = tab === c.k;
              return (
                <button key={c.k} onClick={() => setTab(c.k)} className="text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: on ? t.accent : t.surface, color: on ? "#fff" : t.ink, border: `1px solid ${on ? t.accent : t.border}` }}>{c.l}</button>
              );
            })}
          </section>

          <section className="px-4 mt-3 space-y-2">
            {list.map((o) => {
              const c = colorOf(o.badgeC);
              const I = o.stage === "shipped" ? Ship : o.stage === "ready" ? FileCheck2 : o.stage === "dispute" ? AlertCircle : Package;
              return (
                <Link key={o.id} to="/seller/orders/$id" params={{ id: o.id }}
                  className="block rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="size-11 rounded-xl grid place-items-center shrink-0" style={{ background: `${c}15`, color: c }}>
                    <I className="size-5" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>#{o.id}</p>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${c}15`, color: c }}>{o.badge}</span>
                    </div>
                    <p className="text-[12px] font-bold mt-0.5 truncate">{o.buyer}</p>
                    <p className="text-[10.5px] truncate" style={{ color: t.muted }}>{o.item}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-extrabold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{o.v.toLocaleString()}</p>
                    <ChevronRight className="size-4 ml-auto mt-1" strokeWidth={2.4} style={{ color: t.muted }} />
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
