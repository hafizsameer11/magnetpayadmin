import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { TxnDetailBody } from "@/components/admin/MoneyProfiles";
import { fetchAdminTransfers, type AdminTransfer } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/transactions/$id")({
  head: () => ({ meta: [{ title: "Transaction — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminTransfer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminTransfers()
      .then((list) => setRow(list.find((t) => t.id === id) ?? null))
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load transfer");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Transaction" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Transactions", to: "/admin/transactions" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Transaction" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Transactions", to: "/admin/transactions" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>
          Transfer not found.
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Transactions", to: "/admin/transactions" }, { label: row.id.slice(0, 8) }]}
    >
      <TxnDetailBody
        id={row.id}
        status={row.status}
        currency={row.currency}
        amountMinor={row.amountMinor}
        nombaRef={row.nombaRef}
        sender={row.sender}
        recipient={row.recipient}
        createdAt={row.createdAt}
      />
    </AdminShell>
  );
}
