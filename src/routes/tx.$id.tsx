import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import {
  ChevronLeft, ArrowDownLeft, ArrowUpRight, Repeat, ShieldCheck,
  Copy, Download, RefreshCcw, MessageCircle, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type TxState = "completed" | "processing" | "failed";

export const Route = createFileRoute("/tx/$id")({
  head: () => ({ meta: [{ title: "Transaction — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    kind: (String(s.kind ?? "out") as "in" | "out" | "convert"),
    name: String(s.name ?? "Wei Chen"),
    amount: String(s.amount ?? "¥2,500.00"),
    state: (String(s.state ?? "completed") as TxState),
    ccy: String(s.ccy ?? "CNY"),
  }),
  component: TxDetail,
});

function TxDetail() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E", warn = "#B45309", danger = "#B91C1C";

  const navigate = useNavigate();
  const { id } = useParams({ from: "/tx/$id" });
  const { kind, name, amount, state, ccy } = useSearch({ from: "/tx/$id" });
  const copyRef = () => { try { navigator.clipboard.writeText(id); toast.success("Reference copied"); } catch { toast.error("Copy failed"); } };
  const viewReceipt = () => navigate({ to: "/tx/$id/receipt", params: { id }, search: { kind, name, amount, state, ccy } });
  const repeat = () => { toast.success("Opening send flow", { description: `Repeat ${amount} to ${name}` }); navigate({ to: "/send" }); };
  const dispute = () => { toast("Dispute thread opened", { description: `Ref ${id} · Support replies within 24h` }); navigate({ to: "/help/ticket" }); };

  const I = kind === "in" ? ArrowDownLeft : kind === "convert" ? Repeat : ArrowUpRight;
  const isPos = kind === "in" || kind === "convert";
  const stateMap: Record<TxState, { c: string; I: any; label: string }> = {
    completed: { c: success, I: CheckCircle2, label: "Completed" },
    processing: { c: warn, I: Clock, label: "Processing" },
    failed: { c: danger, I: XCircle, label: "Failed" },
  };
  const stateMeta = stateMap[state as TxState] ?? stateMap.completed;

  const timeline = [
    { t: "Authorized", d: "Today · 11:38", done: true },
    { t: "FX settled", d: "Today · 11:39", done: true },
    { t: "Payout sent", d: "Today · 11:41", done: state !== "failed" },
    { t: state === "failed" ? "Payout failed" : "Recipient credited", d: "Today · 11:42", done: state === "completed" },
  ];

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Transaction</p>
              <p className="text-[13px] font-bold">{id}</p>
            </div>
            <button onClick={viewReceipt} className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <Download className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          {/* Hero */}
          <section className="px-4 mt-3">
            <div className="rounded-3xl p-5 text-center" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="mx-auto size-14 rounded-2xl grid place-items-center"
                style={{ background: `${stateMeta.c}14`, color: stateMeta.c }}>
                <I className="size-6" strokeWidth={2.3} />
              </div>
              <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>{ccy} · {kind === "in" ? "Received from" : kind === "convert" ? "Converted" : "Paid to"}</p>
              <p className="mt-1 text-[14px] font-bold">{name}</p>
              <p className="mt-3 text-[34px] font-bold tabular-nums leading-none"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: isPos ? success : ink }}>
                {isPos && !amount.startsWith("+") ? "+" : ""}{amount}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                style={{ background: `${stateMeta.c}14`, color: stateMeta.c }}>
                <stateMeta.I className="size-3" strokeWidth={2.6} /> {stateMeta.label}
              </span>
            </div>
          </section>

          {/* Timeline */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Timeline</p>
            <div className="rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
              {timeline.map((s, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className="size-5 rounded-full grid place-items-center shrink-0"
                      style={{ background: s.done ? navy : "transparent", border: `1.5px solid ${s.done ? navy : border}` }}>
                      {s.done && <CheckCircle2 className="size-3 text-white" strokeWidth={3} />}
                    </div>
                    {i < timeline.length - 1 && <div className="w-px flex-1 my-1" style={{ background: border, minHeight: 22 }} />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-[12px] font-semibold" style={{ color: s.done ? ink : muted }}>{s.t}</p>
                    <p className="text-[10.5px]" style={{ color: muted }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Details */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl divide-y" style={{ background: surface, border: `1px solid ${border}`, borderColor: border }}>
              {[
                ["Reference", id, true],
                ["Recipient", name],
                ["Channel", "ICBC · 6228••5678"],
                ["Purpose", "GDS · Goods trade"],
                ["FX rate", "1 CNY = ₦229.04"],
                ["Network fee", `${ccy === "CNY" ? "¥18.00" : "₦150"}`],
                ["Total debited", "₦591,348"],
              ].map(([k, v, copy], i) => (
                <div key={i} className="flex items-center justify-between px-3.5 py-2.5 text-[12px]" style={{ borderColor: border }}>
                  <span style={{ color: sub }}>{k}</span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}>{v}</span>
                    {copy && (
                      <button onClick={copyRef} aria-label="Copy reference" className="size-6 grid place-items-center rounded-md" style={{ background: `${navy}0d`, color: navy }}>
                        <Copy className="size-3" strokeWidth={2.6} />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${navy}0a`, border: `1px solid ${navy}1a` }}>
              <ShieldCheck className="size-4 shrink-0 mt-0.5" style={{ color: navy }} strokeWidth={2.4} />
              <p className="text-[11px]" style={{ color: ink }}>Settled via licensed FX partner. Receipt available as PDF.</p>
            </div>
          </section>

          {/* Actions */}
          <section className="px-4 mt-4 grid grid-cols-3 gap-2">
            <Action I={RefreshCcw} l="Repeat" onClick={repeat} />
            <Action I={Download} l="Receipt" onClick={viewReceipt} />
            <Action I={MessageCircle} l="Dispute" onClick={dispute} />
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Action({ I, l, onClick }: { I: any; l: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 py-3 rounded-2xl active:scale-[0.98] transition"
      style={{ background: "#FFFFFF", border: `1px solid #E7DFCE` }}>
      <div className="size-9 rounded-xl grid place-items-center" style={{ background: "#0E3B2E10", color: "#0E3B2E" }}>
        <I className="size-4" strokeWidth={2.3} />
      </div>
      <span className="text-[10.5px] font-semibold">{l}</span>
    </button>
  );
}
