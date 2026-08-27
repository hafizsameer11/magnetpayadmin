import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Truck, Package, Ship, CheckCircle2, Camera } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/orders/$id/dispatch")({
  head: () => ({ meta: [{ title: "Dispatch — Seller" }] }),
  component: Dispatch,
});

function Dispatch() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"ready" | "picked" | "dispatched">("ready");
  const [cartons, setCartons] = useState("10");
  const [cbm, setCbm] = useState("0.12");
  const [weight, setWeight] = useState("84");
  const [carrier, setCarrier] = useState("Maersk · MagnetPay Sea");
  const [tracking, setTracking] = useState("");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/orders/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Dispatch</p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Phase stepper */}
          <section className="px-4 mt-2">
            <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { k: "ready" as const, I: Package, l: "Ready" },
                  { k: "picked" as const, I: Truck, l: "Picked up" },
                  { k: "dispatched" as const, I: Ship, l: "Dispatched" },
                ].map((p) => {
                  const order = { ready: 0, picked: 1, dispatched: 2 };
                  const on = order[phase] >= order[p.k];
                  return (
                    <div key={p.k} className="flex flex-col items-center gap-1">
                      <div className="size-9 rounded-xl grid place-items-center" style={{ background: on ? t.accent : t.bg, color: on ? "#fff" : t.muted }}>
                        <p.I className="size-4" strokeWidth={2.4} />
                      </div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: on ? t.accent : t.muted }}>{p.l}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: t.bg }}>
                <div className="h-full rounded-full transition-all" style={{ width: phase === "ready" ? "33%" : phase === "picked" ? "66%" : "100%", background: t.accent }} />
              </div>
            </div>
          </section>

          {/* Package details */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Package details</p>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Cartons" v={cartons} setV={setCartons} suffix="ctn" />
              <Stat label="Volume" v={cbm} setV={setCbm} suffix="CBM" />
              <Stat label="Weight" v={weight} setV={setWeight} suffix="kg" />
            </div>
          </section>

          {/* Photos */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Packed photos · proof for buyer</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((n) => (
                <button key={n} onClick={() => toast.success(`Photo ${n} uploaded`)}
                  className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1"
                  style={{ background: t.surface, border: `1.5px dashed ${t.border}`, color: t.muted }}>
                  <Camera className="size-5" strokeWidth={2.2} />
                  <p className="text-[9.5px] font-bold">Add</p>
                </button>
              ))}
            </div>
          </section>

          {/* Carrier */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Carrier & tracking</p>
            <div className="space-y-2">
              <div className="rounded-2xl px-3 py-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Carrier</p>
                <input value={carrier} onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-transparent text-[12px] font-bold outline-none mt-0.5" />
              </div>
              <div className="rounded-2xl px-3 py-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Tracking / B/L #</p>
                <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="MAEU-123456789"
                  className="w-full bg-transparent text-[12px] font-extrabold tabular-nums outline-none mt-0.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </div>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6 space-y-2">
            {phase === "ready" && (
              <button onClick={() => { setPhase("picked"); toast.success("Marked ready to ship · buyer notified"); }}
                className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <CheckCircle2 className="size-4" strokeWidth={2.6} /> Mark ready to ship
              </button>
            )}
            {phase === "picked" && (
              <button onClick={() => { setPhase("dispatched"); toast.success("Confirmed pickup · awaiting B/L"); }}
                className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent }}>
                <Truck className="size-4" strokeWidth={2.6} /> Confirm carrier pickup
              </button>
            )}
            {phase === "dispatched" && (
              <button onClick={() => { toast.success("Dispatched · upload B/L next"); navigate({ to: "/seller/orders/$id/docs", params: { id } }); }}
                className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent }}>
                <Ship className="size-4" strokeWidth={2.6} /> Upload shipping docs
              </button>
            )}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Stat({ label, v, setV, suffix }: { label: string; v: string; setV: (s: string) => void; suffix: string }) {
  const t = escrowTheme;
  return (
    <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <input value={v} onChange={(e) => setV(e.target.value)} inputMode="decimal"
          className="w-full bg-transparent text-[16px] font-extrabold tabular-nums outline-none"
          style={{ fontFamily: "'JetBrains Mono', monospace" }} />
        <p className="text-[10px] font-bold shrink-0" style={{ color: t.muted }}>{suffix}</p>
      </div>
    </div>
  );
}
