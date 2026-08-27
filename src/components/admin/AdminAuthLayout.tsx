import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { T } from "./AdminShell";
import { ShieldCheck } from "lucide-react";

export function AdminAuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <div
        className="min-h-screen w-full flex"
        style={{ background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif" }}
      >
        {/* Brand panel */}
        <aside
          className="hidden md:flex w-[44%] max-w-[560px] flex-col justify-between p-10"
          style={{ background: T.navy, color: "#EFE9D9" }}
        >
          <Link to="/admin" className="flex items-center gap-2.5">
            <div
              className="size-9 rounded-lg grid place-items-center text-[15px] font-bold"
              style={{ background: T.accent, color: "#fff" }}
            >
              M
            </div>
            <div>
              <p className="text-[15px] font-bold leading-tight">MagnetPay</p>
              <p
                className="text-[9.5px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#C8C2B0" }}
              >
                Admin Console
              </p>
            </div>
          </Link>

          <div className="space-y-5">
            <div
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: "rgba(255,255,255,0.10)", color: "#EFE9D9" }}
            >
              <ShieldCheck className="size-3" strokeWidth={2.6} />
              Restricted access
            </div>
            <h2 className="text-[28px] font-bold leading-[1.15] max-w-[18ch]">
              Run the NG–CN corridor with one operations cockpit.
            </h2>
            <p className="text-[13px] leading-relaxed max-w-[40ch]" style={{ color: "#C8C2B0" }}>
              Sign in to review escrow contracts, resolve disputes, monitor FX flows and
              keep liquidity healthy across markets.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { k: "Escrow held", v: "$3.2M" },
              { k: "Open disputes", v: "12" },
              { k: "FX 24h", v: "$842K" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-lg p-3"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "#C8C2B0" }}
                >
                  {s.k}
                </p>
                <p
                  className="mt-1 text-[16px] font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[400px]">
            <div className="md:hidden mb-8 flex items-center gap-2.5">
              <div
                className="size-9 rounded-lg grid place-items-center text-[15px] font-bold"
                style={{ background: T.accent, color: "#fff" }}
              >
                M
              </div>
              <div>
                <p className="text-[14px] font-bold leading-tight">MagnetPay Admin</p>
              </div>
            </div>

            <h1 className="text-[24px] font-bold leading-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-[13px]" style={{ color: T.sub }}>
                {subtitle}
              </p>
            )}

            <div className="mt-7">{children}</div>

            {footer && (
              <div className="mt-6 text-[12px]" style={{ color: T.sub }}>
                {footer}
              </div>
            )}

            <p className="mt-12 text-[10.5px]" style={{ color: T.muted }}>
              © MagnetPay 2026 · Staff access only · All sessions are audited.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
