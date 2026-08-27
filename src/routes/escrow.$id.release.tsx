import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ShieldCheck, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/$id/release")({
  head: () => ({ meta: [{ title: "Release funds — MagnetPay" }] }),
  component: ReleaseConfirm,
});

function ReleaseConfirm() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/$id/release" });
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);
  const ready = pin.length === 4;

  const submit = () => {
    setDone(true);
    setTimeout(() => navigate({ to: "/escrow/$id", params: { id } }), 1100);
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Confirm release</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          {done ? (
            <section className="px-6 pt-24 text-center">
              <div className="mx-auto size-20 rounded-full grid place-items-center" style={{ background: `${t.success}15`, color: t.success }}>
                <CheckCircle2 className="size-10" strokeWidth={2.2} />
              </div>
              <h1 className="mt-5 text-[22px] font-bold">Funds released</h1>
              <p className="mt-2 text-[13px]" style={{ color: t.sub }}>¥12,400 sent to Guangzhou Huayi Co.</p>
            </section>
          ) : (
            <>
              <section className="px-4 mt-3">
                <div className="rounded-3xl p-5 text-white text-center" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>You are releasing</p>
                  <p className="mt-2 text-[44px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥12,400</p>
                  <p className="mt-2 text-[11.5px]" style={{ color: "#C8C2B0" }}>to Guangzhou Huayi Co.</p>
                </div>
              </section>

              <section className="px-4 mt-4">
                <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  {[
                    { l: "Deal", v: "Industrial pump parts" },
                    { l: "Released by", v: "You · Chidi Okoro" },
                    { l: "Inspection", v: "SGS Lagos · passed" },
                    { l: "Settlement", v: "Instant · CNY rails" },
                  ].map((r, i, arr) => (
                    <div key={r.l} className={`flex items-center justify-between px-3.5 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                      <p className="text-[11.5px]" style={{ color: t.sub }}>{r.l}</p>
                      <p className="text-[12px] font-semibold">{r.v}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="px-4 mt-4">
                <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}26` }}>
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.warn }} />
                  <p className="text-[11px]" style={{ color: t.sub }}>
                    Release is <span className="font-bold" style={{ color: t.ink }}>irreversible</span>. Once funds leave escrow you cannot raise a dispute.
                  </p>
                </div>
              </section>

              <section className="px-4 mt-5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-center mb-3" style={{ color: t.muted }}>
                  Enter passcode to confirm
                </p>
                <div className="flex justify-center gap-2.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="size-12 rounded-2xl grid place-items-center"
                      style={{ background: t.surface, border: `1.5px solid ${pin.length > i ? t.navy : t.border}` }}>
                      {pin.length > i && <div className="size-2.5 rounded-full" style={{ background: t.navy }} />}
                    </div>
                  ))}
                </div>
                <input autoFocus inputMode="numeric" maxLength={4} value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="opacity-0 absolute pointer-events-none" />
                <div className="mt-4 grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                  {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
                    <button key={i} onClick={() => {
                      if (k === "⌫") setPin((p) => p.slice(0, -1));
                      else if (k && pin.length < 4) setPin((p) => p + k);
                    }} disabled={!k}
                      className="h-12 rounded-2xl text-[16px] font-bold disabled:opacity-0"
                      style={{ background: t.surface, border: `1px solid ${t.border}` }}>{k}</button>
                  ))}
                </div>
              </section>

              <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
                <div className="max-w-[420px] mx-auto pointer-events-auto">
                  <button onClick={submit} disabled={!ready}
                    className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5 disabled:opacity-40"
                    style={{ background: t.success, boxShadow: `0 12px 28px -10px ${t.success}80` }}>
                    <ShieldCheck className="size-4" strokeWidth={2.6} /> Release ¥12,400
                  </button>
                  <p className="mt-2 text-center text-[10px] flex items-center justify-center gap-1" style={{ color: t.muted }}>
                    <Lock className="size-2.5" strokeWidth={2.6} /> Secured by MagnetPay Trust
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
      </PhoneFrame>
    </>
  );
}
