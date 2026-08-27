import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/splash")({
  head: () => ({ meta: [{ title: "MagnetPay — Welcome" }] }),
  component: Splash,
});

function Splash() {
  const navy = "#0E3B2E";
  const bg = "#F6F1E7";
  const ivory = "#EFE9D9";
  const accent = "#C2410C";

  const [resume, setResume] = useState<{ to: "/signup" | "/welcome"; label: string } | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("v8.onboardingDone")) return;
    const role = window.localStorage.getItem("v8.role");
    const locale = window.localStorage.getItem("v8.locale");
    if (role === "buyer" || role === "seller" || role === "both") {
      setResume({ to: "/signup", label: "Resume onboarding" });
    } else if (locale === "en" || locale === "zh") {
      setResume({ to: "/welcome", label: "Continue where you left off" });
    }
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={navy}>
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            background: `radial-gradient(120% 80% at 50% 10%, #14513E 0%, ${navy} 55%, #082A20 100%)`,
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* decorative grid lines */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          {/* soft glow */}
          <div
            className="absolute -top-24 -right-24 size-[340px] rounded-full"
            style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 65%)` }}
          />

          {/* top wordmark */}
          <div className="absolute top-14 inset-x-0 flex justify-center">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.32em]"
              style={{ color: "#C8C2B0" }}
            >
              MagnetPay · v1
            </span>
          </div>

          {/* center logo + name */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div
              className="relative size-[96px] rounded-[28px] grid place-items-center mb-6"
              style={{
                background: ivory,
                boxShadow: `0 24px 60px -20px ${accent}80, 0 0 0 1px rgba(255,255,255,0.08)`,
              }}
            >
              {/* magnet glyph */}
              <svg viewBox="0 0 64 64" className="size-12" fill="none">
                <path
                  d="M16 12h10v22a6 6 0 0 0 12 0V12h10v22a16 16 0 0 1-32 0V12Z"
                  fill={navy}
                />
                <rect x="16" y="12" width="10" height="8" fill={accent} />
                <rect x="38" y="12" width="10" height="8" fill={accent} />
              </svg>
            </div>
            <h1
              className="text-[44px] leading-[0.95] font-black tracking-tight"
              style={{ fontFeatureSettings: "'ss01'" }}
            >
              MagnetPay
            </h1>
            <p
              className="mt-3 text-[13px] leading-snug max-w-[260px]"
              style={{ color: "#C8C2B0" }}
            >
              Trade, pay and ship between Nigeria and China — safely, in one app.
            </p>
          </div>

          {/* bottom CTA */}
          <div className="absolute bottom-12 inset-x-0 px-6">
            {resume ? (
              <>
                <Link
                  to={resume.to}
                  className="block w-full h-12 rounded-2xl text-center leading-[48px] text-[13px] font-bold"
                  style={{ background: accent, color: "#fff" }}
                >
                  {resume.label}
                </Link>
                <Link
                  to="/locale"
                  className="mt-2 block w-full h-11 rounded-2xl text-center leading-[44px] text-[12px] font-bold"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  Start over
                </Link>
              </>
            ) : (
              <Link
                to="/locale"
                className="block w-full h-12 rounded-2xl text-center leading-[48px] text-[13px] font-bold"
                style={{ background: "#FFFFFF", color: navy }}
              >
                Get started · 开始
              </Link>
            )}
            <Link
              to="/login"
              className="mt-2 block w-full h-11 rounded-2xl text-center leading-[44px] text-[12px] font-bold"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              I already have an account · Log in
            </Link>

            <p
              className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#C8C2B0" }}
            >
              Licensed in NG · Partner banks in CN
            </p>
          </div>

          {/* loader dot pulse */}
          <div className="absolute top-[58%] left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full"
                style={{
                  background: "#FFFFFF",
                  opacity: 0.3 + i * 0.2,
                  animation: `pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>

          <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.9}}`}</style>
        </div>
      </PhoneFrame>
    </>
  );
}
