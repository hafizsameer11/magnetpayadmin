import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Check, Clock, X, ArrowRight, ShieldCheck, RotateCw, MessageSquare, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/kyc-status")({
  head: () => ({ meta: [{ title: "Verification status — MagnetPay" }] }),
  component: KycStatus,
});

type State = "pending" | "approved" | "rejected";

function KycStatus() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    teal = "#0F766E", warn = "#B45309", danger = "#B91C1C";

  const [state, setState] = useState<State>("pending");
  const [refreshing, setRefreshing] = useState(false);
  const doRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); };

  const cfg: Record<State, { tone: string; bg: string; I: typeof Check; title: string; sub: string; eta: string }> = {
    pending: { tone: warn, bg: `${warn}14`, I: Clock, title: "Review in progress", sub: "Most checks finish in under 5 minutes. We'll notify you the moment it's done.", eta: "~ 3 min remaining" },
    approved: { tone: teal, bg: `${teal}14`, I: Check, title: "You're verified!", sub: "Full access unlocked. Send up to ₦20M/day and trade cross-border with no hold-ups.", eta: "Approved just now" },
    rejected: { tone: danger, bg: `${danger}14`, I: X, title: "We couldn't verify you", sub: "The photo of your ID was too blurry to read. Re-upload a clearer shot in good light.", eta: "Reviewed 2 min ago" },
  };
  const c = cfg[state];

  const checks = [
    { l: "Phone number", done: true },
    { l: "BVN match", done: true },
    { l: "ID document", done: state !== "rejected", failed: state === "rejected" },
    { l: "Selfie liveness", done: state === "approved", pending: state === "pending" },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/kyc2" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Verification status</p>
            </div>
          </header>

          {/* state switcher for prototype */}
          <div className="mx-5 mt-2 p-1 rounded-2xl flex gap-1" style={{ background: surface, border: `1px solid ${border}` }}>
            {(["pending", "approved", "rejected"] as State[]).map((s) => (
              <button key={s}
                onClick={() => setState(s)}
                className="flex-1 h-8 rounded-xl text-[11px] font-bold capitalize"
                style={{
                  background: state === s ? navy : "transparent",
                  color: state === s ? "#fff" : sub,
                }}>
                {s}
              </button>
            ))}
          </div>

          <section className="px-4 mt-5">
            <div className="p-5 rounded-3xl text-center" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="size-16 mx-auto rounded-full grid place-items-center" style={{ background: c.bg, color: c.tone }}>
                <c.I className="size-7" strokeWidth={2.6} />
              </div>
              <h1 className="mt-4 text-[22px] leading-tight font-bold tracking-tight">{c.title}</h1>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: sub }}>{c.sub}</p>
              <p className="mt-3 inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                style={{ background: c.bg, color: c.tone, fontFamily: "'JetBrains Mono', monospace" }}>{c.eta}</p>
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Checklist</p>
            <div className="rounded-2xl divide-y" style={{ background: surface, border: `1px solid ${border}`, ["--tw-divide-opacity" as never]: 1 }}>
              {checks.map((ck) => (
                <div key={ck.l} className="px-3.5 py-3 flex items-center justify-between" style={{ borderColor: border }}>
                  <span className="text-[12.5px]">{ck.l}</span>
                  {ck.failed ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold" style={{ color: danger }}>
                      <X className="size-3" strokeWidth={3} /> Failed
                    </span>
                  ) : ck.done ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold" style={{ color: teal }}>
                      <Check className="size-3" strokeWidth={3} /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold" style={{ color: warn }}>
                      <Clock className="size-3" strokeWidth={3} /> Reviewing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {state === "pending" && (
            <>
              <p className="px-4 mt-5 text-center text-[11px] flex items-center justify-center gap-1.5" style={{ color: muted }}>
                <ShieldCheck className="size-3.5" strokeWidth={2.4} /> You can keep using basic features while we verify.
              </p>
              <div className="px-4 mt-3">
                <button onClick={doRefresh}
                  className="w-full h-11 rounded-2xl text-[12px] font-bold inline-flex items-center justify-center gap-1.5"
                  style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  {refreshing ? <Loader2 className="size-4 animate-spin" strokeWidth={2.6} /> : <RefreshCw className="size-4" strokeWidth={2.6} />}
                  {refreshing ? "Checking…" : "Check for updates"}
                </button>
              </div>
            </>
          )}

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            {state === "rejected" ? (
              <div className="space-y-2">
                <Link to="/kyc2" className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold" style={{ background: navy, color: "#fff" }}>
                  <RotateCw className="size-4" strokeWidth={2.6} /> Re-upload documents
                </Link>
                <Link to="/help" className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl text-[12.5px] font-bold" style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  <MessageSquare className="size-4" strokeWidth={2.4} /> Contact support
                </Link>
              </div>
            ) : (
              <Link to="/bank" className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold" style={{ background: navy, color: "#fff" }}>
                {state === "approved" ? "Continue setup" : "Continue while we review"} <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
            )}
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
