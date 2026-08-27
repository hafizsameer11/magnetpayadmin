import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader } from "@/components/admin/UserProfile";
import { fetchAdminUser, fmtMoney, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/wallet")({
  head: () => ({ meta: [{ title: "User wallet — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setUser(await fetchAdminUser(id));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Wallet" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell title="Wallet" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>User not found.</p>
      </AdminShell>
    );
  }

  const wallets = user.wallets ?? [];

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: user.name, to: `/admin/users/${user.id}` },
        { label: "Wallet" },
      ]}
    >
      <UserHeader user={user} />

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        {wallets.map((w) => (
          <div key={w.currency} className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {w.currency} balance
            </p>
            <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtMoney(w.currency, w.balanceMinor)}
            </p>
            {w.holdMinor != null && Number(w.holdMinor) > 0 ? (
              <p className="mt-1 text-[11px]" style={{ color: T.sub }}>
                On hold: {fmtMoney(w.currency, w.holdMinor)}
              </p>
            ) : null}
          </div>
        ))}
        {!wallets.length ? (
          <p className="text-[12px] col-span-full" style={{ color: T.muted }}>
            No wallets for this user.
          </p>
        ) : null}
      </div>

      <Link to="/admin/wallets" className="inline-block mt-4 text-[12px] font-semibold" style={{ color: T.navy }}>
        View all wallets →
      </Link>
    </AdminShell>
  );
}
