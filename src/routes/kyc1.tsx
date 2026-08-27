import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ShieldCheck, ArrowRight, Info, Check } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/kyc1")({
  head: () => ({ meta: [{ title: "Verify identity — MagnetPay" }] }),
  component: Kyc1,
});

function Kyc1() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    teal = "#0F766E", accent = "#C2410C";
  const navigate = useNavigate();
  const [type, setType] = useState<"BVN" | "NIN">("BVN");
  const [num, setNum] = useState("");
  const need = 11;
  const valid = num.length === need;

  const grouped = num.replace(/(\d{4})(\d{4})(\d+)?/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/profile" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 5 of 8 · Tier 1 KYC</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 5 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
          </header>

          <section className="px-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `${teal}14`, color: teal, border: `1px solid ${teal}26` }}>Tier 1</span>
              <span className="text-[11px]" style={{ color: muted }}>Unlocks ₦500k / day</span>
            </div>
            <h1 className="mt-3 text-[24px] leading-[1.05] font-bold tracking-tight">Verify your {type}</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              We use this to confirm your identity with the bank. It takes about 10 seconds.
            </p>
          </section>

          <section className="px-4 mt-5">
            <div className="grid grid-cols-2 gap-2">
              {(["BVN", "NIN"] as const).map((o) => (
                <button key={o} onClick={() => { setType(o); setNum(""); }}
                  className="p-3 rounded-2xl text-left transition active:scale-[0.98]"
                  style={{
                    background: type === o ? navy : surface,
                    border: `1.5px solid ${type === o ? navy : border}`,
                    color: type === o ? "#fff" : ink,
                  }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold">{o}</span>
                    {type === o && <Check className="size-4" strokeWidth={3} />}
                  </div>
                  <p className="text-[10.5px] mt-1" style={{ color: type === o ? "rgba(255,255,255,0.7)" : muted }}>
                    {o === "BVN" ? "Bank Verification Number" : "National Identity Number"}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>{type}</label>
              <div className="mt-2 h-14 rounded-2xl px-4 flex items-center" style={{ background: surface, border: `1.5px solid ${valid ? teal : num ? navy : border}` }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  value={grouped}
                  onChange={(e) => setNum(e.target.value.replace(/\D/g, "").slice(0, need))}
                  placeholder="0000 0000 000"
                  className="w-full bg-transparent outline-none text-[18px] font-bold tracking-[0.18em] placeholder:font-normal placeholder:text-[#bdb6a2]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}
                />
                <span className="ml-2 text-[10px] font-bold shrink-0" style={{ color: valid ? teal : muted }}>
                  {valid ? <Check className="size-4" strokeWidth={3} /> : `${num.length}/${need}`}
                </span>
              </div>
              {type === "BVN" && (
                <button className="mt-2 text-[11px] font-bold" style={{ color: navy }}>
                  Dial *565*0# to retrieve your BVN
                </button>
              )}
            </div>
          </section>

          <section className="px-4 mt-5">
            <div className="p-3.5 rounded-2xl flex gap-2.5" style={{ background: `${navy}08`, border: `1px solid ${navy}1a` }}>
              <ShieldCheck className="size-4 mt-0.5 shrink-0" style={{ color: navy }} strokeWidth={2.4} />
              <div>
                <p className="text-[12px] font-bold">Bank-grade encryption</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: sub }}>
                  We only read your name and date of birth — never your bank balance or transactions.
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-2xl flex items-center gap-2.5" style={{ background: `${accent}10`, border: `1px solid ${accent}26` }}>
              <Info className="size-4 shrink-0" style={{ color: accent }} strokeWidth={2.4} />
              <p className="text-[11px]" style={{ color: ink }}>
                Name on {type} must match the name you entered.
              </p>
            </div>
          </section>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={!valid}
              onClick={() => navigate({ to: "/kyc2" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Verify identity <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
