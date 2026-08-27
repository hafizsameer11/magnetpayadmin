import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, AlertTriangle, Upload, Scale, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/order/$id/dispute")({
  head: () => ({ meta: [{ title: "Raise dispute — MagnetPay" }] }),
  component: OrderDispute,
});

const REASONS = [
  { k: "quality", l: "Quality defect", d: "Goods don't match spec or sample" },
  { k: "quantity", l: "Quantity short", d: "Received less than ordered" },
  { k: "damage", l: "Damaged in transit", d: "Packaging or product damaged" },
  { k: "delay", l: "Severe delay", d: "Lead time exceeded by 14+ days" },
  { k: "wrong", l: "Wrong item", d: "Different SKU shipped" },
];

function OrderDispute() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const { id } = useParams({ from: "/market/order/$id/dispute" });
  const [reason, setReason] = useState("quality");
  const [note, setNote] = useState("");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/order/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.danger }}>● Raise a dispute</p>
              <p className="text-[13px] font-bold">Order #{id}</p>
            </div>
            <span className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3 flex items-start gap-2" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Scale className="size-4 shrink-0 mt-0.5" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[10.5px]" style={{ color: t.info }}>Funds stay in escrow while MagnetPay mediates. Most disputes resolve in 5 days.</p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>What went wrong?</p>
            <div className="space-y-2">
              {REASONS.map((r) => {
                const on = reason === r.k;
                return (
                  <button key={r.k} onClick={() => setReason(r.k)} className="w-full text-left rounded-2xl p-3 flex items-start gap-3"
                    style={{ background: t.surface, border: `1.5px solid ${on ? t.danger : t.border}` }}>
                    <span className="size-5 rounded-full mt-0.5 shrink-0" style={{ background: on ? t.danger : "transparent", border: `1.5px solid ${on ? t.danger : t.border}` }} />
                    <div className="flex-1">
                      <p className="text-[12.5px] font-bold">{r.l}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{r.d}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Describe the issue</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              rows={4} placeholder="What was promised vs what arrived. Include unit counts and dates."
              className="w-full rounded-2xl p-3 text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          <section className="px-4 mt-3">
            <button className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-[12px] font-semibold border-dashed"
              style={{ background: t.surface, border: `1.5px dashed ${t.border}`, color: t.sub }}>
              <Upload className="size-4" strokeWidth={2.4} /> Upload photos / video (up to 8)
            </button>
            <p className="mt-1.5 text-[10px] text-center" style={{ color: t.muted }}>Side-by-side spec vs. received product speeds up resolution.</p>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Resolution you want</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "refund", l: "Full refund", v: "¥13,297" },
                { k: "partial", l: "Partial refund", v: "—" },
                { k: "replace", l: "Replacement", v: "Re-ship" },
              ].map((o, i) => (
                <button key={o.k} className="rounded-2xl p-2.5 text-left"
                  style={{ background: t.surface, border: `1.5px solid ${i === 0 ? t.danger : t.border}` }}>
                  <p className="text-[11px] font-bold">{o.l}</p>
                  <p className="text-[10px] tabular-nums" style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>{o.v}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <button onClick={() => navigate({ to: "/market/order/$id", params: { id } })}
              className="w-full h-13 rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.danger, boxShadow: `0 12px 28px -10px ${t.danger}80` }}>
              <AlertTriangle className="size-4" strokeWidth={2.6} /> Open dispute case
            </button>
            <p className="mt-2 text-[10px] text-center" style={{ color: t.muted }}>
              <ShieldCheck className="size-3 inline -mt-0.5" strokeWidth={2.6} /> Your ¥13,297.60 stays protected throughout.
            </p>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
