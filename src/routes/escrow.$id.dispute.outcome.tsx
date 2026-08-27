import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ChevronLeft, Gavel, CheckCircle2, ArrowRight, Scale, FileText, Download, Home } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/$id/dispute/outcome")({
  head: () => ({ meta: [{ title: "Dispute outcome — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    outcome: (String(s.outcome ?? "split") as "buyer" | "seller" | "split"),
  }),
  component: DisputeOutcome,
});

function DisputeOutcome() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/$id/dispute/outcome" });
  const { outcome } = useSearch({ from: "/escrow/$id/dispute/outcome" });
  const navigate = useNavigate();

  const total = 12400;
  const refund = outcome === "buyer" ? total : outcome === "split" ? 1116 : 0;
  const release = total - refund;

  const cfgMap: Record<"buyer" | "seller" | "split", { label: string; tone: string; desc: string }> = {
    buyer: { label: "Refund in buyer's favor", tone: t.success, desc: "Full amount returned to your CNY wallet." },
    seller: { label: "Released to supplier", tone: t.warn, desc: "Funds released to supplier in full." },
    split: { label: "Partial refund", tone: t.info, desc: `${((refund / total) * 100).toFixed(1)}% refunded for 18 damaged units.` },
  };
  const cfg = cfgMap[outcome as "buyer" | "seller" | "split"];

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/$id/dispute/thread" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Ruling · D-4421</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2 text-center">
            <div className="mx-auto size-16 rounded-full grid place-items-center" style={{ background: `${cfg.tone}15`, color: cfg.tone }}>
              <Gavel className="size-7" strokeWidth={2.2} />
            </div>
            <p className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: cfg.tone }}>Mediator ruling</p>
            <h1 className="mt-1 text-[20px] font-bold leading-tight">{cfg.label}</h1>
            <p className="mt-1.5 text-[12px] px-4" style={{ color: t.sub }}>{cfg.desc}</p>
          </section>

          {/* Outcome selector chips (preview tool) */}
          <section className="px-4 mt-4">
            <div className="grid grid-cols-3 gap-2">
              {(["buyer", "split", "seller"] as const).map((o) => {
                const sel = outcome === o;
                const label = o === "buyer" ? "Buyer" : o === "split" ? "Split" : "Seller";
                return (
                  <button key={o} onClick={() => navigate({ to: "/escrow/$id/dispute/outcome", params: { id }, search: { outcome: o } })}
                    className="h-9 rounded-full text-[10.5px] font-bold uppercase tracking-[0.12em]"
                    style={{ background: sel ? t.navy : t.surface, color: sel ? "#fff" : t.sub, border: `1px solid ${sel ? t.navy : t.border}` }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Settlement</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between px-3.5 py-3 border-b" style={{ borderColor: t.border }}>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Refund to you</p>
                  <p className="text-[12.5px] font-semibold">CNY wallet</p>
                </div>
                <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: refund > 0 ? t.success : t.muted }}>
                  ¥{fmt(refund)}
                </p>
              </div>
              <div className="flex items-center justify-between px-3.5 py-3 border-b" style={{ borderColor: t.border }}>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Released to supplier</p>
                  <p className="text-[12.5px] font-semibold">Guangzhou Huayi Co.</p>
                </div>
                <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: release > 0 ? t.warn : t.muted }}>
                  ¥{fmt(release)}
                </p>
              </div>
              <div className="flex items-center justify-between px-3.5 py-3">
                <p className="text-[12px] font-bold" style={{ color: t.ink }}>Total disputed</p>
                <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{fmt(total)}</p>
              </div>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Mediator findings</p>
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-start gap-2.5">
                <Scale className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
                <p className="text-[11.5px] leading-snug" style={{ color: t.sub }}>
                  Inspection report SGS-Lagos-IR-771 confirms 18 of 200 units (9%) failed drop-test. Supplier acknowledged packaging defect.
                  Refund proportional to defective units; remainder released to supplier.
                </p>
              </div>
            </div>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Ruling document", v: "D-4421-ruling.pdf" },
                { l: "Inspection report", v: "SGS-Lagos-IR-771.pdf" },
              ].map((r, i, arr) => (
                <button key={r.l} onClick={() => toast.success(`Downloading ${r.v}`)} className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <FileText className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>{r.l}</p>
                    <p className="text-[12px] font-semibold truncate">{r.v}</p>
                  </div>
                  <Download className="size-4" strokeWidth={2.3} style={{ color: t.sub }} />
                </button>
              ))}
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto space-y-2">
              <button onClick={() => navigate({ to: "/escrow/$id", params: { id } })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.success }}>
                <CheckCircle2 className="size-4" strokeWidth={2.6} /> Accept ruling
              </button>
              <Link to="/escrow/$id/dispute/thread" params={{ id }}
                className="h-11 w-full rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                style={{ background: "transparent", color: t.sub }}>
                Discuss with mediator <ArrowRight className="size-3.5" strokeWidth={2.4} />
              </Link>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
