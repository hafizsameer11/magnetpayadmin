import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search, MessageCircle, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/rfq/")({
  head: () => ({ meta: [{ title: "RFQ inbox — Seller" }] }),
  component: RfqInbox,
});

const RFQS = [
  { id: "RFQ-9281", buyer: "Adekunle Trading", country: "🇳🇬 Lagos", item: "Cast-iron pump body PB-A2", qty: 800, target: 215, sla: "2h left", status: "new" as const, msg: "Need CE-certified · monthly repeat order possible" },
  { id: "RFQ-9278", buyer: "Niger Industrial", country: "🇳🇪 Niamey", item: "Sealed bearing B-22", qty: 5000, target: 22, sla: "18h left", status: "new" as const, msg: "Sample first, then bulk" },
  { id: "RFQ-9265", buyer: "Lagos Pumps Ltd", country: "🇳🇬 Lagos", item: "Coil set CS-7 copper", qty: 200, target: 240, sla: "Quoted", status: "quoted" as const, msg: "Quoted ¥248 · awaiting buyer" },
  { id: "RFQ-9241", buyer: "Accra Spares", country: "🇬🇭 Accra", item: "Neodymium magnet MG-9", qty: 1200, target: 78, sla: "Won", status: "won" as const, msg: "Converted to order #4831" },
  { id: "RFQ-9220", buyer: "Dakar Metals", country: "🇸🇳 Dakar", item: "Steel shaft SH-3", qty: 600, target: 58, sla: "Expired", status: "lost" as const, msg: "No response in 48h" },
];

function RfqInbox() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [tab, setTab] = useState<"new" | "quoted" | "won" | "lost" | "all">("new");
  const list = RFQS.filter((r) => tab === "all" ? true : r.status === tab);
  const counts = {
    new: RFQS.filter(r => r.status === "new").length,
    quoted: RFQS.filter(r => r.status === "quoted").length,
    won: RFQS.filter(r => r.status === "won").length,
    lost: RFQS.filter(r => r.status === "lost").length,
  };
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<SellerNav active="home" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Seller</p>
              <p className="text-[13px] font-bold">RFQ inbox · {counts.new + counts.quoted}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input placeholder="Search buyer, SKU…" className="flex-1 bg-transparent text-[12.5px] outline-none" />
            </div>
          </section>

          <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
            {[
              { k: "new" as const, l: `New · ${counts.new}` },
              { k: "quoted" as const, l: `Quoted · ${counts.quoted}` },
              { k: "won" as const, l: `Won · ${counts.won}` },
              { k: "lost" as const, l: `Lost · ${counts.lost}` },
            ].map((c) => {
              const on = tab === c.k;
              return (
                <button key={c.k} onClick={() => setTab(c.k)} className="text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: on ? t.accent : t.surface, color: on ? "#fff" : t.ink, border: `1px solid ${on ? t.accent : t.border}` }}>{c.l}</button>
              );
            })}
          </section>

          <section className="px-4 mt-3 space-y-2">
            {list.map((r) => {
              const c = r.status === "new" ? t.accent : r.status === "quoted" ? t.info : r.status === "won" ? t.success : t.muted;
              const I = r.status === "new" ? Clock : r.status === "quoted" ? MessageCircle : r.status === "won" ? CheckCircle2 : XCircle;
              return (
                <Link key={r.id} to="/seller/rfq/$id/quote" params={{ id: r.id }}
                  className="block rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-2">
                    <p className="text-[10.5px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>{r.id}</p>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: `${c}15`, color: c }}>
                      <I className="size-2.5" strokeWidth={2.6} />{r.sla}
                    </span>
                    <p className="ml-auto text-[10.5px]" style={{ color: t.muted }}>{r.country}</p>
                  </div>
                  <p className="text-[12.5px] font-extrabold mt-1">{r.buyer}</p>
                  <p className="text-[11.5px] mt-0.5 truncate">{r.item}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10.5px]" style={{ color: t.muted }}>Qty <span className="font-bold tabular-nums" style={{ color: t.ink, fontFamily: "'JetBrains Mono', monospace" }}>{r.qty.toLocaleString()}</span></p>
                    <span style={{ color: t.border }}>·</span>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>Target <span className="font-bold tabular-nums" style={{ color: t.ink, fontFamily: "'JetBrains Mono', monospace" }}>¥{r.target}</span></p>
                  </div>
                  <p className="text-[10.5px] mt-1.5 italic" style={{ color: t.sub }}>"{r.msg}"</p>
                  <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: `1px dashed ${t.border}` }}>
                    <p className="text-[10.5px] font-bold" style={{ color: r.status === "new" ? t.accent : t.muted }}>
                      {r.status === "new" ? "Tap to send quotation" : r.status === "quoted" ? "View quotation" : r.status === "won" ? "View order" : "Archived"}
                    </p>
                    <ChevronRight className="size-3.5" strokeWidth={2.6} style={{ color: t.muted }} />
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
