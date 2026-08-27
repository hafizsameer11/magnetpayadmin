import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Plus, Trash2, GripVertical, Calendar } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { EscrowStepper, escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/milestones")({
  head: () => ({ meta: [{ title: "New escrow · milestones — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    party: String(s.party ?? "Counterparty"),
    mode: String(s.mode ?? "contact"),
    title: String(s.title ?? "Deal"),
    amount: Number(s.amount ?? 0),
    ccy: String(s.ccy ?? "CNY"),
  }),
  component: NewEscrowMilestones,
});

type Milestone = { id: string; label: string; pct: number; eta: string };

function NewEscrowMilestones() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const { party, mode, title, amount, ccy } = useSearch({ from: "/escrow/new/milestones" });
  const sym = ccy === "CNY" ? "¥" : ccy === "USD" ? "$" : "₦";

  const [items, setItems] = useState<Milestone[]>([
    { id: "m1", label: "Deposit on order confirmation", pct: 30, eta: "Mar 14" },
    { id: "m2", label: "Goods dispatched (B/L issued)", pct: 40, eta: "Mar 18" },
    { id: "m3", label: "Delivered & inspected", pct: 30, eta: "Apr 02" },
  ]);
  const [editing, setEditing] = useState<string | null>(null);

  const total = items.reduce((s, m) => s + m.pct, 0);
  const ready = items.length >= 1 && total === 100;

  const update = (id: string, patch: Partial<Milestone>) =>
    setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const remove = (id: string) => setItems(items.filter(i => i.id !== id));
  const add = () => {
    const id = `m${Date.now()}`;
    setItems([...items, { id, label: "New milestone", pct: 0, eta: "" }]);
    setEditing(id);
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/new/terms" search={{ party, mode }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>{sym}{fmt(amount)} · {ccy}</p>
              <p className="text-[13px] font-bold">Milestones</p>
            </div>
            <div className="size-9" />
          </header>

          <EscrowStepper step={3} />

          {/* Allocation bar */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-baseline justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Allocated</p>
                <p className="text-[12px] font-bold tabular-nums" style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: total === 100 ? t.success : total > 100 ? t.danger : t.warn,
                }}>
                  {total}% / 100%
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: `${t.navy}10` }}>
                <div className="h-full transition-all" style={{
                  width: `${Math.min(100, total)}%`,
                  background: total === 100 ? t.success : total > 100 ? t.danger : t.accent,
                }} />
              </div>
              <p className="mt-2 text-[10.5px]" style={{ color: t.muted }}>
                {total === 100 ? "Fully allocated — ready to proceed." : total > 100 ? `Over by ${total - 100}%. Reduce one milestone.` : `${100 - total}% remaining to allocate.`}
              </p>
            </div>
          </section>

          {/* List */}
          <section className="px-4 mt-3 space-y-2">
            {items.map((m, i) => {
              const isEdit = editing === m.id;
              const moneyForPct = (amount * m.pct) / 100;
              return (
                <div key={m.id} className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-start gap-2">
                    <div className="size-7 rounded-md grid place-items-center mt-0.5" style={{ background: `${t.navy}10`, color: t.navy }}>
                      <span className="text-[10px] font-bold font-mono">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      {isEdit ? (
                        <>
                          <input value={m.label} onChange={(e) => update(m.id, { label: e.target.value })}
                            className="w-full h-9 px-2.5 rounded-lg text-[12.5px] font-semibold"
                            style={{ background: t.bg, border: `1px solid ${t.border}` }} />
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <p className="text-[9.5px] font-bold uppercase mb-1" style={{ color: t.muted }}>Share %</p>
                              <input inputMode="numeric" value={m.pct}
                                onChange={(e) => update(m.id, { pct: Math.max(0, Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0)) })}
                                className="w-full h-9 px-2.5 rounded-lg text-[12px] font-bold tabular-nums"
                                style={{ background: t.bg, border: `1px solid ${t.border}`, fontFamily: "'JetBrains Mono', monospace" }} />
                            </div>
                            <div className="flex-[1.4]">
                              <p className="text-[9.5px] font-bold uppercase mb-1" style={{ color: t.muted }}>Target date</p>
                              <input value={m.eta} onChange={(e) => update(m.id, { eta: e.target.value })} placeholder="Apr 02"
                                className="w-full h-9 px-2.5 rounded-lg text-[12px]"
                                style={{ background: t.bg, border: `1px solid ${t.border}` }} />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => setEditing(null)} className="flex-1 h-9 rounded-lg text-[11px] font-bold text-white" style={{ background: t.navy }}>Done</button>
                            <button onClick={() => { remove(m.id); setEditing(null); }} className="size-9 rounded-lg grid place-items-center" style={{ background: `${t.danger}10`, color: t.danger }}>
                              <Trash2 className="size-4" strokeWidth={2.3} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => setEditing(m.id)} className="w-full text-left">
                          <p className="text-[12.5px] font-semibold leading-tight">{m.label}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10.5px]" style={{ color: t.muted }}>
                            <Calendar className="size-3" strokeWidth={2.4} />{m.eta || "no date"}
                            <span>·</span>
                            <span className="font-mono">{m.pct}%</span>
                            <span>·</span>
                            <span className="font-mono">{sym}{fmt(moneyForPct)}</span>
                          </div>
                        </button>
                      )}
                    </div>
                    {!isEdit && <GripVertical className="size-4 mt-1" strokeWidth={2.2} style={{ color: t.muted }} />}
                  </div>
                </div>
              );
            })}

            <button onClick={add}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-[12.5px] font-bold"
              style={{ background: "transparent", border: `1.5px dashed ${t.border}`, color: t.accent }}>
              <Plus className="size-4" strokeWidth={2.6} /> Add milestone
            </button>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/new/inspection", search: { party, mode, title, amount, ccy, ms: items.length } })}
                disabled={!ready}
                className="h-13 w-full rounded-2xl text-[13.5px] font-bold text-white py-3.5 disabled:opacity-40"
                style={{ background: t.navy }}>
                Continue to inspection
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
