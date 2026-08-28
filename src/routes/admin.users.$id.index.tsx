import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, ShoppingBag, Lock, Gavel, Wallet } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  UserHeader,
  Pill,
  fmtUSD,
  walletVolumeUsd,
  roleLabel,
  countryFromPhone,
  kycPill,
} from "@/components/admin/UserProfile";
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
        <p className="text-[13px]" style={{ color: T.muted }}>User not found.</p>
      </AdminShell>
    );
  }

  const country = countryFromPhone(user.phone);
  const vol = walletVolumeUsd(user);
  const walletCount = user.wallets?.length ?? 0;

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: user.name },
      ]}
    >
      <UserHeader user={user} />

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { I: Wallet, label: "Wallet balance (est.)", val: fmtUSD(vol), tone: T.navy },
          { I: ShoppingBag, label: "Wallets", val: String(walletCount), tone: T.info },
          { I: Lock, label: "KYC", val: user.kycApplications?.[0]?.status ?? "None", tone: T.success },
          { I: Gavel, label: "Role", val: roleLabel(user.role), tone: T.accent },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md grid place-items-center" style={{ background: `${s.tone}14`, color: s.tone }}>
                <s.I className="size-3.5" strokeWidth={2.4} />
              </div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{s.label}</p>
            </div>
            <p className="mt-2 text-[18px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {s.val}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            Account
          </p>
          <dl className="space-y-2 text-[12px]">
            <div className="flex justify-between gap-3">
              <dt style={{ color: T.sub }}>Marketplace role</dt>
              <dd className="font-semibold">{roleLabel(user.role)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: T.sub }}>Platform role</dt>
              <dd><Pill tone="neutral">{user.platformRole}</Pill></dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: T.sub }}>Country</dt>
              <dd>{country.flag} {country.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: T.sub }}>KYC</dt>
              <dd>{kycPill(user)}</dd>
            </div>
          </dl>
          <div className="pt-2 border-t" style={{ borderColor: T.border }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
              Change role
            </p>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 px-3 rounded-lg text-[12px] outline-none"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              {!ROLES.includes(role as (typeof ROLES)[number]) && <option value={role}>{role}</option>}
            </select>
            <button
              onClick={() => void saveRole()}
              disabled={saving || role === user.role}
              className="mt-2 h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: T.navy }}
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save role
            </button>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Wallets
            </p>
            <Link to="/admin/users/$id/wallet" params={{ id: user.id }} className="text-[11px] font-semibold hover:underline" style={{ color: T.info }}>
              Full wallet →
            </Link>
          </div>
          {(user.wallets ?? []).length === 0 ? (
            <p className="text-[12px]" style={{ color: T.muted }}>No wallets.</p>
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
          {user.businessProfile ? (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: T.border }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>Business (KYB)</p>
              <p className="text-[13px] font-semibold">{user.businessProfile.companyName}</p>
              <p className="mt-1"><Pill tone={user.businessProfile.status === "APPROVED" ? "success" : "warn"}>{user.businessProfile.status}</Pill></p>
              <Link to="/admin/kyb" className="inline-block mt-2 text-[11px] font-semibold hover:underline" style={{ color: T.navy }}>
                Open KYB queue →
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { to: "/admin/users/$id/orders" as const, label: "Orders", sub: "Purchase history" },
          { to: "/admin/users/$id/escrow" as const, label: "Escrow", sub: "Active contracts" },
          { to: "/admin/users/$id/tickets" as const, label: "Support", sub: "Conversations" },
        ].map((link) => (
          <Link
            key={link.label}
            to={link.to}
            params={{ id: user.id }}
            className="rounded-xl p-4 hover:bg-[rgba(14,59,46,0.02)] transition"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <p className="text-[13px] font-bold" style={{ color: T.navy }}>{link.label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>{link.sub}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
