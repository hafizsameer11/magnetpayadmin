import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Fingerprint,
  Smartphone,
  ShieldCheck,
  Trash2,
  Monitor,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/settings/security")({
  head: () => ({ meta: [{ title: "Security — MagnetPay" }] }),
  component: Security,
});

function Toggle({ on, onChange, color }: { on: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-10 h-6 rounded-full transition shrink-0"
      style={{ background: on ? color : "#d4ccba" }}
    >
      <span
        className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

function Security() {
  const t = escrowTheme;
  const [bio, setBio] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [hideBal, setHideBal] = useState(false);

  const devices = [
    { I: Smartphone, name: "iPhone 15 · Lagos", when: "This device · active now", current: true },
    { I: Monitor, name: "Chrome · MacBook Pro", when: "Last seen 2h ago · Lagos" },
    { I: Smartphone, name: "Android · Pixel 7", when: "Last seen 4d ago · Abuja" },
  ];

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
            <p className="text-[13px] font-bold">Security</p>
            <div className="size-9" />
          </header>

          <section className="px-4">
            <div
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{ background: `${t.success}10`, border: `1px solid ${t.success}30` }}
            >
              <ShieldCheck
                className="size-5 shrink-0"
                strokeWidth={2.4}
                style={{ color: t.success }}
              />
              <div>
                <p className="text-[12px] font-bold" style={{ color: t.success }}>
                  Your account is well protected
                </p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.sub }}>
                  Passcode + Face ID + 2FA enabled
                </p>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Authentication
            </p>
            <div
              className="rounded-2xl"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <Link
                to="/passcode"
                className="px-3.5 py-3 flex items-center gap-3"
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <KeyRound className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Change passcode</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    6-digit · last changed 41 days ago
                  </p>
                </div>
                <ChevronRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              </Link>
              <div
                className="px-3.5 py-3 flex items-center gap-3"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <Fingerprint className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Face ID / biometrics</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    Required for payments over ¥1,000
                  </p>
                </div>
                <Toggle on={bio} onChange={setBio} color={t.navy} />
              </div>
              <div
                className="px-3.5 py-3 flex items-center gap-3"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <ShieldCheck className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Two-factor authentication</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    SMS to +234 803 555 0144
                  </p>
                </div>
                <Toggle on={twoFA} onChange={setTwoFA} color={t.navy} />
              </div>
              <div
                className="px-3.5 py-3 flex items-center gap-3"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <ShieldCheck className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Hide balance on lock</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    Blur amounts when app is in background
                  </p>
                </div>
                <Toggle on={hideBal} onChange={setHideBal} color={t.navy} />
              </div>
            </div>
          </section>

          {/* Devices */}
          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Active devices
            </p>
            <div
              className="rounded-2xl"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              {devices.map((d, i) => (
                <div
                  key={d.name}
                  className="px-3.5 py-3 flex items-center gap-3"
                  style={{ borderTop: i > 0 ? `1px solid ${t.border}` : "none" }}
                >
                  <div
                    className="size-8 rounded-lg grid place-items-center"
                    style={{ background: `${t.navy}08`, color: t.navy }}
                  >
                    <d.I className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate">{d.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>
                      {d.when}
                    </p>
                  </div>
                  {d.current ? (
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full"
                      style={{ background: `${t.success}15`, color: t.success }}
                    >
                      This
                    </span>
                  ) : (
                    <button style={{ color: t.danger }}>
                      <Trash2 className="size-4" strokeWidth={2.4} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="w-full mt-3 h-11 rounded-2xl text-[12px] font-bold"
              style={{ background: `${t.danger}10`, color: t.danger, border: `1px solid ${t.danger}30` }}
            >
              Sign out of all other devices
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
