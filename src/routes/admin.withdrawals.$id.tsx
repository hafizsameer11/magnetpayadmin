import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { WithdrawalDetailBody } from "@/components/admin/MoneyProfiles";
import { decideWithdrawal, fetchAdminWithdrawals, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/withdrawals/$id")({
  head: () => ({ meta: [{ title: "Withdrawal — MagnetPay Admin" }] }),
  component: Page,
});

type Row = {
  id: string;
  status: string;
  currency: string;
  amountMinor: string | number;
  createdAt: string;
  destination?: string;
  rail?: string;
  providerRef?: string | null;
  user?: { id: string; name: string; phone: string };
};

function isPending(status: string) {
  const s = status.toUpperCase();
  return s === "PENDING" || s === "PROCESSING" || s === "REVIEW";
}

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchAdminWithdrawals();
      setRow((list as Row[]).find((r) => r.id === id) ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const decide = async (status: "APPROVED" | "REJECTED") => {
    if (busy) return;
    setBusy(true);
    try {
      await decideWithdrawal(id, status);
      toast.success(status === "APPROVED" ? "Withdrawal approved" : "Withdrawal rejected");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Withdrawal" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Withdrawals", to: "/admin/withdrawals" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title={id.slice(0, 8)} breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Withdrawals", to: "/admin/withdrawals" }, { label: id.slice(0, 8) }]}>
        <div className="rounded-xl p-5 space-y-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[13px]" style={{ color: T.muted }}>
            No matching withdrawal for <span className="font-mono font-semibold">{id}</span>.
          </p>
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => void decide("APPROVED")} className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: T.success }}>
              <Check className="size-3.5" /> Approve
            </button>
            <button disabled={busy} onClick={() => void decide("REJECTED")} className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: T.danger }}>
              <X className="size-3.5" /> Reject
            </button>
          </div>
          <Link to="/admin/withdrawals" className="text-[11px] font-semibold" style={{ color: T.sub }}>
            Back to queue
          </Link>
        </div>
      </AdminShell>
    );
  }

  const pending = isPending(row.status);

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Withdrawals", to: "/admin/withdrawals" }, { label: row.id.slice(0, 8) }]}
    >
      <WithdrawalDetailBody
        row={row}
        actions={
          pending ? (
            <>
              <button disabled={busy} onClick={() => void decide("APPROVED")} className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: T.success }}>
                <Check className="size-3.5" /> Approve
              </button>
              <button disabled={busy} onClick={() => void decide("REJECTED")} className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: T.danger }}>
                <X className="size-3.5" /> Reject
              </button>
            </>
          ) : null
        }
      />
      <p className="mt-2 text-[11px]" style={{ color: T.muted }}>
        Amount: {fmtMoney(row.currency, row.amountMinor)}
      </p>
    </AdminShell>
  );
}
