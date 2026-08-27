import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ArrowLeftRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { EscrowStepper, escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/terms")({
  head: () => ({ meta: [{ title: "New escrow · terms — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    party: String(s.party ?? "Counterparty"),
    mode: String(s.mode ?? "contact"),
  }),
  component: NewEscrowTerms,
});

const CCY = [
  { c: "CNY", sym: "¥", flag: "🇨🇳", fx: "1 CNY = ₦229.04" },
  { c: "USD", sym: "$", flag: "🇺🇸", fx: "1 USD = ₦1,540" },
  { c: "NGN", sym: "₦", flag: "🇳🇬", fx: "Local" },
];

function NewEscrowTerms() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const { party, mode } = useSearch({ from: "/escrow/new/terms" });

  const [title, setTitle] = useState("Industrial pump parts");
  const [amount, setAmount] = useState("12400");
  const [ccy, setCcy] = useState("CNY");
  const [desc, setDesc] = useState("");

  const sym = CCY.find(c => c.c === ccy)?.sym ?? "¥";
  const fx = CCY.find(c => c.c === ccy)?.fx ?? "";
  const num = Number(amount.replace(/,/g, "")) || 0;
  const ready = title.trim().length >= 3 && num >= 10;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/new" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>With · {party}</p>
              <p className="text-[13px] font-bold">Deal terms</p>
            </div>
            <div className="size-9" />
          </header>

          <EscrowStepper step={2} />

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Deal title</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={64}
              placeholder="What's this deal for?"
              className="w-full h-12 px-3.5 rounded-2xl text-[13.5px] font-semibold"
              style={{ background: t.surface, border: `1px solid ${t.border}` }} />
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Currency</p>
            <div className="flex gap-2">
              {CCY.map((c) => (
                <button key={c.c} onClick={() => setCcy(c.c)}
                  className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold transition"
                  style={{
                    background: ccy === c.c ? t.navy : t.surface,
                    border: `1px solid ${ccy === c.c ? t.navy : t.border}`,
                    color: ccy === c.c ? "#fff" : t.ink,
                  }}>
                  <span>{c.flag}</span> {c.c}
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5 text-center">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Total deal amount</p>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-[36px] font-bold" style={{ color: t.muted }}>{sym}</span>
              <input inputMode="decimal" value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className="w-[200px] bg-transparent outline-none text-center text-[48px] font-bold tabular-nums tracking-tight"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
            <p className="mt-1 text-[11.5px] flex items-center justify-center gap-1.5" style={{ color: t.sub }}>
              <ArrowLeftRight className="size-3.5" strokeWidth={2.4} />
              {fx}
            </p>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Short description (optional)</p>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={240} rows={3}
              placeholder="200 units · 6-month warranty · DDP Lagos"
              className="w-full p-3.5 rounded-2xl text-[12.5px] resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}` }} />
            <p className="mt-1 text-right text-[10px] font-mono" style={{ color: t.muted }}>{desc.length}/240</p>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/new/milestones", search: { party, mode, title, amount: num, ccy } })}
                disabled={!ready}
                className="h-13 w-full rounded-2xl text-[13.5px] font-bold text-white py-3.5 disabled:opacity-40"
                style={{ background: t.navy }}>
                Continue to milestones
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
