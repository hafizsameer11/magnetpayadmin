import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader } from "@/components/admin/UserProfile";
import { WalletOverview } from "@/components/admin/WalletProfile";
import { fetchAdminUser, fetchAdminWalletDetail, type AdminUser, type AdminWalletDetail } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/wallet")({
  head: () => ({ meta: [{ title: "User wallet — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [detail, setDetail] = useState<AdminWalletDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [u, d] = await Promise.all([fetchAdminUser(id), fetchAdminWalletDetail(id)]);
        setUser(u);
        setDetail(d);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load wallet");
        setUser(null);
        setDetail(null);
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

  if (!user || !detail) {
    return (
      <AdminShell title="Wallet" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>User or wallet not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: detail.user.name, to: `/admin/users/${detail.user.id}` },
        { label: "Wallet" },
      ]}
    >
      <UserHeader user={user} />
      <div className="mt-5">
        <WalletOverview detail={detail} />
      </div>
      <Link
        to="/admin/wallets/$userId"
        params={{ userId: detail.user.id }}
        className="inline-block mt-4 text-[12px] font-semibold"
        style={{ color: T.navy }}
      >
        Open full wallet admin →
      </Link>
    </AdminShell>
  );
}
