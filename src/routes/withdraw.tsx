import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Building2, Plus, ShieldCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { getRole, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — MagnetPay" }] }),
  component: Withdraw,
});

const NG_BANKS = [
  { id: "gt", name: "GTBank", number: "0123••7821", default: true },
  { id: "wema", name: "Wema Bank", number: "8821••0044" },
  { id: "access", name: "Access Bank", number: "0099••3344" },
];
const CN_BANKS = [
  { id: "icbc", name: "ICBC 中国工商银行", number: "6228 ••• 5678", default: true },
  { id: "boc", name: "Bank of China 中国银行", number: "6217 ••• 1144" },
  { id: "cmb", name: "China Merchants Bank", number: "6225 ••• 3344" },
];

const NG_PRESETS = [50_000, 200_000, 500_000, 1_000_000];
const CN_PRESETS = [500, 2_000, 5_000, 20_000];

function Withdraw() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const navigate = useNavigate();
  const [role, setRoleState] = useState<V8Role>("buyer");
  useEffect(() => setRoleState(getRole()), []);
  const isSeller = role === "seller";

  const BANKS = isSeller ? CN_BANKS : NG_BANKS;
  const PRESETS = isSeller ? CN_PRESETS : NG_PRESETS;
  const sym = isSeller ? "¥" : "₦";
  const ccy = isSeller ? "CNY" : "NGN";
  const balance = isSeller ? 86_540 : 14_820_400;
  const fee = isSeller ? 6 : 50;

  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState(BANKS[0].id);
  useEffect(() => setBank(BANKS[0].id), [isSeller]); // eslint-disable-line react-hooks/exhaustive-deps

  const num = Number(amount.replace(/[^\d]/g, "")) || 0;
  const minOK = isSeller ? num >= 10 : num >= 1000;
  const ready = minOK && num <= balance;
  const fmt = (n: number) => n.toLocaleString(isSeller ? "en-US" : "en-NG");

  const submit = () => {
    if (!ready) return;
    const ref = `MP-W-${Math.floor(Math.random() * 9000 + 1000)}`;
    toast.success(`${sym}${fmt(num)} withdrawn`, { description: `Ref ${ref}` });
    navigate({
      to: "/tx/$id",
      params: { id: ref },
      search: {
        kind: "out",
        name: BANKS.find((b) => b.id === bank)?.name ?? "Bank",
        amount: `−${sym}${fmt(num)}`,
        state: "completed",
        ccy,
      },
    });
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/currency/$code" params={{ code: ccy.toLowerCase() }} className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>{isSeller ? "Payout" : "Withdraw"}</p>
              <p className="text-[13px] font-bold">{ccy} to {isSeller ? "CN bank" : "bank"}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-center" style={{ background: surface, border: `1px solid ${border}` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>You {isSeller ? "payout" : "withdraw"}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-[28px] font-bold" style={{ color: sub }}>{sym}</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-44 bg-transparent outline-none text-center text-[40px] font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
              <p className="mt-1 text-[11px]" style={{ color: muted }}>
                Available <span className="font-bold tabular-nums" style={{ color: ink }}>{sym}{fmt(balance)}</span>
              </p>

              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p} onClick={() => setAmount(String(p))}
                    className="text-[11px] font-bold py-2 rounded-full"
                    style={{ background: bg, border: `1px solid ${border}`, color: sub }}>
                    {sym}{p >= 1_000_000 ? `${p / 1_000_000}M` : p >= 1000 ? `${p / 1000}k` : p}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Pay to</p>
              <Link to="/bank" className="text-[11px] font-bold" style={{ color: accent }}>Manage banks</Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {BANKS.map((b, i) => {
                const active = b.id === bank;
                return (
                  <button key={b.id} onClick={() => setBank(b.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < BANKS.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: border, background: active ? `${navy}06` : "transparent" }}>
                    <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${navy}10`, color: navy }}>
                      <Building2 className="size-4" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold flex items-center gap-2">
                        {b.name}
                        {b.default && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${navy}10`, color: navy }}>Default</span>}
                      </p>
                      <p className="text-[10.5px] tabular-nums" style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}>{b.number}</p>
                    </div>
                    <div className="size-5 rounded-full grid place-items-center" style={{ border: `1.5px solid ${active ? navy : border}`, background: active ? navy : "transparent" }}>
                      {active && <span className="size-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
              <Link to="/bank" className="flex items-center gap-2 px-3.5 py-3 text-[12px] font-bold" style={{ color: accent, borderTop: `1px solid ${border}` }}>
                <Plus className="size-4" strokeWidth={2.4} /> Add new bank
                <ChevronRight className="size-3.5 ml-auto" strokeWidth={2.4} />
              </Link>
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-4 space-y-1.5" style={{ background: surface, border: `1px solid ${border}` }}>
              <Row k="Amount" v={`${sym}${fmt(num)}`} />
              <Row k="Fee" v={`${sym}${fmt(fee)}`} />
              <Row k="Arrives" v={isSeller ? "T+0 · same-day" : "Instant · NIP"} />
              <div className="my-2 h-px" style={{ background: border }} />
              <Row k="Total debit" v={`${sym}${fmt(num + fee)}`} bold />
            </div>

            <div className="mt-3 rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${navy}0a`, border: `1px solid ${navy}1a` }}>
              <ShieldCheck className="size-4 shrink-0 mt-0.5" style={{ color: navy }} strokeWidth={2.4} />
              <p className="text-[11px]" style={{ color: ink }}>
                {isSeller
                  ? "Payouts to your verified CN bank settle same day. Daily limit ¥200,000."
                  : "Withdrawals to your own verified bank settle in seconds. Daily limit ₦20M."}
              </p>
            </div>
          </section>

          <section className="px-4 mt-5">
            <button onClick={submit} disabled={!ready}
              className="w-full h-13 py-3.5 rounded-2xl text-[14px] font-bold text-white active:scale-[0.99] transition disabled:opacity-40"
              style={{ background: accent }}>
              {isSeller ? "Payout" : "Withdraw"} {sym}{fmt(num)}
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span style={{ color: "#5B5749" }}>{k}</span>
      <span className={`tabular-nums ${bold ? "text-[15px] font-bold" : "font-semibold"}`}
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1B1A17" }}>{v}</span>
    </div>
  );
}
