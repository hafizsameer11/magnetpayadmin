import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader, Pill } from "@/components/admin/UserProfile";
import { fetchAdminConversations, fetchAdminUser, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/tickets")({
  head: () => ({ meta: [{ title: "User support — MagnetPay Admin" }] }),
  component: UserTickets,
});

function UserTickets() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [rows, setRows] = useState<{ id: string; updatedAt?: string; participants?: { userId: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [u, chats] = await Promise.all([fetchAdminUser(id), fetchAdminConversations()]);
        setUser(u);
        setRows(
          chats.filter((c) =>
            c.participants?.some((p) => p.user?.id === id),
          ) as typeof rows,
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
      <AdminShell title="Support" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell title="Support" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
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
        { label: "Support chats" },
      ]}
    >
      <UserHeader user={user} />

      <p className="mt-5 text-[12.5px]" style={{ color: T.sub }}>
        Support tickets are not implemented yet. Showing live chat threads this user participates in.
      </p>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {rows.map((t, i) => (
          <div
            key={t.id}
            className="flex items-center justify-between px-4 h-[52px] text-[12px]"
            style={{ borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}
          >
            <Link to="/admin/chats/$id" params={{ id: t.id }} className="font-semibold tabular-nums" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
              {t.id.slice(0, 8)}
            </Link>
            <Pill tone="info">Chat</Pill>
            <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
              {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}
            </span>
          </div>
        ))}
        {!rows.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No support chats for this user.</p>
        ) : null}
      </div>
    </AdminShell>
  );
}
