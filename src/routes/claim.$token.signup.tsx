import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/claim/$token/signup")({
  head: () => ({ meta: [{ title: "Claim — Quick signup — MagnetPay" }] }),
  component: ClaimSignup,
});

function ClaimSignup() {
  const t = escrowTheme;
  const { token } = useParams({ from: "/claim/$token/signup" });
  const navigate = useNavigate();
  const [name, setName] = useState("Wei Chen");
  const [phone, setPhone] = useState("+86 138 4421 0099");
  const [email, setEmail] = useState("wei@huayi.cn");
  const [country, setCountry] = useState<"CN" | "NG" | "US">("CN");
  const [agree, setAgree] = useState(true);

  const valid = name.trim() && phone.trim() && email.includes("@") && agree;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/claim/$token" params={{ token }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Step 1 of 2</p>
              <p className="text-[13px] font-bold">Quick account</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: `${t.success}10`, border: `1px solid ${t.success}30` }}>
              <ShieldCheck className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                <strong>¥8,400 reserved</strong> · linked to invite <span className="font-mono">#{token.toUpperCase()}</span>
              </p>
            </div>
          </section>

          <section className="px-4 mt-5 space-y-4">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full h-12 px-3.5 rounded-2xl text-[13px] font-semibold outline-none"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Mobile (we'll text a code)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full h-12 px-3.5 rounded-2xl text-[13px] font-semibold outline-none tabular-nums"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink, fontFamily: "'JetBrains Mono', monospace" }} />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full h-12 px-3.5 rounded-2xl text-[13px] font-semibold outline-none"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Country</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(["CN", "NG", "US"] as const).map((c) => {
                  const sel = country === c;
                  return (
                    <button key={c} onClick={() => setCountry(c)}
                      className="h-11 rounded-xl text-[11.5px] font-bold"
                      style={{ background: sel ? t.navy : t.surface, color: sel ? "#fff" : t.sub, border: `1px solid ${sel ? t.navy : t.border}` }}>
                      {c === "CN" ? "🇨🇳 China" : c === "NG" ? "🇳🇬 Nigeria" : "🇺🇸 USA"}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-4 mt-5">
            <button onClick={() => setAgree((a) => !a)} className="flex items-start gap-2.5 text-left w-full">
              <div className="size-5 rounded mt-0.5 grid place-items-center shrink-0" style={{ background: agree ? t.accent : t.surface, border: `1.5px solid ${agree ? t.accent : t.border}` }}>
                {agree && <Check className="size-3 text-white" strokeWidth={3} />}
              </div>
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                I agree to MagnetPay's <span className="font-bold" style={{ color: t.navy }}>Terms</span> and <span className="font-bold" style={{ color: t.navy }}>Privacy Policy</span>, and consent to receive transaction SMS at this number.
              </p>
            </button>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10px] text-center" style={{ color: t.muted }}>
              KYC verification will be requested when you withdraw above ¥1,000.
            </p>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button disabled={!valid} onClick={() => navigate({ to: "/claim/$token/done", params: { token } })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5 disabled:opacity-50"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                Verify & claim ¥8,400 <ArrowRight className="size-4" strokeWidth={2.6} />
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
