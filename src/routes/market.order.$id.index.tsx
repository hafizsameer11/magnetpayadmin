import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, MessageCircle, ShieldCheck, MapPin, LifeBuoy, FileText, ChevronRight, Truck, Package2, Copy, Star } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";
import pPump from "@/assets/market/p-pump.jpg";

export const Route = createFileRoute("/market/order/$id/")({
  head: () => ({ meta: [{ title: "Order — MagnetPay" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const { id } = useParams({ from: "/market/order/$id/" });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/orders" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Order details</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Status banner */}
          <section className="px-4 mt-1">
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}30` }}>
              <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.accent}20`, color: t.accent }}>
                <Package2 className="size-4.5" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold" style={{ color: t.accent }}>In production</p>
                <p className="text-[10.5px]" style={{ color: t.sub }}>Estimated delivery Apr 26 – 28</p>
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Items (1)</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="p-3 flex items-start gap-3">
                <img src={pPump} alt="" className="size-14 rounded-xl shrink-0 object-cover" style={{ border: `1px solid ${t.border}` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold leading-tight">Pump body PB-A2</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>Guangzhou Huayi Co. · SKU PB-A2-200</p>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <p className="text-[10.5px]" style={{ color: t.sub }}>200 × ¥66.49</p>
                    <p className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥13,297.60</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Totals */}
          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Payment</p>
            <div className="rounded-2xl p-3.5 space-y-1.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                ["Subtotal", "¥13,297.60"],
                ["Shipping (FOB · LCL)", "Included"],
                ["Fees", "¥0.00"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[11.5px]">
                  <span style={{ color: t.sub }}>{k}</span>
                  <span className="tabular-nums font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                </div>
              ))}
              <div className="pt-2 mt-1 flex items-center justify-between" style={{ borderTop: `1px solid ${t.border}` }}>
                <span className="text-[12px] font-bold">Total paid</span>
                <span className="text-[14px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥13,297.60</span>
              </div>
              <p className="text-[10px] pt-1" style={{ color: t.muted }}>Paid Apr 02 · Wise transfer · ref TRX-99421</p>
            </div>
          </section>

          {/* Shipping address */}
          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Delivery</p>
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold">Adekunle Logistics Ltd.</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>14 Marina Rd, Lagos Island · +234 803 555 0142</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2.5 flex items-center gap-3" style={{ borderTop: `1px solid ${t.border}` }}>
                <Truck className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-bold">FOB sea freight · LCL</p>
                  <p className="text-[10px]" style={{ color: t.muted }}>Guangzhou → Apapa Port, Lagos</p>
                </div>
                <button className="text-[10px] font-bold flex items-center gap-1" style={{ color: t.navy }}>
                  Track <ChevronRight className="size-3" strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </section>

          {/* Escrow strip */}
          <section className="px-4 mt-3">
            <Link to="/market/order/$id/escrow" params={{ id }} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.success}15`, color: t.success }}>
                <ShieldCheck className="size-4.5" strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">Protected by escrow</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>1 of 4 milestones released · manage</p>
              </div>
              <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
            </Link>
          </section>

          {/* Documents + Order info */}
          <section className="px-4 mt-3 space-y-2">
            <button className="w-full rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <FileText className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
              <p className="flex-1 text-left text-[12px] font-bold">Invoice & commercial docs</p>
              <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
            </button>
            <button className="w-full rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Copy className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
              <p className="flex-1 text-left text-[12px] font-bold">Order #{id}</p>
              <p className="text-[10px]" style={{ color: t.muted }}>Placed Apr 02</p>
            </button>
          </section>

          {/* Review supplier */}
          <section className="px-4 mt-3">
            <Link to="/market/order/$id/review" params={{ id }} className="w-full rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.accent}15`, color: t.accent }}>
                <Star className="size-4.5" strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">Rate this supplier</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Share your experience · helps other buyers</p>
              </div>
              <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
            </Link>
          </section>


          {/* Bottom CTAs */}
          <section className="absolute bottom-3 left-0 right-0 px-4 pointer-events-none">
            <div className="pointer-events-auto grid grid-cols-[auto_1fr] gap-2">
              <button className="h-12 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}>
                <LifeBuoy className="size-4" strokeWidth={2.4} /> Help
              </button>
              <Link to="/messages/$id" params={{ id: "t1" }} className="h-12 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold text-white"
                style={{ background: t.navy, boxShadow: `0 12px 28px -10px ${t.navy}80` }}>
                <MessageCircle className="size-4" strokeWidth={2.6} /> Message supplier
              </Link>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
