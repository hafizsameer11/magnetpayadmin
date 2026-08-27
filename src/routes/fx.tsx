import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ArrowUpDown, Lock, TrendingUp, Info, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type Ccy = "ngn" | "cny" | "usd";

const CCY: Record<Ccy, {
  code: string; name: string; symbol: string; flag: string;
  bal: string; ngnRate: number; // 1 unit = N NGN
  defaultAmount: string; quick: number[];
}> = {
  ngn: { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬",
         bal: "₦14,820,400", ngnRate: 1,
         defaultAmount: "500000", quick: [100000, 250000, 500000, 1000000] },
  cny: { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳",
         bal: "¥86,540.20", ngnRate: 229.04,
         defaultAmount: "2000", quick: [500, 1000, 2500, 5000] },
  usd: { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸",
         bal: "$4,210.45", ngnRate: 1540,
         defaultAmount: "500", quick: [100, 250, 500, 1000] },
};

const norm = (s: unknown, fallback: Ccy): Ccy => {
  const v = String(s ?? "").toLowerCase();
  return v === "ngn" || v === "cny" || v === "usd" ? (v as Ccy) : fallback;
};

export const Route = createFileRoute("/fx")({
  head: () => ({ meta: [{ title: "Convert — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => {
    // Back-compat: ?to=usd alone implies from=ngn
    const from = norm(s.from, "ngn");
    const to = norm(s.to, from === "ngn" ? "cny" : "ngn");
    return { from, to };
  },
  component: FxConvert,
});

function FxConvert() {
  useRoleGuard(["buyer", "both"], "FX isn't available for seller accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E";
  const navigate = useNavigate();
  const search = useSearch({ from: "/fx" }) as { from: Ccy; to: Ccy };
  const from: Ccy = norm(search.from, "ngn");
  const toInit: Ccy = norm(search.to, from === "ngn" ? "cny" : "ngn");
  // Ensure from !== to
  const to: Ccy = toInit === from ? (from === "ngn" ? "cny" : "ngn") : toInit;

  const src = CCY[from];
  const dst = CCY[to];

  // Target toggle always shown — the two currencies other than `from`
  const showTargetToggle = true;
  const targetOptions: Ccy[] = (["ngn", "cny", "usd"] as Ccy[]).filter((c) => c !== from);

  // Live mid rate: how many `to` per 1 `from`
  // baseRate (units of `to` per unit of `from`) = src.ngnRate / dst.ngnRate
  const baseRate = useMemo(() => src.ngnRate / dst.ngnRate, [src.ngnRate, dst.ngnRate]);
  const [rate, setRate] = useState(baseRate);
  const [amount, setAmount] = useState(src.defaultAmount);
  const [locked, setLocked] = useState(false);
  const [tick, setTick] = useState(28);

  useEffect(() => {
    setRate(baseRate);
    setAmount(src.defaultAmount);
    setLocked(false);
  }, [from, to, baseRate, src.defaultAmount]);

  useEffect(() => {
    if (locked) return;
    const drift = baseRate * 0.003;
    const t = setInterval(() => {
      setTick((s) => (s <= 1 ? 30 : s - 1));
      if (tick <= 1) setRate((r) => +(r + (Math.random() - 0.5) * drift).toFixed(6));
    }, 1000);
    return () => clearInterval(t);
  }, [locked, tick, baseRate]);

  const inNum = Number(amount.replace(/,/g, "")) || 0;
  const feePct = 0.008;
  const fee = inNum * feePct;
  const net = inNum - fee;
  const out = net * rate;

  // Decimals: NGN integer-ish, others 2dp
  const dp = (c: Ccy) => (c === "ngn" ? 0 : 2);
  const fmt = (n: number, d: number) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtAmt = (n: number, c: Ccy) => `${CCY[c].symbol}${fmt(n, dp(c))}`;

  // Display rate: "1 SRC = X.XX DST" — but when NGN involved, prefer "1 FOREIGN = ₦X" convention
  const showInverse = from === "ngn"; // 1 dst = ? ngn reads more naturally
  const displayRate = showInverse
    ? `1 ${dst.code} = ${src.symbol}${fmt(1 / rate, 2)}`
    : `1 ${src.code} = ${dst.symbol}${fmt(rate, dst === CCY.ngn ? 2 : 4)}`;

  const quickLabel = (v: number) => {
    if (from === "ngn") return `₦${v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1000}k`}`;
    return `${src.symbol}${v >= 1000 ? `${v / 1000}k` : v}`;
  };

  const swap = () => navigate({ to: "/fx", search: { from: to, to: from } });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Convert</p>
              <p className="text-[13px] font-bold">{src.code} → {dst.code}</p>
            </div>
            {showTargetToggle ? (
              <div className="flex gap-1">
                {targetOptions.map((k) => (
                  <button key={k}
                    onClick={() => navigate({ to: "/fx", search: { from, to: k } })}
                    className="px-2.5 h-7 rounded-full text-[10.5px] font-bold"
                    style={{ background: to === k ? navy : `${navy}10`, color: to === k ? "#fff" : navy }}>
                    {CCY[k].code}
                  </button>
                ))}
              </div>
            ) : <div className="size-9" />}
          </header>

          {/* From */}
          <section className="px-4 mt-3">
            <div className="rounded-3xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>You pay</p>
                <span className="text-[10.5px]" style={{ color: muted }}>Bal {src.bal}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="size-11 rounded-2xl grid place-items-center text-[20px]" style={{ background: `${navy}10` }}>{src.flag}</div>
                <div className="flex-1 min-w-0">
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    className="w-full bg-transparent outline-none text-[28px] font-bold tabular-nums"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <p className="text-[11px] font-semibold" style={{ color: sub }}>{src.name} · {src.code}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                {src.quick.map((v) => (
                  <button key={v} onClick={() => setAmount(String(v))}
                    className="flex-1 py-1.5 rounded-full text-[10.5px] font-bold"
                    style={{ background: inNum === v ? navy : `${navy}0d`, color: inNum === v ? "#fff" : navy }}>
                    {quickLabel(v)}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-2 flex justify-center">
              <button onClick={swap}
                className="size-10 rounded-full grid place-items-center shadow-sm active:scale-[0.95] transition" style={{ background: navy, color: "#fff" }}>
                <ArrowUpDown className="size-4" strokeWidth={2.6} />
              </button>
            </div>

            {/* To */}
            <div className="rounded-3xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>You receive</p>
                <span className="text-[10.5px]" style={{ color: muted }}>Bal {dst.bal}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="size-11 rounded-2xl grid place-items-center text-[20px]" style={{ background: `${accent}14` }}>{dst.flag}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[28px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtAmt(out, to)}
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: sub }}>{dst.name} · {dst.code}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Rate card */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3.5" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg grid place-items-center" style={{ background: `${success}14`, color: success }}>
                    <TrendingUp className="size-4" strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold">{displayRate}</p>
                    <p className="text-[10.5px]" style={{ color: muted }}>
                      {locked ? "Rate locked for 60s" : `Refreshes in ${tick}s · mid-market +0.4%`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setLocked((l) => !l)}
                  className="px-3 py-1.5 rounded-full text-[10.5px] font-bold flex items-center gap-1"
                  style={{ background: locked ? navy : `${navy}10`, color: locked ? "#fff" : navy }}>
                  <Lock className="size-3" strokeWidth={2.6} /> {locked ? "Locked" : "Lock"}
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-2xl p-3.5 text-[11.5px]" style={{ background: surface, border: `1px solid ${border}`, color: sub }}>
              <Row k="Conversion fee (0.8%)" v={fmtAmt(fee, from)} />
              <Row k="Net converted" v={fmtAmt(net, from)} />
              <div className="my-2 h-px" style={{ background: border }} />
              <Row k="You receive" v={fmtAmt(out, to)} bold ink={ink} />
            </div>

            <div className="mt-3 rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${accent}10`, border: `1px solid ${accent}26` }}>
              <Sparkles className="size-4 shrink-0 mt-0.5" style={{ color: accent }} strokeWidth={2.4} />
              <p className="text-[11px]" style={{ color: ink }}>
                Tip — lock the rate before reviewing if the market is moving. Locks expire after 60 seconds.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 mt-5">
            <button
              onClick={() => navigate({ to: "/fx/confirm", search: { from, to, amount: inNum, out: +out.toFixed(2), rate, fee: +fee.toFixed(2), locked: locked ? 1 : 0 } })}
              className="w-full h-13 py-3.5 rounded-2xl text-[14px] font-bold text-white active:scale-[0.99] transition"
              style={{ background: navy }}>
              Review conversion
            </button>
            <p className="mt-2 text-center text-[10.5px] flex items-center justify-center gap-1" style={{ color: muted }}>
              <Info className="size-3" strokeWidth={2.6} /> Settles instantly to your {dst.code} wallet
            </p>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ k, v, bold, ink }: { k: string; v: string; bold?: boolean; ink?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span>{k}</span>
      <span className={`tabular-nums ${bold ? "text-[14px] font-bold" : "font-semibold"}`} style={{ fontFamily: "'JetBrains Mono', monospace", color: bold ? ink : undefined }}>{v}</span>
    </div>
  );
}
