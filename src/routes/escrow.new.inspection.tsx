import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ShieldCheck, FileText, Plus, X, Building2, User } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { EscrowStepper, escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/inspection")({
  head: () => ({ meta: [{ title: "New escrow · inspection — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    party: String(s.party ?? "Counterparty"),
    mode: String(s.mode ?? "contact"),
    title: String(s.title ?? "Deal"),
    amount: Number(s.amount ?? 0),
    ccy: String(s.ccy ?? "CNY"),
    ms: Number(s.ms ?? 3),
  }),
  component: NewEscrowInspection,
});

const INSPECTORS = [
  { id: "sgs", name: "SGS Lagos", meta: "Third-party · 4.9★ · fee ~¥420", I: Building2, badge: "Recommended" },
  { id: "bv", name: "Bureau Veritas", meta: "Third-party · 4.8★ · fee ~¥520", I: Building2 },
  { id: "self", name: "Buyer self-inspection", meta: "Inspect on arrival · no third-party fee", I: User },
  { id: "none", name: "No inspection", meta: "Release on delivery only", I: ShieldCheck },
];

const DEFAULT_DOCS = [
  { id: "ci", label: "Commercial invoice", req: true },
  { id: "pl", label: "Packing list", req: true },
  { id: "bl", label: "Bill of lading / AWB", req: true },
  { id: "coo", label: "Certificate of origin", req: false },
  { id: "qc", label: "QC / inspection report", req: false },
];

function NewEscrowInspection() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const params = useSearch({ from: "/escrow/new/inspection" });

  const [inspector, setInspector] = useState("sgs");
  const [docs, setDocs] = useState(DEFAULT_DOCS);
  const [adding, setAdding] = useState("");

  const toggle = (id: string) => setDocs(docs.map(d => d.id === id ? { ...d, req: !d.req } : d));
  const remove = (id: string) => setDocs(docs.filter(d => d.id !== id));
  const add = () => {
    const v = adding.trim();
    if (!v) return;
    setDocs([...docs, { id: `c${Date.now()}`, label: v, req: true }]);
    setAdding("");
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/new/milestones" search={{ party: params.party, mode: params.mode, title: params.title, amount: params.amount, ccy: params.ccy }}
              className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Verification</p>
              <p className="text-[13px] font-bold">Inspection & documents</p>
            </div>
            <div className="size-9" />
          </header>

          <EscrowStepper step={4} />

          {/* Inspector */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Who inspects the goods?</p>
            <div className="space-y-2">
              {INSPECTORS.map((opt) => {
                const sel = inspector === opt.id;
                return (
                  <button key={opt.id} onClick={() => setInspector(opt.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
                    style={{ background: t.surface, border: `1px solid ${sel ? t.accent : t.border}` }}>
                    <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                      <opt.I className="size-4" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-semibold truncate">{opt.name}</p>
                        {opt.badge && <span className="text-[8.5px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded" style={{ background: `${t.success}15`, color: t.success }}>{opt.badge}</span>}
                      </div>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{opt.meta}</p>
                    </div>
                    <span className="size-4 rounded-full grid place-items-center shrink-0"
                      style={{ border: `2px solid ${sel ? t.accent : t.border}`, background: sel ? t.accent : "transparent" }}>
                      {sel && <span className="size-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Documents */}
          <section className="px-4 mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Required documents</p>
              <p className="text-[10px]" style={{ color: t.muted }}>Tap to toggle required</p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {docs.map((d, i, arr) => (
                <div key={d.id} className={`flex items-center gap-3 px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                    <FileText className="size-4" strokeWidth={2.3} />
                  </div>
                  <button onClick={() => toggle(d.id)} className="flex-1 text-left">
                    <p className="text-[12.5px] font-semibold">{d.label}</p>
                    <p className="text-[10px]" style={{ color: d.req ? t.accent : t.muted }}>{d.req ? "Required" : "Optional"}</p>
                  </button>
                  <button onClick={() => toggle(d.id)} className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ background: d.req ? `${t.accent}15` : `${t.muted}15`, color: d.req ? t.accent : t.muted }}>
                    {d.req ? "Req" : "Opt"}
                  </button>
                  <button onClick={() => remove(d.id)} className="size-7 grid place-items-center rounded-md" style={{ color: t.muted }}>
                    <X className="size-3.5" strokeWidth={2.3} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ borderTop: `1px solid ${t.border}` }}>
                <Plus className="size-4" strokeWidth={2.4} style={{ color: t.accent }} />
                <input value={adding} onChange={(e) => setAdding(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="Add custom document"
                  className="flex-1 bg-transparent outline-none text-[12px]" />
                <button onClick={add} disabled={!adding.trim()} className="px-3 h-8 rounded-lg text-[10.5px] font-bold text-white disabled:opacity-40" style={{ background: t.navy }}>Add</button>
              </div>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/new/fees", search: { ...params, inspector, docs: docs.filter(d => d.req).length } })}
                className="h-13 w-full rounded-2xl text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.navy }}>
                Continue to fees & terms
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
