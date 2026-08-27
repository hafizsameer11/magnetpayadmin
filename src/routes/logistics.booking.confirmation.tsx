import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Ship, Calendar, MapPin, ArrowRight, Download, Share2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/booking/confirmation")({
  head: () => ({ meta: [{ title: "Booking confirmed — Logistics" }] }),
  component: BookingConfirm,
});

function BookingConfirm() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const id = "SHP-204732";

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28 text-white" style={{ background: t.navy, fontFamily: "'Inter', sans-serif" }}>
          <div className="px-4 pt-16 flex flex-col items-center text-center">
            <div className="size-20 rounded-full grid place-items-center" style={{ background: "#ffffff15", border: "2px solid #ffffff25" }}>
              <CheckCircle2 className="size-10" strokeWidth={2.2} style={{ color: t.success }} />
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Booking confirmed</p>
            <p className="mt-1 text-[22px] font-extrabold leading-tight">Pickup scheduled for Jul 02</p>
            <p className="mt-1.5 text-[12px] opacity-75 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
          </div>

          <div className="px-4 mt-7">
            <div className="rounded-3xl p-4 text-[color:var(--mp-ink)]" style={{ background: t.surface, color: t.ink }}>
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Ship className="size-4" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold">ChinaSea Express · Sea LCL</p>
                  <p className="text-[10.5px]" style={{ color: t.muted }}>Guangzhou → Lagos</p>
                </div>
                <p className="text-[14px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥482</p>
              </div>

              <div className="my-3 h-px" style={{ background: t.border }} />

              <div className="space-y-2.5">
                <Row icon={Calendar} l="Pickup" v="Thu, Jul 02 · Morning" />
                <Row icon={MapPin} l="Origin" v="Baiyun Industrial Park, Guangzhou" />
                <Row icon={MapPin} l="Destination" v="Apapa Warehouse, Lagos" />
                <Row icon={Calendar} l="Estimated arrival" v="Jul 28 – Aug 03" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-[11.5px] font-bold" style={{ background: t.bg, color: t.ink, border: `1px solid ${t.border}` }}>
                  <Download className="size-3.5" strokeWidth={2.5} /> Receipt
                </button>
                <button className="rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-[11.5px] font-bold" style={{ background: t.bg, color: t.ink, border: `1px solid ${t.border}` }}>
                  <Share2 className="size-3.5" strokeWidth={2.5} /> Share
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 mt-4">
            <div className="rounded-2xl p-3 text-[11px] leading-snug" style={{ background: "#ffffff10", border: "1px solid #ffffff20", color: "#ffffffd0" }}>
              We'll notify you when goods leave origin, clear customs, and arrive Lagos. Freight, customs & clearing are estimates — any difference is credited to your ₦ wallet.
            </div>
          </div>

          <div className="sticky bottom-4 left-0 right-0 px-4 mt-6 space-y-2">
            <Link to="/logistics/shipments/$id" params={{ id }}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold py-3.5"
              style={{ background: t.accent, color: "#fff", boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              Track shipment <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link to="/logistics" className="block text-center text-[12px] font-bold opacity-80">Back to logistics</Link>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}

function Row({ icon: Icon, l, v }: { icon: any; l: string; v: string }) {
  const t = escrowTheme;
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
      <div className="flex-1 min-w-0">
        <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>{l}</p>
        <p className="text-[12px] font-semibold truncate">{v}</p>
      </div>
    </div>
  );
}
