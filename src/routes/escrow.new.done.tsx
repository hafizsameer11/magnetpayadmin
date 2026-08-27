import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Copy, Share2, Mail, MessageCircle, ShieldCheck, Home } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/done")({
  head: () => ({ meta: [{ title: "Escrow created — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    party: String(s.party ?? "Counterparty"),
    title: String(s.title ?? "Deal"),
    amount: Number(s.amount ?? 0),
    ccy: String(s.ccy ?? "CNY"),
  }),
  component: EscrowDone,
});

function EscrowDone() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const p = useSearch({ from: "/escrow/new/done" });
  const id = "E-771";
  const link = `mpay.co/e/${id}`;
  const sym = p.ccy === "CNY" ? "¥" : p.ccy === "USD" ? "$" : "₦";
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [copied, setCopied] = useState(false);

  const copy = () => { navigator.clipboard?.writeText(`https://${link}`); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28 text-center" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <section className="px-6 pt-20">
            <div className="mx-auto size-20 rounded-full grid place-items-center" style={{ background: `${t.success}15`, color: t.success }}>
              <CheckCircle2 className="size-10" strokeWidth={2.2} />
            </div>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>
              Escrow #<span style={{ fontFamily: "'JetBrains Mono', monospace", color: t.ink }}>{id}</span>
            </p>
            <h1 className="mt-1 text-[22px] font-bold leading-tight">Funds held in escrow</h1>
            <p className="mt-2 text-[13px]" style={{ color: t.sub }}>
              {sym}{fmt(p.amount)} for <span className="font-semibold" style={{ color: t.ink }}>{p.title}</span>.
              <br /> {p.party} has been notified.
            </p>
          </section>

          <section className="px-4 mt-7 text-left">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Secure deal link</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                <ShieldCheck className="size-4" strokeWidth={2.4} />
              </div>
              <p className="flex-1 text-[12px] font-semibold truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{link}</p>
              <button onClick={copy} className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
                style={{ background: copied ? t.success : t.navy, color: "#fff" }}>
                {copied ? <CheckCircle2 className="size-3.5" strokeWidth={2.6} /> : <Copy className="size-3.5" strokeWidth={2.6} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>

          <section className="px-4 mt-3 text-left">
            <div className="grid grid-cols-3 gap-2">
              {[
                { I: Share2, l: "Share", onClick: () => { navigator.share?.({ title: "MagnetPay escrow", url: `https://${link}` }).catch(() => navigator.clipboard?.writeText(`https://${link}`)); } },
                { I: Mail, l: "Email", onClick: () => { window.location.href = `mailto:?subject=Escrow ${id}&body=Accept the deal: https://${link}`; } },
                { I: MessageCircle, l: "WhatsApp", onClick: () => { window.open(`https://wa.me/?text=${encodeURIComponent(`Accept escrow ${id}: https://${link}`)}`, "_blank"); } },
              ].map((x) => (
                <button key={x.l} onClick={x.onClick} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }}>
                  <x.I className="size-4" strokeWidth={2.3} style={{ color: t.navy }} /> {x.l}
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5 text-left">
            <div className="rounded-2xl p-3" style={{ background: `${t.warn}10`, border: `1px solid ${t.warn}26` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.warn }}>Next step</p>
              <p className="mt-1 text-[11.5px]" style={{ color: t.sub }}>
                {p.party} must accept the terms before funds are committed. We'll notify you within 24h.
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-8">
            <div className="max-w-[420px] mx-auto pointer-events-auto space-y-2">
              <button onClick={() => navigate({ to: "/escrow/$id", params: { id } })}
                className="h-13 w-full rounded-2xl text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.navy }}>
                Open escrow
              </button>
              <Link to="/home" className="h-11 w-full rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                style={{ background: "transparent", color: t.sub }}>
                <Home className="size-3.5" strokeWidth={2.4} /> Back to home
              </Link>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
