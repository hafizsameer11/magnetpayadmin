import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight, CheckCircle2, Lock, Globe2, Smartphone } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/claim/$token")({
  head: () => ({ meta: [{ title: "You've been invited — MagnetPay" }] }),
  component: ClaimLanding,
});

function ClaimLanding() {
  const t = escrowTheme;
  const { token } = useParams({ from: "/claim/$token" });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          {/* From-message strip */}
          <section className="px-4 pt-12">
            <div className="rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Smartphone className="size-3.5 shrink-0" strokeWidth={2.3} style={{ color: t.muted }} />
              <p className="text-[10.5px] truncate" style={{ color: t.sub }}>
                From SMS · <span className="font-mono">+86 138 •••• 4421</span>
              </p>
            </div>
          </section>

          <section className="px-4 mt-4 text-center">
            <div className="mx-auto size-14 rounded-2xl grid place-items-center" style={{ background: t.navy, color: "#fff" }}>
              <ShieldCheck className="size-6" strokeWidth={2.4} />
            </div>
            <p className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>● Secure invitation</p>
            <h1 className="mt-1 text-[22px] font-bold leading-tight">Chidi Okoro sent you ¥8,400 via MagnetPay escrow</h1>
            <p className="mt-2 text-[12.5px] px-2" style={{ color: t.sub }}>
              Claim it by creating a free MagnetPay account. Funds are held until the deal completes.
            </p>
          </section>

          {/* Deal card */}
          <section className="px-4 mt-5">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>You will receive</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-[34px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥8,400<span style={{ color: "#C8C2B0" }}>.00</span></p>
              </div>
              <p className="mt-1 text-[11px]" style={{ color: "#C8C2B0" }}>≈ ₦1.92M · after milestones</p>
              <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <span style={{ color: "#C8C2B0" }}>Reference</span>
                <span className="font-mono">#{token.toUpperCase()}</span>
              </div>
            </div>
          </section>

          {/* Trust strip */}
          <section className="px-4 mt-5 grid grid-cols-3 gap-2">
            {[
              { I: Lock, l: "Bank-grade", s: "256-bit secure" },
              { I: ShieldCheck, l: "Held safe", s: "Escrow-backed" },
              { I: Globe2, l: "Global", s: "CN · NG · USD" },
            ].map((b) => (
              <div key={b.l} className="rounded-2xl p-3 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <b.I className="size-4 mx-auto" strokeWidth={2.3} style={{ color: t.navy }} />
                <p className="mt-1.5 text-[10.5px] font-bold">{b.l}</p>
                <p className="text-[9.5px]" style={{ color: t.muted }}>{b.s}</p>
              </div>
            ))}
          </section>

          {/* How it works */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>How it works</p>
            <ol className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { n: 1, l: "Verify your phone & email", s: "30 seconds — no card needed." },
                { n: 2, l: "Confirm deal terms", s: "Accept or counter the milestones." },
                { n: 3, l: "Get paid as you deliver", s: "Funds release per milestone." },
              ].map((r, i, a) => (
                <li key={r.n} className={`flex items-start gap-3 px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-7 rounded-full grid place-items-center text-[11px] font-bold shrink-0" style={{ background: `${t.accent}15`, color: t.accent, fontFamily: "'JetBrains Mono', monospace" }}>{r.n}</div>
                  <div>
                    <p className="text-[12.5px] font-semibold">{r.l}</p>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>{r.s}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* CTA */}
          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto space-y-2">
              <Link to="/claim/$token/signup" params={{ token }}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                Claim ¥8,400 <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
              <p className="text-center text-[10.5px]" style={{ color: t.muted }}>
                Already on MagnetPay? <Link to="/welcome" className="font-bold" style={{ color: t.navy }}>Sign in</Link>
              </p>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
