import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader, Pill } from "@/components/admin/UserProfile";
import { fetchAdminOrders, fetchAdminUser, fmtMoney, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/orders")({
  head: () => ({ meta: [{ title: "User orders — MagnetPay Admin" }] }),
  component: Page,
});

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function Page() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [u, orders] = await Promise.all([fetchAdminUser(id), fetchAdminOrders()]);
        setUser(u);
        setRows(
          orders.filter((raw) => {
            const r = raw as Record<string, unknown>;
            const orderUser = (r.user ?? {}) as Record<string, unknown>;
            return orderUser.id === id || r.userId === id;
          }),
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setUser(null);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Orders" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell title="Orders" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>User not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: user.name, to: `/admin/users/${user.id}` },
        { label: "Orders" },
      ]}
    >
      <UserHeader user={user} />

      <div className="mt-5 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {rows.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const orderId = str(r.id);
          return (
            <div
              key={orderId}
              className="flex items-center justify-between px-4 h-[52px] text-[12px]"
              style={{ borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <Link to="/admin/orders/$id" params={{ id: orderId }} className="font-semibold tabular-nums" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                {orderId.slice(0, 8)}
              </Link>
              <span className="truncate flex-1 mx-4" style={{ color: T.sub }}>{str(r.supplier, "—")}</span>
              <span className="tabular-nums font-bold mr-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(str(r.currency, "NGN"), r.totalMinor as string | number)}
              </span>
              <Pill tone="info">{str(r.status)}</Pill>
            </div>
          );
        })}
        {!rows.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No orders for this user.</p>
        ) : null}
      </div>
    </AdminShell>
  );
}
