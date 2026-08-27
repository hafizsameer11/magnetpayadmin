import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, User, FileCheck, Layers, Clock, Pencil } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { EscrowStepper, escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/review")({
  head: () => ({ meta: [{ title: "New escrow · review — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    party: String(s.party ?? "Counterparty"),
    mode: String(s.mode ?? "contact"),
    title: String(s.title ?? "Deal"),
    amount: Number(s.amount ?? 0),
    ccy: String(s.ccy ?? "CNY"),
    ms: Number(s.ms ?? 3),
    inspector: String(s.inspector ?? "sgs"),
    docs: Number(s.docs ?? 3),
    split: String(s.split ?? "5050") as "buyer" | "seller" | "5050",
    autoDays: Number(s.autoDays ?? 48),
    fee: Number(s.fee ?? 0),
  }),
  component: NewEscrowReview,
});

const INSPECTOR_LABEL: Record<string, string> = {
  sgs: "SGS Lagos", bv: "Bureau Veritas", self: "Buyer self-inspection", none: "No inspection",
};
const SPLIT_LABEL: Record<"buyer" | "seller" | "5050", string> = { buyer: "Buyer pays 100%", seller: "Seller pays 100%", "5050": "Split 50 / 50" };

function NewEscrowReview() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const p = useSearch({ from: "/escrow/new/review" });
  const sym = p.ccy === "CNY" ? "¥" : p.ccy === "USD" ? "$" : "₦";
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const total = p.amount + (p.split === "buyer" ? p.fee : p.split === "5050" ? p.fee / 2 : 0);

  const rows: { I: typeof User; l: string; v: string; to?: any; search?: any }[] = [
    { I: User, l: "Counterparty", v: p.party, to: "/escrow/new", search: {} },
    { I: Layers, l: "Milestones", v: `${p.ms} stages`, to: "/escrow/new/milestones", search: { party: p.party, mode: p.mode, title: p.title, amount: p.amount, ccy: p.ccy } },
    { I: ShieldCheck, l: "Inspection", v: INSPECTOR_LABEL[p.inspector], to: "/escrow/new/inspection", search: { party: p.party, mode: p.mode, title: p.title, amount: p.amount, ccy: p.ccy, ms: p.ms } },
    { I: FileCheck, l: "Required docs", v: `${p.docs} document${p.docs === 1 ? "" : "s"}`, to: "/escrow/new/inspection", search: { party: p.party, mode: p.mode, title: p.title, amount: p.amount, ccy: p.ccy, ms: p.ms } },
    { I: Clock, l: "Auto-release", v: p.autoDays === 0 ? "Manual" : `${p.autoDays}h after inspection`, to: "/escrow/new/fees", search: { party: p.party, mode: p.mode, title: p.title, amount: p.amount, ccy: p.ccy, ms: p.ms, inspector: p.inspector, docs: p.docs } },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/new/fees" search={{ party: p.party, mode: p.mode, title: p.title, amount: p.amount, ccy: p.ccy, ms: p.ms, inspector: p.inspector, docs: p.docs }}
              className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Final check</p>
              <p className="text-[13px] font-bold">Review escrow</p>
            </div>
            <div className="size-9" />
          </header>

          <EscrowStepper step={6} />

          {/* Hero */}
          <section className="px-4 mt-4">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Deal title</p>
              <h1 className="mt-0.5 text-[18px] font-bold leading-tight">{p.title}</h1>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-[36px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {sym}{fmt(p.amount)}
                </p>
                <p className="text-[11px]" style={{ color: "#C8C2B0" }}>{p.ccy}</p>
              </div>
              <p className="mt-2 text-[11px]" style={{ color: "#C8C2B0" }}>With {p.party}</p>
            </div>
          </section>

          {/* Summary rows */}
          <section className="px-4 mt-4 rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            {rows.map((r, i, arr) => (
              <Link key={r.l} to={r.to} search={r.search}
                className={`flex items-center gap-3 px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <r.I className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>{r.l}</p>
                  <p className="text-[12.5px] font-semibold truncate">{r.v}</p>
                </div>
                <Pencil className="size-3.5" strokeWidth={2.3} style={{ color: t.muted }} />
              </Link>
            ))}
          </section>

          {/* Cost breakdown */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Cost breakdown</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Deal amount", v: `${sym}${fmt(p.amount)}`, bold: false },
                { l: `Escrow fee · ${SPLIT_LABEL[p.split as "buyer" | "seller" | "5050"]}`, v: `${sym}${fmt(p.fee)}`, bold: false },
                { l: "Your total today", v: `${sym}${fmt(total)}`, bold: true },
              ].map((r, i, arr) => (
                <div key={r.l} className={`flex items-center justify-between px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className={`text-[12px] ${r.bold ? "font-bold" : ""}`} style={{ color: r.bold ? t.ink : t.sub }}>{r.l}</p>
                  <p className={`text-[12.5px] tabular-nums ${r.bold ? "font-bold" : "font-semibold"}`} style={{ fontFamily: "'JetBrains Mono', monospace", color: r.bold ? t.accent : t.ink }}>{r.v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trust note */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: `${t.success}10`, border: `1px solid ${t.success}26` }}>
              <ShieldCheck className="size-5 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[11px]" style={{ color: t.sub }}>
                Funds are debited from your CNY wallet and held by <span className="font-semibold" style={{ color: t.ink }}>MagnetPay Trust</span> until milestone release.
                Counterparty receives a secure deal link to accept.
              </p>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/new/fund", search: { party: p.party, title: p.title, amount: p.amount, ccy: p.ccy, fee: p.fee } })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <ShieldCheck className="size-4" strokeWidth={2.6} /> Fund & create escrow
              </button>
              <p className="mt-2 text-center text-[10px]" style={{ color: t.muted }}>
                Both parties must accept before funds release.
              </p>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
