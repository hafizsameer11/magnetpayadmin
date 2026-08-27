import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Package, CheckCircle2, XCircle, FileText, Paperclip, Camera } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/$id/milestone/$ms")({
  head: () => ({ meta: [{ title: "Milestone action — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    label: String(s.label ?? "Goods received & inspected"),
    amount: Number(s.amount ?? 4960),
    ccy: String(s.ccy ?? "CNY"),
  }),
  component: MilestoneAction,
});

type Mode = "received" | "approve" | "reject";

function MilestoneAction() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const { id, ms } = useParams({ from: "/escrow/$id/milestone/$ms" });
  const s = useSearch({ from: "/escrow/$id/milestone/$ms" });
  const navigate = useNavigate();
  const sym = s.ccy === "CNY" ? "¥" : s.ccy === "USD" ? "$" : "₦";
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [mode, setMode] = useState<Mode>("received");
  const [note, setNote] = useState("");

  const cfg: Record<Mode, { label: string; tone: string; icon: typeof Package; ctaTone: string }> = {
    received: { label: "Mark received", tone: t.info, icon: Package, ctaTone: t.navy },
    approve: { label: "Approve & release stage", tone: t.success, icon: CheckCircle2, ctaTone: t.success },
    reject: { label: "Reject milestone", tone: t.danger, icon: XCircle, ctaTone: t.danger },
  };

  const c = cfg[mode];

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Stage {ms} · #{id}</p>
              <p className="text-[13px] font-bold truncate max-w-[200px]">{s.label}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-3xl p-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Stage value</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {sym}{fmt(s.amount)}
              </p>
              <p className="text-[11px]" style={{ color: t.sub }}>40% of total · held in escrow</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Action</p>
            <div className="grid grid-cols-3 gap-2">
              {(["received", "approve", "reject"] as Mode[]).map((m) => {
                const C = cfg[m];
                const sel = mode === m;
                return (
                  <button key={m} onClick={() => setMode(m)}
                    className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] transition"
                    style={{ background: sel ? `${C.tone}12` : t.surface, border: `1.5px solid ${sel ? C.tone : t.border}`, color: sel ? C.tone : t.sub }}>
                    <C.icon className="size-4.5" strokeWidth={2.4} />
                    {m === "received" ? "Received" : m === "approve" ? "Approve" : "Reject"}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>
              {mode === "reject" ? "Reason (required)" : "Notes (optional)"}
            </p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={400}
              placeholder={mode === "reject" ? "Describe what's wrong with the milestone…" : "Add context for the audit log…"}
              className="w-full p-3.5 rounded-2xl text-[12.5px] resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}` }} />
            <p className="mt-1 text-right text-[10px] font-mono" style={{ color: t.muted }}>{note.length}/400</p>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Evidence</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => toast.success("Photo added", { description: "IMG_2241.jpg attached" })}
                className="h-14 rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-bold"
                style={{ background: t.surface, border: `1px dashed ${t.border}`, color: t.navy }}>
                <Camera className="size-4" strokeWidth={2.3} /> Photo
              </button>
              <button onClick={() => toast.success("File attached", { description: "Select a PDF or document" })}
                className="h-14 rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-bold"
                style={{ background: t.surface, border: `1px dashed ${t.border}`, color: t.navy }}>
                <Paperclip className="size-4" strokeWidth={2.3} /> Attach file
              </button>
            </div>
          </section>

          {mode === "approve" && (
            <section className="px-4 mt-4">
              <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: `${t.success}10`, border: `1px solid ${t.success}26` }}>
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
                <p className="text-[11px]" style={{ color: t.sub }}>
                  Approving releases <span className="font-bold" style={{ color: t.ink }}>{sym}{fmt(s.amount)}</span> from escrow to the supplier.
                </p>
              </div>
            </section>
          )}

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button
                onClick={() => {
                  if (mode === "approve") navigate({ to: "/escrow/$id/release", params: { id } });
                  else if (mode === "reject") navigate({ to: "/escrow/$id/dispute", params: { id } });
                  else navigate({ to: "/escrow/$id", params: { id } });
                }}
                disabled={mode === "reject" && note.trim().length < 5}
                className="h-13 w-full rounded-2xl text-[13.5px] font-bold text-white py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: c.ctaTone }}>
                <c.icon className="size-4" strokeWidth={2.6} /> {c.label}
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
