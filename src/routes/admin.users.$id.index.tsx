import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill, initials } from "@/components/admin/UserProfile";
import { fetchAdminUser, fmtMoney, patchAdminUser, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/")({
  head: () => ({ meta: [{ title: "User profile — MagnetPay Admin" }] }),
  component: UserDetail,
});

const ROLES = ["BUYER", "SELLER", "BOTH"] as const;

function UserDetail() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("BUYER");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const u = await fetchAdminUser(id);
      setUser(u);
      setRole(u.role);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const saveRole = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await patchAdminUser(user.id, { role });
      toast.success("Role updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell
        title="User"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell
        title="User"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          User not found.
        </p>
      </AdminShell>
    );
  }

  const kyc = user.kycApplications?.[0]?.status;

  return (
    <AdminShell
      title={user.name}
      description={user.phone}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: user.name },
      ]}
    >
      <div className="rounded-xl p-4 flex items-start gap-4 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="size-12 rounded-full grid place-items-center text-[14px] font-bold shrink-0"
          style={{ background: `${T.navy}10`, color: T.navy }}
        >
          {initials(user.name || "?")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-bold">{user.name}</h2>
            <Pill tone="info">{user.role}</Pill>
            <Pill tone="neutral">{user.platformRole}</Pill>
            {kyc ? <Pill tone={kyc === "APPROVED" ? "success" : kyc === "REJECTED" ? "danger" : "warn"}>{kyc}</Pill> : null}
          </div>
          <p className="mt-1 text-[12px] tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
            {user.phone}
            {user.email ? ` · ${user.email}` : ""}
          </p>
          <p className="text-[11px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            {user.id} · joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            Marketplace role
          </p>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            {!ROLES.includes(role as (typeof ROLES)[number]) && <option value={role}>{role}</option>}
          </select>
          <button
            onClick={() => void saveRole()}
            disabled={saving || role === user.role}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: T.navy }}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save role
          </button>
        </div>

        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Wallets
            </p>
            <Link
              to="/admin/wallets/$userId"
              params={{ userId: user.id }}
              className="text-[11px] font-semibold hover:underline"
              style={{ color: T.info }}
            >
              Open wallets →
            </Link>
          </div>
          {(user.wallets ?? []).length === 0 ? (
            <p className="text-[12px]" style={{ color: T.muted }}>
              No wallets.
            </p>
          ) : (
            <ul className="space-y-2">
              {user.wallets!.map((w) => (
                <li key={w.currency} className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold">{w.currency}</span>
                  <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtMoney(w.currency, w.balanceMinor)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
