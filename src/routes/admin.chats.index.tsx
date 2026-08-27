import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminConversations, type AdminConversation } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";
import { toast } from "sonner";

const CHAT_POLL_MS = 5000;

export const Route = createFileRoute("/admin/chats/")({
  head: () => ({ meta: [{ title: "Chat moderation — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchAdminConversations();
      setRows(data);
    } catch (e) {
      if (!silent) {
        toast.error(e instanceof Error ? e.message : "Failed to load conversations");
        setRows([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  usePolling(() => load(true), CHAT_POLL_MS, true);

  return (
    <AdminShell
      title="Conversations"
      description="Buyer ↔ seller threads from /admin/conversations."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats" }]}
    >
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1fr 1.6fr 1.8fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>Participants</span>
          <span>Last message</span>
          <span>Updated</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="size-5 mx-auto mb-2" style={{ color: T.muted }} />
            <p className="text-[12px]" style={{ color: T.muted }}>
              No support tickets / conversations
            </p>
          </div>
        ) : (
          rows.map((c, i) => {
            const names = (c.participants ?? []).map((p) => p.user.name).join(" · ") || "—";
            const last = c.messages?.[0];
            return (
              <Link
                key={c.id}
                to="/admin/chats/$id"
                params={{ id: c.id }}
                className="grid items-center px-4 py-3 text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
                style={{
                  gridTemplateColumns: "1fr 1.6fr 1.8fr 1.2fr",
                  borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <span className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                  {c.id.slice(0, 8)}
                </span>
                <span className="truncate font-medium">{names}</span>
                <span className="truncate italic" style={{ color: T.sub }}>
                  {last?.body ?? c.subject ?? "—"}
                </span>
                <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(c.updatedAt).toLocaleString()}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
