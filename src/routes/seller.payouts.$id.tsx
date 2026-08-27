import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Download, CheckCircle2, Building2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/payouts/$id")({
  head: () => ({ meta: [{ title: "Payout detail — Seller" }] }),
  component: PayoutDetail,
});

const ORDERS = [
  { id: "#4824", buyer: "Adekunle Trading", v: 12400 },
  { id: "#4820", buyer: "Lagos Pumps Ltd", v: 18600 },
  { id: "#4817", buyer: "Niger Industrial", v: 9800 },
  { id: "#4811", buyer: "Kano Mech", v: 22300 },
  { id: "#4808", buyer: "Sahara Tools", v: 14200 },
  { id: "#4802", buyer: "Bayelsa Pumps", v: 9100 },
];

function PayoutDetail() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const gross = ORDERS.reduce((s, o) => s + o.v, 0);
  const fee = Math.round(gross * 0.018);
  const net = gross - fee;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<SellerNav active="home" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/payouts" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Payout</p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
            </div>
            <button className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Download className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          {/* Status hero */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-12 rounded-2xl grid place-items-center" style={{ background: `${t.success}15`, color: t.success }}>
                <CheckCircle2 className="size-6" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Paid · Dec 2, 09:14</p>
                <p className="text-[24px] font-extrabold tabular-nums leading-none mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{net.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Bank */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                <Building2 className="size-4" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">ICBC · 中国工商银行</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>···· 3821 · Hangzhou Magnetics Co.</p>
              </div>
            </div>
          </section>

          {/* Breakdown */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Breakdown</p>
            <div className="rounded-2xl p-3.5 space-y-1.5 text-[12px]" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Row l={`Gross from ${ORDERS.length} orders`} v={`¥${gross.toLocaleString()}`} />
              <Row l="MagnetPay fee · 1.8%" v={`−¥${fee.toLocaleString()}`} muted />
              <div className="pt-2 mt-1.5 flex items-center justify-between" style={{ borderTop: `1px dashed ${t.border}` }}>
                <p className="font-extrabold">Net payout</p>
                <p className="font-extrabold tabular-nums text-[15px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{net.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Orders */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Orders included</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {ORDERS.map((o, i, a) => (
                <div key={o.id} className={`px-3.5 py-2.5 flex items-center gap-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: t.sub }}>{o.buyer}</p>
                  </div>
                  <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{o.v.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ l, v, muted }: { l: string; v: string; muted?: boolean }) {
  const t = escrowTheme;
  return (
    <div className="flex items-center justify-between">
      <p className="font-semibold" style={{ color: muted ? t.muted : t.ink }}>{l}</p>
      <p className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: muted ? t.muted : t.ink }}>{v}</p>
    </div>
  );
}
