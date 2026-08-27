import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft, ArrowDownLeft, ArrowUpRight, Repeat, MoreHorizontal,
  TrendingUp, Plus, Send, Sparkles, Building2, Wallet,
  Eye, EyeOff, Star, FileText, Download, Bell, Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { getRole, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/currency/$code")({
  head: () => ({ meta: [{ title: "Currency — MagnetPay" }] }),
  component: CurrencyDetail,
});

const META: Record<string, { name: string; symbol: string; flag: string; bal: string; sub: string; fx: string; usd: string }> = {
  cny: { name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", bal: "86,540.20", sub: "Renminbi · CNY", fx: "1 CNY = ₦229.04", usd: "≈ $12,108.50" },
  ngn: { name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", bal: "14,820,400.00", sub: "Naira · NGN", fx: "1 USD = ₦1,540", usd: "≈ $9,623.60" },
  usd: { name: "US Dollar", symbol: "$", flag: "🇺🇸", bal: "4,210.45", sub: "Dollar · USD", fx: "1 USD = ₦1,540", usd: "≈ $4,210.45" },
};

function CurrencyDetail() {
  const { code } = useParams({ from: "/currency/$code" });
  const key = (code || "cny").toLowerCase();
  const m = META[key] ?? META.cny;
  const upper = key.toUpperCase();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [primary, setPrimary] = useState(key === "ngn");
  const [alerts, setAlerts] = useState(true);
  const [role, setRoleState] = useState<V8Role>("buyer");
  useEffect(() => setRoleState(getRole()), []);
  const isBuyer = role === "buyer";
  const isForeign = key === "cny" || key === "usd";
  const hideWithdraw = isBuyer && isForeign;
  const depositTo: "/deposit" | "/fx" = isForeign ? "/fx" : "/deposit";

  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E", danger = "#B91C1C";

  const txns = [
    { I: ArrowDownLeft, t: "Wei Chen · Shenzhen", d: "Inbound · today 11:42", a: `+${m.symbol}2,500.00`, pos: true },
    { I: ArrowUpRight,  t: "Guangzhou Huayi",     d: "Supplier payout · yesterday", a: `−${m.symbol}18,400.00`, pos: false },
    { I: Repeat,        t: "Converted from NGN",  d: "FX · 2 days ago", a: `+${m.symbol}12,000.00`, pos: true },
    { I: ArrowUpRight,  t: "Foshan Ceramics",     d: "Order #A-1241 · 4 days ago", a: `−${m.symbol}6,820.00`, pos: false },
    { I: ArrowDownLeft, t: "Refund · Yiwu Trade", d: "Escrow refund · last week", a: `+${m.symbol}1,200.00`, pos: true },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          {/* Header */}
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Ledger</p>
              <p className="text-[13px] font-bold flex items-center gap-1.5"><span>{m.flag}</span>{upper} · {m.name}</p>
            </div>
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <button aria-label="More options" className="size-9 grid place-items-center rounded-full active:scale-95 transition" style={{ background: surface, border: `1px solid ${border}` }}>
                  <MoreHorizontal className="size-4" strokeWidth={2.4} />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={6} className="w-60 p-1.5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 16px 40px -12px rgba(15,25,20,0.25)" }}>
                {[
                  { I: hidden ? Eye : EyeOff, l: hidden ? "Show balance" : "Hide balance", on: () => { setHidden((h) => !h); setMenuOpen(false); toast.success(hidden ? "Balance shown" : "Balance hidden"); } },
                  { I: Star, l: primary ? "Primary ledger" : "Set as primary", active: primary, on: () => { setPrimary(true); setMenuOpen(false); toast.success(`${upper} set as primary`); } },
                  { I: Bell, l: alerts ? "Mute FX alerts" : "Enable FX alerts", on: () => { setAlerts((a) => !a); setMenuOpen(false); toast.success(alerts ? "FX alerts muted" : "FX alerts enabled"); } },
                  { I: FileText, l: "Statements", on: () => { setMenuOpen(false); navigate({ to: "/statements" }); } },
                  { I: Download, l: "Export CSV", on: () => { setMenuOpen(false); toast.success("Export started", { description: `${upper} ledger · last 90 days` }); } },
                  { I: Ban, l: "Block currency", danger: true, on: () => { setMenuOpen(false); toast(`${upper} blocked`, { description: "Incoming transfers in this currency will be declined." }); } },
                ].map((row, i, a) => (
                  <button key={row.l} onClick={row.on}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold active:scale-[0.99] transition ${i < a.length - 1 ? "" : ""}`}
                    style={{ color: row.danger ? danger : ink, background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = row.danger ? `${danger}0d` : `${navy}08`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <row.I className="size-4 shrink-0" strokeWidth={2.3} style={{ color: row.danger ? danger : row.active ? accent : navy }} />
                    <span className="flex-1">{row.l}</span>
                    {row.active && <span className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: accent }}>On</span>}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </header>

          {/* Balance hero */}
          <section className="px-4 mt-3">
            <div className="relative rounded-3xl p-5 overflow-hidden text-white"
              style={{ background: `linear-gradient(135deg, ${navy} 0%, #14513E 55%, ${navy} 100%)` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Available balance</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "#EFE9D9" }}>{m.usd}</span>
              </div>
              <h2 className="mt-2 text-[40px] leading-none font-bold tracking-tight tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="mr-1 font-sans" style={{ color: "#EFE9D9" }}>{m.symbol}</span>
                {hidden
                  ? <span style={{ letterSpacing: "0.1em" }}>••••••</span>
                  : key === "ngn"
                    ? m.bal.split(".")[0]
                    : <>{m.bal.split(".")[0]}<span style={{ color: "#C8C2B0" }}>.{m.bal.split(".")[1]}</span></>}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: "#C8C2B0" }}>
                <TrendingUp className="size-3.5" strokeWidth={2.4} />
                <span>{m.fx}</span>
                <span className="opacity-50">·</span>
                <span>updated 2m ago</span>
              </div>
              {/* Actions */}
              {(() => {
                const ccy = key as "ngn" | "cny" | "usd";
                const topUpSearch = isForeign ? { from: "ngn" as const, to: ccy } : undefined;
                // Convert: from this wallet. NGN→CNY (toggle to USD inside FX). Foreign→NGN.
                const convertSearch = ccy === "ngn"
                  ? { from: "ngn" as const, to: "cny" as const }
                  : { from: ccy, to: "ngn" as const };
                return (
                  <div className={`mt-5 grid gap-2 ${hideWithdraw ? "grid-cols-3" : "grid-cols-4"}`}>
                    {[
                      { I: Plus, l: isForeign ? "Top up" : "Deposit", to: depositTo, search: topUpSearch },
                      { I: Send, l: "Send", to: "/send" as const, search: undefined },
                      { I: Repeat, l: "Convert", to: "/fx" as const, search: convertSearch },
                      ...(hideWithdraw
                        ? []
                        : [ccy === "ngn"
                            ? { I: ArrowUpRight, l: "Withdraw", to: "/withdraw" as const, search: undefined }
                            : { I: ArrowUpRight, l: "Payout", to: "/bank" as const, search: undefined }]),
                    ].map(({ I, l, to, search }) => (
                      <Link key={l} to={to} search={search as never} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl active:scale-[0.97] transition"
                        style={{ background: "rgba(255,255,255,0.10)" }}>
                        <I className="size-4" strokeWidth={2.4} />
                        <span className="text-[10.5px] font-bold">{l}</span>
                      </Link>
                    ))}
                  </div>
                );
              })()}


            </div>
          </section>

          {/* Insights */}
          <section className="px-4 mt-5 grid grid-cols-2 gap-2">
            {[
              { l: "In · 30d", v: `${m.symbol}48,920`, c: success },
              { l: "Out · 30d", v: `${m.symbol}26,140`, c: accent },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl p-3" style={{ background: surface, border: `1px solid ${border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>{k.l}</p>
                <p className="mt-1.5 text-[18px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: k.c }}>{k.v}</p>
              </div>
            ))}
          </section>

          {/* CNY-specific tip */}
          {key === "cny" && (
            <section className="px-4 mt-4">
              <div className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: `${accent}10`, border: `1px solid ${accent}26` }}>
                <div className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${accent}1f`, color: accent }}>
                  <Sparkles className="size-4" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold" style={{ color: ink }}>Pay suppliers directly in CNY</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: sub }}>Skip FX spread. Settle to UnionPay, WeChat Pay, or Alipay merchant.</p>
                </div>
              </div>
            </section>
          )}

          {/* Linked accounts */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Linked payout</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${navy}10`, color: navy }}>
                {key === "cny" ? <Wallet className="size-4" strokeWidth={2.3} /> : <Building2 className="size-4" strokeWidth={2.3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold truncate">{key === "cny" ? "WeChat Pay · 138••8000" : "GTBank · 0123••7821"}</p>
                <p className="text-[10.5px]" style={{ color: muted }}>{key === "cny" ? "Linked · default payout" : "Linked · default payout"}</p>
              </div>
              <Link to="/bank" className="text-[11px] font-bold" style={{ color: accent }}>Manage</Link>
            </div>
          </section>

          {/* Transactions */}
          <section className="px-4 mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-sm font-bold">Activity</h3>
              <Link to="/statements" className="text-[11px] font-semibold" style={{ color: accent }}>Export</Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {txns.map((r, i, arr) => (
                <Link key={i} to="/tx/$id" params={{ id: `MP-${1000 + i}` }}
                  search={{ kind: r.pos ? "in" : "out", name: r.t, amount: r.a, state: "completed", ccy: upper }}
                  className={`flex items-center gap-3 px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: border }}>
                  <div className="size-9 rounded-full grid place-items-center shrink-0"
                    style={{ background: r.pos ? `${success}15` : `${ink}08`, color: r.pos ? success : ink }}>
                    <r.I className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{r.t}</p>
                    <p className="text-[10.5px]" style={{ color: muted }}>{r.d}</p>
                  </div>
                  <p className="text-[13px] font-bold tabular-nums shrink-0"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: r.pos ? success : ink }}>
                    {r.a}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
