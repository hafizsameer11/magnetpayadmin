import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound } from "lucide-react";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { T } from "@/components/admin/AdminShell";
import { adminLogin } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin sign-in — MagnetPay" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@magnetpay.test");
  const [password, setPassword] = useState("123456");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      toast.success("Signed in");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  const field: React.CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    color: T.ink,
  };

  return (
    <AdminAuthLayout
      title="Sign in to Admin"
      subtitle="Use your MagnetPay staff credentials. SSO available for approved teams."
      footer={
        <div className="flex items-center justify-between">
          <span>Need access?</span>
          <a href="mailto:itsec@magnetpay.io" className="font-semibold" style={{ color: T.navy }}>
            Contact IT Security →
          </a>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.sub }}>
            Work email
          </label>
          <div className="mt-1.5 flex items-center gap-2 h-11 px-3 rounded-lg" style={field}>
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

        <div>
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.sub }}>
              Password
            </label>
            <Link to="/admin/forgot" className="text-[11.5px] font-semibold" style={{ color: T.navy }}>
              Forgot?
            </Link>
          </div>
          <div className="mt-1.5 flex items-center gap-2 h-11 px-3 rounded-lg" style={field}>
            <Lock className="size-4" strokeWidth={2.2} style={{ color: T.muted }} />
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="size-7 grid place-items-center rounded-md"
              aria-label={show ? "Hide password" : "Show password"}
              style={{ color: T.muted }}
            >
              {show ? <EyeOff className="size-4" strokeWidth={2.2} /> : <Eye className="size-4" strokeWidth={2.2} />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-[12px]" style={{ color: T.sub }}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ accentColor: T.navy }}
          />
          Trust this device for 7 days
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg flex items-center justify-center gap-1.5 text-[13px] font-bold text-white transition disabled:opacity-60"
          style={{ background: T.navy }}
        >
          {submitting ? "Signing in…" : "Continue"}
          {!submitting && <ArrowRight className="size-4" strokeWidth={2.6} />}
        </button>

        <div className="flex items-center gap-3" aria-hidden>
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            or
          </span>
          <div className="flex-1 h-px" style={{ background: T.border }} />
        </div>

        <button
          type="button"
          className="w-full h-11 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <KeyRound className="size-4" strokeWidth={2.2} />
          Continue with SSO
        </button>
      </form>
    </AdminAuthLayout>
  );
}
