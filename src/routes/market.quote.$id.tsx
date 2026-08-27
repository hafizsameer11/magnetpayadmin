import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Star,
  Download,
  Clock,
  Truck,
  Package2,
  FileText,
  Building2,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/market/quote/$id")({
  head: () => ({ meta: [{ title: "Quote — MagnetPay" }] }),
  component: QuoteDoc,
});

function QuoteDoc() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const { id } = useParams({ from: "/market/quote/$id" });
  const navigate = useNavigate();

  const items = [
    { sku: "PB-A2-200", name: "Pump body PB-A2", qty: 300, unit: 51, total: 15300 },
  ];
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const fees = 0;
  const total = subtotal + fees;

  const terms: [string, string][] = [
    ["Incoterms", "FOB Guangzhou"],
    ["Lead time", "21 days"],
    ["Packaging", "Wooden crate, palletised"],
    ["Inspection", "SGS pre-shipment included"],
    ["Payment", "30% deposit · 70% on B/L"],
    ["Currency", "CNY"],
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-32"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to="/market/rfq/inbox"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: t.muted }}
              >
                Quote
              </p>
              <p className="text-[13px] font-bold">Q-{id}</p>
            </div>
            <button
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}
              aria-label="Download PDF"
            >
              <Download className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          {/* Supplier */}
          <section className="px-4">
            <div
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div
                className="size-10 rounded-xl grid place-items-center shrink-0 text-[12px] font-bold"
                style={{ background: `${t.navy}10`, color: t.navy }}
              >
                GH
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-bold truncate">Guangzhou Huayi Co.</p>
                <p
                  className="text-[10px] flex items-center gap-1.5"
                  style={{ color: t.muted }}
                >
                  <Building2 className="size-2.5" strokeWidth={2.6} />
                  Verified manufacturer · Guangdong
                  <Star className="size-2.5 fill-current" style={{ color: t.warn }} />
                  4.8
                </p>
              </div>
            </div>
          </section>

          {/* Headline price */}
          <section className="px-4 mt-3">
            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(135deg, ${t.accent}12, ${t.accent}04)`,
                border: `1px solid ${t.accent}30`,
              }}
            >
              <div className="flex items-baseline justify-between">
                <p
                  className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: t.accent }}
                >
                  Quoted price
                </p>
                <p
                  className="text-[9.5px] inline-flex items-center gap-1 font-bold"
                  style={{ color: t.muted }}
                >
                  <Clock className="size-2.5" strokeWidth={2.6} /> Valid 7 days
                </p>
              </div>
              <p
                className="mt-1 text-[28px] font-bold tabular-nums leading-none"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}
              >
                ¥51<span className="text-[14px]" style={{ color: t.sub }}>/unit</span>
              </p>
              <p className="mt-1.5 text-[11px]" style={{ color: t.sub }}>
                300 units · 21-day lead · FOB Guangzhou
              </p>
            </div>
          </section>

          {/* Items */}
          <section className="px-4 mt-4">
            <p
              className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2"
              style={{ color: t.muted }}
            >
              Line items
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              {items.map((it, i) => (
                <div
                  key={it.sku}
                  className="p-3 flex items-start gap-3"
                  style={{
                    borderTop: i > 0 ? `1px solid ${t.border}` : "none",
                  }}
                >
                  <div
                    className="size-10 rounded-xl grid place-items-center shrink-0"
                    style={{ background: `${t.navy}08`, color: t.navy }}
                  >
                    <Package2 className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold leading-tight">{it.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>
                      SKU {it.sku}
                    </p>
                    <div className="mt-1.5 flex items-baseline justify-between gap-2">
                      <p className="text-[10.5px]" style={{ color: t.sub }}>
                        {it.qty} × ¥{it.unit.toFixed(2)}
                      </p>
                      <p
                        className="text-[12px] font-bold tabular-nums"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        ¥{it.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="px-4 mt-3">
            <div
              className="rounded-2xl p-3.5 space-y-1.5"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <Row k="Subtotal" v={`¥${subtotal.toLocaleString()}`} t={t} />
              <Row k="Shipping (FOB)" v="Included" t={t} />
              <Row k="MagnetPay fees" v={`¥${fees.toFixed(2)}`} t={t} />
              <div
                className="pt-2 mt-1 flex items-center justify-between"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <span className="text-[12px] font-bold">Total</span>
                <span
                  className="text-[15px] font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ¥{total.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* Terms */}
          <section className="px-4 mt-4">
            <p
              className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2"
              style={{ color: t.muted }}
            >
              Terms
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              {terms.map(([k, v], i) => (
                <div
                  key={k}
                  className="px-3.5 py-2.5 flex items-center justify-between text-[11.5px]"
                  style={{
                    borderTop: i > 0 ? `1px solid ${t.border}` : "none",
                  }}
                >
                  <span style={{ color: t.sub }}>{k}</span>
                  <span className="font-semibold text-right">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Escrow note */}
          <section className="px-4 mt-3">
            <div
              className="rounded-2xl p-3 flex items-start gap-2.5"
              style={{ background: `${t.info}08`, border: `1px solid ${t.info}30` }}
            >
              <ShieldCheck
                className="size-4 shrink-0 mt-0.5"
                strokeWidth={2.4}
                style={{ color: t.info }}
              />
              <div>
                <p className="text-[11.5px] font-bold" style={{ color: t.info }}>
                  Funds held in MagnetPay escrow
                </p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.sub }}>
                  Released to supplier across 4 milestones: deposit, production, B/L, delivery.
                </p>
              </div>
            </div>
          </section>

          {/* Attachments */}
          <section className="px-4 mt-3 mb-4">
            <button
              className="w-full rounded-2xl p-3 flex items-center gap-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <FileText className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
              <p className="flex-1 text-left text-[11.5px] font-bold">Spec-sheet-PB-A2.pdf</p>
              <p className="text-[10px]" style={{ color: t.muted }}>1.2 MB</p>
            </button>
          </section>

          {/* Bottom CTAs */}
          <section className="absolute bottom-3 left-0 right-0 px-4 pointer-events-none">
            <div className="pointer-events-auto grid grid-cols-[auto_1fr] gap-2">
              <Link
                to="/messages/$id"
                params={{ id: "t1" }}
                className="h-12 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}
              >
                <MessageCircle className="size-4" strokeWidth={2.4} /> Negotiate
              </Link>
              <button
                onClick={() => navigate({ to: "/market/checkout/shipping" })}
                className="h-12 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold text-white"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}
              >
                <CheckCircle2 className="size-4" strokeWidth={2.6} />
                Accept · Start escrow
              </button>
            </div>
            <p
              className="text-center text-[9.5px] mt-1.5 inline-flex items-center justify-center gap-1 w-full"
              style={{ color: t.muted }}
            >
              <Truck className="size-2.5" strokeWidth={2.6} /> Ship-by Jul 18 if accepted today
            </p>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ k, v, t }: { k: string; v: string; t: typeof escrowTheme }) {
  return (
    <div className="flex items-center justify-between text-[11.5px]">
      <span style={{ color: t.sub }}>{k}</span>
      <span
        className="tabular-nums font-medium"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {v}
      </span>
    </div>
  );
}
