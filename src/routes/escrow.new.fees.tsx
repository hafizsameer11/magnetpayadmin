import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Info, Clock } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { EscrowStepper, escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/fees")({
  head: () => ({ meta: [{ title: "New escrow · fees — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    party: String(s.party ?? "Counterparty"),
    mode: String(s.mode ?? "contact"),
    title: String(s.title ?? "Deal"),
    amount: Number(s.amount ?? 0),
    ccy: String(s.ccy ?? "CNY"),
    ms: Number(s.ms ?? 3),
    inspector: String(s.inspector ?? "sgs"),
    docs: Number(s.docs ?? 3),
  }),
  component: NewEscrowFees,
});

type Split = "buyer" | "seller" | "5050";

function NewEscrowFees() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const params = useSearch({ from: "/escrow/new/fees" });
  const sym = params.ccy === "CNY" ? "¥" : params.ccy === "USD" ? "$" : "₦";

  const [split, setSplit] = useState<Split>("5050");
  const [autoDays, setAutoDays] = useState(48);
  const [terms, setTerms] = useState(true);

  const feePct = 0.009;
  const fee = params.amount * feePct;
  const buyerPct = split === "buyer" ? 1 : split === "seller" ? 0 : 0.5;
  const buyerFee = fee * buyerPct;
  const sellerFee = fee - buyerFee;
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/new/inspection" search={{ party: params.party, mode: params.mode, title: params.title, amount: params.amount, ccy: params.ccy, ms: params.ms }}
              className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Cost & rules</p>
              <p className="text-[13px] font-bold">Fees & terms</p>
            </div>
            <div className="size-9" />
          </header>

          <EscrowStepper step={5} />

          {/* Fee preview */}
          <section className="px-4 mt-4">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>MagnetPay escrow fee</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {sym}{fmt(fee)}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: "#C8C2B0" }}>0.9% of {sym}{fmt(params.amount)} · includes dispute mediation</p>
            </div>
          </section>

          {/* Split */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>How are fees split?</p>
            <div className="flex gap-2">
              {([
                { k: "buyer", l: "Buyer pays", sub: "100% / 0%" },
                { k: "5050", l: "Split 50 / 50", sub: "Recommended" },
                { k: "seller", l: "Seller pays", sub: "0% / 100%" },
              ] as { k: Split; l: string; sub: string }[]).map((opt) => {
                const sel = split === opt.k;
                return (
                  <button key={opt.k} onClick={() => setSplit(opt.k)}
                    className="flex-1 p-3 rounded-2xl text-left transition"
                    style={{ background: sel ? t.navy : t.surface, border: `1px solid ${sel ? t.navy : t.border}`, color: sel ? "#fff" : t.ink }}>
                    <p className="text-[11.5px] font-bold">{opt.l}</p>
                    <p className="text-[9.5px] mt-0.5" style={{ color: sel ? "#C8C2B0" : t.muted }}>{opt.sub}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Buyer share", v: `${sym}${fmt(buyerFee)}` },
                { l: "Seller share", v: `${sym}${fmt(sellerFee)}` },
              ].map((r, i, arr) => (
                <div key={r.l} className={`flex items-center justify-between px-3.5 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className="text-[12px]" style={{ color: t.sub }}>{r.l}</p>
                  <p className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Auto-release */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Auto-release window</p>
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center gap-2">
                <Clock className="size-4" strokeWidth={2.4} style={{ color: t.accent }} />
                <p className="text-[12.5px] font-semibold">Release {autoDays}h after inspection passes</p>
              </div>
              <input type="range" min={0} max={168} step={12} value={autoDays}
                onChange={(e) => setAutoDays(Number(e.target.value))}
                className="w-full mt-3 accent-current" style={{ color: t.accent }} />
              <div className="mt-1 flex justify-between text-[9.5px] font-mono" style={{ color: t.muted }}>
                <span>Manual</span><span>48h</span><span>7d</span>
              </div>
            </div>
          </section>

          {/* Terms */}
          <section className="px-4 mt-5">
            <button onClick={() => setTerms(!terms)}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <span className="size-5 rounded-md grid place-items-center mt-0.5 shrink-0"
                style={{ background: terms ? t.accent : "transparent", border: `1.5px solid ${terms ? t.accent : t.border}` }}>
                {terms && <span className="text-white text-[11px] leading-none">✓</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold">I accept the Escrow Service Agreement</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>Funds are held by MagnetPay Trust until milestone release. Disputes resolved per the Mediation Rules.</p>
              </div>
            </button>
            <p className="mt-2 text-[10px] flex items-center gap-1.5" style={{ color: t.muted }}>
              <Info className="size-3" strokeWidth={2.4} /> A signed PDF is generated when both parties accept.
            </p>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/new/review", search: { ...params, split, autoDays, fee: Number(fee.toFixed(2)) } })}
                disabled={!terms}
                className="h-13 w-full rounded-2xl text-[13.5px] font-bold text-white py-3.5 disabled:opacity-40"
                style={{ background: t.navy }}>
                Review escrow
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
