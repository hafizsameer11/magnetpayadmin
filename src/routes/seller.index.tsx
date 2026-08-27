import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bell, ChevronRight, TrendingUp, Package, ShoppingBag, Star, Wallet,
  ArrowUpRight, AlertCircle, Clock, BarChart3, Store, MessageCircle, Plus, FileText, Inbox,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/")({
  head: () => ({ meta: [{ title: "Seller — MagnetPay" }] }),
  component: SellerHome,
});

function SellerHome() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<SellerNav active="home" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          {/* Header */}
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/me" aria-label="Open profile" className="flex items-center gap-2.5 -m-1 p-1 rounded-2xl active:opacity-70 transition-opacity">
              <div className="size-10 rounded-2xl grid place-items-center text-white font-extrabold" style={{ background: t.navy }}>HM</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: t.muted }}>Seller mode</p>
                <p className="text-[13px] font-extrabold">Hangzhou Magnetics Co.</p>
              </div>
            </Link>
            <div className="flex items-center gap-1.5">
              <Link to="/seller/rfq" className="relative size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Inbox className="size-4" strokeWidth={2.4} />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full" style={{ background: t.accent }} />
              </Link>
              <Link to="/notifications" aria-label="Notifications" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Bell className="size-4" strokeWidth={2.4} />
              </Link>
            </div>
          </header>

          {/* Payout balance */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4" style={{ background: t.navy, color: "#fff" }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.65)" }}>Payout balance</p>
                <Link to="/seller/payouts" className="text-[10.5px] font-bold flex items-center gap-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Payouts <ChevronRight className="size-3" strokeWidth={2.6} />
                </Link>
              </div>
              <p className="mt-1 text-[32px] font-extrabold leading-none tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥184,520<span className="text-[16px] opacity-60">.40</span></p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat dark label="In escrow" v="¥72,300" sub="6 active orders" />
                <Stat dark label="Available" v="¥112,220" sub="Next payout Mon" />
              </div>
              <button onClick={() => toast.success("Withdrawal of ¥112,220 requested · arrives in 1–2 days")} className="mt-3 w-full rounded-2xl py-2.5 text-[12.5px] font-bold flex items-center justify-center gap-1.5" style={{ background: t.accent, color: "#fff" }}>
                <Wallet className="size-4" strokeWidth={2.6} /> Withdraw to bank
              </button>
            </div>
          </section>

          {/* KPI row */}
          <section className="px-4 mt-3 grid grid-cols-3 gap-2">
            <Kpi I={ShoppingBag} label="Orders (30d)" v="142" delta="+18%" up />
            <Kpi I={Star} label="Rating" v="4.86" delta="312 reviews" />
            <Kpi I={TrendingUp} label="GMV" v="¥612k" delta="+24%" up />
          </section>

          {/* Quick actions */}
          <section className="px-4 mt-4">
            <Link to="/seller/products/new"
              className="w-full flex items-center gap-3 rounded-2xl p-3 mb-2"
              style={{ background: t.navy, color: "#fff", boxShadow: `0 12px 24px -14px ${t.navy}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: t.accent }}>
                <Plus className="size-5" strokeWidth={2.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-extrabold leading-tight">Add product</p>
                <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.65)" }}>List a new SKU to your catalog</p>
              </div>
              <ChevronRight className="size-4" strokeWidth={2.6} style={{ color: "rgba(255,255,255,0.75)" }} />
            </Link>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { I: MessageCircle, l: "RFQs", sub: "2 new", to: "/seller/rfq" as const, accent: true },
                { I: FileText, l: "Quotes", sub: "5 sent", to: "/seller/quotes" as const },
                { I: ShoppingBag, l: "Orders", sub: "6 active", to: "/seller/orders" as const },
              ].map(({ I, l, sub, to, accent }) => (
                <Link key={l} to={to} className="rounded-2xl p-2.5 flex flex-col gap-2"
                  style={{ background: t.surface, border: `1px solid ${accent ? t.accent : t.border}` }}>
                  <div className="flex items-center justify-between">
                    <div className="size-8 rounded-lg grid place-items-center" style={{ background: accent ? `${t.accent}15` : `${t.navy}0d`, color: accent ? t.accent : t.navy }}>
                      <I className="size-4" strokeWidth={2.4} />
                    </div>
                    <ChevronRight className="size-3.5" strokeWidth={2.6} style={{ color: t.muted }} />
                  </div>
                  <div>
                    <p className="text-[11.5px] font-extrabold leading-tight">{l}</p>
                    <p className="text-[9.5px] mt-0.5 tabular-nums" style={{ color: accent ? t.accent : t.muted, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { I: Package, l: "Catalog", sub: "48 SKUs", to: "/seller/catalog" as const },
                { I: FileText, l: "Templates", sub: "Quotes & docs", to: "/seller/templates" as const },
                { I: BarChart3, l: "Metrics", sub: "4.86 ★", to: "/seller/performance" as const },
                { I: Store, l: "Storefront", sub: "Live", to: "/seller/storefront" as const },
              ].map(({ I, l, sub, to }) => (
                <Link key={l} to={to} className="rounded-2xl p-2.5 flex flex-col gap-2"
                  style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center justify-between">
                    <div className="size-8 rounded-lg grid place-items-center" style={{ background: `${t.navy}0d`, color: t.navy }}>
                      <I className="size-4" strokeWidth={2.4} />
                    </div>
                    <ChevronRight className="size-3.5" strokeWidth={2.6} style={{ color: t.muted }} />
                  </div>
                  <div>
                    <p className="text-[11.5px] font-extrabold leading-tight">{l}</p>
                    <p className="text-[9.5px] mt-0.5 tabular-nums" style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Action items */}
          <section className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Needs attention</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${t.accent}15`, color: t.accent }}>3</span>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { I: AlertCircle, c: t.accent, l: "Dispute opened · order #4827", s: "Buyer claims 4 units short · respond in 18h" },
                { I: Clock, c: t.warn, l: "Sample request awaiting reply", s: "Lagos Pumps Ltd · 2h ago" },
                { I: MessageCircle, c: t.info, l: "5 unread RFQ messages", s: "Avg response time 1h 12m" },
              ].map((r, i, a) => (
                <button key={r.l} onClick={() => toast(r.l)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-8 rounded-xl grid place-items-center shrink-0" style={{ background: `${r.c}15`, color: r.c }}>
                    <r.I className="size-4" strokeWidth={2.4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate">{r.l}</p>
                    <p className="text-[10.5px] truncate" style={{ color: t.muted }}>{r.s}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                </button>
              ))}
            </div>
          </section>

          {/* Recent orders */}
          <section className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Recent orders</p>
              <Link to="/seller/orders" className="text-[10.5px] font-bold flex items-center gap-0.5" style={{ color: t.accent }}>All <ChevronRight className="size-3" strokeWidth={2.6} /></Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { id: "4831", buyer: "Adekunle Trading", item: "Pump body PB-A2 · 200", v: "¥48,600", s: "Escrow", c: t.info },
                { id: "4829", buyer: "Lagos Pumps Ltd", item: "Coil set CS-7 · 80", v: "¥22,400", s: "Shipped", c: t.success },
                { id: "4827", buyer: "Niger Industrial", item: "Bearings B-22 · 1,200", v: "¥31,200", s: "Dispute", c: t.accent },
              ].map((o, i, a) => (
                <Link key={o.id} to="/seller/orders/$id" params={{ id: o.id }} className={`px-3.5 py-2.5 flex items-center gap-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11.5px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{o.id}</p>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${o.c}15`, color: o.c }}>{o.s}</span>
                    </div>
                    <p className="text-[11.5px] font-bold mt-0.5 truncate">{o.buyer}</p>
                    <p className="text-[10.5px] truncate" style={{ color: t.muted }}>{o.item}</p>
                  </div>
                  <p className="text-[13px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.v}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Stat({ label, v, sub, dark }: { label: string; v: string; sub?: string; dark?: boolean }) {
  return (
    <div className="rounded-2xl p-2.5" style={{ background: dark ? "rgba(255,255,255,0.08)" : "transparent", border: dark ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: dark ? "rgba(255,255,255,0.6)" : "#8A8472" }}>{label}</p>
      <p className="mt-0.5 text-[15px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: dark ? "#fff" : "#1B1A17" }}>{v}</p>
      {sub && <p className="text-[9.5px] mt-0.5" style={{ color: dark ? "rgba(255,255,255,0.55)" : "#8A8472" }}>{sub}</p>}
    </div>
  );
}

function Kpi({ I, label, v, delta, up }: { I: any; label: string; v: string; delta: string; up?: boolean }) {
  const t = escrowTheme;
  return (
    <div className="rounded-2xl p-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between">
        <I className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} />
        {up && <ArrowUpRight className="size-3" strokeWidth={2.8} style={{ color: t.success }} />}
      </div>
      <p className="mt-1 text-[16px] font-extrabold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</p>
      <p className="text-[9.5px] font-bold uppercase tracking-wider mt-1" style={{ color: t.muted }}>{label}</p>
      <p className="text-[9.5px] mt-0.5" style={{ color: up ? t.success : t.muted }}>{delta}</p>
    </div>
  );
}
