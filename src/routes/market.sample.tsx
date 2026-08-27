import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Minus, Plus, Package, ShieldCheck, Info, CheckCircle2, Truck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";
import pPump from "@/assets/market/p-pump.jpg";

export const Route = createFileRoute("/market/sample")({
  head: () => ({ meta: [{ title: "Request sample — MagnetPay" }] }),
  component: SampleRequest,
});

function SampleRequest() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [qty, setQty] = useState(2);
  const [mode, setMode] = useState<"sample" | "cart">("sample");
  const unit = 58;
  const sampleFee = 120;
  const ship = 240;
  const subtotal = mode === "sample" ? sampleFee * qty : unit * qty;
  const total = subtotal + ship;

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>● Quick order</p>
              <p className="text-[13px] font-bold">Sample or add to cart</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <img src={pPump} alt="" className="size-14 rounded-xl shrink-0 object-cover" style={{ border: `1px solid ${t.border}` }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-bold leading-tight">Cast-iron pump body PB-A2 · DN50</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Guangzhou Huayi Co.</p>
              </div>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{unit}</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {(["sample", "cart"] as const).map((x) => {
                const on = mode === x;
                return (
                  <button key={x} onClick={() => setMode(x)}
                    className="flex-1 h-9 rounded-xl text-[11.5px] font-bold"
                    style={{ background: on ? t.navy : "transparent", color: on ? "#fff" : t.sub }}>
                    {x === "sample" ? "Request sample" : "Add to cart"}
                  </button>
                );
              })}
            </div>
          </section>

          {mode === "sample" ? (
            <section className="px-4 mt-4">
              <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
                <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
                <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                  Samples ship via DHL Express. Sample cost is refunded against your first bulk order.
                </p>
              </div>
            </section>
          ) : (
            <section className="px-4 mt-4">
              <div className="rounded-2xl p-3 text-[11px]" style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.sub }}>
                Bulk price tier · 50–199 units · <span className="font-bold" style={{ color: t.ink }}>¥{unit}/unit</span>. MOQ is 50.
              </div>
            </section>
          )}

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Quantity</p>
            <div className="rounded-2xl p-3 flex items-center justify-between" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <p className="text-[11px]" style={{ color: t.muted }}>{mode === "sample" ? "Sample units (max 5)" : "Bulk units (MOQ 50)"}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(mode === "sample" ? 1 : 50, qty - (mode === "sample" ? 1 : 10)))}
                  className="size-9 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                  <Minus className="size-3.5" strokeWidth={2.6} />
                </button>
                <p className="w-14 text-center text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{qty}</p>
                <button onClick={() => setQty(qty + (mode === "sample" ? 1 : 10))}
                  className="size-9 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                  <Plus className="size-3.5" strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Ship to</p>
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Truck className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
              <div className="flex-1">
                <p className="text-[12px] font-bold">DHL Express · Lagos, NG</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>5–7 business days · ¥{ship}</p>
              </div>
              <button className="text-[10.5px] font-bold" style={{ color: t.accent }}>Change</button>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Summary</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: mode === "sample" ? `Sample × ${qty}` : `Units × ${qty}`, v: `¥${subtotal.toFixed(2)}` },
                { l: "Express shipping", v: `¥${ship.toFixed(2)}` },
                { l: "Total", v: `¥${total.toFixed(2)}`, bold: true },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-center justify-between px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className={`text-[12px] ${r.bold ? "font-bold" : "font-semibold"}`}>{r.l}</p>
                  <p className={`text-[13px] tabular-nums ${r.bold ? "font-bold" : "font-semibold"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: r.bold ? t.accent : t.ink }}>{r.v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/market/cart" })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                {mode === "sample" ? <Package className="size-4" strokeWidth={2.6} /> : <CheckCircle2 className="size-4" strokeWidth={2.6} />}
                {mode === "sample" ? "Add sample to cart" : "Add to cart"}
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
