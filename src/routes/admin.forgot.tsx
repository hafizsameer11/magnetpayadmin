import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ArrowRight } from "lucide-react";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { T } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/forgot")({
  head: () => ({ meta: [{ title: "Forgot password — MagnetPay Admin" }] }),
  component: AdminForgot,
});

function AdminForgot() {
  return (
    <AdminAuthLayout
      title="Admin sign-in help"
      subtitle="Staff accounts use phone + passcode authentication."
      footer={
        <Link to="/admin/login" className="font-semibold" style={{ color: T.navy }}>
          ← Back to sign in
        </Link>
      }
    >
      <div className="p-5 rounded-xl flex gap-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="size-9 shrink-0 rounded-lg grid place-items-center" style={{ background: `${T.info}18`, color: T.info }}>
          <Mail className="size-5" strokeWidth={2.4} />
        </div>
        <div className="text-[12.5px]" style={{ color: T.sub }}>
          <p className="font-semibold" style={{ color: T.ink }}>
            Password reset is not available
          </p>
          <p className="mt-1 leading-relaxed">
            Admin login uses your registered phone number and passcode. If you are locked out, contact your platform administrator or IT security to reset access.
          </p>
          <Link
            to="/admin/login"
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold"
            style={{ color: T.navy }}
          >
            Return to sign in <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </AdminAuthLayout>
  );
}
