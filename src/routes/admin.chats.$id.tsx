import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Loader2, Send } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminConversation, postAdminConversationMessage } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/chats/$id")({
  head: () => ({ meta: [{ title: "Conversation — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Awaited<ReturnType<typeof fetchAdminConversation>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminConversation(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load conversation");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const send = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await postAdminConversationMessage(id, reply.trim());
      setReply("");
      toast.success("Message sent");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

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
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
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
      <div className="rounded-xl p-4 flex gap-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply as support…"
          rows={3}
          className="flex-1 resize-none rounded-lg px-3 py-2 text-[12px] outline-none"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
        />
        <button
          type="button"
          disabled={sending || !reply.trim()}
          onClick={() => void send()}
          className="self-end h-9 px-4 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: T.navy }}
        >
          <Send className="size-3.5" />
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </AdminShell>
  );
}
