import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Check, Globe2, Coins } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/settings/locale")({
  head: () => ({ meta: [{ title: "Language & currency — MagnetPay" }] }),
  component: Locale,
});

function Locale() {
  const t = escrowTheme;
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("CNY");
  const [numFmt, setNumFmt] = useState("1,234.56");

  const langs = [
    { code: "en", label: "English", flag: "🇬🇧", sub: "English (UK)" },
    { code: "en-ng", label: "English (Nigeria)", flag: "🇳🇬", sub: "Naira-friendly formats" },
    { code: "zh", label: "中文 (简体)", flag: "🇨🇳", sub: "Simplified Chinese" },
    { code: "fr", label: "Français", flag: "🇫🇷", sub: "Beta" },
  ];

  const currencies = [
    { code: "CNY", label: "Chinese Yuan", sym: "¥", note: "Default display for sourcing" },
    { code: "USD", label: "US Dollar", sym: "$", note: "" },
    { code: "NGN", label: "Nigerian Naira", sym: "₦", note: "" },
    { code: "EUR", label: "Euro", sym: "€", note: "" },
  ];

  const Row = <T extends string>({
    items,
    value,
    onChange,
    render,
  }: {
    items: { code: T }[];
    value: T;
    onChange: (v: T) => void;
    render: (item: { code: T }, selected: boolean) => React.ReactNode;
  }) => (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
    >
      {items.map((it, i) => {
        const sel = it.code === value;
        return (
          <button
            key={it.code}
            onClick={() => onChange(it.code)}
            className="w-full px-3.5 py-3 flex items-center gap-3 text-left"
            style={{ borderTop: i > 0 ? `1px solid ${t.border}` : "none" }}
          >
            {render(it, sel)}
            <div
              className="size-5 rounded-full grid place-items-center shrink-0"
              style={{
                background: sel ? t.navy : "transparent",
                border: `1.5px solid ${sel ? t.navy : t.border}`,
              }}
            >
              {sel && <Check className="size-3" strokeWidth={3} style={{ color: "#fff" }} />}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-8"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to="/me"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[13px] font-bold">Language & currency</p>
            <div className="size-9" />
          </header>

          <section className="px-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2 inline-flex items-center gap-1.5"
              style={{ color: t.muted }}
            >
              <Globe2 className="size-3" strokeWidth={2.6} /> App language
            </p>
            <Row
              items={langs as { code: string }[]}
              value={lang}
              onChange={setLang}
              render={(it, sel) => {
                const l = langs.find((x) => x.code === it.code)!;
                return (
                  <>
                    <span className="text-[20px] leading-none">{l.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12.5px] font-bold"
                        style={{ color: sel ? t.navy : t.ink }}
                      >
                        {l.label}
                      </p>
                      <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                        {l.sub}
                      </p>
                    </div>
                  </>
                );
              }}
            />
          </section>

          <section className="px-4 mt-5">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2 inline-flex items-center gap-1.5"
              style={{ color: t.muted }}
            >
              <Coins className="size-3" strokeWidth={2.6} /> Display currency
            </p>
            <Row
              items={currencies as { code: string }[]}
              value={currency}
              onChange={setCurrency}
              render={(it, sel) => {
                const c = currencies.find((x) => x.code === it.code)!;
                return (
                  <>
                    <div
                      className="size-9 rounded-xl grid place-items-center text-[13px] font-bold shrink-0"
                      style={{
                        background: sel ? t.navy : `${t.navy}08`,
                        color: sel ? "#fff" : t.navy,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {c.sym}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold">
                        {c.code} · {c.label}
                      </p>
                      {c.note && (
                        <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                          {c.note}
                        </p>
                      )}
                    </div>
                  </>
                );
              }}
            />
            <p className="text-[10.5px] mt-2 px-1" style={{ color: t.muted }}>
              Prices and balances will be converted at the live MagnetPay FX rate.
            </p>
          </section>

          <section className="px-4 mt-5">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Number format
            </p>
            <Row
              items={[{ code: "1,234.56" }, { code: "1.234,56" }, { code: "1 234,56" }]}
              value={numFmt}
              onChange={setNumFmt}
              render={(it, sel) => (
                <div className="flex-1">
                  <p
                    className="text-[13px] font-bold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: sel ? t.navy : t.ink,
                    }}
                  >
                    {it.code}
                  </p>
                </div>
              )}
            />
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
