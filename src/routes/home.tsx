import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Bell, Plus, Send, Store, ShieldCheck, Ship, Repeat, Grid3x3,
  Home, User, ChevronRight, ArrowUpRight, ArrowDownLeft,
  CircleDot, Package, FileCheck2, AlertCircle, ScanLine, TruckIcon,
  MessageCircle, Tag, BarChart3, Banknote,
} from "lucide-react";
import { toast } from "sonner";

import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { BottomNav } from "@/components/magnetpay/BottomNav";
import { setRole } from "@/lib/v8-role";
import avatarUrl from "@/assets/avatar.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "MagnetPay — Atlas Dashboard" }] }),
  component: V8,
});

// V8 — Buyer (Nigerian importer) home. Seller home lives at /seller.
function V8() {
  const navy = "#0E3B2E";       // deep forest (primary)
  const bg = "#F6F1E7";         // warm ivory canvas
  const surface = "#FFFFFF";    // card
  const border = "#E7DFCE";     // hairline
  const accent = "#C2410C";     // terracotta accent
  const ink = "#1B1A17";        // primary text
  const sub = "#5B5749";        // secondary
  const muted = "#8A8472";      // muted
  const warn = "#B45309";       // amber warn

  // Anchor role to buyer on the buyer home so quick actions never bounce
  // back here after a previous flow (e.g. accepting an escrow invite) flipped
  // the stored role to "seller".
  useEffect(() => { setRole("buyer"); }, []);

  const isSeller = false;

  const actions = [
    { l: "Send", I: Send, to: "/send" as const },
    { l: "Market", I: Store, to: "/market" as const },
    { l: "Escrow", I: ShieldCheck, to: "/escrow" as const },
    { l: "Logistics", I: Ship, to: "/logistics" as const },
    { l: "Convert", I: Repeat, to: "/fx" as const },
    { l: "Recipients", I: Grid3x3, to: "/recipients" as const },
  ];



  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      
      <PhoneFrame
        background={navy}
        bottomNav={<BottomNav active="home" />}
      >
        <div
          className="relative min-h-full pb-28"
          style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}
        >
          {/* Header */}
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/me" className="flex items-center gap-3 min-w-0 -m-1 p-1 rounded-2xl active:opacity-70 transition-opacity" aria-label="Open profile">
              <div className="size-10 rounded-full overflow-hidden shrink-0" style={{ boxShadow: `0 0 0 2px ${navy}` }}>
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium" style={{ color: sub }}>Good afternoon</p>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-semibold truncate">Chidi Okoro</h1>
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
                    style={{ background: `${navy}14`, color: navy }}
                  >
                    <ShieldCheck className="size-2.5" strokeWidth={3} /> KYC
                  </span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/messages"
                className="relative size-9 grid place-items-center rounded-full"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <MessageCircle className="size-4" strokeWidth={2} style={{ color: sub }} />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full" style={{ background: accent }} />
              </Link>
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative size-9 grid place-items-center rounded-full"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <Bell className="size-4" strokeWidth={2} style={{ color: sub }} />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full" style={{ background: accent }} />
              </Link>
            </div>
          </header>

          {/* Wallet Summary */}
          <section className="px-4 mt-3">
            <div
              className="relative rounded-3xl p-5 overflow-hidden text-white"
              style={{
                background: `linear-gradient(135deg, ${navy} 0%, #14513E 60%, ${navy} 100%)`,
                border: `1px solid ${navy}`,
              }}
            >
              <div className="relative flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>
                  Total Balance
                </p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "#EFE9D9" }}>
                  USD equiv.
                </span>
              </div>
              <h2 className="relative mt-2 text-[40px] leading-none font-bold tracking-tight tabular-nums">
                $18,942<span style={{ color: "#C8C2B0" }}>.10</span>
              </h2>

              {/* Per-currency balances */}
              <div className="relative mt-5 grid grid-cols-3 gap-2">
                {[
                  { c: "NGN", v: "₦14.8M", flag: "🇳🇬", to: "/currency/$code" as const, code: "ngn" },
                  { c: "USD", v: "$4,210", flag: "🇺🇸", to: "/currency/$code" as const, code: "usd" },
                  { c: "CNY", v: "¥86,540", flag: "🇨🇳", to: "/currency/$code" as const, code: "cny" },
                ].map((w) => (
                  <Link
                    key={w.c}
                    to={w.to}
                    params={{ code: w.code }}
                    className="rounded-xl p-2.5 active:scale-[0.97] transition"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base leading-none">{w.flag}</span>
                      <span className="text-[9px] font-bold" style={{ color: "#C8C2B0" }}>{w.c}</span>
                    </div>
                    <p
                      className="mt-1.5 text-[13px] font-bold tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {w.v}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Primary CTA — role-aware */}
              {isSeller ? (
                <Link
                  to="/withdraw"
                  className="relative mt-4 w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold"
                  style={{ background: "#FFFFFF", color: navy }}
                >
                  <Banknote className="size-4" strokeWidth={2.6} /> Request payout
                </Link>
              ) : (
                <Link
                  to="/deposit"
                  className="relative mt-4 w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold"
                  style={{ background: "#FFFFFF", color: navy }}
                >
                  <Plus className="size-4" strokeWidth={2.6} /> Fund Wallet
                </Link>
              )}
            </div>
          </section>


          {/* Quick Actions */}
          <section className="px-4 mt-6">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-bold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {actions.map(({ l, I, to }) => (
                <Link
                  key={l}
                  to={to}
                  className="flex flex-col items-center justify-center gap-2 py-3 rounded-2xl active:scale-[0.98] transition"
                  style={{ background: surface, border: `1px solid ${border}` }}
                >
                  <div
                    className="size-9 rounded-xl grid place-items-center"
                    style={{ background: `${navy}10`, color: navy }}
                  >
                    <I className="size-4" strokeWidth={2.3} />
                  </div>
                  <span className="text-[10.5px] font-semibold" style={{ color: ink }}>{l}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Promo banner carousel */}
          <section className="mt-6">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {([
                {
                  k: "FX Alert",
                  t: "CNY → NGN rate just dropped",
                  d: "Save ₦18,400 on a ¥10,000 transfer today",
                  cta: "Convert now",
                  to: "/fx" as const,
                  img: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=900&q=70&auto=format&fit=crop",
                  tint: `linear-gradient(95deg, ${navy}F2 0%, ${navy}B0 55%, ${navy}30 100%)`,
                  pill: "rgba(255,255,255,0.18)",
                },
                {
                  k: "Escrow",
                  t: "Trade safely with verified suppliers",
                  d: "Funds released only when goods are confirmed",
                  cta: "Start an escrow",
                  to: "/escrow/new" as const,
                  img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=70&auto=format&fit=crop",
                  tint: `linear-gradient(95deg, ${accent}F2 0%, ${accent}B0 55%, ${accent}20 100%)`,
                  pill: "rgba(255,255,255,0.22)",
                },
                {
                  k: "Shipping",
                  t: "Door-to-door Guangzhou → Lagos",
                  d: "Live tracking · customs handled · 14-day ETA",
                  cta: "Book a shipment",
                  to: "/logistics/quote" as const,
                  img: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=900&q=70&auto=format&fit=crop",
                  tint: `linear-gradient(95deg, #0F766EF2 0%, #0F766EB0 55%, #0F766E20 100%)`,
                  pill: "rgba(255,255,255,0.20)",
                },
                {
                  k: "Refer & Earn",
                  t: "Earn $25 for every business you invite",
                  d: "They get $25 in fee credits on their first trade",
                  cta: "Invite a business",
                  to: "/help" as const,
                  img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=70&auto=format&fit=crop",
                  tint: `linear-gradient(95deg, #1B1A17F2 0%, #1B1A17A0 55%, #1B1A1720 100%)`,
                  pill: "rgba(255,255,255,0.20)",
                },
              ]).map((b) => (
                <div
                  key={b.k}
                  className="snap-center shrink-0 w-[390px] px-4"
                >
                  <div
                    className="relative w-full h-[170px] rounded-2xl overflow-hidden text-white"
                    style={{
                      backgroundImage: `${b.tint}, url('${b.img}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div>
                        <span
                          className="inline-block text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-full backdrop-blur-sm"
                          style={{ background: b.pill }}
                        >
                          {b.k}
                        </span>
                        <p
                          className="mt-2 text-[15px] font-bold leading-tight max-w-[230px]"
                          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}
                        >
                          {b.t}
                        </p>
                        <p
                          className="mt-1 text-[11px] leading-snug max-w-[230px] opacity-90"
                          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}
                        >
                          {b.d}
                        </p>
                      </div>
                      <Link
                        to={b.to}
                        className="inline-flex items-center gap-1 self-start text-[11px] font-bold px-3 py-1.5 rounded-full"
                        style={{ background: "#FFFFFF", color: ink }}
                      >
                        {b.cta} <ChevronRight className="size-3.5" strokeWidth={2.6} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* dot indicators */}
            <div className="mt-3 flex justify-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === 0 ? 16 : 5,
                    height: 5,
                    background: i === 0 ? navy : `${navy}33`,
                  }}
                />
              ))}
            </div>
          </section>


          {/* Trade Overview */}

          <section className="px-4 mt-6">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-bold">Trade Overview</h3>
              <Link to="/statements" className="text-[11px] font-semibold" style={{ color: accent }}>View all</Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Orders", v: 5, I: Package, c: navy, to: "/market/orders" as const },
                { l: "Escrows", v: 3, I: ShieldCheck, c: accent, to: "/escrow" as const },
                { l: "Shipments", v: 2, I: Ship, c: "#0F766E", to: "/logistics/shipments" as const },
              ].map((t) => (
                <Link
                  key={t.l}
                  to={t.to}
                  className="rounded-2xl p-3 block"
                  style={{ background: surface, border: `1px solid ${border}` }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="size-8 rounded-lg grid place-items-center"
                      style={{ background: `${t.c}15`, color: t.c }}
                    >
                      <t.I className="size-4" strokeWidth={2.3} />
                    </div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ background: `${t.c}15`, color: t.c }}
                    >
                      Active
                    </span>
                  </div>
                  <p className="mt-3 text-[22px] leading-none font-bold tabular-nums">{t.v}</p>
                  <p className="mt-1 text-[10.5px]" style={{ color: muted }}>{t.l}</p>
                </Link>
              ))}
            </div>
          </section>


          {/* Recent Activity feed */}
          <section className="px-4 mt-6">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-bold">Recent Activity</h3>
              <Link to="/statements" className="text-[11px] font-semibold" style={{ color: accent }}>See all</Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {[
                { I: ArrowDownLeft, t: "Wei Chen", d: "Inbound payment · 11:42", a: "+¥2,500.00", pos: true, c: navy, kind: "in" as const, ccy: "CNY", state: "completed" as const },
                { I: Ship, t: "Container MSK-2210", d: "Departed Shenzhen port", a: "Update", pos: null, c: "#0F766E", kind: "out" as const, ccy: "CNY", state: "processing" as const },
                { I: Package, t: "Order #A-1284", d: "Supplier confirmed · Guangzhou", a: "Confirmed", pos: null, c: accent, kind: "out" as const, ccy: "CNY", state: "completed" as const },
                { I: ArrowUpRight, t: "Adebayo Logistics", d: "Card payment · 09:15", a: "−₦85,000.00", pos: false, c: ink, kind: "out" as const, ccy: "NGN", state: "completed" as const },
                { I: AlertCircle, t: "Escrow #E-771", d: "Awaiting your release", a: "Action", pos: null, c: warn, kind: "out" as const, ccy: "CNY", state: "processing" as const },
              ].map((r, i, arr) => (
                <Link
                  key={r.t + i}
                  to="/tx/$id"
                  params={{ id: `MP-${2840 + i}` }}
                  search={{ kind: r.kind, name: r.t, amount: r.a, state: r.state, ccy: r.ccy }}
                  className={`flex items-center gap-3 px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: border }}
                >
                  <div
                    className="size-9 rounded-full grid place-items-center shrink-0"
                    style={{ background: `${r.c}15`, color: r.c }}
                  >
                    <r.I className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{r.t}</p>
                    <p className="text-[10.5px]" style={{ color: muted }}>{r.d}</p>
                  </div>
                  {r.pos === true || r.pos === false ? (
                    <p
                      className="text-[13px] font-bold tabular-nums shrink-0"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: r.pos ? navy : ink,
                      }}
                    >
                      {r.a}
                    </p>
                  ) : (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0 inline-flex items-center gap-1"
                      style={{ background: `${r.c}15`, color: r.c }}
                    >
                      <CircleDot className="size-2.5" /> {r.a}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>



          {/* spacer to keep ChevronRight import in case future row uses it */}
          <span className="hidden"><ChevronRight /></span>
        </div>
      </PhoneFrame>
    </>
  );
}
