import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader, Pill } from "@/components/admin/UserProfile";
import {
  fetchAdminConversations,
  fetchAdminTickets,
  fetchAdminUser,
  type AdminRecordRow,
  type AdminUser,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/tickets")({
  head: () => ({ meta: [{ title: "User support — MagnetPay Admin" }] }),
  component: UserTickets,
});

type Row = {
  id: string;
  kind: "ticket" | "chat";
  title: string;
  status: string;
  updatedAt: string;
};

function UserTickets() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [tickets, setTickets] = useState<AdminRecordRow[]>([]);
  const [chats, setChats] = useState<{ id: string; subject?: string | null; updatedAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [u, ticketRows, allChats] = await Promise.all([
          fetchAdminUser(id),
          fetchAdminTickets(undefined, id),
          fetchAdminConversations(),
        ]);
        setUser(u);
        setTickets(ticketRows);
        setChats(
          allChats.filter(
            (c) =>
              c.participants?.some((p) => p.user?.id === id) &&
              (c.subject?.toLowerCase().includes("support") ?? false),
          ),
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setUser(null);
        setTickets([]);
        setChats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const rows = useMemo(() => {
    const linkedChatIds = new Set(
      tickets
        .map((t) => (t.payload as Record<string, unknown> | undefined)?.conversationId)
        .filter(Boolean)
        .map(String),
    );
    const list: Row[] = tickets.map((t) => ({
        id: t.id,
        kind: "ticket" as const,
        title: t.title,
        status: t.status ?? "open",
        updatedAt: t.updatedAt,
      }));
    for (const c of chats) {
      if (linkedChatIds.has(c.id)) continue;
      list.push({
        id: c.id,
        kind: "chat",
        title: c.subject ?? "Support conversation",
        status: "open",
        updatedAt: c.updatedAt ?? "",
      });
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tickets, chats]);

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
        { label: "Support" },
      ]}
    >
      <UserHeader user={user} />

      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Tickets", val: tickets.length },
          { label: "Support chats", val: chats.length, tone: T.info },
          { label: "Total threads", val: rows.length },
        ].map((k) => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {k.label}
            </p>
            <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: k.tone ?? T.ink }}>
              {k.val}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.2fr 1.4fr 0.9fr 0.9fr 1fr",
          }}
        >
          <span>Ref</span>
          <span>Subject</span>
          <span>Type</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        {rows.map((t, i) => (
          <div
            key={`${t.kind}-${t.id}`}
            className="grid items-center px-4 h-[52px] text-[12px]"
            style={{
              gridTemplateColumns: "1.2fr 1.4fr 0.9fr 0.9fr 1fr",
              borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            {t.kind === "chat" ? (
              <Link
                to="/admin/chats/$id"
                params={{ id: t.id }}
                className="font-semibold tabular-nums hover:underline"
                style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t.id.slice(0, 8).toUpperCase()}
              </Link>
            ) : (
              <Link
                to="/admin/tickets/$id"
                params={{ id: t.id }}
                className="font-semibold tabular-nums hover:underline"
                style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t.id.slice(0, 8).toUpperCase()}
              </Link>
            )}
            <span className="truncate font-medium" style={{ color: T.ink }}>
              {t.title}
            </span>
            <Pill tone={t.kind === "ticket" ? "warn" : "info"}>{t.kind === "ticket" ? "Ticket" : "Chat"}</Pill>
            <Pill tone={t.status === "closed" ? "neutral" : "success"}>{t.status}</Pill>
            <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
              {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}
            </span>
          </div>
        ))}
        {!rows.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No support tickets or chats for this user yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
