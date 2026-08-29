import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { getSessionUser } from "@/lib/session";

export const Route = createFileRoute("/admin/me")({
  head: () => ({ meta: [{ title: "Me — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const me = getSessionUser();

  return (
    <AdminShell
      title="My account"
      description="Signed-in admin session."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Me" }]}
    >
      {me ? (
        <div className="rounded-xl p-5 max-w-md space-y-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {[
            ["Name", me.name ?? "—"],
            ["Role", me.platformRole ?? "—"],
            ["Phone", me.phone ?? "—"],
            ["Email", me.email ?? "—"],
            ["User ID", me.id ?? "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                {label}
              </p>
              <p className="mt-1 text-[13px] font-semibold tabular-nums" style={{ fontFamily: label === "User ID" ? "'JetBrains Mono', monospace" : undefined }}>
                {val}
              </p>
            </div>
          ))}
          {me.id ? (
            <Link to="/admin/users/$id" params={{ id: me.id }} className="inline-block text-[12px] font-semibold" style={{ color: T.navy }}>
              Open full user profile →
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[13px] font-semibold" style={{ color: T.ink }}>Not signed in</p>
          <Link to="/admin/login" className="inline-block mt-4 text-[12px] font-semibold" style={{ color: T.navy }}>
            Sign in →
          </Link>
        </div>
      )}
    </AdminShell>
  );
}
