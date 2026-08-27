import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  ChevronLeft, Copy, Check, Clock, ShieldCheck, Share2, Building2, RefreshCcw,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/deposit/virtual")({
  head: () => ({ meta: [{ title: "Virtual account — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    amount: typeof s.amount === "number" ? s.amount : Number(s.amount) || 50000,
  }),
  component: VirtualAccount,
});

function VirtualAccount() {
  useRoleGuard(["buyer", "both"], "Deposit NGN isn't available for seller accounts");
  const navigate = useNavigate();
  const { amount } = useSearch({ from: "/deposit/virtual" });
  const [copied, setCopied] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(29 * 60 + 47);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E";

  const acct = {
    bank: "Wema Bank (Providus)",
    number: "9981 442 718",
    name: "MPay/Chidi Okoro",
  };

  const copy = async (label: string, val: string) => {
    try { await navigator.clipboard.writeText(val.replace(/\s/g, "")); } catch { /* noop */ }
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Deposit · Virtual account</p>
              <h1 className="text-[15px] font-bold leading-tight">Send to fund wallet</h1>
            </div>
            <button onClick={() => { try { navigator.clipboard.writeText(`${acct.bank}\n${acct.number}\n${acct.name}`); toast.success("Account details copied"); } catch { toast.error("Copy failed"); } }}
              className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <Share2 className="size-4" strokeWidth={2.2} />
            </button>
          </header>

          {/* Amount banner */}
          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${navy} 0%, #14513E 60%, ${navy} 100%)` }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>Send exactly</p>
              <h2 className="mt-1.5 text-[38px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="mr-1 font-sans" style={{ color: "#EFE9D9" }}>₦</span>
                {amount.toLocaleString("en-US")}<span style={{ color: "#C8C2B0" }}>.00</span>
              </h2>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10.5px] font-bold"
                style={{ background: "rgba(255,255,255,0.12)", color: "#EFE9D9" }}>
                <Clock className="size-3" strokeWidth={2.6} />
                <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{mm}:{ss}</span>
                <span className="opacity-70 font-medium">expires</span>
              </div>
            </div>
          </section>

          {/* Account card */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${border}` }}>
                <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${navy}10`, color: navy }}>
                  <Building2 className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold">{acct.bank}</p>
                  <p className="text-[10.5px]" style={{ color: muted }}>Powered by Providus · Dedicated to you</p>
                </div>
              </div>

              {[
                { l: "Account number", v: acct.number, mono: true, big: true },
                { l: "Account name", v: acct.name, mono: false, big: false },
                { l: "Amount", v: `₦${amount.toLocaleString("en-US")}.00`, mono: true, big: false },
              ].map((row, i) => (
                <div key={row.l} className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: i < 2 ? `1px solid ${border}` : "none" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>{row.l}</p>
                    <p className={`mt-0.5 font-bold ${row.big ? "text-[20px]" : "text-[13px]"} tabular-nums`}
                      style={{ fontFamily: row.mono ? "'JetBrains Mono', monospace" : undefined, color: ink, letterSpacing: row.big ? "0.02em" : undefined }}>
                      {row.v}
                    </p>
                  </div>
                  <button onClick={() => copy(row.l, row.v)}
                    className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold active:scale-[0.96] transition"
                    style={{
                      background: copied === row.l ? `${success}1a` : `${navy}0d`,
                      color: copied === row.l ? success : navy,
                    }}>
                    {copied === row.l ? <Check className="size-3.5" strokeWidth={3} /> : <Copy className="size-3.5" strokeWidth={2.4} />}
                    {copied === row.l ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Helper steps */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>How it works</p>
            <ol className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {[
                "Open your bank app and start a transfer",
                "Use the account details above",
                "Wallet credits instantly after bank confirms",
              ].map((s, i, arr) => (
                <li key={i} className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}>
                  <span className="size-6 rounded-full grid place-items-center text-[11px] font-bold tabular-nums"
                    style={{ background: `${navy}10`, color: navy }}>{i + 1}</span>
                  <span className="text-[12.5px]" style={{ color: ink }}>{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: `${accent}10`, border: `1px solid ${accent}26` }}>
              <ShieldCheck className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: accent }} />
              <p className="text-[11px]" style={{ color: sub }}>
                Send the <span className="font-bold" style={{ color: ink }}>exact amount</span>. Different amounts may be delayed for review.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6 space-y-2" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button onClick={() => navigate({ to: "/deposit/status", search: { state: "success", amount, method: "virtual" } as never })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition"
              style={{ background: navy, color: "#fff" }}>
              I've sent the transfer
            </button>
            <button onClick={() => toast("Still checking…", { description: "No deposit detected yet — most clear in 1–10 minutes." })}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-2xl text-[12px] font-bold active:scale-[0.98] transition"
              style={{ background: "transparent", color: sub }}>
              <RefreshCcw className="size-3.5" strokeWidth={2.4} />
              Refresh status
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
