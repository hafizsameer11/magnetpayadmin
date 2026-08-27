import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronLeft, CheckCircle2, ArrowDownRight, Share2, Download } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type Ccy = "ngn" | "cny" | "usd";
const META: Record<Ccy, { code: string; symbol: string; name: string; dp: number }> = {
  ngn: { code: "NGN", symbol: "₦", name: "NGN wallet", dp: 0 },
  cny: { code: "CNY", symbol: "¥", name: "CNY wallet", dp: 2 },
  usd: { code: "USD", symbol: "$", name: "USD wallet", dp: 2 },
};
const norm = (s: unknown, fb: Ccy): Ccy => {
  const v = String(s ?? "").toLowerCase();
  return v === "ngn" || v === "cny" || v === "usd" ? (v as Ccy) : fb;
};

export const Route = createFileRoute("/fx/confirm")({
  head: () => ({ meta: [{ title: "Confirm conversion — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => {
    const from = norm(s.from, "ngn");
    const to = norm(s.to, from === "ngn" ? "cny" : "ngn");
    return {
      from, to,
      amount: Number(s.amount ?? s.ngn) || 0,
      out: Number(s.out ?? s.cny) || 0,
      rate: Number(s.rate) || 1,
      fee: Number(s.fee) || 0,
      locked: Number(s.locked) || 0,
    };
  },
  component: FxConfirm,
});

function FxConfirm() {
  useRoleGuard(["buyer", "both"], "FX isn't available for seller accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E";
  const navigate = useNavigate();
  const s = useSearch({ from: "/fx/confirm" }) as { from: Ccy; to: Ccy; amount: number; out: number; rate: number; fee: number; locked: number };
  const { from, to, amount, out, rate, fee, locked } = s;
  const src = META[from], dst = META[to];
  const [done, setDone] = useState(false);
  const fmt = (n: number, d: number) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtAmt = (n: number, c: Ccy) => `${META[c].symbol}${fmt(n, META[c].dp)}`;
  // Rate display — show foreign→NGN orientation when NGN is one side
  const rateLine = from === "ngn"
    ? `1 ${dst.code} = ₦${fmt(1 / rate, 2)}`
    : to === "ngn"
      ? `1 ${src.code} = ₦${fmt(rate, 2)}`
      : `1 ${src.code} = ${dst.symbol}${fmt(rate, 4)}`;

  if (done) {
    return (
      <>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
        <PhoneFrame background={navy}>
          <div className="relative min-h-full pb-10 flex flex-col" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
            <header className="px-4 pt-12 pb-3" />
            <section className="px-4 mt-6 flex-1">
              <div className="size-16 rounded-full grid place-items-center mx-auto" style={{ background: `${success}1a`, color: success }}>
                <CheckCircle2 className="size-9" strokeWidth={2.2} />
              </div>
              <h1 className="mt-4 text-center text-[22px] font-bold tracking-tight">Conversion complete</h1>
              <p className="mt-1.5 text-center text-[12.5px]" style={{ color: sub }}>
                {fmtAmt(out, to)} is now in your {dst.code} wallet
              </p>

              <div className="mt-6 rounded-3xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
                <p className="text-center text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Receipt</p>
                <div className="mt-4 space-y-2.5">
                  <Row k="From" v={fmtAmt(amount, from)} />
                  <Row k="Conversion fee" v={fmtAmt(fee, from)} />
                  <Row k="Rate used" v={rateLine} />
                  <Row k="Settled to" v={dst.name} />
                  <div className="my-2 h-px" style={{ background: border }} />
                  <Row k="You received" v={fmtAmt(out, to)} bold ink={ink} />
                  <Row k="Reference" v="MP-FX-2840-7184" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => toast.success("PDF receipt downloaded", { description: "MP-FX-2840-7184.pdf" })}
                  className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                  style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  <Download className="size-4" strokeWidth={2.4} /> PDF receipt
                </button>
                <button onClick={() => { try { navigator.clipboard.writeText("MP-FX-2840-7184"); toast.success("Receipt link copied"); } catch { toast.error("Copy failed"); } }}
                  className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                  style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  <Share2 className="size-4" strokeWidth={2.4} /> Share
                </button>
              </div>
            </section>

            <section className="px-4 mt-5 space-y-2">
              <Link to="/send" className="block w-full h-13 py-3.5 rounded-2xl text-center text-[14px] font-bold text-white" style={{ background: navy }}>
                {to === "cny" ? "Send to China" : to === "usd" ? "Send in USD" : "Send NGN"}
              </Link>
              <Link to="/home" className="block w-full h-12 py-3 rounded-2xl text-center text-[13px] font-bold" style={{ color: navy }}>
                Back to home
              </Link>
            </section>
          </div>
        </PhoneFrame>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <button onClick={() => navigate({ to: "/fx", search: { from, to } })} className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Review</p>
              <p className="text-[13px] font-bold">Confirm conversion</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${navy} 0%, #14513E 100%)` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>You'll receive</p>
              <h2 className="mt-1 text-[36px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtAmt(out, to)}
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-[11px]" style={{ color: "#C8C2B0" }}>
                <ArrowDownRight className="size-3.5" strokeWidth={2.4} />
                <span>Debit {fmtAmt(amount, from)} from {src.code} wallet</span>
              </div>
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
              <Row k="Amount" v={fmtAmt(amount, from)} />
              <Row k="Fee (0.8%)" v={fmtAmt(fee, from)} />
              <Row k="Rate" v={`${rateLine}${locked ? " · locked" : ""}`} />
              <Row k="Settles in" v="Instant" />
              <div className="my-2 h-px" style={{ background: border }} />
              <Row k="You receive" v={fmtAmt(out, to)} bold ink={ink} />
            </div>

            <p className="mt-3 text-center text-[10.5px]" style={{ color: muted }}>
              By tapping Convert you agree to MagnetPay's FX terms.
            </p>
          </section>

          <section className="px-4 mt-5">
            <button onClick={() => setDone(true)}
              className="w-full h-13 py-3.5 rounded-2xl text-[14px] font-bold text-white active:scale-[0.99] transition"
              style={{ background: accent }}>
              Convert {fmtAmt(amount, from)}
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ k, v, bold, ink }: { k: string; v: string; bold?: boolean; ink?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12px]">
      <span style={{ color: "#5B5749" }}>{k}</span>
      <span className={`tabular-nums ${bold ? "text-[14px] font-bold" : "font-semibold"}`}
        style={{ fontFamily: "'JetBrains Mono', monospace", color: bold ? ink : "#1B1A17" }}>{v}</span>
    </div>
  );
}
