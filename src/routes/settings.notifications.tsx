import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Bell, Mail, MessageSquare } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MagnetPay" }] }),
  component: Notifications,
});

type Channels = { push: boolean; email: boolean; sms: boolean };
type Row = { key: string; label: string; hint: string; c: Channels };

function Notifications() {
  const t = escrowTheme;
  const [rows, setRows] = useState<Row[]>([
    { key: "orders", label: "Orders & escrow", hint: "Payment, production, B/L, release", c: { push: true, email: true, sms: true } },
    { key: "rfq", label: "RFQs & quotes", hint: "New quotes, counter-offers, expiry", c: { push: true, email: true, sms: false } },
    { key: "ship", label: "Shipments", hint: "Pickup, ETA changes, customs, delivery", c: { push: true, email: true, sms: false } },
    { key: "fx", label: "FX & balance", hint: "Rate alerts, top-ups, payouts", c: { push: true, email: false, sms: false } },
    { key: "msgs", label: "Messages", hint: "Replies from suppliers and support", c: { push: true, email: false, sms: false } },
    { key: "promo", label: "Promotions", hint: "Featured suppliers, fee discounts", c: { push: false, email: true, sms: false } },
  ]);
  const [quiet, setQuiet] = useState(true);

  const toggle = (key: string, ch: keyof Channels) =>
    setRows((rs) =>
      rs.map((r) => (r.key === key ? { ...r, c: { ...r.c, [ch]: !r.c[ch] } } : r)),
    );

  const Cell = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="size-6 rounded-md grid place-items-center"
      style={{
        background: on ? t.navy : "transparent",
        border: `1.5px solid ${on ? t.navy : t.border}`,
      }}
    >
      {on && (
        <svg viewBox="0 0 12 12" className="size-3" fill="none">
          <path d="M2.5 6.5l2.5 2.5L9.5 4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-8"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to="/me"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[13px] font-bold">Notifications</p>
            <div className="size-9" />
          </header>

          <section className="px-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div
                className="px-3.5 py-2.5 grid grid-cols-[1fr_repeat(3,auto)] gap-3 items-center"
                style={{ background: `${t.navy}06`, borderBottom: `1px solid ${t.border}` }}
              >
                <span
                  className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: t.muted }}
                >
                  Event
                </span>
                {[Bell, Mail, MessageSquare].map((I, i) => (
                  <I
                    key={i}
                    className="size-3.5"
                    strokeWidth={2.4}
                    style={{ color: t.sub }}
                  />
                ))}
              </div>
              {rows.map((r, i) => (
                <div
                  key={r.key}
                  className="px-3.5 py-3 grid grid-cols-[1fr_repeat(3,auto)] gap-3 items-center"
                  style={{ borderTop: i > 0 ? `1px solid ${t.border}` : "none" }}
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold leading-tight">{r.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>
                      {r.hint}
                    </p>
                  </div>
                  <Cell on={r.c.push} onClick={() => toggle(r.key, "push")} />
                  <Cell on={r.c.email} onClick={() => toggle(r.key, "email")} />
                  <Cell on={r.c.sms} onClick={() => toggle(r.key, "sms")} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px]" style={{ color: t.muted }}>
              <span className="inline-flex items-center gap-1">
                <Bell className="size-3" strokeWidth={2.4} /> Push
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3" strokeWidth={2.4} /> Email
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="size-3" strokeWidth={2.4} /> SMS
              </span>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Quiet hours
            </p>
            <div
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div className="flex-1">
                <p className="text-[12.5px] font-bold">22:00 — 07:00 (WAT)</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                  Mute push during these hours. Urgent escrow alerts always ring.
                </p>
              </div>
              <button
                onClick={() => setQuiet((v) => !v)}
                className="relative w-10 h-6 rounded-full shrink-0"
                style={{ background: quiet ? t.navy : "#d4ccba" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform"
                  style={{ transform: quiet ? "translateX(16px)" : "translateX(0)" }}
                />
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
