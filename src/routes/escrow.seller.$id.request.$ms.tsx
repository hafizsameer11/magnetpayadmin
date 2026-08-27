import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Banknote, CheckCircle2, Clock, FileText, Info } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/escrow/seller/$id/request/$ms")({
  head: () => ({ meta: [{ title: "Request release — MagnetPay" }] }),
  component: RequestRelease,
});

function RequestRelease() {
  const t = escrowTheme;
  const { id, ms } = useParams({ from: "/escrow/seller/$id/request/$ms" });
  useRoleGuard(["seller", "both"], "Release requests are for suppliers only");
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const amount = 3720;
  const fee = amount * 0.0045;
  const net = amount - fee;

  if (sent) {
    return (
      <>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
        <PhoneFrame background={t.navy}>
          <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
            <section className="px-6 pt-32 text-center">
              <div className="mx-auto size-20 rounded-full grid place-items-center" style={{ background: `${t.success}15`, color: t.success }}>
                <CheckCircle2 className="size-9" strokeWidth={2.2} />
              </div>
              <p className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.success }}>Request sent</p>
              <h1 className="mt-1 text-[22px] font-bold leading-tight">Buyer notified</h1>
              <p className="mt-2 text-[12.5px]" style={{ color: t.sub }}>Chidi has 48h to approve. If no response, milestone auto-releases.</p>
            </section>
            <section className="px-4 mt-8">
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Clock className="size-5 shrink-0" strokeWidth={2.3} style={{ color: t.warn }} />
                <div className="flex-1">
                  <p className="text-[12px] font-bold">Auto-release in 48h</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>by Mar 22 · 14:05 GMT+8</p>
                </div>
                <p className="text-[14px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.success }}>¥{net.toFixed(2)}</p>
              </div>
            </section>
            <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-8">
              <div className="max-w-[420px] mx-auto pointer-events-auto">
                <Link to="/escrow/seller/$id" params={{ id }}
                  className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                  style={{ background: t.navy }}>
                  Back to escrow
                </Link>
              </div>
            </section>
          </div>
        </PhoneFrame>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/seller/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Request release</p>
              <p className="text-[13px] font-bold">Milestone {ms} · #{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>You receive</p>
              <p className="mt-2 text-[36px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.success }}>
                ¥{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-2 text-[11px]" style={{ color: t.muted }}>≈ ₦852,000 at today's mid-rate</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Breakdown</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Milestone amount", v: `¥${amount.toFixed(2)}`, c: t.ink },
                { l: "Seller fee · 0.45%", v: `−¥${fee.toFixed(2)}`, c: t.warn },
                { l: "Net to CNY wallet", v: `¥${net.toFixed(2)}`, c: t.success, bold: true },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-center justify-between px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className={`text-[12px] ${r.bold ? "font-bold" : "font-semibold"}`}>{r.l}</p>
                  <p className={`text-[13px] tabular-nums ${r.bold ? "font-bold" : "font-semibold"}`} style={{ fontFamily: "'JetBrains Mono', monospace", color: r.c }}>{r.v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Evidence attached</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {["BL-2210-MSK.pdf", "carton-01.jpg", "carton-02.jpg"].map((n, i, a) => (
                <div key={n} className={`flex items-center gap-3 px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <FileText className="size-4" strokeWidth={2.3} style={{ color: t.navy }} />
                  <p className="text-[12px] font-semibold flex-1 truncate">{n}</p>
                  <CheckCircle2 className="size-4" strokeWidth={2.6} style={{ color: t.success }} />
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Buyer has <strong>48h</strong> to approve, reject, or raise a dispute. If they take no action, funds auto-release to your CNY wallet.
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => setSent(true)}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.success, boxShadow: `0 12px 28px -10px ${t.success}80` }}>
                <Banknote className="size-4" strokeWidth={2.6} /> Send release request
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
