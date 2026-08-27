import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft, ShieldCheck, MessageCircle, MoreHorizontal,
  CheckCircle2, Circle, Loader2, FileText, Download, Paperclip,
  AlertTriangle, Ship, Package, Building2, User as UserIcon,
  ArrowUpRight, Info,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/escrow/$id")({
  head: () => ({ meta: [{ title: "Escrow #E-771 — MagnetPay" }] }),
  component: EscrowDetail,
});

// PRESSURE TEST: v8 system applied to a data-dense PRD screen.
// Tests: 5 status states in one view, milestone timeline, parties block,
// document list, dispute risk banner, dual primary actions, audit log.
function EscrowDetail() {
  useRoleGuard(["buyer", "both"], "Buyer escrow view. Sellers manage incoming deals from /escrow/seller.");
  const { id } = useParams({ from: "/escrow/$id" });
  // v8 palette + extended status tokens (the "recolor" the PRD needs)
  const navy = "#0E3B2E";
  const bg = "#F6F1E7";
  const surface = "#FFFFFF";
  const border = "#E7DFCE";
  const ink = "#1B1A17";
  const sub = "#5B5749";
  const muted = "#8A8472";
  const accent = "#C2410C";   // terracotta — high-stakes action
  const success = "#0F766E";  // released / completed
  const warn = "#B45309";     // pending / awaiting
  const danger = "#B91C1C";   // dispute / held
  const info = "#1D4ED8";     // FX / notice

  // Status pill helper
  const Pill = ({ tone, children }: { tone: "success" | "warn" | "danger" | "info" | "neutral"; children: React.ReactNode }) => {
    const c =
      tone === "success" ? success :
      tone === "warn" ? warn :
      tone === "danger" ? danger :
      tone === "info" ? info : sub;
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]"
        style={{ background: `${c}15`, color: c }}
      >
        {children}
      </span>
    );
  };

  // Milestones — 5 states forced into one view
  const milestones = [
    { label: "Funded", note: "¥12,400 held in escrow", date: "Mar 14", state: "done" as const },
    { label: "Supplier confirmed order", note: "Guangzhou Huayi Co.", date: "Mar 15", state: "done" as const },
    { label: "Goods dispatched", note: "Bill of Lading #BL-2210-MSK", date: "Mar 18", state: "current" as const },
    { label: "Goods received & inspected", note: "Apapa Port — pending arrival", date: "ETA Apr 02", state: "pending" as const },
    { label: "Buyer release", note: "48h auto-release after inspection", date: "—", state: "pending" as const },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame
        background={navy}
        bottomNav={
          // Action bar replaces nav on detail screens
          <div className="relative">
            <div
              className="h-8 -mb-1"
              style={{ background: `linear-gradient(to top, ${bg} 30%, ${bg}00 100%)` }}
            />
            <div className="px-4 pb-5 pt-1" style={{ background: bg }}>
              <div className="flex gap-2">
                <Link
                  to="/escrow/$id/dispute" params={{ id }}
                  className="flex-1 h-12 rounded-2xl text-[12.5px] font-bold flex items-center justify-center gap-1.5"
                  style={{ background: surface, border: `1px solid ${border}`, color: danger }}
                >
                  <AlertTriangle className="size-4" strokeWidth={2.4} /> Raise dispute
                </Link>
                <Link
                  to="/escrow/$id/release" params={{ id }}
                  className="flex-[1.4] h-12 rounded-2xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 text-white"
                  style={{ background: navy, boxShadow: `0 10px 24px -10px ${navy}` }}
                >
                  <ShieldCheck className="size-4" strokeWidth={2.4} /> Release ¥12,400
                </Link>
              </div>
            </div>
          </div>
        }
      >
        <div
          className="relative min-h-full pb-24"
          style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}
        >
          {/* Top bar */}
          <header className="px-4 pt-12 pb-2 flex items-center justify-between">
            <Link
              to="/escrow"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} style={{ color: ink }} />
            </Link>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
              Escrow · <span style={{ color: ink, fontFamily: "'JetBrains Mono', monospace" }}>#{id}</span>
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/messages/$id"
                params={{ id: "t2" }}
                className="size-9 grid place-items-center rounded-full"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <MessageCircle className="size-4" strokeWidth={2} style={{ color: sub }} />
              </Link>
              <button
                onClick={() => toast.message("Escrow options", { description: "Export PDF · Mute · Report — coming soon" })}
                className="size-9 grid place-items-center rounded-full"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <MoreHorizontal className="size-4" strokeWidth={2} style={{ color: sub }} />
              </button>
            </div>
          </header>

          {/* Hero: compressed escrow summary */}
          <section className="px-4 mt-2">
            <div
              className="relative rounded-3xl p-4 overflow-hidden text-white"
              style={{
                background: `linear-gradient(135deg, ${navy} 0%, #14513E 60%, ${navy} 100%)`,
                border: `1px solid ${navy}`,
              }}
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[16px] font-bold leading-tight truncate">
                    Industrial pump parts
                  </h1>
                  <p className="mt-0.5 text-[11px]" style={{ color: "#C8C2B0" }}>
                    Guangzhou → Lagos · Sea freight
                  </p>
                </div>
                <span
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-[0.14em]"
                  style={{ background: "rgba(253,186,116,0.18)", color: "#FDBA74", border: "1px solid rgba(253,186,116,0.35)" }}
                >
                  <Loader2 className="size-2.5 animate-spin" strokeWidth={3} /> In transit
                </span>
              </div>

              {/* Amount + FX inline */}
              <div className="mt-4 flex items-baseline gap-2">
                <p
                  className="text-[34px] leading-none font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ¥12,400<span style={{ color: "#C8C2B0" }}>.00</span>
                </p>
                <p className="text-[10.5px]" style={{ color: "#C8C2B0" }}>
                  ≈ ₦2.84M · held
                </p>
              </div>

              {/* Progress bar with inline label */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <div className="h-full rounded-full" style={{ width: "60%", background: "#FDBA74" }} />
                </div>
                <span
                  className="text-[10px] font-bold tabular-nums"
                  style={{ color: "#FDBA74", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  60% · 3/5
                </span>
              </div>
            </div>
          </section>



          {/* Parties — structured block */}
          <section className="px-4 mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                Parties
              </h3>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {[
                { role: "Buyer", name: "Chidi Okoro", meta: "MagnetPay · KYC verified", I: UserIcon, tone: "success" as const, status: "Verified" },
                { role: "Supplier", name: "Guangzhou Huayi Co.", meta: "Verified · 4.8 ★ · 142 trades", I: Building2, tone: "success" as const, status: "Verified" },
                { role: "Inspector", name: "SGS Lagos", meta: "Assigned · awaiting goods", I: ShieldCheck, tone: "warn" as const, status: "Pending" },
              ].map((p, i, arr) => (
                <div
                  key={p.role}
                  className={`flex items-center gap-3 px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: border }}
                >
                  <div
                    className="size-9 rounded-full grid place-items-center shrink-0"
                    style={{ background: `${navy}10`, color: navy }}
                  >
                    <p.I className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>
                        {p.role}
                      </p>
                    </div>
                    <p className="text-[13px] font-semibold truncate">{p.name}</p>
                    <p className="text-[10.5px] truncate" style={{ color: muted }}>{p.meta}</p>
                  </div>
                  <Pill tone={p.tone}>{p.status}</Pill>
                </div>
              ))}
            </div>
          </section>

          {/* Milestone timeline — the dense test */}
          <section className="px-4 mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                Milestones
              </h3>
              <span className="text-[10.5px]" style={{ color: muted }}>3 of 5</span>
            </div>
            <div
              className="rounded-2xl px-4 py-4"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <ol className="relative">
                {milestones.map((m, i) => {
                  const isLast = i === milestones.length - 1;
                  const isCurrent = m.state === "current";
                  const color =
                    m.state === "done" ? success :
                    isCurrent ? accent : muted;
                  const Icon =
                    m.state === "done" ? CheckCircle2 :
                    isCurrent ? Loader2 : Circle;
                  return (
                    <li key={m.label} className="relative pl-7 pb-4 last:pb-0">
                      {!isLast && (
                        <span
                          className="absolute left-[9px] top-5 bottom-0 w-px"
                          style={{ background: m.state === "done" ? success : border }}
                        />
                      )}
                      {isCurrent && (
                        <span
                          className="absolute -left-4 top-0 bottom-2 w-[3px] rounded-full"
                          style={{ background: accent }}
                        />
                      )}
                      <Icon
                        className={`absolute left-0 top-0.5 size-[18px] ${isCurrent ? "animate-spin" : ""}`}
                        strokeWidth={2.6}
                        style={{ color }}
                      />
                      <Link to="/escrow/$id/milestone/$ms" params={{ id, ms: String(i + 1) }}
                        search={{ label: m.label, amount: 12400 / milestones.length, ccy: "CNY" }}
                        className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p
                              className="text-[13px] font-semibold leading-tight"
                              style={{ color: m.state === "pending" ? muted : ink }}
                            >
                              {m.label}
                            </p>
                            {isCurrent && (
                              <span
                                className="text-[8.5px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                                style={{ background: `${accent}15`, color: accent }}
                              >
                                Now
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-[10.5px]" style={{ color: muted }}>{m.note}</p>
                        </div>
                        <p
                          className="text-[10px] font-semibold tabular-nums shrink-0"
                          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {m.date}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* Documents — dense list */}
          <section className="px-4 mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                Documents
              </h3>
              <button
                onClick={() => toast.success("Document upload", { description: "Select a PDF or photo from your device" })}
                className="text-[11px] font-semibold flex items-center gap-1" style={{ color: accent }}>
                <Paperclip className="size-3" strokeWidth={2.4} /> Attach
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {[
                { name: "Commercial Invoice", meta: "PDF · 248 KB · Mar 14", tone: "success" as const, status: "Verified" },
                { name: "Bill of Lading BL-2210", meta: "PDF · 1.2 MB · Mar 18", tone: "success" as const, status: "Verified" },
                { name: "Packing List", meta: "XLSX · 64 KB · Mar 14", tone: "success" as const, status: "Verified" },
                { name: "Inspection Report", meta: "Awaiting SGS Lagos", tone: "warn" as const, status: "Pending" },
              ].map((d, i, arr) => (
                <div
                  key={d.name}
                  className={`flex items-center gap-3 px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: border }}
                >
                  <div
                    className="size-9 rounded-lg grid place-items-center shrink-0"
                    style={{ background: `${navy}10`, color: navy }}
                  >
                    <FileText className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold truncate">{d.name}</p>
                    <p className="text-[10.5px]" style={{ color: muted }}>{d.meta}</p>
                  </div>
                  <Pill tone={d.tone}>{d.status}</Pill>
                  {d.tone === "success" && (
                    <button
                      onClick={() => toast.success(`Downloading ${d.name}`)}
                      className="size-7 grid place-items-center rounded-md" style={{ color: sub }}>
                      <Download className="size-3.5" strokeWidth={2.3} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Audit log — compact rows */}
          <section className="px-4 mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                Audit log
              </h3>
              <button onClick={() => toast.message("Full audit log", { description: "Opens detailed event timeline" })} className="text-[11px] font-semibold" style={{ color: accent }}>Full log →</button>
            </div>
            <div
              className="rounded-2xl px-4 py-2"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              {[
                { t: "Container scanned at Singapore PSA", who: "MSK carrier feed", time: "11:42 · today", I: Ship, c: info },
                { t: "Supplier uploaded Bill of Lading", who: "Guangzhou Huayi Co.", time: "Mar 18 · 09:10", I: FileText, c: success },
                { t: "Order confirmed by supplier", who: "Guangzhou Huayi Co.", time: "Mar 15 · 14:22", I: Package, c: success },
                { t: "Escrow funded", who: "You · Wallet CNY", time: "Mar 14 · 10:05", I: ShieldCheck, c: navy },
              ].map((r, i, arr) => (
                <div
                  key={r.t}
                  className={`flex items-start gap-3 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: border }}
                >
                  <r.I className="size-3.5 mt-0.5 shrink-0" strokeWidth={2.3} style={{ color: r.c }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold leading-snug">{r.t}</p>
                    <p className="text-[10px]" style={{ color: muted }}>{r.who}</p>
                  </div>
                  <span
                    className="text-[9.5px] tabular-nums shrink-0"
                    style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {r.time}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Soft secondary action */}
          <section className="px-4 mt-5">
            <Link
              to="/logistics/shipments/$id" params={{ id }}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold"
              style={{ background: surface, border: `1px solid ${border}`, color: ink }}
            >
              Open shipment tracker <ArrowUpRight className="size-3.5" strokeWidth={2.4} />
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
