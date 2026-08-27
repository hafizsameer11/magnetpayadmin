import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, MessageCircle, MoreHorizontal, CheckCircle2, Circle, Loader2, FileText, Upload, AlertTriangle, User as UserIcon, Building2, Ship, ArrowUpRight, Banknote, MapPin, Clock, QrCode, Printer, Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/escrow/seller/$id")({
  head: () => ({ meta: [{ title: "Escrow (seller) — MagnetPay" }] }),
  component: SellerDetail,
});

function SellerDetail() {
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/seller/$id" });
  useRoleGuard(["seller", "both"], "Seller escrow view is for suppliers only");
  const copyAddress = () => {
    navigator.clipboard?.writeText("No. 18, Xinshi Industrial Park, Baiyun District, Guangzhou 510440");
    toast.success("Drop-off address copied");
  };

  const milestones = [
    { i: 1, label: "Production complete", note: "Evidence uploaded · Mar 14", date: "Mar 14", state: "done" as const, amt: 3720 },
    { i: 2, label: "Goods dispatched", note: "Upload Bill of Lading", date: "Mar 18", state: "current" as const, amt: 3720 },
    { i: 3, label: "Arrived at Apapa", note: "Awaiting carrier confirmation", date: "ETA Apr 02", state: "pending" as const, amt: 2480 },
    { i: 4, label: "Inspection pass", note: "SGS Lagos", date: "ETA Apr 04", state: "pending" as const, amt: 2480 },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame
        background={t.navy}
        bottomNav={
          <div className="relative">
            <div className="h-8 -mb-1" style={{ background: `linear-gradient(to top, ${t.bg} 30%, ${t.bg}00 100%)` }} />
            <div className="px-4 pb-5 pt-1" style={{ background: t.bg }}>
              <div className="flex gap-2">
                <Link to="/escrow/seller/$id/dispute" params={{ id }}
                  className="flex-1 h-12 rounded-2xl text-[12.5px] font-bold flex items-center justify-center gap-1.5"
                  style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.danger }}>
                  <AlertTriangle className="size-4" strokeWidth={2.4} /> Respond
                </Link>
                <Link to="/escrow/seller/$id/request/$ms" params={{ id, ms: "2" }}
                  className="flex-[1.4] h-12 rounded-2xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 text-white"
                  style={{ background: t.success, boxShadow: `0 10px 24px -10px ${t.success}` }}>
                  <Banknote className="size-4" strokeWidth={2.4} /> Request release
                </Link>
              </div>
            </div>
          </div>
        }
      >
        <div className="relative min-h-full pb-24" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-2 flex items-center justify-between">
            <Link to="/escrow" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>
              Seller · <span style={{ color: t.ink, fontFamily: "'JetBrains Mono', monospace" }}>#{id}</span>
            </p>
            <div className="flex items-center gap-2">
              <Link to="/messages/$id" params={{ id: "t1" }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <MessageCircle className="size-4" strokeWidth={2} style={{ color: t.sub }} />
              </Link>
              <button onClick={() => toast("Options", { description: "Share · Export PDF · Cancel deal" })} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <MoreHorizontal className="size-4" strokeWidth={2} style={{ color: t.sub }} />
              </button>
            </div>
          </header>

          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${t.navy} 0%, #14513E 60%, ${t.navy} 100%)` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[16px] font-bold leading-tight truncate">Industrial pump parts</h1>
                  <p className="mt-0.5 text-[11px]" style={{ color: "#C8C2B0" }}>You are the supplier · 200 units</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ background: "rgba(187,247,208,0.18)", color: "#BBF7D0" }}>
                  <ShieldCheck className="size-2.5" strokeWidth={3} /> Funded
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.14em] font-bold" style={{ color: "#C8C2B0" }}>You'll receive</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-[30px] leading-none font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥12,344<span style={{ color: "#C8C2B0" }}>.20</span></p>
                  <p className="text-[10.5px]" style={{ color: "#C8C2B0" }}>after ¥55.80 fee</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                {[
                  { l: "Released", v: "¥3,720", c: "#BBF7D0" },
                  { l: "In progress", v: "¥3,720", c: "#FDBA74" },
                  { l: "Locked", v: "¥4,960", c: "#C8C2B0" },
                ].map((k) => (
                  <div key={k.l} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <p className="uppercase tracking-[0.14em] font-bold opacity-70">{k.l}</p>
                    <p className="mt-0.5 text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: k.c }}>{k.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: t.muted }}>Buyer</p>
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-10 rounded-full grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                <UserIcon className="size-4" strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold">Chidi Okoro</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>KYC verified · 27 trades</p>
              </div>
              <Building2 className="size-4" strokeWidth={2.3} style={{ color: t.muted }} />
            </div>
          </section>

          <section className="px-4 mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Milestones</h3>
              <span className="text-[10.5px]" style={{ color: t.muted }}>1 of 4 released</span>
            </div>
            <div className="rounded-2xl px-4 py-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ol className="relative">
                {milestones.map((m, i) => {
                  const isLast = i === milestones.length - 1;
                  const isCurrent = m.state === "current";
                  const color = m.state === "done" ? t.success : isCurrent ? t.accent : t.muted;
                  const Icon = m.state === "done" ? CheckCircle2 : isCurrent ? Loader2 : Circle;
                  return (
                    <li key={m.label} className="relative pl-7 pb-4 last:pb-0">
                      {!isLast && (<span className="absolute left-[9px] top-5 bottom-0 w-px" style={{ background: m.state === "done" ? t.success : t.border }} />)}
                      <Icon className={`absolute left-0 top-0.5 size-[18px] ${isCurrent ? "animate-spin" : ""}`} strokeWidth={2.6} style={{ color }} />
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold leading-tight" style={{ color: m.state === "pending" ? t.muted : t.ink }}>{m.label}</p>
                          <p className="mt-0.5 text-[10.5px]" style={{ color: t.muted }}>{m.note}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: m.state === "done" ? t.success : t.ink }}>
                            ¥{m.amt.toLocaleString()}
                          </p>
                          <p className="text-[9.5px]" style={{ color: t.muted }}>{m.date}</p>
                        </div>
                        {isCurrent && (
                          <div className="col-span-2 mt-2 grid grid-cols-2 gap-2">
                            <Link to="/escrow/seller/$id/evidence/$ms" params={{ id, ms: String(m.i) }}
                              className="h-8 min-w-0 rounded-lg inline-flex items-center justify-center gap-1 text-[10px] leading-none font-bold whitespace-nowrap"
                              style={{ background: t.accent, color: "#fff" }}>
                              <Upload className="size-3 shrink-0" strokeWidth={2.6} /> Upload evidence
                            </Link>
                            <Link to="/escrow/seller/$id/request/$ms" params={{ id, ms: String(m.i) }}
                              className="h-8 min-w-0 rounded-lg inline-flex items-center justify-center gap-1 text-[10px] leading-none font-bold whitespace-nowrap"
                              style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.navy }}>
                              Request release
                            </Link>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          <section className="px-4 mt-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: t.muted }}>Required docs</h3>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Commercial Invoice", s: "Uploaded · Mar 14", ok: true },
                { l: "Packing List", s: "Uploaded · Mar 14", ok: true },
                { l: "Bill of Lading", s: "Required for milestone 2", ok: false },
                { l: "Certificate of Origin", s: "Required before release", ok: false },
              ].map((d, i, a) => (
                <div key={d.l} className={`flex items-center gap-3 px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <FileText className="size-4 shrink-0" strokeWidth={2.3} style={{ color: d.ok ? t.success : t.warn }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold">{d.l}</p>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>{d.s}</p>
                  </div>
                  {!d.ok && (
                    <Link to="/escrow/seller/$id/evidence/$ms" params={{ id, ms: "2" }}
                      className="h-8 px-3 rounded-lg flex items-center gap-1 text-[10.5px] font-bold"
                      style={{ background: `${t.accent}15`, color: t.accent }}>
                      <Upload className="size-3" strokeWidth={2.6} /> Upload
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Drop-off instructions */}
          <section className="px-4 mt-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: t.muted }}>Drop-off at MagnetPay Guangzhou</h3>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="px-3.5 py-3 border-b flex items-start gap-3" style={{ borderColor: t.border }}>
                <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <MapPin className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold">MagnetPay Hub · Baiyun, Guangzhou</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.sub }}>No. 18, Xinshi Industrial Park, Baiyun District, Guangzhou 510440</p>
                  <p className="text-[10.5px] mt-0.5 flex items-center gap-1" style={{ color: t.muted }}>
                    <Clock className="size-3" strokeWidth={2.5} /> Mon–Sat · 09:00–18:00 CST
                  </p>
                </div>
                <button onClick={copyAddress} className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: t.bg, border: `1px solid ${t.border}` }} aria-label="Copy address">
                  <Copy className="size-3.5" strokeWidth={2.4} />
                </button>
              </div>
              <ol className="px-3.5 py-3 space-y-2">
                {[
                  "Print the 2 shipping labels below and tape one on each carton.",
                  "Book a local courier or van to MagnetPay Hub Guangzhou.",
                  "Show the booking QR at the gate — our team weighs, measures CBM and signs the receipt.",
                  "Upload the signed drop-off receipt to milestone 2 to release payment.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[11.5px]" style={{ color: t.sub }}>
                    <span className="size-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0" style={{ background: `${t.accent}15`, color: t.accent }}>{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Shipping labels */}
          <section className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Shipping labels · 2 cartons</h3>
              <button onClick={() => toast.success("Sending 2 labels to printer")} className="text-[10.5px] font-bold flex items-center gap-1" style={{ color: t.accent }}>
                <Printer className="size-3" strokeWidth={2.6} /> Print all
              </button>
            </div>
            <div className="space-y-2">
              {[
                { idx: "1 / 2", sku: "PB-A2", qty: 100, w: "210 kg", cbm: "1.20" },
                { idx: "2 / 2", sku: "PB-A2", qty: 100, w: "210 kg", cbm: "1.20" },
              ].map((c) => (
                <div key={c.idx} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px dashed ${t.border}` }}>
                  <div className="size-14 rounded-xl grid place-items-center shrink-0" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
                    <QrCode className="size-9" strokeWidth={1.8} style={{ color: t.navy }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded" style={{ background: `${t.navy}10`, color: t.navy }}>
                        <Tag className="size-2.5 inline mr-0.5" strokeWidth={3} />MP · #{id}
                      </span>
                      <span className="text-[10px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>{c.idx}</span>
                    </div>
                    <p className="text-[12px] font-bold mt-1">{c.sku} · {c.qty} pcs</p>
                    <p className="text-[10.5px] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.sub }}>{c.w} · {c.cbm} CBM · GZ → LOS</p>
                  </div>
                  <button onClick={() => toast.success(`Label ${c.idx} sent to printer`)} className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: t.bg, border: `1px solid ${t.border}` }} aria-label="Print label">
                    <Printer className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <Link to="/logistics/shipments/$id" params={{ id: "SHP-7741" }} className="w-full h-11 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold" style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }}>
              <Ship className="size-3.5" strokeWidth={2.4} /> Open shipment tracker <ArrowUpRight className="size-3.5" strokeWidth={2.4} />
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
