import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Clock, Truck, AlertOctagon, Star, MessageCircle, Award, TrendingUp, TrendingDown } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/performance")({
  head: () => ({ meta: [{ title: "Performance — Seller" }] }),
  component: Performance,
});

function Performance() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<SellerNav active="home" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Seller</p>
              <p className="text-[13px] font-bold">Performance · 30 days</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Tier card */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4" style={{ background: t.navy, color: "#fff" }}>
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl grid place-items-center" style={{ background: `${t.accent}30`, color: "#fff" }}>
                  <Award className="size-5" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.65)" }}>Seller tier</p>
                  <p className="text-[18px] font-extrabold">Verified Gold</p>
                </div>
                <p className="text-[24px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>94<span className="text-[12px] opacity-60">/100</span></p>
              </div>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="h-full rounded-full" style={{ width: "94%", background: t.accent }} />
              </div>
              <p className="mt-2 text-[10.5px]" style={{ color: "rgba(255,255,255,0.7)" }}>6 points to Platinum · top-of-search placement</p>
            </div>
          </section>

          {/* Metrics */}
          <section className="px-4 mt-3 grid grid-cols-2 gap-2">
            <Metric I={Clock} label="Response time" v="1h 12m" goal="≤ 4h" pct={92} up />
            <Metric I={Truck} label="On-time shipping" v="96.4%" goal="≥ 95%" pct={96} up />
            <Metric I={AlertOctagon} label="Dispute rate" v="1.8%" goal="≤ 3%" pct={88} good />
            <Metric I={Star} label="Avg rating" v="4.86" goal="≥ 4.5" pct={97} up />
            <Metric I={MessageCircle} label="Reply rate" v="98%" goal="≥ 90%" pct={98} up />
            <Metric I={TrendingUp} label="Repeat buyers" v="34%" goal="—" pct={68} />
          </section>

          {/* Reviews */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Recent reviews</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { b: "Adekunle Trading", r: 5, q: "Pump bodies arrived spec-perfect. Will reorder." },
                { b: "Lagos Pumps Ltd", r: 5, q: "Fast packaging and great labels for our shipping." },
                { b: "Niger Industrial", r: 4, q: "Good quality, one carton slightly damaged in transit." },
              ].map((rv, i, a) => (
                <div key={rv.b} className={`px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11.5px] font-bold">{rv.b}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} className="size-3" strokeWidth={0} fill={k < rv.r ? t.accent : t.border} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: t.sub }}>"{rv.q}"</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Metric({ I, label, v, goal, pct, up, good }: { I: any; label: string; v: string; goal: string; pct: number; up?: boolean; good?: boolean }) {
  const t = escrowTheme;
  const c = up || good ? t.success : pct < 70 ? t.danger : t.warn;
  return (
    <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between">
        <I className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} />
        {up ? <TrendingUp className="size-3" strokeWidth={2.8} style={{ color: t.success }} /> : good ? null : <TrendingDown className="size-3" strokeWidth={2.8} style={{ color: t.warn }} />}
      </div>
      <p className="mt-1 text-[18px] font-extrabold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</p>
      <p className="text-[9.5px] font-bold uppercase tracking-wider mt-1" style={{ color: t.muted }}>{label}</p>
      <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: t.bg }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
      </div>
      <p className="text-[9.5px] mt-1" style={{ color: t.muted }}>Goal {goal}</p>
    </div>
  );
}
