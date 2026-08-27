import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Minus, Plus, Trash2, ShieldCheck, Truck, Package, Info, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";
import pPump from "@/assets/market/p-pump.jpg";
import pLed from "@/assets/market/p-led.jpg";
import pBags from "@/assets/market/p-bags.jpg";

const IMG: Record<string, string> = { "P-220": pPump, "P-187": pLed, "P-301": pBags };

export const Route = createFileRoute("/market/cart")({
  head: () => ({ meta: [{ title: "Cart — MagnetPay" }] }),
  component: Cart,
});

type Line = { id: string; t: string; s: string; p: number; q: number; sample?: boolean };

const INIT: Line[] = [
  { id: "P-220", t: "Cast-iron pump body PB-A2", s: "Guangzhou Huayi", p: 120, q: 2, sample: true },
  { id: "P-187", t: "LED panel 600×600 · 40W", s: "Shenzhen Lumica", p: 92, q: 100 },
  { id: "P-301", t: "Polyester woven bags", s: "Yiwu Trade", p: 3.2, q: 500 },
];

function Cart() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [lines, setLines] = useState<Line[]>(INIT);

  const subtotal = lines.reduce((s, l) => s + l.p * l.q, 0);
  const ship = 480;
  const escrowFee = subtotal * 0.009;
  const total = subtotal + ship + escrowFee;

  const upd = (id: string, d: number) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, q: Math.max(1, l.q + d) } : l)));
  const rm = (id: string) => setLines((ls) => ls.filter((l) => l.id !== id));

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Cart</p>
              <p className="text-[13px] font-bold">{lines.length} items · 3 suppliers</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2 space-y-2.5">
            {lines.map((l) => (
              <div key={l.id} className="rounded-2xl p-3 flex gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <img src={IMG[l.id]} alt="" className="size-16 rounded-xl shrink-0 object-cover" style={{ border: `1px solid ${t.border}` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold leading-tight truncate">{l.t}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{l.s}</p>
                      {l.sample && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-px rounded-full text-[9px] font-bold uppercase tracking-[0.12em]"
                          style={{ background: `${t.info}15`, color: t.info }}>
                          <Package className="size-2.5" strokeWidth={3} /> Sample
                        </span>
                      )}
                    </div>
                    <button onClick={() => rm(l.id)} className="size-7 grid place-items-center rounded-full shrink-0"
                      style={{ color: t.muted }}>
                      <Trash2 className="size-3.5" strokeWidth={2.4} />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => upd(l.id, -1)} className="size-7 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                        <Minus className="size-3" strokeWidth={2.6} />
                      </button>
                      <p className="w-8 text-center text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{l.q}</p>
                      <button onClick={() => upd(l.id, 1)} className="size-7 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                        <Plus className="size-3" strokeWidth={2.6} />
                      </button>
                    </div>
                    <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{(l.p * l.q).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="px-4 mt-4">
            <button className="w-full rounded-2xl p-3.5 flex items-center justify-between" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center gap-3 min-w-0">
                <Truck className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                <div className="text-left min-w-0">
                  <p className="text-[12px] font-bold">Consolidated to Lagos, NG</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>Sea freight · 28d · ¥480</p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
            </button>
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.success}10`, border: `1px solid ${t.success}30` }}>
              <ShieldCheck className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Every order is held in <strong>MagnetPay escrow</strong> until you confirm delivery. No release on damaged or short shipments.
              </p>
            </div>
          </section>

          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Order summary</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Subtotal", v: `¥${subtotal.toLocaleString()}` },
                { l: "Consolidated shipping", v: `¥${ship.toFixed(2)}` },
                { l: "Escrow fee · 0.9%", v: `¥${escrowFee.toFixed(2)}` },
                { l: "Total to fund", v: `¥${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, bold: true },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-center justify-between px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className={`text-[12px] ${r.bold ? "font-bold" : "font-semibold"}`}>{r.l}</p>
                  <p className={`text-[13px] tabular-nums ${r.bold ? "font-bold" : "font-semibold"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: r.bold ? t.accent : t.ink }}>{r.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-center" style={{ color: t.muted }}>≈ ₦{Math.round(total * 229).toLocaleString()} at today's mid-rate</p>
          </section>

          <section className="sticky bottom-0 left-0 right-0 px-4 pt-3 pb-3" style={{ background: `linear-gradient(to top, ${t.bg} 60%, transparent)` }}>
            <div className="max-w-[420px] mx-auto">
              <button onClick={() => navigate({ to: "/market/checkout/shipping" })}
                className="h-13 w-full rounded-2xl flex items-center justify-between px-4 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" strokeWidth={2.6} /> Checkout via escrow</span>
                <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
