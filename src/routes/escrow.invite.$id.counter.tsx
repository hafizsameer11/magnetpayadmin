import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, GitCompare, Send, Minus, Plus, Info } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/invite/$id/counter")({
  head: () => ({ meta: [{ title: "Counter-propose — MagnetPay" }] }),
  component: CounterScreen,
});

function CounterScreen() {
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/invite/$id/counter" });
  const navigate = useNavigate();
  const [amount, setAmount] = useState(13600);
  const [inspector, setInspector] = useState<"sgs" | "bv" | "self">("sgs");
  const [autoH, setAutoH] = useState(72);
  const [note, setNote] = useState("Material cost up 9% vs original quote. Suggest splitting freight upgrade.");
  const [ms, setMs] = useState([
    { l: "30% on PO confirmation", p: 30 },
    { l: "30% on shipment", p: 30 },
    { l: "40% on inspection pass", p: 40 },
  ]);

  const setP = (i: number, p: number) => {
    setMs((arr) => arr.map((m, j) => (j === i ? { ...m, p: Math.max(0, Math.min(100, p)) } : m)));
  };
  const total = ms.reduce((a, b) => a + b.p, 0);
  const ok = total === 100;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/invite/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>Counter offer</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>New amount (CNY)</p>
            <div className="rounded-2xl p-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-baseline gap-2">
                <p className="text-[10px]" style={{ color: t.muted }}>was ¥12,400</p>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <button onClick={() => setAmount((a) => Math.max(0, a - 100))} className="size-10 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                  <Minus className="size-4" strokeWidth={2.4} />
                </button>
                <input value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="flex-1 text-center text-[28px] font-bold tabular-nums bg-transparent outline-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }} />
                <button onClick={() => setAmount((a) => a + 100)} className="size-10 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                  <Plus className="size-4" strokeWidth={2.4} />
                </button>
              </div>
              <p className="mt-2 text-center text-[11px]" style={{ color: amount > 12400 ? t.warn : t.success }}>
                {amount > 12400 ? `+¥${(amount - 12400).toLocaleString()} vs original` : amount < 12400 ? `−¥${(12400 - amount).toLocaleString()} vs original` : "Same as original"}
              </p>
            </div>
          </section>

          <section className="px-4 mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Milestone split</p>
              <p className="text-[10px] font-mono" style={{ color: ok ? t.success : t.danger }}>{total}% / 100%</p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {ms.map((m, i) => (
                <div key={i} className={`px-3.5 py-2.5 flex items-center gap-3 ${i < ms.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <input value={m.l} onChange={(e) => setMs((arr) => arr.map((x, j) => j === i ? { ...x, l: e.target.value } : x))}
                    className="flex-1 text-[12px] font-semibold bg-transparent outline-none" />
                  <button onClick={() => setP(i, m.p - 5)} className="size-7 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                    <Minus className="size-3" strokeWidth={2.4} />
                  </button>
                  <p className="w-10 text-center text-[11.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.p}%</p>
                  <button onClick={() => setP(i, m.p + 5)} className="size-7 rounded-full grid place-items-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                    <Plus className="size-3" strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Inspector</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { k: "sgs", l: "SGS" },
                { k: "bv", l: "Bureau V." },
                { k: "self", l: "Self-cert." },
              ] as const).map((o) => {
                const sel = inspector === o.k;
                return (
                  <button key={o.k} onClick={() => setInspector(o.k)}
                    className="h-11 rounded-xl text-[11.5px] font-bold"
                    style={{ background: sel ? t.navy : t.surface, color: sel ? "#fff" : t.sub, border: `1px solid ${sel ? t.navy : t.border}` }}>
                    {o.l}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Auto-release window</p>
            <div className="rounded-2xl p-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold">After inspection</p>
                <p className="text-[14px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}>{autoH}h</p>
              </div>
              <input type="range" min={24} max={168} step={12} value={autoH} onChange={(e) => setAutoH(Number(e.target.value))}
                className="w-full mt-3 accent-current" style={{ color: t.accent }} />
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Note to buyer</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full p-3 rounded-2xl text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>Buyer will get a notification and can accept, counter, or withdraw. Escrow only opens once both sides agree.</p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button disabled={!ok} onClick={() => navigate({ to: "/escrow/seller/$id", params: { id } })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5 disabled:opacity-50"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <Send className="size-4" strokeWidth={2.6} /> Send counter offer
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
