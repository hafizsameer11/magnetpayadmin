import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { T } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/forgot")({
  head: () => ({ meta: [{ title: "Forgot password — MagnetPay Admin" }] }),
  component: AdminForgot,
});

function AdminForgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSent(true);
      setSubmitting(false);
    }, 400);
  }

  return (
    <AdminAuthLayout
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? "If the email matches a staff account, a recovery link is on its way."
          : "We'll send a one-time recovery link to your work email."
      }
      footer={
        <Link to="/admin/login" className="font-semibold" style={{ color: T.navy }}>
          ← Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div
          className="p-5 rounded-xl flex gap-3"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <div
            className="size-9 shrink-0 rounded-lg grid place-items-center"
            style={{ background: `${T.success}18`, color: T.success }}
          >
            <CheckCircle2 className="size-5" strokeWidth={2.4} />
          </div>
          <div className="text-[12.5px]" style={{ color: T.sub }}>
            <p className="font-semibold" style={{ color: T.ink }}>
              Recovery email sent
            </p>
            <p className="mt-1 leading-relaxed">
              Sent to <span className="font-semibold" style={{ color: T.ink }}>{email}</span>. The
              link expires in 30 minutes. Didn't get it? Check spam or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-semibold underline underline-offset-2"
                style={{ color: T.navy }}
              >
                try again
              </button>
              .
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.sub }}>
              Work email
            </label>
            <div
              className="mt-1.5 flex items-center gap-2 h-11 px-3 rounded-lg"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
            >
              <Mail className="size-4" strokeWidth={2.2} style={{ color: T.muted }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@magnetpay.io"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-lg flex items-center justify-center gap-1.5 text-[13px] font-bold text-white transition disabled:opacity-60"
            style={{ background: T.navy }}
          >
            {submitting ? "Sending…" : "Send recovery link"}
            {!submitting && <ArrowRight className="size-4" strokeWidth={2.6} />}
          </button>

          <p className="text-[11.5px]" style={{ color: T.muted }}>
            Staff accounts are locked after 5 failed attempts. If you're locked out,
            ping <span className="font-semibold" style={{ color: T.ink }}>#itsec</span>.
          </p>
        </form>
      )}
    </AdminAuthLayout>
  );
}
