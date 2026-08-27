import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Wallet, Plus, ShieldCheck, Check } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { EscrowStepper, escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/fund")({
  head: () => ({ meta: [{ title: "New escrow · fund — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    party: String(s.party ?? "Counterparty"),
    title: String(s.title ?? "Deal"),
    amount: Number(s.amount ?? 0),
    ccy: String(s.ccy ?? "CNY"),
    fee: Number(s.fee ?? 0),
  }),
  component: NewEscrowFund,
});

const WALLETS = [
  { id: "cny", code: "CNY", flag: "🇨🇳", name: "CN Yuan wallet", bal: 48200, sym: "¥" },
  { id: "usd", code: "USD", flag: "🇺🇸", name: "US Dollar wallet", bal: 6420.55, sym: "$" },
  { id: "ngn", code: "NGN", flag: "🇳🇬", name: "Naira wallet", bal: 1284500, sym: "₦" },
];

function NewEscrowFund() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const p = useSearch({ from: "/escrow/new/fund" });
  const sym = p.ccy === "CNY" ? "¥" : p.ccy === "USD" ? "$" : "₦";
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const total = p.amount + p.fee / 2;

  const preferred = p.ccy.toLowerCase();
  const [picked, setPicked] = useState<string>(preferred);

  const wallet = WALLETS.find((w) => w.id === picked)!;
  const matches = wallet.code === p.ccy;
  const sufficient = matches ? wallet.bal >= total : true;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/new/review" search={{ party: p.party, title: p.title, amount: p.amount, ccy: p.ccy }}
              className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Fund escrow</p>
              <p className="text-[13px] font-bold">Choose source</p>
            </div>
            <div className="size-9" />
          </header>

          <EscrowStepper step={6} />

          <section className="px-4 mt-4">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Amount to hold</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-[36px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {sym}{fmt(total)}
                </p>
                <p className="text-[11px]" style={{ color: "#C8C2B0" }}>{p.ccy}</p>
              </div>
              <p className="mt-2 text-[11px]" style={{ color: "#C8C2B0" }}>{p.title} · with {p.party}</p>
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Pay from wallet</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {WALLETS.map((w, i, arr) => {
                const sel = picked === w.id;
                const low = w.code === p.ccy && w.bal < total;
                return (
                  <button key={w.id} onClick={() => setPicked(w.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < arr.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: t.border, background: sel ? `${t.navy}08` : "transparent" }}>
                    <div className="text-[20px]">{w.flag}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold truncate">{w.name}</p>
                      <p className="text-[10.5px] tabular-nums" style={{ color: low ? t.danger : t.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                        {w.sym}{fmt(w.bal)} available {low ? "· insufficient" : ""}
                      </p>
                    </div>
                    <div className="size-5 rounded-full grid place-items-center" style={{ background: sel ? t.navy : "transparent", border: `1.5px solid ${sel ? t.navy : t.border}` }}>
                      {sel && <Check className="size-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <Link to="/deposit" className="mt-2 flex items-center justify-center gap-1.5 h-11 rounded-2xl text-[12px] font-bold"
              style={{ background: t.surface, border: `1px dashed ${t.border}`, color: t.accent }}>
              <Plus className="size-3.5" strokeWidth={2.6} /> Top up wallet
            </Link>
          </section>

          {!matches && (
            <section className="px-4 mt-3">
              <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: `${t.info}10`, border: `1px solid ${t.info}26` }}>
                <Wallet className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
                <p className="text-[11px]" style={{ color: t.sub }}>
                  Auto-convert from {wallet.code} → {p.ccy} at 1 {wallet.code} = {p.ccy === "CNY" ? "0.96 ¥" : "0.13 $"}.
                </p>
              </div>
            </section>
          )}

          <section className="px-4 mt-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Deal amount", v: `${sym}${fmt(p.amount)}` },
                { l: "Escrow fee (your share)", v: `${sym}${fmt(p.fee / 2)}` },
                { l: "Total debit", v: `${sym}${fmt(total)}`, bold: true },
              ].map((r, i, arr) => (
                <div key={r.l} className={`flex items-center justify-between px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className={`text-[12px] ${r.bold ? "font-bold" : ""}`} style={{ color: r.bold ? t.ink : t.sub }}>{r.l}</p>
                  <p className={`text-[12.5px] tabular-nums ${r.bold ? "font-bold" : "font-semibold"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: r.bold ? t.accent : t.ink }}>{r.v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/new/done", search: { party: p.party, title: p.title, amount: p.amount, ccy: p.ccy } })}
                disabled={!sufficient}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5 disabled:opacity-40"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <ShieldCheck className="size-4" strokeWidth={2.6} /> Fund {sym}{fmt(total)}
              </button>
              <p className="mt-2 text-center text-[10px]" style={{ color: t.muted }}>
                Funds move to MagnetPay Trust until milestone release.
              </p>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
