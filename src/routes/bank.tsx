import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ArrowRight, Check, Landmark, ShieldCheck, ChevronDown, Smartphone } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { getRole, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/bank")({
  head: () => ({ meta: [{ title: "Payout method — MagnetPay" }] }),
  component: Bank,
});

const NG_BANKS = [
  { n: "GTBank", c: "058", color: "#E36C0A", holder: "CHIDI OKORO" },
  { n: "Access Bank", c: "044", color: "#003B7B", holder: "CHIDI OKORO" },
  { n: "Zenith", c: "057", color: "#B91C1C", holder: "CHIDI OKORO" },
  { n: "First Bank", c: "011", color: "#003D7C", holder: "CHIDI OKORO" },
  { n: "UBA", c: "033", color: "#DC2626", holder: "CHIDI OKORO" },
  { n: "Stanbic", c: "221", color: "#0F4C81", holder: "CHIDI OKORO" },
];
const NG_MORE = [
  { n: "Fidelity", c: "070", color: "#1F4E79", holder: "CHIDI OKORO" },
  { n: "FCMB", c: "214", color: "#5B2A86", holder: "CHIDI OKORO" },
  { n: "Sterling", c: "232", color: "#B3261E", holder: "CHIDI OKORO" },
  { n: "Wema", c: "035", color: "#7B1F9A", holder: "CHIDI OKORO" },
  { n: "Union", c: "032", color: "#0067B1", holder: "CHIDI OKORO" },
  { n: "Polaris", c: "076", color: "#5C2D91", holder: "CHIDI OKORO" },
];

const CN_BANKS = [
  { n: "ICBC 工商银行", c: "ICBC", color: "#B91C1C", holder: "WANG WEI 王伟" },
  { n: "Bank of China 中国银行", c: "BOC", color: "#B91C1C", holder: "WANG WEI 王伟" },
  { n: "CCB 建设银行", c: "CCB", color: "#1E4D8B", holder: "WANG WEI 王伟" },
  { n: "ABC 农业银行", c: "ABC", color: "#0F766E", holder: "WANG WEI 王伟" },
  { n: "China Merchants 招商", c: "CMB", color: "#B45309", holder: "WANG WEI 王伟" },
  { n: "Ping An 平安银行", c: "PAB", color: "#EA580C", holder: "WANG WEI 王伟" },
];
const CN_MORE = [
  { n: "Bocom 交通银行", c: "BCM", color: "#1E40AF", holder: "WANG WEI 王伟" },
  { n: "CITIC 中信银行", c: "CITIC", color: "#B91C1C", holder: "WANG WEI 王伟" },
  { n: "China Everbright 光大", c: "CEB", color: "#7C2D12", holder: "WANG WEI 王伟" },
  { n: "Minsheng 民生银行", c: "CMBC", color: "#0F766E", holder: "WANG WEI 王伟" },
];

type Method = "bank" | "wechat" | "alipay";

