import { createFileRoute, Link, useParams, useSearch } from "@tanstack/react-router";
import { ChevronLeft, Download, Share2, ShieldCheck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type TxState = "completed" | "processing" | "failed";

export const Route = createFileRoute("/tx/$id/receipt")({
  head: () => ({ meta: [{ title: "Receipt — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    kind: (String(s.kind ?? "out") as "in" | "out" | "convert"),
    name: String(s.name ?? "Wei Chen"),
    amount: String(s.amount ?? "¥2,500.00"),
    state: (String(s.state ?? "completed") as TxState),
    ccy: String(s.ccy ?? "CNY"),
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    success = "#0F766E", warn = "#B45309", danger = "#B91C1C";

  const { id } = useParams({ from: "/tx/$id/receipt" });
  const { kind, name, amount, state } = useSearch({ from: "/tx/$id/receipt" });

  const stateMap: Record<TxState, { c: string; I: typeof CheckCircle2; label: string }> = {
    completed: { c: success, I: CheckCircle2, label: "Completed" },
    processing: { c: warn, I: Clock, label: "Processing" },
    failed: { c: danger, I: XCircle, label: "Failed" },
  };
  const sMeta = stateMap[state as TxState] ?? stateMap.completed;

  const fxRate = "1 CNY = ₦236.54";
  const totalDebited = "₦591,348";
  const fee = "₦1,250";
  const settled = "Today · 11:42";

  const downloadPdf = () => toast.success("Receipt downloaded", { description: `${id}.pdf` });
  const sharePdf = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && (navigator as { share?: (d: unknown) => Promise<void> }).share) {
        await (navigator as unknown as { share: (d: unknown) => Promise<void> }).share({ title: `Receipt ${id}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Receipt link copied");
    } catch {
      toast.error("Couldn't share");
    }
  };

  const rows: [string, string][] = [
    ["Reference", id],
    ["Status", sMeta.label],
    ["Recipient", name],
    ["Direction", kind === "in" ? "Received" : kind === "convert" ? "Conversion" : "Sent"],
    ["Amount", amount],
    ["FX rate", fxRate],
    ["Fee", fee],
    ["Total debited", totalDebited],
    ["Settled", settled],
    ["FX partner", "Bridge Markets · MTL #B-19284"],
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-28" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/tx/$id" params={{ id }} search={{ kind, name, amount, state, ccy: "CNY" }} className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Receipt</p>
              <p className="text-[13px] font-bold">{id}</p>
            </div>
            <button onClick={sharePdf} className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <Share2 className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-3xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 12px 32px -16px rgba(15,25,20,0.18)" }}>
              <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom: `1px dashed ${border}` }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>MagnetPay</p>
                  <p className="mt-1 text-[15px] font-bold" style={{ color: navy }}>Transfer receipt</p>
                  <p className="mt-0.5 text-[10.5px]" style={{ color: muted }}>{settled}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: `${sMeta.c}15`, color: sMeta.c }}>
                  <sMeta.I className="size-3" strokeWidth={2.6} /> {sMeta.label}
                </span>
              </div>

              <div className="px-5 py-4 text-center" style={{ borderBottom: `1px dashed ${border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Amount</p>
                <p className="mt-1 text-[26px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}>{amount}</p>
                <p className="mt-1.5 text-[11px]" style={{ color: sub }}>to <span className="font-bold" style={{ color: ink }}>{name}</span></p>
              </div>

              <div className="px-5 py-2">
                {rows.map(([k, v], i) => (
                  <div key={k} className={`flex items-start justify-between gap-3 py-2 ${i < rows.length - 1 ? "border-b" : ""}`} style={{ borderColor: `${border}80` }}>
                    <span className="text-[11px]" style={{ color: muted }}>{k}</span>
                    <span className="text-[11.5px] font-bold text-right tabular-nums" style={{ color: ink, fontFamily: k === "Amount" || k === "Total debited" || k === "Fee" || k === "FX rate" ? "'JetBrains Mono', monospace" : undefined }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4" style={{ borderTop: `1px dashed ${border}`, background: `${navy}06` }}>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 shrink-0 mt-0.5" strokeWidth={2.4} style={{ color: navy }} />
                  <p className="text-[10.5px] leading-snug" style={{ color: sub }}>
                    Settled via licensed FX partner. This document is a system-generated receipt and is valid without signature.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="sticky bottom-3 inset-x-0 px-4 mt-5 pointer-events-none">
            <div className="max-w-[420px] mx-auto pointer-events-auto grid grid-cols-2 gap-2">
              <button onClick={sharePdf} className="h-12 rounded-2xl flex items-center justify-center gap-2 text-[12.5px] font-bold" style={{ background: surface, border: `1px solid ${border}`, color: navy }}>
                <Share2 className="size-4" strokeWidth={2.4} /> Share
              </button>
              <button onClick={downloadPdf} className="h-12 rounded-2xl flex items-center justify-center gap-2 text-[12.5px] font-bold text-white" style={{ background: navy, boxShadow: `0 12px 28px -10px ${navy}66` }}>
                <Download className="size-4" strokeWidth={2.4} /> Download PDF
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
