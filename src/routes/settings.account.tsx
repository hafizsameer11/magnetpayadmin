import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  LogOut,
  Trash2,
  ShieldAlert,
  Download,
  AlertTriangle,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/settings/account")({
  head: () => ({ meta: [{ title: "Log out & account — MagnetPay" }] }),
  component: Account,
});

function Account() {
  const t = escrowTheme;
  const navigate = useNavigate();
  const [step, setStep] = useState<"none" | "logout" | "delete">("none");
  const [confirmText, setConfirmText] = useState("");
  const [working, setWorking] = useState(false);

  const doLogout = async () => {
    setWorking(true);
    await new Promise((r) => setTimeout(r, 400));
    navigate({ to: "/welcome" });
  };

  const doDelete = async () => {
    if (confirmText !== "DELETE") return;
    setWorking(true);
    await new Promise((r) => setTimeout(r, 800));
    navigate({ to: "/welcome" });
  };

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
            <p className="text-[13px] font-bold">Log out & account</p>
            <div className="size-9" />
          </header>

          {/* Log out */}
          <section className="px-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Session
            </p>
            <button
              onClick={() => setStep("logout")}
              className="w-full rounded-2xl p-3.5 flex items-center gap-3 text-left"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div
                className="size-10 rounded-xl grid place-items-center"
                style={{ background: `${t.navy}10`, color: t.navy }}
              >
                <LogOut className="size-5" strokeWidth={2.3} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">Log out of this device</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                  iPhone 15 · Lagos. You'll need your passcode to sign back in.
                </p>
              </div>
            </button>
          </section>

          {/* Backup */}
          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Before you delete
            </p>
            <button
              className="w-full rounded-2xl p-3.5 flex items-center gap-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div
                className="size-10 rounded-xl grid place-items-center"
                style={{ background: `${t.info}10`, color: t.info }}
              >
                <Download className="size-5" strokeWidth={2.3} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-bold">Download a full account export</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                  Orders, escrow, payouts, fapiao · JSON + PDF
                </p>
              </div>
            </button>
          </section>

          {/* Delete */}
          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Danger zone
            </p>
            <div
              className="rounded-2xl p-3.5"
              style={{
                background: `${t.danger}06`,
                border: `1px solid ${t.danger}30`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="size-10 rounded-xl grid place-items-center shrink-0"
                  style={{ background: `${t.danger}15`, color: t.danger }}
                >
                  <ShieldAlert className="size-5" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-[13px] font-bold"
                    style={{ color: t.danger }}
                  >
                    Delete account permanently
                  </p>
                  <p
                    className="text-[10.5px] mt-1 leading-snug"
                    style={{ color: t.sub }}
                  >
                    Open escrows must be released or refunded first. Some records are retained
                    for 7 years under AML rules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep("delete")}
                className="mt-3 w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-[12px] font-bold text-white"
                style={{ background: t.danger }}
              >
                <Trash2 className="size-4" strokeWidth={2.6} /> Delete my account
              </button>
            </div>
          </section>

          {/* Logout sheet */}
          {step === "logout" && (
            <>
              <div
                className="absolute inset-0 z-40"
                style={{ background: "rgba(15,23,42,0.45)" }}
                onClick={() => !working && setStep("none")}
              />
              <div
                className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl p-4 pb-6"
                style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-10 rounded-full grid place-items-center mb-2.5"
                  style={{ background: `${t.navy}12`, color: t.navy }}
                >
                  <LogOut className="size-5" strokeWidth={2.3} />
                </div>
                <p className="text-[14px] font-bold mb-1">Log out of MagnetPay?</p>
                <p className="text-[11.5px] mb-4" style={{ color: t.sub }}>
                  You'll be returned to the welcome screen. Your data stays safe.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("none")}
                    disabled={working}
                    className="flex-1 h-11 rounded-full text-[12px] font-bold"
                    style={{
                      background: t.bg,
                      border: `1px solid ${t.border}`,
                      color: t.ink,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={doLogout}
                    disabled={working}
                    className="flex-1 h-11 rounded-full text-[12px] font-bold text-white disabled:opacity-60"
                    style={{ background: t.navy }}
                  >
                    {working ? "Logging out…" : "Log out"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Delete sheet */}
          {step === "delete" && (
            <>
              <div
                className="absolute inset-0 z-40"
                style={{ background: "rgba(15,23,42,0.45)" }}
                onClick={() => !working && setStep("none")}
              />
              <div
                className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl p-4 pb-6"
                style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-10 rounded-full grid place-items-center mb-2.5"
                  style={{ background: `${t.danger}15`, color: t.danger }}
                >
                  <AlertTriangle className="size-5" strokeWidth={2.3} />
                </div>
                <p className="text-[14px] font-bold mb-1">
                  Delete this account?
                </p>
                <p className="text-[11.5px] mb-3" style={{ color: t.sub }}>
                  This cannot be undone. Type{" "}
                  <span
                    className="font-bold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: t.danger,
                    }}
                  >
                    DELETE
                  </span>{" "}
                  to confirm.
                </p>
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: t.bg,
                    border: `1.5px solid ${
                      confirmText === "DELETE" ? t.danger : t.border
                    }`,
                  }}
                >
                  <input
                    autoFocus
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-transparent outline-none text-[14px] font-bold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: t.ink,
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setStep("none")}
                    disabled={working}
                    className="flex-1 h-11 rounded-full text-[12px] font-bold"
                    style={{
                      background: t.bg,
                      border: `1px solid ${t.border}`,
                      color: t.ink,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={doDelete}
                    disabled={confirmText !== "DELETE" || working}
                    className="flex-1 h-11 rounded-full text-[12px] font-bold text-white disabled:opacity-50"
                    style={{ background: t.danger }}
                  >
                    {working ? "Deleting…" : "Delete forever"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </PhoneFrame>
    </>
  );
}
