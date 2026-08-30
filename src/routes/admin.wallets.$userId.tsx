import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, History } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  WalletAdjustForm,
  WalletBackLink,
  WalletOverview,
  walletRefId,
} from "@/components/admin/WalletProfile";
import {
  adjustAdminWallet,
  fetchAdminWalletDetail,
  freezeAdminWallet,
  type AdminWalletDetail,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/wallets/$userId")({
  head: () => ({ meta: [{ title: "Wallet detail — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { userId } = Route.useParams();
  const [detail, setDetail] = useState<AdminWalletDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setDetail(await fetchAdminWalletDetail(userId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load wallet");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const onAdjust = async (payload: { currency: string; amountMajor: string; direction: "credit" | "debit"; note: string }) => {
    const major = Number(payload.amountMajor);
    if (!Number.isFinite(major) || major <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (payload.note.trim().length < 3) {
      toast.error("Add a note for the adjustment");
      return;
    }
    setBusy(true);
    try {
      await adjustAdminWallet(userId, {
        currency: payload.currency,
        amountMinor: Math.round(major * 100),
        direction: payload.direction,
        note: payload.note.trim(),
      });
      toast.success("Wallet adjusted");
      setShowAdjust(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Adjustment failed");
    } finally {
      setBusy(false);
    }
  };

  const onToggleFreeze = async () => {
    if (!detail) return;
    const frozen = detail.status === "frozen";
    const ok = window.confirm(frozen ? "Unfreeze this user's wallet access?" : "Freeze this user's wallet access?");
    if (!ok) return;
    setBusy(true);
    try {
      await freezeAdminWallet(userId, !frozen, frozen ? "Unfrozen from wallet admin" : "Frozen from wallet admin");
      toast.success(frozen ? "User unfrozen" : "User frozen");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update access");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Wallet" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Wallets", to: "/admin/wallets" }, { label: userId.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!detail) {
    return (
      <AdminShell title="Wallet" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Wallets", to: "/admin/wallets" }, { label: userId.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>No wallets found for this user.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={detail.user.name}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Wallets", to: "/admin/wallets" },
        { label: walletRefId(detail.user.id) },
      ]}
      actions={
        <>
          <Link
            to="/admin/ledger"
            search={{ userId: detail.user.id }}
            className="h-9 px-3 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            <History className="size-3.5" strokeWidth={2.2} /> Ledger
          </Link>
          <Link
            to="/admin/users/$id"
            params={{ id: detail.user.id }}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white inline-flex items-center gap-1.5"
            style={{ background: T.navy }}
          >
            View user
          </Link>
        </>
      }
    >
      <WalletBackLink />
      {showAdjust ? (
        <div className="max-w-md mb-4">
          <WalletAdjustForm
            currencies={detail.wallets.map((w) => w.currency)}
            busy={busy}
            onSubmit={(p) => void onAdjust(p)}
            onCancel={() => setShowAdjust(false)}
          />
        </div>
      ) : null}
      <WalletOverview
        detail={detail}
        busy={busy}
        onAdjust={() => setShowAdjust(true)}
        onToggleFreeze={() => void onToggleFreeze()}
      />
    </AdminShell>
  );
}
