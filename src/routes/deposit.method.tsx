import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { useState } from "react";
import {
  ChevronLeft, Copy, Check, ShieldCheck, CreditCard, Hash, Smartphone, Lock,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type Method = "transfer" | "card" | "ussd";

export const Route = createFileRoute("/deposit/method")({
  head: () => ({ meta: [{ title: "Deposit — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>): { method: Method; amount: number } => ({
    method: (s.method === "card" || s.method === "ussd" ? s.method : "transfer") as Method,
    amount: typeof s.amount === "number" ? s.amount : Number(s.amount) || 50000,
  }),
  component: DepositMethod,
});

function DepositMethod() {
  useRoleGuard(["buyer", "both"], "Deposit NGN isn't available for seller accounts");
  const navigate = useNavigate();
  const { method, amount } = useSearch({ from: "/deposit/method" });
  const [copied, setCopied] = useState<string | null>(null);
  const [card, setCard] = useState({ num: "", exp: "", cvv: "" });

  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E";

  const copy = async (label: string, val: string) => {
    try { await navigator.clipboard.writeText(val.replace(/\s/g, "")); } catch { /* noop */ }
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const META = {
    transfer: { I: Hash, title: "Bank transfer", sub: "Send from any Nigerian bank app" },
    card:     { I: CreditCard, title: "Pay with card", sub: "Visa, Mastercard or Verve · 1.5% fee" },
    ussd:     { I: Smartphone, title: "Pay via USSD", sub: "Dial from your registered phone · ₦50" },
  } as const;
  const m = META[method as Method];

  const ussdBanks = [
    { name: "GTBank", code: `*737*2*${amount}*737#` },
    { name: "Access", code: `*901*2*${amount}*000#` },
    { name: "UBA",    code: `*919*4*${amount}*000#` },
    { name: "Zenith", code: `*966*2*${amount}*000#` },
  ];

  const cardValid =
    card.num.replace(/\s/g, "").length >= 15 &&
    /^\d{2}\/\d{2}$/.test(card.exp) &&
    card.cvv.length >= 3;

  const onContinue = () => {
    if (method === "card") {
      if (!cardValid) return;
      navigate({ to: "/deposit/status", search: { state: "success", amount, method } as never });
    } else if (method === "transfer") {
      navigate({ to: "/deposit/status", search: { state: "pending", amount, method } as never });
    } else {
      navigate({ to: "/deposit/status", search: { state: "pending", amount, method } as never });
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/deposit" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Deposit · {m.title}</p>
              <h1 className="text-[15px] font-bold leading-tight">{m.sub}</h1>
            </div>
            <div className="size-9 rounded-full grid place-items-center" style={{ background: `${navy}10`, color: navy }}>
              <m.I className="size-4" strokeWidth={2.3} />
            </div>
          </header>

          {/* Amount banner */}
          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${navy} 0%, #14513E 60%, ${navy} 100%)` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Amount</p>
              <h2 className="mt-1 text-[34px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="mr-1 font-sans" style={{ color: "#EFE9D9" }}>₦</span>
                {amount.toLocaleString("en-US")}<span style={{ color: "#C8C2B0" }}>.00</span>
              </h2>
            </div>
          </section>

          {/* Method-specific body */}
          {method === "transfer" && (
            <section className="px-4 mt-4">
              <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
                {[
                  { l: "Bank", v: "Wema Bank" },
                  { l: "Account number", v: "9981 442 718", mono: true, big: true },
                  { l: "Account name", v: "MagnetPay / User" },
                  { l: "Narration", v: `MPY-${amount}`, mono: true },
                ].map((row, i, arr) => (
                  <div key={row.l} className="px-4 py-3 flex items-center gap-3"
                    style={{ borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>{row.l}</p>
                      <p className={`mt-0.5 font-bold ${row.big ? "text-[20px]" : "text-[13px]"}`}
                        style={{ fontFamily: row.mono ? "'JetBrains Mono', monospace" : undefined, color: ink }}>
                        {row.v}
                      </p>
                    </div>
                    <button onClick={() => copy(row.l, row.v)}
                      className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold active:scale-[0.96] transition"
                      style={{ background: copied === row.l ? `${success}1a` : `${navy}0d`, color: copied === row.l ? success : navy }}>
                      {copied === row.l ? <Check className="size-3.5" strokeWidth={3} /> : <Copy className="size-3.5" strokeWidth={2.4} />}
                      {copied === row.l ? "Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-center" style={{ color: sub }}>
                Send the exact amount. Wallet credits within 1–10 minutes.
              </p>
            </section>
          )}

          {method === "card" && (
            <section className="px-4 mt-4 space-y-3">
              <div className="rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
                <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Card number</label>
                <input value={card.num} onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setCard({ ...card, num: raw.replace(/(.{4})/g, "$1 ").trim() });
                }} inputMode="numeric" placeholder="1234 5678 9012 3456"
                  className="mt-1 w-full bg-transparent outline-none text-[16px] font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
                  <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Expiry</label>
                  <input value={card.exp} onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const f = raw.length > 2 ? `${raw.slice(0,2)}/${raw.slice(2)}` : raw;
                    setCard({ ...card, exp: f });
                  }} inputMode="numeric" placeholder="MM/YY"
                    className="mt-1 w-full bg-transparent outline-none text-[16px] font-bold tabular-nums"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }} />
                </div>
                <div className="rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
                  <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>CVV</label>
                  <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    inputMode="numeric" placeholder="123" type="password"
                    className="mt-1 w-full bg-transparent outline-none text-[16px] font-bold tabular-nums"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }} />
                </div>
              </div>
              <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: `${navy}08`, border: `1px solid ${navy}1f` }}>
                <Lock className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: navy }} />
                <p className="text-[11px]" style={{ color: sub }}>
                  Your card is processed by <span className="font-bold" style={{ color: ink }}>Paystack</span>. We never store full card details.
                </p>
              </div>
            </section>
          )}

          {method === "ussd" && (
            <section className="px-4 mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Choose your bank</p>
              <div className="space-y-2">
                {ussdBanks.map((b) => (
                  <div key={b.name} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: surface, border: `1px solid ${border}` }}>
                    <div className="size-9 rounded-xl grid place-items-center text-[11px] font-bold"
                      style={{ background: `${navy}10`, color: navy }}>{b.name.slice(0, 2).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold">{b.name}</p>
                      <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: accent }}>{b.code}</p>
                    </div>
                    <button onClick={() => copy(b.name, b.code)}
                      className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold"
                      style={{ background: copied === b.name ? `${success}1a` : `${navy}0d`, color: copied === b.name ? success : navy }}>
                      {copied === b.name ? <Check className="size-3.5" strokeWidth={3} /> : <Copy className="size-3.5" strokeWidth={2.4} />}
                      {copied === b.name ? "Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl p-3 flex items-start gap-2.5" style={{ background: `${accent}10`, border: `1px solid ${accent}26` }}>
                <ShieldCheck className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: accent }} />
                <p className="text-[11px]" style={{ color: sub }}>
                  Dial from the phone number linked to your bank account.
                </p>
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button onClick={onContinue}
              disabled={method === "card" && !cardValid}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              {method === "card" ? `Pay ₦${amount.toLocaleString("en-US")}` : method === "transfer" ? "I've sent the transfer" : "I've dialled the code"}
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
