import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, FileText, Send, Download, Plus, Trash2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/orders/$id/proforma")({
  head: () => ({ meta: [{ title: "Pro-forma invoice — Seller" }] }),
  component: ProForma,
});

type Line = { sku: string; desc: string; hs: string; qty: string; price: string };

function ProForma() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [piNum] = useState(`PI-${id}`);
  const [bank, setBank] = useState("Bank of China · Hangzhou · USD/CNY");
  const [port, setPort] = useState("Guangzhou → Apapa, Lagos");
  const [incoterm, setIncoterm] = useState("FOB Guangzhou");
  const [lines, setLines] = useState<Line[]>([
    { sku: "PB-A2", desc: "Cast-iron pump body PB-A2 · CE certified", hs: "8413.91", qty: "200", price: "243" },
  ]);

  const subtotal = lines.reduce((s, l) => s + (+l.qty || 0) * (+l.price || 0), 0);
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
            <Link to="/seller/orders/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Pro-forma</p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{piNum}</p>
            </div>
            <button onClick={() => toast.success(`${piNum}.pdf downloaded`)} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Download className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          {/* Preview header */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[18px] font-extrabold leading-none">Pro-Forma Invoice</p>
                  <p className="text-[10.5px] mt-1 tabular-nums" style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>{piNum} · {new Date().toLocaleDateString("en-GB")}</p>
                </div>
                <FileText className="size-6" strokeWidth={2} style={{ color: t.muted }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Seller</p>
                  <p className="text-[11.5px] font-extrabold mt-0.5">Hangzhou Magnetics Co.</p>
                  <p className="text-[10.5px]" style={{ color: t.sub }}>Xihu District, Hangzhou, China</p>
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Buyer</p>
                  <p className="text-[11.5px] font-extrabold mt-0.5">Adekunle Trading</p>
                  <p className="text-[10.5px]" style={{ color: t.sub }}>Apapa, Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </section>

          {/* Editable header fields */}
          <section className="px-4 mt-3 space-y-2">
            <FieldRow label="Incoterm" v={incoterm} setV={setIncoterm} />
            <FieldRow label="Route" v={port} setV={setPort} />
            <FieldRow label="Beneficiary bank" v={bank} setV={setBank} />
          </section>

          {/* Line items */}
          <section className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Goods · with HS codes</p>
              <button type="button" onClick={() => setLines([...lines, { sku: "", desc: "", hs: "", qty: "", price: "" }])}
                className="text-[11px] font-bold flex items-center gap-1 px-2 py-1 rounded-full" style={{ color: t.accent }}>
                <Plus className="size-3.5" strokeWidth={2.8} /> Line
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="rounded-2xl p-3 space-y-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                    <div className="space-y-1.5">
                      <input value={l.desc} onChange={(e) => upd(i, "desc", e.target.value)} placeholder="Description"
                        className="w-full bg-transparent text-[12px] font-bold outline-none" />
                      <div className="flex items-center gap-2 text-[10.5px]" style={{ color: t.muted }}>
                        <span>SKU</span>
                        <input value={l.sku} onChange={(e) => upd(i, "sku", e.target.value)}
                          className="w-16 bg-transparent font-bold tabular-nums outline-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.ink }} />
                        <span>·</span>
                        <span>HS</span>
                        <input value={l.hs} onChange={(e) => upd(i, "hs", e.target.value)}
                          className="w-20 bg-transparent font-bold tabular-nums outline-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.ink }} />
                      </div>
                    </div>
                    <button onClick={() => setLines(lines.filter((_, x) => x !== i))} className="size-6 grid place-items-center" style={{ color: t.muted }}>
                      <Trash2 className="size-3.5" strokeWidth={2.4} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: `1px dashed ${t.border}` }}>
                    <Mini label="Qty" v={l.qty} setV={(v) => upd(i, "qty", v)} />
                    <Mini label="¥ / unit" v={l.price} setV={(v) => upd(i, "price", v)} />
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Line</p>
                      <p className="text-[14px] font-extrabold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{((+l.qty||0)*(+l.price||0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 space-y-1.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Row l="Goods subtotal" v={`¥${subtotal.toLocaleString()}`} />
              <Row l="MagnetPay escrow fee · 1.2%" v={`¥${fee.toLocaleString()}`} muted />
              <div className="pt-1.5 mt-1.5 flex items-center justify-between" style={{ borderTop: `1px dashed ${t.border}` }}>
                <p className="text-[12px] font-extrabold">Total invoice</p>
                <p className="text-[18px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{total.toLocaleString()}</p>
              </div>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => { toast.success(`${piNum} sent to buyer`); navigate({ to: "/seller/orders/$id", params: { id } }); }}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <Send className="size-4" strokeWidth={2.6} /> Send PI to buyer
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function FieldRow({ label, v, setV }: { label: string; v: string; setV: (s: string) => void }) {
  const t = escrowTheme;
  return (
    <div className="rounded-2xl px-3 py-2.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-wider w-20 shrink-0" style={{ color: t.muted }}>{label}</p>
      <input value={v} onChange={(e) => setV(e.target.value)} className="flex-1 bg-transparent text-[12px] font-bold outline-none" />
    </div>
  );
}
function Mini({ label, v, setV }: { label: string; v: string; setV: (s: string) => void }) {
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
function Row({ l, v, muted }: { l: string; v: string; muted?: boolean }) {
  const t = escrowTheme;
  return (
    <div className="flex items-center justify-between">
      <p className="text-[11px]" style={{ color: muted ? t.muted : t.ink }}>{l}</p>
      <p className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: muted ? t.muted : t.ink }}>{v}</p>
    </div>
  );
}
