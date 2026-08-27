import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, FileText, Wallet } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/claim/$token/done")({
  head: () => ({ meta: [{ title: "Claimed — MagnetPay" }] }),
  component: ClaimDone,
});

function ClaimDone() {
  const t = escrowTheme;
  const { token } = useParams({ from: "/claim/$token/done" });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          {/* Hero */}
          <section className="px-6 pt-20 text-center">
            <div className="relative mx-auto size-24">
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${t.success}30` }} />
              <div className="relative size-24 rounded-full grid place-items-center" style={{ background: t.success }}>
                <CheckCircle2 className="size-12 text-white" strokeWidth={2.4} />
              </div>
            </div>
            <p className="mt-6 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.success }}>● Account ready</p>
            <h1 className="mt-1 text-[24px] font-bold leading-tight">You've claimed ¥8,400</h1>
            <p className="mt-2 text-[12.5px] px-2" style={{ color: t.sub }}>
              Funds are held in escrow #{token.toUpperCase()}. They'll release as each milestone is met.
            </p>
          </section>

          {/* Wallet card */}
          <section className="px-4 mt-6">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>CNY Wallet</p>
                <Wallet className="size-4" strokeWidth={2.3} style={{ color: "#C8C2B0" }} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-[32px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥0<span style={{ color: "#C8C2B0" }}>.00</span></p>
                <p className="text-[10.5px]" style={{ color: "#C8C2B0" }}>available</p>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <span style={{ color: "#C8C2B0" }}>In escrow</span>
                <span className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FDBA74" }}>¥8,400.00</span>
              </div>
            </div>
          </section>

          {/* Next steps */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Next steps</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { I: FileText, l: "Review deal terms", s: "Confirm milestones with Chidi", c: t.accent, to: "/escrow/invite/$id" as const, id: "E-803" },
                { I: ShieldCheck, l: "Verify business (KYB)", s: "Required to withdraw above ¥1,000", c: t.warn, to: "/kyb" as const, id: undefined },
                { I: Sparkles, l: "Explore MagnetPay", s: "Multi-currency wallets, FX, marketplace", c: t.info, to: "/home" as const, id: undefined },
              ].map((r, i, a) => (
                r.id ? (
                  <Link key={r.l} to={r.to} params={{ id: r.id }} className={`flex items-center gap-3 px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                    <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${r.c}15`, color: r.c }}>
                      <r.I className="size-4" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold">{r.l}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{r.s}</p>
                    </div>
                    <ArrowRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
                  </Link>
                ) : (
                  <Link key={r.l} to={r.to} className={`flex items-center gap-3 px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                    <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${r.c}15`, color: r.c }}>
                      <r.I className="size-4" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold">{r.l}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{r.s}</p>
                    </div>
                    <ArrowRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
                  </Link>
                )
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto space-y-2">
              <Link to="/escrow/invite/$id" params={{ id: "E-803" }}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                Open escrow deal <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
              <Link to="/home" className="block text-center text-[11px] font-bold py-2" style={{ color: t.sub }}>
                Skip to dashboard
              </Link>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
