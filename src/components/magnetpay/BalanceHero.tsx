import { useState } from "react";

type Currency = "NGN" | "CNY" | "USD";

const balances: Record<Currency, { symbol: string; whole: string; decimals: string; label: string }> = {
  NGN: { symbol: "₦", whole: "2,450,000", decimals: "00", label: "Naira" },
  CNY: { symbol: "¥", whole: "94,200", decimals: "40", label: "Renminbi" },
  USD: { symbol: "$", whole: "14,280", decimals: "45", label: "US Dollar" },
};

export function BalanceHero() {
  const [active, setActive] = useState<Currency>("NGN");
  const b = balances[active];

  return (
    <section className="px-6 mt-2 animate-[reveal_600ms_var(--ease-out-expo)_80ms_both]">
      <div className="bg-foreground text-white rounded-[32px] p-7 shadow-2xl shadow-foreground/10">
        <div className="flex justify-between items-start mb-6">
          <div className="min-w-0">
            <p className="text-white/60 text-sm font-medium mb-1">Total Balance ({active})</p>
            <h2 className="text-3xl font-extrabold tracking-tight font-mono">
              <span className="font-display mr-1">{b.symbol}</span>
              {b.whole}
              {active !== "NGN" && <span className="text-white/40">.{b.decimals}</span>}
            </h2>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-mono tracking-tighter uppercase shrink-0">
            Live Rates
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl">
          {(Object.keys(balances) as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                active === c ? "bg-white text-foreground" : "text-white/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
