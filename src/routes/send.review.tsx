import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { ChevronLeft, Clock, ShieldCheck, ChevronDown } from "lucide-react";
import { useState } from "react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/send/review")({
  head: () => ({ meta: [{ title: "Send · review — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    rid: String(s.rid ?? ""),
    name: String(s.name ?? "Recipient"),
    channel: String(s.channel ?? "bank"),
    cny: Number(s.cny) || 0,
    purpose: String(s.purpose ?? "GDS"),
    note: String(s.note ?? ""),
  }),
  component: SendReview,
});

function SendReview() {
  useRoleGuard(["buyer", "both"], "Sending CNY isn't available for seller accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const navigate = useNavigate();
  const { rid, name, channel, cny, purpose, note } = useSearch({ from: "/send/review" });
  const [openFees, setOpenFees] = useState(true);

  const rate = 229.04;
  const fxFee = +(cny * 0.008).toFixed(2);
  const networkFee = channel === "bank" || channel === "unionpay" ? 18 : 6;
  const totalCny = cny + fxFee + networkFee;
  const totalNgn = totalCny * rate;
  const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const channelLabel = ({ bank: "Bank · ICBC", alipay: "Alipay", wechat: "WeChat Pay", unionpay: "UnionPay" } as Record<string, string>)[channel] ?? "Bank";

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <button onClick={() => navigate({ to: "/send/amount", search: { rid, name, channel } })}
              className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 4 of 5</p>
              <p className="text-[13px] font-bold">Review transfer</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Hero */}
          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${navy} 0%, #14513E 100%)` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Recipient gets</p>
              <h2 className="mt-1 text-[40px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                ¥{fmt(cny)}
              </h2>
              <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: "#C8C2B0" }}>
                <Clock className="size-3.5" strokeWidth={2.4} />
                <span>Arrives in {channel === "bank" ? "~30 min" : channel === "unionpay" ? "~1 hour" : "~5 min"}</span>
              </div>
            </div>
          </section>

          {/* Recipient */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="size-11 rounded-full grid place-items-center text-[12px] font-bold text-white" style={{ background: navy }}>
                {name.split(" ").map((p: string) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate">{name}</p>
                <p className="text-[10.5px]" style={{ color: muted }}>{channelLabel} · 6228••5678</p>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-1 rounded-full" style={{ background: `${navy}10`, color: navy }}>Verified</span>
            </div>
          </section>

          {/* Breakdown */}
          <section className="px-4 mt-3">
            <button onClick={() => setOpenFees((o) => !o)}
              className="w-full rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold">Fees & rate</p>
                <ChevronDown className="size-4 transition" style={{ transform: openFees ? "rotate(180deg)" : "none", color: muted }} strokeWidth={2.4} />
              </div>
              {openFees && (
                <div className="mt-3 space-y-1.5 text-left">
                  <Row k="Amount" v={`¥${fmt(cny)}`} />
                  <Row k="FX margin (0.8%)" v={`¥${fmt(fxFee)}`} />
                  <Row k="Network fee" v={`¥${fmt(networkFee)}`} />
                  <Row k="Rate" v={`1 CNY = ₦${rate.toFixed(2)}`} />
                  <div className="my-2 h-px" style={{ background: border }} />
                  <Row k="You pay" v={`₦${fmt(totalNgn, 0)}`} bold ink={ink} />
                  <p className="text-[10.5px]" style={{ color: muted }}>= ¥{fmt(totalCny)} debited from CNY wallet</p>
                </div>
              )}
            </button>

            <div className="mt-3 rounded-2xl p-3" style={{ background: surface, border: `1px solid ${border}` }}>
              <Row k="Purpose code" v={purpose} />
              {note && <Row k="Note" v={note} />}
              <Row k="Reference" v="MP-S-2840-7184" />
            </div>

            <div className="mt-3 rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${accent}10`, border: `1px solid ${accent}26` }}>
              <ShieldCheck className="size-4 shrink-0 mt-0.5" style={{ color: accent }} strokeWidth={2.4} />
              <p className="text-[11px]" style={{ color: ink }}>
                Held in escrow if recipient name mismatches. Auto-refund within 24h if payout fails.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 mt-5">
            <button
              onClick={() => navigate({ to: "/send/auth", search: { rid, name, channel, cny, purpose, note } })}
              className="w-full h-13 py-3.5 rounded-2xl text-[14px] font-bold text-white active:scale-[0.99] transition"
              style={{ background: accent }}>
              Slide to confirm · ₦{fmt(totalNgn, 0)}
            </button>
            <Link to="/send/amount" search={{ rid, name, channel }}
              className="mt-2 block text-center text-[11.5px] font-bold" style={{ color: muted }}>
              Edit amount
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ k, v, bold, ink }: { k: string; v: string; bold?: boolean; ink?: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-[12px]">
      <span style={{ color: "#5B5749" }}>{k}</span>
      <span className={`tabular-nums ${bold ? "text-[15px] font-bold" : "font-semibold"}`}
        style={{ fontFamily: "'JetBrains Mono', monospace", color: bold ? ink : "#1B1A17" }}>{v}</span>
    </div>
  );
}
