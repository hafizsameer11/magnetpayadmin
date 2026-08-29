import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminConversation } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/chats/$id")({
  head: () => ({ meta: [{ title: "Conversation — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Awaited<ReturnType<typeof fetchAdminConversation>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminConversation(id)
      .then(setRow)
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load conversation");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Chat" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats", to: "/admin/chats" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Chat" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats", to: "/admin/chats" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Conversation not found.</p>
      </AdminShell>
    );
  }

  const names = (row.participants ?? []).map((p) => p.user.name).join(" · ") || "—";
  const messages = row.messages ?? [];

  return (
    <AdminShell title="Conversation" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats", to: "/admin/chats" }, { label: id.slice(0, 8) }]}>
      <Link to="/admin/chats" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-4" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" /> Chats
      </Link>
      <div className="rounded-xl p-4 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>Participants</p>
        <p className="mt-1 text-[13px] font-semibold">{names}</p>
        {row.subject ? <p className="mt-2 text-[12px]" style={{ color: T.sub }}>{row.subject}</p> : null}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {messages.length ? (
          messages.map((m, i) => (
            <div key={m.id} className="px-4 py-3 text-[12px]" style={{ borderBottom: i < messages.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <p style={{ color: T.ink }}>{m.body}</p>
              <p className="text-[10px] mt-1 tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No messages in thread.</p>
        )}
      </div>
    </AdminShell>
  );
}
