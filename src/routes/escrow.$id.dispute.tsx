import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, AlertTriangle, Camera, Paperclip, X, FileText } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/$id/dispute")({
  head: () => ({ meta: [{ title: "Raise dispute — MagnetPay" }] }),
  component: RaiseDispute,
});

const REASONS = [
  { id: "not_received", label: "Goods not received", desc: "Shipment never arrived" },
  { id: "damaged", label: "Damaged on arrival", desc: "Goods received in poor condition" },
  { id: "wrong_item", label: "Wrong item / spec", desc: "Doesn't match order" },
  { id: "quantity", label: "Short quantity", desc: "Less than agreed quantity" },
  { id: "quality", label: "Quality below spec", desc: "Fails inspection criteria" },
  { id: "other", label: "Other", desc: "Describe the issue below" },
];

function RaiseDispute() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/$id/dispute" });
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState<string[]>(["IMG_2241.jpg"]);
  const ready = reason && desc.trim().length >= 20;

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.danger }}>Raise dispute</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: `${t.danger}10`, border: `1px solid ${t.danger}26` }}>
              <AlertTriangle className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.danger }} />
              <p className="text-[11px]" style={{ color: t.sub }}>
                Funds will be <span className="font-bold" style={{ color: t.ink }}>frozen</span> until a MagnetPay mediator resolves the case. Typical response: 24–48h.
              </p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Reason</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {REASONS.map((r, i, arr) => {
                const sel = reason === r.id;
                return (
                  <button key={r.id} onClick={() => setReason(r.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < arr.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: t.border, background: sel ? `${t.danger}08` : "transparent" }}>
                    <div className="size-4 rounded-full grid place-items-center" style={{ border: `1.5px solid ${sel ? t.danger : t.border}` }}>
                      {sel && <div className="size-1.5 rounded-full" style={{ background: t.danger }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold">{r.label}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>What happened? (required)</p>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} maxLength={1000}
              placeholder="Be specific: dates, quantities, condition, communications…"
              className="w-full p-3.5 rounded-2xl text-[12.5px] resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}` }} />
            <p className="mt-1 text-right text-[10px] font-mono" style={{ color: desc.length < 20 ? t.danger : t.muted }}>
              {desc.length}/1000 · min 20
            </p>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Evidence</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => setFiles((f) => [...f, `IMG_${2240 + f.length}.jpg`])}
                className="h-14 rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-bold"
                style={{ background: t.surface, border: `1px dashed ${t.border}`, color: t.navy }}>
                <Camera className="size-4" strokeWidth={2.3} /> Photo
              </button>
              <button onClick={() => setFiles((f) => [...f, `DOC_${f.length + 1}.pdf`])}
                className="h-14 rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-bold"
                style={{ background: t.surface, border: `1px dashed ${t.border}`, color: t.navy }}>
                <Paperclip className="size-4" strokeWidth={2.3} /> Document
              </button>
            </div>
            {files.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                {files.map((f, i, arr) => (
                  <div key={f + i} className={`flex items-center gap-3 px-3.5 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                    <FileText className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                    <p className="flex-1 text-[12px] font-semibold truncate">{f}</p>
                    <button onClick={() => setFiles((arr) => arr.filter((_, x) => x !== i))} className="size-6 grid place-items-center" style={{ color: t.muted }}>
                      <X className="size-3.5" strokeWidth={2.4} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/$id/dispute/thread", params: { id } })}
                disabled={!ready}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5 disabled:opacity-40"
                style={{ background: t.danger, boxShadow: `0 12px 28px -10px ${t.danger}80` }}>
                <AlertTriangle className="size-4" strokeWidth={2.6} /> Submit dispute
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
