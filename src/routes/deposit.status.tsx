import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { toast } from "sonner";
import { useState } from "react";
import {
  Check, Clock, X, ArrowRight, Home, Receipt, RefreshCcw, HelpCircle, Copy,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type State = "success" | "pending" | "failed";

export const Route = createFileRoute("/deposit/status")({
  head: () => ({ meta: [{ title: "Deposit status — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>): { state: State; amount: number; method: string } => ({
    state: (s.state === "pending" || s.state === "failed" ? s.state : "success") as State,
    amount: typeof s.amount === "number" ? s.amount : Number(s.amount) || 50000,
    method: typeof s.method === "string" ? s.method : "virtual",
  }),
  component: DepositStatus,
});

const COPY: Record<State, { title: string; sub: string; color: string; bg: string; ring: string; Icon: typeof Check; pill: string }> = {
  success: {
    title: "Deposit successful",
    sub: "Funds are now in your NGN wallet, ready to use.",
    color: "#0F766E",
    bg: "#ECFDF5",
    ring: "#0F766E",
    Icon: Check,
    pill: "Completed",
  },
  pending: {
    title: "Processing your deposit",
    sub: "Your bank is confirming the transfer. This usually takes 1–10 minutes.",
    color: "#B45309",
    bg: "#FEF3C7",
    ring: "#B45309",
    Icon: Clock,
    pill: "Pending",
  },
  failed: {
    title: "Deposit could not complete",
    sub: "We didn't receive the funds. Your bank may have reversed the transfer.",
    color: "#B91C1C",
    bg: "#FEE2E2",
    ring: "#B91C1C",
    Icon: X,
    pill: "Failed",
  },
};

function DepositStatus() {
  useRoleGuard(["buyer", "both"], "Deposit NGN isn't available for seller accounts");
  const navigate = useNavigate();
  const { state: initial, amount, method } = useSearch({ from: "/deposit/status" });
  const [state, setState] = useState<State>(initial);
  const m = COPY[state];

  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472";

  const ref = "MPY-" + (amount + 8821).toString(36).toUpperCase().slice(0, 6);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-1 flex items-center justify-between">
            <span />
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <X className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          {/* State preview switcher (dev only) */}
          {import.meta.env.DEV && (
            <div className="px-4 mt-2 flex items-center gap-1 p-1 rounded-full mx-auto w-fit"
              style={{ background: surface, border: `1px solid ${border}` }}>
              {(["success", "pending", "failed"] as State[]).map((s) => (
                <button key={s} onClick={() => setState(s)}
                  className="px-3 h-7 rounded-full text-[10.5px] font-bold capitalize transition"
                  style={{
                    background: state === s ? navy : "transparent",
                    color: state === s ? "#fff" : sub,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Hero */}
          <section className="px-4 mt-6 flex flex-col items-center text-center">
            <div className="relative size-24 rounded-full grid place-items-center"
              style={{ background: m.bg }}>
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ background: m.ring, opacity: state === "pending" ? 0.15 : 0, animationDuration: "1.8s" }} />
              <div className="relative size-16 rounded-full grid place-items-center" style={{ background: m.color }}>
                <m.Icon className="size-8 text-white" strokeWidth={state === "pending" ? 2.4 : 3} />
              </div>
            </div>
            <span className="mt-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}33` }}>
              {m.pill}
            </span>
            <h1 className="mt-2 text-[22px] font-bold tracking-tight">{m.title}</h1>
            <p className="mt-1.5 text-[12.5px] max-w-[280px]" style={{ color: sub }}>{m.sub}</p>

            <h2 className="mt-5 text-[32px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="mr-1 font-sans" style={{ color: sub }}>₦</span>
              {amount.toLocaleString("en-US")}<span style={{ color: muted }}>.00</span>
            </h2>
          </section>

          {/* Receipt */}
          <section className="px-4 mt-6">
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {[
                { l: "Reference", v: ref, mono: true },
                { l: "Method", v: method === "virtual" ? "Virtual account" : method === "card" ? "Debit card" : method === "ussd" ? "USSD" : "Bank transfer", mono: false },
                { l: "From", v: method === "card" ? "Card •• 4827" : "GTBank 0123••7821", mono: false },
                { l: "Date", v: "27 Jun 2026 · 14:22", mono: false },
                { l: "Fee", v: method === "card" ? `₦${Math.round(amount * 0.015).toLocaleString("en-US")}` : "₦0.00", mono: true },
              ].map((row, i, arr) => (
                <div key={row.l} className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}>
                  <span className="text-[11.5px]" style={{ color: muted }}>{row.l}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[12.5px] font-semibold ${row.mono ? "tabular-nums" : ""}`}
                      style={{ fontFamily: row.mono ? "'JetBrains Mono', monospace" : undefined, color: ink }}>
                      {row.v}
                    </span>
                    {row.l === "Reference" && (
                      <button onClick={() => { try { navigator.clipboard.writeText(String(row.v)); toast.success("Reference copied"); } catch { toast.error("Copy failed"); } }}
                        className="size-6 grid place-items-center rounded-md" style={{ background: `${navy}0d`, color: navy }}>
                        <Copy className="size-3" strokeWidth={2.6} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Help block for failed */}
          {state === "failed" && (
            <section className="px-4 mt-4">
              <div className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: m.bg, border: `1px solid ${m.color}33` }}>
                <HelpCircle className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: m.color }} />
                <div className="flex-1">
                  <p className="text-[12px] font-bold" style={{ color: ink }}>What you can do</p>
                  <ul className="mt-1 text-[11px] space-y-1" style={{ color: sub }}>
                    <li>· Check your bank app — funds may not have left.</li>
                    <li>· Try a different method (card or USSD).</li>
                    <li>· If debited, reach support with the reference.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* CTAs */}
          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6 space-y-2"
            style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            {state === "success" && (
              <>
                <button onClick={() => navigate({ to: "/home" })}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition"
                  style={{ background: navy, color: "#fff" }}>
                  <Home className="size-4" strokeWidth={2.6} /> Back to wallet
                </button>
                <button onClick={() => toast.success("Receipt downloaded", { description: `${ref}.pdf` })}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-2xl text-[12px] font-bold"
                  style={{ color: sub }}>
                  <Receipt className="size-3.5" strokeWidth={2.4} /> View receipt
                </button>
              </>
            )}
            {state === "pending" && (
              <>
                <button onClick={() => setState("success")}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition"
                  style={{ background: navy, color: "#fff" }}>
                  <RefreshCcw className="size-4" strokeWidth={2.6} /> Check again
                </button>
                <button onClick={() => toast.success("We'll notify you", { description: "Push + email when funds clear" })}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-2xl text-[12px] font-bold"
                  style={{ color: sub }}>
                  Notify me when it clears <ArrowRight className="size-3.5" strokeWidth={2.4} />
                </button>
              </>
            )}
            {state === "failed" && (
              <>
                <button onClick={() => navigate({ to: "/deposit" })}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition"
                  style={{ background: navy, color: "#fff" }}>
                  Try again <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
                <button onClick={() => toast("Support thread opened", { description: `Ref ${ref}` })}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-2xl text-[12px] font-bold"
                  style={{ color: sub }}>
                  <HelpCircle className="size-3.5" strokeWidth={2.4} /> Contact support
                </button>
              </>
            )}
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
