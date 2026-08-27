import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, Ship, FileText, Share2, Copy, Calendar } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/order/$id/confirmed")({
  head: () => ({ meta: [{ title: "Order placed — MagnetPay" }] }),
  component: OrderConfirmed,
});

function OrderConfirmed() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const { id } = useParams({ from: "/market/order/$id/confirmed" });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <section className="px-6 pt-24 text-center">
            <div className="mx-auto size-20 rounded-full grid place-items-center" style={{ background: `${t.success}15`, color: t.success }}>
              <CheckCircle2 className="size-10" strokeWidth={2.2} />
            </div>
            <p className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.success }}>Order placed</p>
            <h1 className="mt-1 text-[22px] font-bold leading-tight">Funds in escrow</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: t.sub }}>Supplier has been notified to begin production.</p>
          </section>

          <section className="px-4 mt-6">
            <div className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Order</p>
                  <p className="text-[16px] font-bold">#{id}</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="size-8 grid place-items-center rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <Copy className="size-3.5" strokeWidth={2.4} />
                  </button>
                  <button className="size-8 grid place-items-center rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <Share2 className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[28px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥13,297<span style={{ color: "#C8C2B0" }}>.60</span></p>
              <p className="text-[10.5px]" style={{ color: "#C8C2B0" }}>200 × pump body PB-A2 · Guangzhou Huayi</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>What happens next</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { I: ShieldCheck, l: "Funds locked", d: "MagnetPay holds ¥13,297.60", c: t.success, done: true },
                { I: FileText, l: "Production begins", d: "Supplier confirms within 24h", c: t.warn },
                { I: Ship, l: "Shipment dispatched", d: "BL uploaded · sea freight", c: t.muted },
                { I: CheckCircle2, l: "Delivery & release", d: "You confirm · funds released", c: t.muted },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-start gap-3 px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-8 rounded-full grid place-items-center shrink-0" style={{ background: `${r.c}15`, color: r.c }}>
                    <r.I className="size-4" strokeWidth={2.4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold">{r.l}{r.done && <span className="ml-1.5 text-[9.5px] font-bold" style={{ color: t.success }}>✓</span>}</p>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Calendar className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
              <div className="flex-1">
                <p className="text-[12px] font-bold">Estimated delivery</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Apr 26 – Apr 28 · Apapa Port, Lagos</p>
              </div>
            </div>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto grid grid-cols-[auto_1fr] gap-2">
              <Link to="/market/orders" className="h-13 px-4 rounded-2xl flex items-center justify-center text-[12px] font-bold py-3.5"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}>
                All orders
              </Link>
              <Link to="/market/order/$id" params={{ id }}
                className="h-13 rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <ShieldCheck className="size-4" strokeWidth={2.6} /> Track this order
              </Link>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
