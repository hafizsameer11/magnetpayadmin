import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, MapPin, Calendar, User, Phone, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/logistics/booking/")({
  head: () => ({ meta: [{ title: "Booking · Pickup — Logistics" }] }),
  component: BookingPickup,
});

function BookingPickup() {
  useRoleGuard(["buyer", "both"], "Logistics booking is for buyers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [date, setDate] = useState("2026-07-02");
  const [contact, setContact] = useState("Mei Lin");
  const [phone, setPhone] = useState("+86 138 0013 8000");
  const [addr, setAddr] = useState("Building 7, Baiyun Industrial Park, Guangzhou");
  const [notes, setNotes] = useState("");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/logistics/quote/compare" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Step 1 of 2</p>
              <p className="text-[13px] font-bold">Pickup details</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2">
            <div className="flex items-center gap-1.5">
              {["Pickup", "Docs", "Confirm"].map((l, i) => (
                <div key={l} className="flex-1 flex flex-col gap-1">
                  <div className="h-1 rounded-full" style={{ background: i === 0 ? t.accent : t.border }} />
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-center" style={{ color: i === 0 ? t.accent : t.muted }}>{l}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Pickup address</p>
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <MapPin className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.accent }} />
              <textarea value={addr} onChange={(e) => setAddr(e.target.value)} rows={2}
                className="flex-1 bg-transparent text-[12.5px] font-semibold outline-none resize-none" />
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Pickup date</p>
            <label className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Calendar className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="flex-1 bg-transparent text-[13px] font-bold outline-none" />
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Morning", "Afternoon", "Evening", "Any time"].map((s, i) => (
                <button key={s} className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: i === 0 ? t.accent : t.surface, color: i === 0 ? "#fff" : t.ink, border: `1px solid ${i === 0 ? t.accent : t.border}` }}>{s}</button>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Contact at pickup</p>
            <div className="rounded-2xl divide-y" style={{ background: t.surface, border: `1px solid ${t.border}`, borderColor: t.border }}>
              <div className="flex items-center gap-2.5 p-3">
                <User className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                <input value={contact} onChange={(e) => setContact(e.target.value)} className="flex-1 bg-transparent text-[13px] font-semibold outline-none" />
              </div>
              <div className="flex items-center gap-2.5 p-3" style={{ borderTop: `1px solid ${t.border}` }}>
                <Phone className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 bg-transparent text-[13px] font-semibold outline-none tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </div>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Notes for driver (optional)</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Gate code, loading dock, fragile handling..."
              className="w-full rounded-2xl p-3 text-[12.5px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/logistics/booking/docs" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              Continue to docs <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
