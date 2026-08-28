import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { WalletDetailBody } from "@/components/admin/MoneyProfiles";
import { fetchAdminWallets, type AdminWallet } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/wallets/$userId")({
  head: () => ({ meta: [{ title: "Wallet detail — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { userId } = Route.useParams();
  const [rows, setRows] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const all = await fetchAdminWallets();
        const filtered = all.filter((w) => w.user.id === userId);
        if (!cancelled) setRows(filtered);
        if (!cancelled && filtered.length === 0) toast.message("No wallets for this user");
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load wallets");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const user = rows[0]?.user;

  if (loading) {
    return (
      <AdminShell title="Wallets" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Wallets", to: "/admin/wallets" }, { label: userId.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell title="Wallets" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Wallets", to: "/admin/wallets" }, { label: userId.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>No wallets found for this user.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Wallets", to: "/admin/wallets" }, { label: user.name }]}
    >
      <WalletDetailBody
        user={user}
        wallets={rows.map((w) => ({ currency: w.currency, balanceMinor: w.balanceMinor, holdMinor: w.holdMinor }))}
      />
    </AdminShell>
  );
}
