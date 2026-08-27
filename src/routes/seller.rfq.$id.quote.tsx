import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Send, Plus, Trash2, Calendar, Package, Truck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/rfq/$id/quote")({
  head: () => ({ meta: [{ title: "Send quotation — Seller" }] }),
  component: SendQuotation,
});

type Line = { sku: string; desc: string; qty: string; price: string };

function SendQuotation() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [lines, setLines] = useState<Line[]>([
    { sku: "PB-A2", desc: "Cast-iron pump body PB-A2 · CE certified", qty: "800", price: "228" },
  ]);
  const [validity, setValidity] = useState("7");
  const [leadTime, setLeadTime] = useState("8");
  const [incoterm, setIncoterm] = useState("FOB Guangzhou");
  const [notes, setNotes] = useState("Bulk packed in cartons of 20. Inspection by SGS available.");

  const subtotal = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  const fee = Math.round(subtotal * 0.012);
  const total = subtotal + fee;

  function upd(i: number, k: keyof Line, v: string) {
    setLines(lines.map((l, x) => (x === i ? { ...l, [k]: v } : l)));
  }

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/rfq" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Quotation</p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Buyer card */}
          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.navy, color: "#fff" }}>
              <div className="size-10 rounded-xl grid place-items-center font-extrabold" style={{ background: "rgba(255,255,255,0.12)" }}>AT</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-extrabold">Adekunle Trading</p>
                <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.7)" }}>🇳🇬 Lagos · 14 prior orders · 4.8★</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: t.accent }}>2h SLA</span>
            </div>
          </section>

          {/* Line items */}
          <section className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Line items</p>
              <button type="button" onClick={() => setLines([...lines, { sku: "", desc: "", qty: "", price: "" }])}
                className="text-[11px] font-bold flex items-center gap-1 px-2 py-1 rounded-full" style={{ color: t.accent }}>
                <Plus className="size-3.5" strokeWidth={2.8} /> Add line
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="rounded-2xl p-3 space-y-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-2">
                    <input value={l.sku} onChange={(e) => upd(i, "sku", e.target.value)} placeholder="SKU"
                      className="w-20 bg-transparent text-[12px] font-extrabold tabular-nums outline-none"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                    <input value={l.desc} onChange={(e) => upd(i, "desc", e.target.value)} placeholder="Description"
                      className="flex-1 bg-transparent text-[12px] outline-none" />
                    <button onClick={() => setLines(lines.filter((_, x) => x !== i))} className="size-6 grid place-items-center" style={{ color: t.muted }}>
                      <Trash2 className="size-3.5" strokeWidth={2.4} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: `1px dashed ${t.border}` }}>
                    <Field label="Qty" v={l.qty} setV={(v) => upd(i, "qty", v)} />
                    <Field label="¥ / unit" v={l.price} setV={(v) => upd(i, "price", v)} />
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Line total</p>
                      <p className="text-[14px] font-extrabold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{((Number(l.qty)||0)*(Number(l.price)||0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Terms */}
          <section className="px-4 mt-4 grid grid-cols-2 gap-2">
            <Term I={Calendar} label="Valid for (days)" v={validity} setV={setValidity} suffix="days" />
            <Term I={Package} label="Lead time" v={leadTime} setV={setLeadTime} suffix="days" />
          </section>

          <section className="px-4 mt-2">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Incoterm</p>
            <div className="grid grid-cols-3 gap-1.5">
              {["FOB Guangzhou", "CIF Lagos", "EXW Factory"].map((x) => (
                <button key={x} onClick={() => setIncoterm(x)} className="text-[10.5px] font-bold px-2 py-2 rounded-xl"
                  style={{ background: incoterm === x ? t.accent : t.surface, color: incoterm === x ? "#fff" : t.ink, border: `1px solid ${incoterm === x ? t.accent : t.border}` }}>
                  {x}
                </button>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Notes to buyer</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full rounded-2xl p-3 text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          {/* Totals */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 space-y-1.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Row l="Subtotal" v={`¥${subtotal.toLocaleString()}`} />
              <Row l="MagnetPay escrow fee · 1.2%" v={`¥${fee.toLocaleString()}`} muted />
              <div className="pt-1.5 mt-1.5 flex items-center justify-between" style={{ borderTop: `1px dashed ${t.border}` }}>
                <p className="text-[12px] font-extrabold">Buyer pays</p>
                <p className="text-[18px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{total.toLocaleString()}</p>
              </div>
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: t.muted }}>
                <Truck className="size-3" strokeWidth={2.4} /> Logistics quoted separately based on incoterm
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => { toast.success(`Quotation sent to Adekunle Trading`); navigate({ to: "/seller/quotes" }); }}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <Send className="size-4" strokeWidth={2.6} /> Send quotation
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Field({ label, v, setV }: { label: string; v: string; setV: (s: string) => void }) {
  const t = escrowTheme;
  return (
    <div>
      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>{label}</p>
      <input value={v} onChange={(e) => setV(e.target.value)} inputMode="numeric"
        className="w-full bg-transparent text-[14px] font-extrabold tabular-nums outline-none mt-0.5"
        style={{ fontFamily: "'JetBrains Mono', monospace" }} />
    </div>
  );
}

function Term({ I, label, v, setV, suffix }: { I: any; label: string; v: string; setV: (s: string) => void; suffix: string }) {
  const t = escrowTheme;
  return (
    <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="flex items-center gap-1.5">
        <I className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} />
        <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>{label}</p>
      </div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <input value={v} onChange={(e) => setV(e.target.value)} inputMode="numeric"
          className="w-12 bg-transparent text-[18px] font-extrabold tabular-nums outline-none"
          style={{ fontFamily: "'JetBrains Mono', monospace" }} />
        <p className="text-[10.5px] font-bold" style={{ color: t.muted }}>{suffix}</p>
      </div>
    </div>
  );
}

function Row({ l, v, muted }: { l: string; v: string; muted?: boolean }) {
  const t = escrowTheme;
  return (
    <div className="flex items-center justify-between">
      <p className="text-[11px]" style={{ color: muted ? t.muted : t.ink }}>{l}</p>
      <p className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: muted ? t.muted : t.ink }}>{v}</p>
    </div>
  );
}
