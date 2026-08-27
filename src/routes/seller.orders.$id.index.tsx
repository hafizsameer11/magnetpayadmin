import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, FileText, Package, Ship, FileCheck2, ChevronRight, MessageCircle, CheckCircle2, Clock, MapPin, Truck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/orders/$id/")({
  head: () => ({ meta: [{ title: "Order — Seller" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const { id } = Route.useParams();

  const timeline = [
    { l: "Order placed", s: "Buyer funded escrow", t: "Mon 24 Jun", done: true },
    { l: "Pro-forma invoice", s: "PI-4831 sent · accepted", t: "Tue 25 Jun", done: true },
    { l: "In production", s: "Batch 1 of 2 complete", t: "Today", done: true, current: true },
    { l: "Ready to ship", s: "Awaiting carrier pickup", t: "—", done: false },
    { l: "Dispatched", s: "B/L uploaded to buyer", t: "—", done: false },
    { l: "Delivered", s: "POD signed", t: "—", done: false },
  ];

  const docs = [
    { I: FileText, l: "Pro-forma invoice", s: "PI-4831 · ¥48,600", to: "/seller/orders/$id/proforma" as const, ready: true },
    { I: Package, l: "Packing list", s: "10 cartons · 0.12 CBM", to: "/seller/orders/$id/docs" as const, ready: true },
    { I: Ship, l: "Bill of Lading", s: "Upload after dispatch", to: "/seller/orders/$id/docs" as const, ready: false },
    { I: FileCheck2, l: "Customs invoice & HS codes", s: "Required for SGS", to: "/seller/orders/$id/docs" as const, ready: false },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/orders" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Order</p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{id}</p>
            </div>
            <Link to="/messages/$id" params={{ id: "t1" }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <MessageCircle className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          {/* Hero */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4" style={{ background: t.navy, color: "#fff" }}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.65)" }}>Escrow held</p>
              <p className="mt-1 text-[28px] font-extrabold leading-none tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥48,600</p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="size-9 rounded-xl grid place-items-center font-extrabold text-[12px]" style={{ background: "rgba(255,255,255,0.12)" }}>AT</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-extrabold">Adekunle Trading</p>
                  <p className="text-[10.5px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <MapPin className="size-3" strokeWidth={2.4} /> Lagos, Nigeria
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: t.accent }}>In production</span>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="px-4 mt-3 grid grid-cols-3 gap-2">
            <Quick to={`/seller/orders/${id}/proforma`} I={FileText} l="Pro-forma" />
            <Quick to={`/seller/orders/${id}/dispatch`} I={Truck} l="Dispatch" />
            <Quick to={`/seller/orders/${id}/docs`} I={Ship} l="Shipping docs" />
          </section>

          {/* Items */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Items</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-12 rounded-xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                <Package className="size-5" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold truncate">Cast-iron pump body PB-A2</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>200 units · ¥243 / unit</p>
              </div>
              <p className="text-[13px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥48,600</p>
            </div>
          </section>

          {/* Timeline */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Fulfillment timeline</p>
            <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {timeline.map((step, i, a) => {
                const c = step.current ? t.accent : step.done ? t.success : t.border;
                const I = step.done ? CheckCircle2 : Clock;
                return (
                  <div key={step.l} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-6 rounded-full grid place-items-center" style={{ background: `${c}15`, color: c }}>
                        <I className="size-3.5" strokeWidth={2.6} />
                      </div>
                      {i < a.length - 1 && <div className="w-px flex-1 mt-1 mb-1" style={{ background: t.border }} />}
                    </div>
                    <div className={`flex-1 ${i < a.length - 1 ? "pb-3" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold" style={{ color: step.current ? t.accent : step.done ? t.ink : t.muted }}>{step.l}</p>
                        <p className="text-[10px]" style={{ color: t.muted }}>{step.t}</p>
                      </div>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{step.s}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Docs */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Documents</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {docs.map((d, i, a) => (
                <Link key={d.l} to={d.to} params={{ id }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${d.ready ? t.success : t.muted}15`, color: d.ready ? t.success : t.muted }}>
                    <d.I className="size-4" strokeWidth={2.4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold">{d.l}</p>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>{d.s}</p>
                  </div>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${d.ready ? t.success : t.warn}15`, color: d.ready ? t.success : t.warn }}>
                    {d.ready ? "Ready" : "Needed"}
                  </span>
                  <ChevronRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
                </Link>
              ))}
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <Link to="/seller/orders/$id/dispatch" params={{ id }}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <Truck className="size-4" strokeWidth={2.6} /> Mark ready to ship
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Quick({ to, I, l }: { to: string; I: any; l: string }) {
  const t = escrowTheme;
  return (
    <Link to={to} className="rounded-2xl p-2.5 flex flex-col items-center gap-1.5"
      style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${t.navy}0d`, color: t.navy }}>
        <I className="size-4" strokeWidth={2.4} />
      </div>
      <p className="text-[10.5px] font-bold">{l}</p>
    </Link>
  );
}
