import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Package, Calendar, Paperclip, Send, Info, Globe2, Building2, Star, Inbox } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/rfq")({
  head: () => ({ meta: [{ title: "Request for quote — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    supplier: typeof s.supplier === "string" ? s.supplier : undefined,
    product: typeof s.product === "string" ? s.product : undefined,
  }),
  component: RFQNew,
});

function RFQNew() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const { supplier, product } = Route.useSearch();
  const targeted = Boolean(supplier);
  const [alsoBroadcast, setAlsoBroadcast] = useState(false);
  const sendCount = targeted ? (alsoBroadcast ? 5 : 1) : 5;
  const sendLabel = targeted
    ? alsoBroadcast ? "Send to Huayi + 4 similar" : "Send to Guangzhou Huayi"
    : "Send RFQ to 5 suppliers";
  const [qty, setQty] = useState("200");
  const [target, setTarget] = useState("52");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>● New RFQ</p>
              <p className="text-[13px] font-bold">{targeted ? "Quote from Huayi" : "Get quotes from suppliers"}</p>
            </div>
            <Link to="/market/rfq/inbox" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }} title="View quotes">
              <Inbox className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          <section className="px-4 mt-2">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Product {product && <span style={{ color: t.accent }}>· #{product}</span>}</p>
            <input defaultValue="Cast-iron pump bodies PB-A2 · DN50"
              className="w-full h-12 px-4 rounded-2xl text-[13px] font-semibold outline-none"
              style={{ background: t.surface, border: `1px solid ${t.border}` }} />
          </section>

          <section className="px-4 mt-4 grid grid-cols-2 gap-2">
            <Field t={t} label="Quantity" suffix="units">
              <input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric"
                className="w-full h-10 bg-transparent outline-none text-[15px] font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field t={t} label="Target price" suffix="¥ /unit">
              <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric"
                className="w-full h-10 bg-transparent outline-none text-[15px] font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
          </section>

          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Incoterm</p>
            <div className="grid grid-cols-4 gap-1.5">
              {["EXW", "FOB", "CIF", "DDP"].map((x, i) => (
                <button key={x} className="h-10 rounded-xl text-[11px] font-bold"
                  style={{ background: i === 1 ? t.navy : t.surface, color: i === 1 ? "#fff" : t.sub, border: `1px solid ${i === 1 ? t.navy : t.border}` }}>
                  {x}
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 mt-3 grid grid-cols-2 gap-2">
            <SelectField t={t} I={Globe2} label="Ship to" value="Lagos, NG" />
            <SelectField t={t} I={Calendar} label="Needed by" value="May 30" />
          </section>

          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Specs & notes</p>
            <textarea defaultValue="Material: HT250. Flanged DN50, PN16. Pre-shipment SGS inspection required. Wooden crate packing."
              rows={4} className="w-full p-3 rounded-2xl text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.sub }} />
          </section>

          <section className="px-4 mt-3">
            <button className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[12px] font-semibold"
              style={{ background: t.surface, border: `1px dashed ${t.border}`, color: t.sub }}>
              <Paperclip className="size-3.5" strokeWidth={2.4} /> Attach drawing or spec sheet
            </button>
          </section>

          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Send to</p>
            {targeted ? (
              <>
                <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.accent}40` }}>
                  <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                    <Building2 className="size-5" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-bold truncate">Guangzhou Huayi Co.</p>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold"><Star className="size-2.5 fill-current" style={{ color: t.warn }} />4.8</span>
                    </div>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>Supplier #{supplier} · verified · &lt; 4h response</p>
                  </div>
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full" style={{ background: `${t.accent}15`, color: t.accent }}>Selected</span>
                </div>
                <label className="mt-2 rounded-2xl p-3 flex items-center gap-3 cursor-pointer" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${t.info}10`, color: t.info }}>
                    <Package className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-bold">Also send to 4 similar suppliers</p>
                    <p className="text-[10px]" style={{ color: t.muted }}>Compare prices · still negotiate with Huayi</p>
                  </div>
                  <input type="checkbox" checked={alsoBroadcast} onChange={(e) => setAlsoBroadcast(e.target.checked)}
                    className="size-4 accent-current" style={{ accentColor: t.accent }} />
                </label>
              </>
            ) : (
              <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Package className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-bold">5 matched suppliers</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>Verified · ships to NG · MOQ ≤ 200</p>
                </div>
                <button className="text-[10.5px] font-bold" style={{ color: t.accent }}>Edit</button>
              </div>
            )}
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.info}10`, border: `1px solid ${t.info}30` }}>
              <Info className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.info }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Suppliers respond within <strong>24h</strong>. Compare quotes side-by-side, negotiate, then start an escrow order in one tap.
              </p>
            </div>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/market/rfq/inbox" })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <Send className="size-4" strokeWidth={2.6} /> {sendLabel}{sendCount > 1 && targeted ? "" : ""}
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Field({ t, label, suffix, children }: { t: typeof escrowTheme; label: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl px-3.5 py-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: t.muted }}>{label}</p>
        {suffix && <p className="text-[9.5px]" style={{ color: t.muted }}>{suffix}</p>}
      </div>
      {children}
    </div>
  );
}

function SelectField({ t, I, label, value }: { t: typeof escrowTheme; I: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <button className="rounded-2xl px-3.5 py-2 text-left" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: t.muted }}>{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold">
        <I className="size-3.5" strokeWidth={2.4} /> {value}
      </p>
    </button>
  );
}
