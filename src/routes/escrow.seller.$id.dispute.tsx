import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, AlertTriangle, Upload, FileText, Send, MessageCircle, Scale } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/escrow/seller/$id/dispute")({
  head: () => ({ meta: [{ title: "Dispute response — MagnetPay" }] }),
  component: SellerDispute,
});

const STANCES = [
  { k: "agree", l: "Agree — full refund", c: "warn" as const, desc: "Refund buyer in full and close deal." },
  { k: "partial", l: "Propose partial refund", c: "info" as const, desc: "Offer a discount or replacement for damaged units." },
  { k: "reject", l: "Reject claim", c: "danger" as const, desc: "Goods shipped as agreed — escalate to mediator." },
] as const;

function SellerDispute() {
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/seller/$id/dispute" });
  useRoleGuard(["seller", "both"], "Seller dispute view is for suppliers only");
  const navigate = useNavigate();
  const [stance, setStance] = useState<"agree" | "partial" | "reject">("partial");
  const [offer, setOffer] = useState(1116);
  const [reply, setReply] = useState("Inspection report flags 18 of 200 units (9%) with packaging damage from drop-test. We accept partial refund equal to defective units and will ship replacements on next batch.");
  const [files, setFiles] = useState(["QC-report-pre-ship.pdf", "carton-pack-video.mp4"]);

  const toneOf = (c: "warn" | "info" | "danger") => c === "warn" ? t.warn : c === "info" ? t.info : t.danger;

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.danger }}>● Dispute · D-4421</p>
              <p className="text-[13px] font-bold">Your response</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-4" style={{ background: `${t.danger}10`, border: `1px solid ${t.danger}30` }}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="size-5 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.danger }} />
                <div className="flex-1">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.danger }}>Buyer claim</p>
                  <p className="mt-1 text-[12.5px] font-semibold leading-snug" style={{ color: t.ink }}>
                    "18 of 200 pump units arrived cracked. Requesting partial refund."
                  </p>
                  <p className="mt-1.5 text-[10.5px]" style={{ color: t.sub }}>Filed by Chidi Okoro · 2h ago · ¥12,400 frozen</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Your stance</p>
            <div className="space-y-2">
              {STANCES.map((s) => {
                const sel = stance === s.k;
                const c = toneOf(s.c);
                return (
                  <button key={s.k} onClick={() => setStance(s.k)}
                    className="w-full text-left rounded-2xl p-3.5 flex items-start gap-3"
                    style={{ background: sel ? `${c}10` : t.surface, border: `1.5px solid ${sel ? c : t.border}` }}>
                    <div className="size-5 rounded-full grid place-items-center mt-0.5 shrink-0" style={{ background: sel ? c : t.bg, border: sel ? "none" : `1.5px solid ${t.border}` }}>
                      {sel && <span className="size-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold" style={{ color: sel ? c : t.ink }}>{s.l}</p>
                      <p className="mt-0.5 text-[11px]" style={{ color: t.sub }}>{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {stance === "partial" && (
            <section className="px-4 mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Offered refund (CNY)</p>
              <div className="rounded-2xl p-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <input type="number" value={offer} onChange={(e) => setOffer(Number(e.target.value) || 0)}
                  className="w-full text-center text-[28px] font-bold tabular-nums bg-transparent outline-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: t.info }} />
                <input type="range" min={0} max={12400} step={100} value={offer} onChange={(e) => setOffer(Number(e.target.value))}
                  className="w-full mt-2" style={{ accentColor: t.info }} />
                <div className="mt-2 flex justify-between text-[10.5px] tabular-nums" style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>¥0</span>
                  <span>{((offer / 12400) * 100).toFixed(1)}% of total</span>
                  <span>¥12,400</span>
                </div>
              </div>
            </section>
          )}

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Your reply</p>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4}
              className="w-full p-3 rounded-2xl text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
            <p className="mt-1 text-[10px] text-right" style={{ color: t.muted }}>{reply.length} / 600</p>
          </section>

          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Supporting evidence</p>
            <button onClick={() => setFiles((f) => [...f, `evidence-${f.length + 1}.pdf`])}
              className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 border-dashed border-2"
              style={{ background: `${t.accent}08`, borderColor: `${t.accent}50`, color: t.accent }}>
              <Upload className="size-4" strokeWidth={2.4} />
              <p className="text-[12px] font-bold">Upload QC reports, videos, or photos</p>
            </button>
            <div className="mt-2 space-y-1.5">
              {files.map((f) => (
                <div key={f} className="rounded-xl px-3 py-2 flex items-center gap-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <FileText className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                  <p className="text-[11.5px] font-semibold flex-1 truncate">{f}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <Link to="/escrow/$id/dispute/thread" params={{ id }}
              className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <MessageCircle className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <div className="flex-1">
                <p className="text-[12px] font-bold" style={{ color: t.info }}>Open mediator chat</p>
                <p className="text-[10.5px]" style={{ color: t.sub }}>3-way thread with buyer & MagnetPay mediator</p>
              </div>
              <Scale className="size-4" strokeWidth={2.4} style={{ color: t.info }} />
            </Link>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/$id/dispute/thread", params: { id } })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <Send className="size-4" strokeWidth={2.6} /> Submit response
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
