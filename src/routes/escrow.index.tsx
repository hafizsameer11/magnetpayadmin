import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, Plus, Search, ShieldCheck, Loader2, CheckCircle2,
  AlertTriangle, Ship, Building2, Package,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { BottomNav } from "@/components/magnetpay/BottomNav";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/escrow/")({
  head: () => ({ meta: [{ title: "Escrow — MagnetPay" }] }),
  component: EscrowList,
});

type Tab = "active" | "completed" | "disputed";

const DEALS = [
  { id: "E-771", title: "Industrial pump parts", party: "Guangzhou Huayi Co.", amt: "¥12,400.00", ngn: "≈ ₦2.84M", state: "transit" as const, prog: "3/5", tab: "active" as Tab, I: Ship },
  { id: "E-768", title: "Ceramic tiles · 2 pallets", party: "Foshan Ceramics", amt: "¥6,820.00", ngn: "≈ ₦1.56M", state: "funded" as const, prog: "1/4", tab: "active" as Tab, I: Package },
  { id: "E-762", title: "Sourcing agent retainer", party: "Wei Chen · Shenzhen", amt: "¥3,200.00", ngn: "≈ ₦732k", state: "inspect" as const, prog: "4/5", tab: "active" as Tab, I: Building2 },
  { id: "E-754", title: "LED panels · Q1 order", party: "Shenzhen Lumica", amt: "¥18,900.00", ngn: "≈ ₦4.33M", state: "released" as const, prog: "5/5", tab: "completed" as Tab, I: CheckCircle2 },
  { id: "E-749", title: "Packaging samples", party: "Yiwu Trade Co.", amt: "¥1,200.00", ngn: "≈ ₦275k", state: "released" as const, prog: "5/5", tab: "completed" as Tab, I: CheckCircle2 },
  { id: "E-741", title: "Stainless fittings · short ship", party: "Tianjin Metals", amt: "¥4,560.00", ngn: "≈ ₦1.04M", state: "dispute" as const, prog: "held", tab: "disputed" as Tab, I: AlertTriangle },
];

function EscrowList() {
  useRoleGuard(["buyer", "both"], "Escrow deals are buyer-side. Sellers manage incoming deals from /escrow/seller.");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", success = "#0F766E", warn = "#B45309", danger = "#B91C1C";

  const [tab, setTab] = useState<Tab>("active");
  const [q, setQ] = useState("");

  const tone = (s: typeof DEALS[number]["state"]) =>
    s === "released" ? success :
    s === "dispute" ? danger :
    s === "transit" || s === "inspect" ? warn : navy;

  const label = (s: typeof DEALS[number]["state"]) =>
    s === "released" ? "Released" :
    s === "dispute" ? "Disputed" :
    s === "transit" ? "In transit" :
    s === "inspect" ? "Inspection" : "Funded";

  const list = DEALS.filter((d) => d.tab === tab && (q === "" || (d.title + d.party + d.id).toLowerCase().includes(q.toLowerCase())));
  const counts = { active: DEALS.filter(d => d.tab === "active").length, completed: DEALS.filter(d => d.tab === "completed").length, disputed: DEALS.filter(d => d.tab === "disputed").length };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy} bottomNav={<BottomNav active="escrow" />}>
        <div className="relative min-h-full pb-28" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Protected</p>
              <p className="text-[13px] font-bold">Escrow deals</p>
            </div>
            <Link to="/escrow/new" className="size-9 grid place-items-center rounded-full text-white" style={{ background: navy }}>
              <Plus className="size-4" strokeWidth={2.6} />
            </Link>
          </header>

          {/* Summary chips */}
          <section className="px-4 mt-2 grid grid-cols-3 gap-2">
            {[
              { l: "Held", v: "¥22,420", c: navy },
              { l: "Released 30d", v: "¥20,100", c: success },
              { l: "Disputed", v: "¥4,560", c: danger },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl p-3" style={{ background: surface, border: `1px solid ${border}` }}>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>{k.l}</p>
                <p className="mt-1 text-[14px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: k.c }}>{k.v}</p>
              </div>
            ))}
          </section>

          {/* Pending invite (seller side) */}
          <section className="px-4 mt-3">
            <Link to="/escrow/invite/$id" params={{ id: "E-803" }}
              className="block rounded-2xl p-3.5"
              style={{ background: `${accent}10`, border: `1.5px solid ${accent}40` }}>
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: accent, color: "#fff" }}>
                  <ShieldCheck className="size-4" strokeWidth={2.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>● Invite to accept</p>
                  <p className="mt-0.5 text-[13px] font-bold truncate">LED panels · 50 units</p>
                  <p className="text-[10.5px] truncate" style={{ color: sub }}>From Chidi Okoro · ¥8,400 to be held</p>
                </div>
                <span className="text-[10px] font-bold" style={{ color: accent }}>Review →</span>
              </div>
            </Link>
          </section>


          {/* Search */}
          <section className="px-4 mt-4">
            <div className="flex items-center gap-2 h-11 px-3 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
              <Search className="size-4" strokeWidth={2.3} style={{ color: muted }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by counterparty or ID" className="flex-1 bg-transparent outline-none text-[12.5px]" />
            </div>
          </section>

          {/* Tabs */}
          <section className="px-4 mt-3">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: `${navy}0d` }}>
              {(["active", "completed", "disputed"] as Tab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold capitalize transition"
                  style={{ background: tab === t ? "#fff" : "transparent", color: tab === t ? navy : sub }}>
                  {t} <span className="font-mono opacity-60">· {counts[t]}</span>
                </button>
              ))}
            </div>
          </section>

          {/* List */}
          <section className="px-4 mt-4 space-y-2">
            {list.length === 0 && (
              <div className="rounded-2xl p-6 text-center" style={{ background: surface, border: `1px solid ${border}` }}>
                <ShieldCheck className="size-6 mx-auto mb-2" strokeWidth={2} style={{ color: muted }} />
                <p className="text-[12px] font-semibold">No {tab} escrows</p>
                <p className="mt-0.5 text-[10.5px]" style={{ color: muted }}>Create one to protect your next deal.</p>
              </div>
            )}
            {list.map((d) => {
              const c = tone(d.state);
              return (
                <Link key={d.id} to="/escrow/$id" params={{ id: d.id }}
                  className="block rounded-2xl p-3.5" style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${c}15`, color: c }}>
                      {d.state === "transit" ? <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> : <d.I className="size-4" strokeWidth={2.4} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-bold truncate">{d.title}</p>
                      </div>
                      <p className="text-[10.5px] truncate" style={{ color: muted }}>{d.party} · <span className="font-mono">#{d.id}</span></p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded" style={{ background: `${c}15`, color: c }}>
                          {label(d.state)}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: muted }}>{d.prog}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.amt}</p>
                      <p className="text-[10px]" style={{ color: muted }}>{d.ngn}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>

          {/* CTA */}
          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <Link to="/escrow/new"
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: accent, boxShadow: `0 12px 28px -10px ${accent}80` }}>
                <Plus className="size-4" strokeWidth={2.6} /> Create new escrow
              </Link>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
