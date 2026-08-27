import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  Scale,
  Cookie,
  Globe2,
  Download,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/legal")({
  head: () => ({ meta: [{ title: "Legal — MagnetPay" }] }),
  component: Legal,
});

function Legal() {
  const t = escrowTheme;

  const docs = [
    { I: FileText, k: "Terms of Service", v: "Updated 4 Jun 2026" },
    { I: ShieldCheck, k: "Privacy policy", v: "Updated 4 Jun 2026" },
    { I: Scale, k: "AML & sanctions policy", v: "Updated 12 May 2026" },
    { I: Scale, k: "Escrow rules & dispute resolution", v: "v3.2" },
    { I: Cookie, k: "Cookies & tracking", v: "Updated 4 Jun 2026" },
    { I: Globe2, k: "Acceptable use policy", v: "Updated 14 Feb 2026" },
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
            <p className="text-[13px] font-bold">Legal</p>
            <div className="size-9" />
          </header>

          <section className="px-4">
            <div
              className="rounded-2xl p-4"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <p
                className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
                style={{ color: t.muted }}
              >
                Operated by
              </p>
              <p className="text-[14px] font-bold mt-0.5">MagnetPay Technologies Ltd.</p>
              <p className="text-[11px] mt-1.5 leading-snug" style={{ color: t.sub }}>
                25 Marina Road, Lagos Island, Nigeria · CAC RC-1842901
                <br />
                Licensed by the Central Bank of Nigeria · MMO 0042/24
              </p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Policies & agreements
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              {docs.map((d, i) => (
                <button
                  key={d.k}
                  onClick={() => toast(`${d.k} — opening latest version`)}
                  className="w-full px-3.5 py-3 flex items-center gap-3"
                  style={{ borderTop: i > 0 ? `1px solid ${t.border}` : "none" }}
                >
                  <div
                    className="size-8 rounded-lg grid place-items-center shrink-0"
                    style={{ background: `${t.navy}08`, color: t.navy }}
                  >
                    <d.I className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[12.5px] font-bold leading-tight">{d.k}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                      {d.v}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4"
                    strokeWidth={2.4}
                    style={{ color: t.muted }}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Your data
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <button onClick={() => toast.success("Export requested · email within 7 days")} className="w-full px-3.5 py-3 flex items-center gap-3">
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <Download className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[12.5px] font-bold">Request a data export</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    JSON + PDF of your account · within 7 days
                  </p>
                </div>
                <ChevronRight
                  className="size-4"
                  strokeWidth={2.4}
                  style={{ color: t.muted }}
                />
              </button>
              <Link
                to="/settings/account"
                className="w-full px-3.5 py-3 flex items-center gap-3"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.danger}10`, color: t.danger }}
                >
                  <ShieldCheck className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className="text-[12.5px] font-bold"
                    style={{ color: t.danger }}
                  >
                    Delete my account
                  </p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    Permanent · subject to AML record-keeping rules
                  </p>
                </div>
                <ChevronRight
                  className="size-4"
                  strokeWidth={2.4}
                  style={{ color: t.muted }}
                />
              </Link>
            </div>
          </section>

          <p
            className="text-center text-[9.5px] mt-5"
            style={{ color: t.muted }}
          >
            © 2026 MagnetPay Technologies Ltd. All rights reserved.
          </p>
        </div>
      </PhoneFrame>
    </>
  );
}
