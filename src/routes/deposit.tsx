import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { useState } from "react";
import {
  ChevronLeft, Building2, CreditCard, Hash, Smartphone,
  ArrowRight, Check, Zap, Clock, ShieldCheck, Info,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/deposit")({
  head: () => ({ meta: [{ title: "Deposit NGN — MagnetPay" }] }),
  component: Deposit,
});

const PRESETS = ["100,000", "250,000", "500,000", "1M", "5M", "10M"];

const METHODS = [
  { k: "virtual", I: Building2, t: "Virtual account", d: "Free · usually instant", tag: "Recommended", time: "≈ 1 min" },
  { k: "transfer", I: Hash,     t: "Bank transfer",    d: "Free · 1–10 min",        tag: null,           time: "≈ 5 min" },
  { k: "card",     I: CreditCard, t: "Debit card",     d: "1.5% fee · instant",     tag: null,           time: "Instant" },
  { k: "ussd",     I: Smartphone, t: "USSD",           d: "₦50 fee · 2–5 min",       tag: null,           time: "≈ 3 min" },
] as const;

function Deposit() {
  useRoleGuard(["buyer", "both"], "Deposit NGN isn't available for seller accounts");
  const navigate = useNavigate();
  const [amount, setAmount] = useState("50,000");
  const [method, setMethod] = useState<typeof METHODS[number]["k"]>("virtual");

  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E";

  const numeric = Number(amount.replace(/[^0-9]/g, ""));
  const valid = numeric >= 100;

  const onContinue = () => {
    if (!valid) return;
    if (method === "virtual") navigate({ to: "/deposit/virtual", search: { amount: numeric } as never });
    else navigate({ to: "/deposit/method", search: { method, amount: numeric } as never });
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Fund wallet</p>
              <h1 className="text-[15px] font-bold leading-tight">Deposit NGN</h1>
            </div>
            <span className="text-[18px]">🇳🇬</span>
          </header>

          {/* Amount card */}
          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Amount</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-bold" style={{ color: sub }}>₦</span>
                <input
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setAmount(raw ? Number(raw).toLocaleString("en-US") : "");
                  }}
                  inputMode="numeric"
                  placeholder="0"
                  className="flex-1 bg-transparent outline-none text-[36px] font-bold tabular-nums tracking-tight"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {PRESETS.map((p) => {
                  const val = p.endsWith("M")
                    ? (Number(p.replace("M", "")) * 1_000_000).toLocaleString("en-US")
                    : p;
                  const selected = amount === val;
                  return (
                    <button key={p} onClick={() => setAmount(val)}
                      className="h-8 rounded-lg text-[11px] font-bold active:scale-[0.97] transition px-1"
                      style={{
                        background: selected ? navy : `${navy}08`,
                        color: selected ? "#fff" : navy,
                      }}>
                      ₦{p}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-[11px]" style={{ borderTop: `1px dashed ${border}`, color: sub }}>
                <span>Daily limit remaining</span>
                <span className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}>₦19,500,000</span>
              </div>
            </div>
          </section>

          {/* Methods */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>How would you like to pay?</p>
            <div className="space-y-2">
              {METHODS.map((m) => {
                const selected = method === m.k;
                return (
                  <button key={m.k} onClick={() => setMethod(m.k)}
                    className="w-full p-3 rounded-2xl flex items-center gap-3 text-left transition active:scale-[0.99]"
                    style={{
                      background: selected ? `${navy}08` : surface,
                      border: `1.5px solid ${selected ? navy : border}`,
                    }}>
                    <div className="size-10 rounded-xl grid place-items-center shrink-0"
                      style={{ background: selected ? navy : `${ink}06`, color: selected ? "#fff" : sub }}>
                      <m.I className="size-[18px]" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-bold">{m.t}</p>
                        {m.tag && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.12em]"
                            style={{ background: `${success}1a`, color: success }}>{m.tag}</span>
                        )}
                      </div>
                      <p className="text-[10.5px] mt-0.5" style={{ color: muted }}>{m.d}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: sub }}>
                        {m.k === "card" ? <Zap className="size-3" strokeWidth={2.6} /> : <Clock className="size-3" strokeWidth={2.6} />}
                        {m.time}
                      </span>
                      <span className="size-5 rounded-full grid place-items-center"
                        style={{ background: selected ? navy : "transparent", border: selected ? "none" : `1.5px solid ${border}` }}>
                        {selected && <Check className="size-3" strokeWidth={3.2} style={{ color: "#fff" }} />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Trust strip */}
          <section className="px-4 mt-4">
            <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: `${navy}08`, border: `1px solid ${navy}1f` }}>
              <ShieldCheck className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: navy }} />
              <p className="text-[11px]" style={{ color: sub }}>
                Funds are held by our licensed banking partner. <span className="font-bold" style={{ color: ink }}>NDIC-insured</span> up to ₦5M.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button disabled={!valid} onClick={onContinue}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Continue with {METHODS.find((m) => m.k === method)!.t.toLowerCase()}
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-2 text-center text-[10px] flex items-center justify-center gap-1" style={{ color: muted }}>
              <Info className="size-3" strokeWidth={2.4} /> No fees on virtual account deposits
            </p>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
