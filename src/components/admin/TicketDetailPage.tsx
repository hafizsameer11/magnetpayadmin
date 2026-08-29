import { Link } from "@tanstack/react-router";
import { ChevronLeft, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminRecord, postAdminTicketMessage, type AdminRecord } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { toast } from "sonner";

type TicketMsg = { id: string; body: string; author: string; at: string };

export function TicketDetailPage({ id }: { id: string }) {
  const [row, setRow] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminRecord(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load ticket");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const payload = (row?.payload ?? {}) as Record<string, unknown>;
  const messages = (Array.isArray(payload.messages) ? payload.messages : []) as TicketMsg[];
  const conversationId = typeof payload.conversationId === "string" ? payload.conversationId : null;

  const sendReply = async () => {
    if (!row || !reply.trim() || sending) return;
    setSending(true);
    try {
      const me = getSessionUser();
      const updated = await postAdminTicketMessage(row.id, reply.trim(), me?.name ?? "Admin");
      setRow(updated);
      setReply("");
      toast.success("Reply sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Ticket" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Tickets", to: "/admin/tickets" }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Ticket" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Tickets", to: "/admin/tickets" }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Ticket not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={row.title}
      description={row.subtitle ?? undefined}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Tickets", to: "/admin/tickets" }, { label: row.externalId ?? id.slice(0, 8) }]}
    >
      <Link to="/admin/tickets" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-4" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" /> Tickets
      </Link>

      <div className="rounded-xl p-4 mb-4 flex flex-wrap items-center gap-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Pill tone="warn">{row.status ?? "open"}</Pill>
        {row.externalId ? (
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{row.externalId}</span>
        ) : null}
        {conversationId ? (
          <Link to="/admin/chats/$id" params={{ id: conversationId }} className="ml-auto text-[11.5px] font-semibold" style={{ color: T.navy }}>
            Open live chat →
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl overflow-hidden mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {messages.length ? (
          messages.map((m, i) => (
            <div key={m.id} className="px-4 py-3 text-[12px]" style={{ borderBottom: i < messages.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: T.muted }}>{m.author}</p>
              <p style={{ color: T.ink }}>{m.body}</p>
              <p className="text-[10px] mt-1 tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(m.at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No messages yet.</p>
        )}
      </div>

      <div className="rounded-xl p-4 flex gap-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to customer…"
          rows={3}
          className="flex-1 resize-none rounded-lg px-3 py-2 text-[12px] outline-none"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
        />
        <button
          type="button"
          disabled={sending || !reply.trim()}
          onClick={() => void sendReply()}
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
