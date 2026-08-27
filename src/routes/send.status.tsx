import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Loader2, CheckCircle2, XCircle, RefreshCcw, MessageCircle, Copy, ArrowDownLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { useRoleGuard } from "@/lib/use-role-guard";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type State = "processing" | "paid" | "failed" | "refunded";

export const Route = createFileRoute("/send/status")({
  head: () => ({ meta: [{ title: "Transfer status — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    ref: String(s.ref ?? "MP-S-2840-7184"),
    name: String(s.name ?? "Wei Chen"),
    cny: Number(s.cny) || 0,
    state: ((["processing","paid","failed","refunded"].includes(String(s.state)) ? s.state : "processing") as State),
  }),
  component: SendStatus,
});

function SendStatus() {
  useRoleGuard(["buyer", "both"]);
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E", danger = "#B91C1C", warn = "#B45309";
  const initial = useSearch({ from: "/send/status" });
  const [state, setState] = useState<State>(initial.state);
  const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const META: Record<State, { tint: string; I: any; label: string; sub: string; cta: string }> = {
    processing: { tint: warn, I: Loader2, label: "Processing", sub: "Sending to the recipient's bank…", cta: "View timeline" },
    paid: { tint: success, I: CheckCircle2, label: "Paid", sub: "Funds delivered to the recipient.", cta: "Download receipt" },
    failed: { tint: danger, I: XCircle, label: "Failed", sub: "Bank rejected the payout. Funds held in escrow.", cta: "Retry payout" },
    refunded: { tint: success, I: ArrowDownLeft, label: "Refunded", sub: "Returned to your CNY wallet.", cta: "Send again" },
  };
  const m = META[state];

  const navigate = useNavigate();
  const handlePrimary = () => {
    if (state === "paid") toast.success("Receipt downloaded", { description: `${initial.ref}.pdf` });
    else if (state === "processing") navigate({ to: "/tx/$id", params: { id: initial.ref } });
    else if (state === "refunded") toast("Repeating last transfer…");
  };
  const handleRetry = () => toast.success("Retrying payout", { description: "We'll notify you when it clears" });
  const handleSupport = () => toast("Support thread opened", { description: `Ref ${initial.ref}` });
  const handleCopy = () => { try { navigator.clipboard.writeText(initial.ref); toast.success("Reference copied"); } catch { toast.error("Copy failed"); } };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Transfer</p>
              <p className="text-[13px] font-bold font-mono">{initial.ref}</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Hero */}
          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-center" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="size-14 rounded-full grid place-items-center mx-auto" style={{ background: `${m.tint}1a`, color: m.tint }}>
                <m.I className={`size-7 ${state === "processing" ? "animate-spin" : ""}`} strokeWidth={2.3} />
              </div>
              <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: m.tint }}>{m.label}</p>
              <h1 className="mt-1 text-[28px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                ¥{fmt(initial.cny)}
              </h1>
              <p className="mt-1 text-[12px]" style={{ color: sub }}>to {initial.name}</p>
              <p className="mt-3 text-[11px]" style={{ color: muted }}>{m.sub}</p>
            </div>
          </section>

          {/* State-specific */}
          {state === "failed" && (
            <section className="px-4 mt-3">
              <div className="rounded-2xl p-3.5" style={{ background: `${danger}10`, border: `1px solid ${danger}26` }}>
                <p className="text-[12px] font-bold" style={{ color: danger }}>Reason · NAME_MISMATCH</p>
                <p className="mt-1 text-[11px]" style={{ color: ink }}>
                  Recipient name on the account is "陈伟 (Chen Wei)" — doesn't match "Wei Chen". Update the recipient or refund.
                </p>
              </div>
            </section>
          )}

          {/* Meta */}
          <section className="px-4 mt-3">
            <div className="rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
              <RowK k="Reference" v={initial.ref} mono />
              <RowK k="Channel" v="Bank · ICBC 6228••5678" />
              <RowK k="Purpose" v="GDS · Goods" />
              <RowK k="Initiated" v="Today · 11:42" />
              <RowK k={state === "paid" ? "Settled" : state === "refunded" ? "Refunded" : "ETA"} v={state === "paid" ? "Today · 12:09" : state === "refunded" ? "Today · 12:32" : "~30 min"} />
            </div>
          </section>

          {/* Actions */}
          <section className="px-4 mt-4 space-y-2">
            {state === "failed" ? (
              <>
                <button onClick={handleRetry} className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2" style={{ background: accent }}>
                  <RefreshCcw className="size-4" strokeWidth={2.4} /> Retry payout
                </button>
                <button onClick={() => setState("refunded")}
                  className="w-full h-12 rounded-2xl text-[13px] font-bold" style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  Refund to CNY wallet
                </button>
              </>
            ) : (
              <button onClick={handlePrimary} className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2" style={{ background: navy }}>
                {state === "paid" && <Download className="size-4" strokeWidth={2.4} />}
                {m.cta}
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCopy} className="h-11 rounded-2xl text-[12px] font-bold flex items-center justify-center gap-1.5"
                style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                <Copy className="size-4" strokeWidth={2.4} /> Copy ref
              </button>
              <button onClick={handleSupport} className="h-11 rounded-2xl text-[12px] font-bold flex items-center justify-center gap-1.5"
                style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                <MessageCircle className="size-4" strokeWidth={2.4} /> Support
              </button>
            </div>
          </section>

          {/* Prototype state switcher (dev only) */}
          {import.meta.env.DEV && (
            <section className="px-4 mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: muted }}>Preview states · dev</p>
              <div className="flex gap-1.5">
                {(["processing","paid","failed","refunded"] as State[]).map((s) => (
                  <button key={s} onClick={() => setState(s)}
                    className="flex-1 py-1.5 rounded-full text-[10px] font-bold capitalize"
                    style={{ background: state === s ? navy : `${navy}10`, color: state === s ? "#fff" : navy }}>
                    {s}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </PhoneFrame>
    </>
  );
}

function RowK({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12px]">
      <span style={{ color: "#5B5749" }}>{k}</span>
      <span className="font-semibold tabular-nums" style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{v}</span>
    </div>
  );
}