function Bank() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    teal = "#0F766E", accent = "#C2410C";
  const navigate = useNavigate();
  const [role, setRoleState] = useState<V8Role>("buyer");
  useEffect(() => setRoleState(getRole()), []);
  const isSeller = role === "seller";

  const [method, setMethod] = useState<Method>("bank");
  const banks = useMemo(() => isSeller ? CN_BANKS : NG_BANKS, [isSeller]);
  const more = isSeller ? CN_MORE : NG_MORE;
  const [bank, setBank] = useState(banks[0]);
  const [showAll, setShowAll] = useState(false);
  const [acct, setAcct] = useState("");
  const [handle, setHandle] = useState("");

  useEffect(() => { setBank(banks[0]); setAcct(""); }, [banks]);

  const list = showAll ? [...banks, ...more] : banks;
  const acctLen = isSeller ? 19 : 10;
  const valid = method === "bank"
    ? acct.length >= (isSeller ? 16 : 10)
    : handle.trim().length >= 4;

  const fmtNg = (s: string) => s.replace(/(\d{4})(\d{3})(\d+)?/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  const fmtCn = (s: string) => s.replace(/(\d{4})(\d{4})(\d{4})(\d+)?/, (_, a, b, c, d) => [a, b, c, d].filter(Boolean).join(" "));
  const fmtAcct = isSeller ? fmtCn : fmtNg;

  const moreCount = (isSeller ? CN_BANKS.length + CN_MORE.length : 24);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to={isSeller ? "/kyb-docs" : "/kyc-status"} className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Payout method · {isSeller ? "Seller" : "Buyer"}</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 5 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
            <button onClick={() => navigate({ to: "/address" })} className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Skip</button>
          </header>

          <section className="px-4 mt-4">
            <div className="size-12 rounded-2xl grid place-items-center" style={{ background: `${teal}14`, color: teal }}>
              <Landmark className="size-5" strokeWidth={2.2} />
            </div>
            <h1 className="mt-4 text-[24px] leading-[1.05] font-bold tracking-tight">
              {isSeller ? <>Where should we send<br />your CNY payouts?</> : <>Where should we send<br />your money?</>}
            </h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              {isSeller
                ? "Link a Chinese bank, WeChat Pay or Alipay account in your legal name. Withdrawals settle in 15 minutes during banking hours."
                : "Link a Nigerian bank account in your name. Withdrawals settle in 5 minutes during banking hours."}
            </p>
          </section>

          {isSeller && (
            <section className="px-4 mt-5">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Payout method</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { k: "bank" as Method, l: "Bank", I: Landmark, tint: navy },
                  { k: "wechat" as Method, l: "WeChat Pay", I: Smartphone, tint: "#07C160" },
                  { k: "alipay" as Method, l: "Alipay", I: Smartphone, tint: "#1677FF" },
                ]).map((m) => {
                  const on = method === m.k;
                  return (
                    <button key={m.k} onClick={() => setMethod(m.k)}
                      className="rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition"
                      style={{ background: on ? `${m.tint}10` : surface, border: `1.5px solid ${on ? m.tint : border}` }}>
                      <span className="size-8 rounded-xl grid place-items-center" style={{ background: m.tint, color: "#fff" }}>
                        <m.I className="size-4" strokeWidth={2.4} />
                      </span>
                      <span className="text-[10.5px] font-bold">{m.l}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {method === "bank" && (
            <>
              <section className="px-4 mt-5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>
                  Choose your bank
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {list.map((b) => {
                    const on = bank.n === b.n;
                    return (
                      <button key={b.n} onClick={() => setBank(b)}
                        className="aspect-square rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] transition"
                        style={{
                          background: on ? `${navy}08` : surface,
                          border: `1.5px solid ${on ? navy : border}`,
                        }}>
                        <span className="size-9 rounded-xl grid place-items-center text-[10px] font-bold" style={{ background: b.color, color: "#fff" }}>
                          {b.c.slice(0, 3)}
                        </span>
                        <span className="text-[10px] font-bold text-center leading-tight">{b.n}</span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setShowAll((s) => !s)}
                  className="mt-2 w-full h-11 rounded-2xl text-[12px] font-bold flex items-center justify-center gap-1.5"
                  style={{ background: surface, border: `1px solid ${border}`, color: sub }}>
                  <ChevronDown className={`size-3.5 transition ${showAll ? "rotate-180" : ""}`} strokeWidth={2.6} />
                  {showAll ? "Show less" : `Show all ${moreCount} banks`}
                </button>
              </section>

              <section className="px-4 mt-5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Account number</p>
                <div className="mt-2 h-14 rounded-2xl px-4 flex items-center" style={{ background: surface, border: `1.5px solid ${valid ? teal : acct ? navy : border}` }}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={fmtAcct(acct)}
                    onChange={(e) => setAcct(e.target.value.replace(/\D/g, "").slice(0, acctLen))}
                    placeholder={isSeller ? "6228 4800 0000 0000" : "0000 000 000"}
                    className="w-full bg-transparent outline-none text-[17px] font-bold tracking-[0.14em] placeholder:font-normal placeholder:text-[#bdb6a2]"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}
                  />
                  <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-bold shrink-0"
                    style={{ color: valid ? teal : muted }}>
                    {valid ? <><Check className="size-3" strokeWidth={3.2} /> Matched</> : `${acct.length}/${acctLen}`}
                  </span>
                </div>
                {valid && (
                  <div className="mt-3 p-3 rounded-2xl flex items-center gap-3" style={{ background: `${teal}10`, border: `1px solid ${teal}26` }}>
                    <div className="size-9 rounded-full grid place-items-center text-[10px] font-bold" style={{ background: teal, color: "#fff" }}>
                      {bank.holder.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold leading-tight truncate">{bank.holder}</p>
                      <p className="text-[10.5px] truncate" style={{ color: sub }}>{bank.n} · {fmtAcct(acct)}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: teal, color: "#fff" }}>Primary</span>
                  </div>
                )}
              </section>
            </>
          )}

          {method !== "bank" && (
            <section className="px-4 mt-5">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>
                {method === "wechat" ? "WeChat Pay ID / phone" : "Alipay account / phone"}
              </p>
              <div className="mt-2 h-14 rounded-2xl px-4 flex items-center" style={{ background: surface, border: `1.5px solid ${valid ? teal : handle ? navy : border}` }}>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder={method === "wechat" ? "wxid_xxxxxx or +86 138 0013 8000" : "wang.wei@alipay.cn or +86 138 0013 8000"}
                  className="w-full bg-transparent outline-none text-[14px] font-bold placeholder:font-normal placeholder:text-[#bdb6a2]"
                  style={{ color: ink, fontFamily: "'JetBrains Mono', monospace" }}
                />
                {valid && <Check className="size-4 ml-2 shrink-0" strokeWidth={3} style={{ color: teal }} />}
              </div>
              <div className="mt-3 p-3 rounded-2xl flex items-start gap-2.5" style={{ background: `${navy}08`, border: `1px solid ${navy}1a` }}>
                <ShieldCheck className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: navy }} />
                <p className="text-[11px]" style={{ color: sub }}>
                  Real-name account required. We verify against your KYB legal representative on first payout.
                </p>
              </div>
            </section>
          )}

          <p className="px-4 mt-4 text-[11px] flex items-center gap-1.5" style={{ color: muted }}>
            <ShieldCheck className="size-3.5" strokeWidth={2.4} style={{ color: accent }} /> Name on payout method must match your verified {isSeller ? "company / legal rep" : "name"}.
          </p>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={!valid}
              onClick={() => navigate({ to: "/address" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
