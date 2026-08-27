import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ArrowRight, Plus, Trash2, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { ProductStepper } from "@/components/magnetpay/ProductStepper";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/products/new/pricing")({
  head: () => ({ meta: [{ title: "Add product · Pricing — Seller" }] }),
  component: AddPricing,
});

type Tier = { from: string; to: string; price: string };

function AddPricing() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [moq, setMoq] = useState("50");
  const [tiers, setTiers] = useState<Tier[]>([
    { from: "50", to: "199", price: "243" },
    { from: "200", to: "499", price: "228" },
    { from: "500", to: "", price: "212" },
  ]);
  const [sample, setSample] = useState("38");
  const [negotiable, setNegotiable] = useState(true);

  function update(i: number, k: keyof Tier, v: string) {
    setTiers((arr) => arr.map((r, x) => (x === i ? { ...r, [k]: v } : r)));
  }

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/products/new" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Add product · 2 of 4</p>
              <p className="text-[13px] font-bold">Pricing & MOQ</p>
            </div>
            <div className="size-9" />
          </header>

          <ProductStepper step={2} />

          {/* MOQ */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Minimum order quantity</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <input value={moq} onChange={(e) => setMoq(e.target.value)} inputMode="numeric"
                className="flex-1 bg-transparent text-[20px] font-extrabold tabular-nums outline-none"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              <p className="text-[11px] font-bold" style={{ color: t.muted }}>units / order</p>
            </div>
          </section>

          {/* Pricing tiers */}
          <section className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Volume tiers · ¥ per unit</p>
              <button type="button" onClick={() => setTiers((arr) => [...arr, { from: "", to: "", price: "" }])}
                className="text-[11px] font-bold flex items-center gap-1 px-2 py-1 -mr-2 rounded-full active:opacity-70" style={{ color: t.accent }}>
                <Plus className="size-3.5" strokeWidth={2.8} /> Add tier
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 px-3 py-2 text-[9.5px] font-bold uppercase tracking-wider" style={{ background: t.bg, color: t.muted }}>
                <p>From</p><p>To</p><p>Price ¥</p><p></p>
              </div>
              {tiers.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 px-3 py-2 items-center border-t" style={{ borderColor: t.border }}>
                  <Cell v={row.from} setV={(v) => update(i, "from", v)} />
                  <Cell v={row.to} setV={(v) => update(i, "to", v)} placeholder={i === tiers.length - 1 ? "+" : ""} />
                  <Cell v={row.price} setV={(v) => update(i, "price", v)} />
                  <button onClick={() => setTiers(tiers.filter((_, x) => x !== i))} className="size-6 grid place-items-center rounded-full" style={{ color: t.muted }}>
                    <Trash2 className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10.5px] mt-2" style={{ color: t.muted }}>Buyers see the right tier price automatically based on order quantity.</p>
          </section>

          {/* Sample */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Sample price (1 unit)</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <p className="text-[16px] font-extrabold" style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>¥</p>
              <input value={sample} onChange={(e) => setSample(e.target.value)} inputMode="decimal"
                className="flex-1 min-w-0 bg-transparent text-[20px] font-extrabold tabular-nums outline-none"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: `${t.success}15`, color: t.success }}>Optional</span>
            </div>
          </section>

          {/* Negotiable */}
          <section className="px-4 mt-3">
            <button onClick={() => setNegotiable(!negotiable)} className="w-full rounded-2xl p-3 flex items-center gap-3 text-left" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${t.info}15`, color: t.info }}>
                <ShieldCheck className="size-4" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">Accept RFQ / custom quotes</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Buyers can request a negotiated price above MOQ</p>
              </div>
              <span className="w-9 h-5 rounded-full relative" style={{ background: negotiable ? t.accent : t.border }}>
                <span className="absolute top-0.5 size-4 rounded-full bg-white transition-all" style={{ left: negotiable ? "calc(100% - 18px)" : "2px" }} />
              </span>
            </button>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/seller/products/new/media" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              Continue to media <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Cell({ v, setV, placeholder }: { v: string; setV: (s: string) => void; placeholder?: string }) {
  return (
    <input value={v} onChange={(e) => setV(e.target.value)} inputMode="numeric" placeholder={placeholder}
      className="w-full bg-transparent text-[13px] font-bold tabular-nums outline-none"
      style={{ fontFamily: "'JetBrains Mono', monospace" }} />
  );
}
