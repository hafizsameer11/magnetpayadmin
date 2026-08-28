import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { DepositDetailBody } from "@/components/admin/MoneyProfiles";
import { fetchAdminDeposit } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/deposits/$id")({
  head: () => ({ meta: [{ title: "Deposit — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminDeposit(id)
      .then((d) => setRow((d ?? null) as Record<string, unknown> | null))
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load deposit");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Deposit" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Deposits", to: "/admin/deposits" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Deposit" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Deposits", to: "/admin/deposits" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Deposit not found.</p>
      </AdminShell>
    );
  }

  const user = (row.user ?? {}) as Record<string, unknown>;

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Deposits", to: "/admin/deposits" }, { label: String(row.id).slice(0, 8) }]}
    >
      <DepositDetailBody
        row={{
          id: String(row.id),
          status: String(row.status ?? ""),
          currency: String(row.currency ?? "NGN"),
          amountMinor: row.amountMinor as string | number,
          method: row.method != null ? String(row.method) : undefined,
          user: { id: user.id != null ? String(user.id) : undefined, name: user.name != null ? String(user.name) : undefined, phone: user.phone != null ? String(user.phone) : undefined },
          createdAt: row.createdAt != null ? String(row.createdAt) : undefined,
          providerRef: row.providerRef != null ? String(row.providerRef) : null,
        }}
      />
    </AdminShell>
  );
}
