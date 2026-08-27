import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, Building2, User as UserIcon, Package, MapPin, CheckCircle2, XCircle, GitCompare, Info, FileText } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { setRole } from "@/lib/v8-role";

export const Route = createFileRoute("/escrow/invite/$id")({
  head: () => ({ meta: [{ title: "Escrow invite — MagnetPay" }] }),
  component: InviteScreen,
});

function InviteScreen() {
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/invite/$id" });
  const navigate = useNavigate();

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>● New invite</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ background: "rgba(253,186,116,0.18)", color: "#FDBA74" }}>
                  <ShieldCheck className="size-2.5" strokeWidth={3} /> Awaiting your acceptance
                </span>
              </div>
              <h1 className="mt-3 text-[17px] font-bold leading-tight">Industrial pump parts — 200 units</h1>
              <p className="mt-0.5 text-[11px]" style={{ color: "#C8C2B0" }}>Buyer wants you to ship to Lagos, Nigeria.</p>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-[30px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥12,400<span style={{ color: "#C8C2B0" }}>.00</span></p>
                <p className="text-[10.5px]" style={{ color: "#C8C2B0" }}>to be held</p>
              </div>
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Buyer</p>
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-10 rounded-full grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                <UserIcon className="size-4" strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold">Chidi Okoro</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>MagnetPay · KYC verified · Lagos, NG</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ background: `${t.success}15`, color: t.success }}>
                <CheckCircle2 className="size-2.5" strokeWidth={3} /> Verified
              </span>
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Proposed terms</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { I: Package, l: "Goods", v: "200 × cast-iron pump bodies, model PB-A2" },
                { I: MapPin, l: "Route", v: "Guangzhou → Apapa Port, Lagos · Sea freight" },
                { I: Building2, l: "Inspector", v: "SGS Lagos · pre-release inspection" },
                { I: ShieldCheck, l: "Auto-release", v: "48h after inspection passes" },
              ].map((r, i, a) => (
                <div key={r.l} className={`flex items-start gap-3 px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <r.I className="size-4 mt-0.5 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                  <div className="min-w-0">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>{r.l}</p>
                    <p className="text-[12px] font-semibold">{r.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Milestones (4)</p>
            <div className="rounded-2xl p-3.5 space-y-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Production complete", p: 20 },
                { l: "Shipped — BL uploaded", p: 30 },
                { l: "Arrived at Apapa", p: 20 },
                { l: "Inspection passed", p: 30 },
              ].map((m) => (
                <div key={m.l} className="flex items-center justify-between text-[12px]">
                  <p className="font-semibold">{m.l}</p>
                  <p className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.sub }}>{m.p}% · ¥{((12400 * m.p) / 100).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Fees</p>
            <div className="rounded-2xl p-3.5 flex items-center justify-between" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div>
                <p className="text-[12px] font-semibold">Escrow fee · 0.9%</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Split 50/50 with buyer</p>
              </div>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.warn }}>−¥55.80</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Funds are held by MagnetPay until milestones are met. You can counter-propose milestones, amount, or inspection before accepting.
              </p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <button onClick={() => toast.success("Downloading full terms PDF")} className="w-full h-11 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold" style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.sub }}>
              <FileText className="size-3.5" strokeWidth={2.4} /> View full terms (PDF)
            </button>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto space-y-2">
              <button onClick={() => { setRole("seller"); toast.success("Invite accepted"); navigate({ to: "/escrow/seller/$id", params: { id } }); }}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.success, boxShadow: `0 12px 28px -10px ${t.success}80` }}>
                <CheckCircle2 className="size-4" strokeWidth={2.6} /> Accept invite
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/escrow/invite/$id/counter" params={{ id }}
                  className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                  style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}>
                  <GitCompare className="size-3.5" strokeWidth={2.4} /> Counter
                </Link>
                <button onClick={() => { toast("Invite declined", { description: "Buyer has been notified" }); navigate({ to: "/escrow" }); }}
                  className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                  style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.danger }}>
                  <XCircle className="size-3.5" strokeWidth={2.4} /> Reject
                </button>
              </div>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
