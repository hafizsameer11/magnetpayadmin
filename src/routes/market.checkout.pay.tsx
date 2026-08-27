import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Wallet, ArrowDownToLine, CheckCircle2, Lock, Info } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/checkout/pay")({
  head: () => ({ meta: [{ title: "Checkout · Pay — MagnetPay" }] }),
  component: CheckoutPay,
});

function CheckoutPay() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [method, setMethod] = useState<"wallet" | "deposit">("wallet");
  const total = 13297.6;
  const cnyBal = 8420;
  const usdBal = 1240;
  const needTopUp = total - cnyBal;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/checkout/review" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Checkout · 3 of 3</p>
              <p className="text-[13px] font-bold">Fund escrow</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex items-center gap-1.5">
              {["Shipping", "Review", "Pay"].map((l, i) => (
                <div key={l} className="flex-1 flex flex-col gap-1">
                  <div className="h-1 rounded-full" style={{ background: i < 2 ? t.success : t.accent }} />
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-center" style={{ color: i === 2 ? t.accent : t.success }}>{l}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <div className="rounded-3xl p-5 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Total to fund</p>
              <p className="mt-2 text-[34px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}>
                ¥{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-2 text-[11px]" style={{ color: t.muted }}>Held in escrow until delivery confirmed</p>
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Pay from</p>
            <div className="space-y-1.5">
              <button onClick={() => setMethod("wallet")}
                className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
                style={{ background: t.surface, border: `1px solid ${method === "wallet" ? t.accent : t.border}` }}>
                <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Wallet className="size-5" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold">CNY wallet</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>Balance ¥{cnyBal.toLocaleString()} · USD ${usdBal.toLocaleString()}</p>
                </div>
                <span className="size-4 rounded-full grid place-items-center shrink-0" style={{ border: `1.5px solid ${method === "wallet" ? t.accent : t.border}` }}>
                  {method === "wallet" && <span className="size-2 rounded-full" style={{ background: t.accent }} />}
                </span>
              </button>
              <button onClick={() => setMethod("deposit")}
                className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
                style={{ background: t.surface, border: `1px solid ${method === "deposit" ? t.accent : t.border}` }}>
                <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.accent}12`, color: t.accent }}>
                  <ArrowDownToLine className="size-5" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold">Top up from NGN account</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>GTBank · ****4421 · auto-convert</p>
                </div>
                <span className="size-4 rounded-full grid place-items-center shrink-0" style={{ border: `1.5px solid ${method === "deposit" ? t.accent : t.border}` }}>
                  {method === "deposit" && <span className="size-2 rounded-full" style={{ background: t.accent }} />}
                </span>
              </button>
            </div>
          </section>

          {method === "wallet" && (
            <section className="px-4 mt-4">
              <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                {[
                  { l: "CNY wallet", v: `¥${cnyBal.toFixed(2)}` },
                  { l: "Required", v: `¥${total.toFixed(2)}`, c: t.accent },
                  { l: "Top-up needed", v: `¥${needTopUp.toFixed(2)}`, c: t.warn, bold: true },
                ].map((r, i, a) => (
                  <div key={r.l} className={`flex items-center justify-between px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                    <p className={`text-[12px] ${r.bold ? "font-bold" : "font-semibold"}`}>{r.l}</p>
                    <p className={`text-[13px] tabular-nums ${r.bold ? "font-bold" : "font-semibold"}`}
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: r.c ?? t.ink }}>{r.v}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {method === "deposit" && (
            <section className="px-4 mt-4">
              <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                {[
                  { l: "Amount NGN", v: `₦${Math.round(total * 229).toLocaleString()}` },
                  { l: "FX rate", v: "1 CNY = ₦229.00" },
                  { l: "FX margin · 0.4%", v: `¥${(total * 0.004).toFixed(2)}`, c: t.warn },
                  { l: "Settlement", v: "Instant · 9:14 AM" },
                ].map((r, i, a) => (
                  <div key={r.l} className={`flex items-center justify-between px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                    <p className="text-[12px] font-semibold">{r.l}</p>
                    <p className="text-[12.5px] font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: r.c ?? t.ink }}>{r.v}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.success}10`, border: `1px solid ${t.success}30` }}>
              <Lock className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Funds go to MagnetPay's segregated trust account. Supplier never sees money until you confirm delivery.
              </p>
            </div>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/market/order/$id/confirmed", params: { id: "O-9412" } })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <CheckCircle2 className="size-4" strokeWidth={2.6} /> Fund ¥{total.toLocaleString(undefined, { maximumFractionDigits: 0 })} & place order
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
