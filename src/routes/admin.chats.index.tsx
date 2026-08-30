import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Users, Clock } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
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
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const n = query.toLowerCase();
    return rows.filter((c) => {
      const names = (c.participants ?? []).map((p) => p.user.name).join(" ");
      const last = c.messages?.[0]?.body ?? c.subject ?? "";
      return c.id.toLowerCase().includes(n) || names.toLowerCase().includes(n) || last.toLowerCase().includes(n);
    });
  }, [rows, query]);

  const activeToday = useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return rows.filter((c) => new Date(c.updatedAt).getTime() > dayAgo).length;
  }, [rows]);

  return (
    <AdminShell
      title="Conversations"
      description="Buyer ↔ seller threads — auto-refreshes every 5 seconds."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats" }]}
    >
      <KpiStrip
        cols={3}
        items={[
          { label: "Total threads", value: loading ? "…" : rows.length, Icon: MessageSquare, tone: T.navy, delta: "All conversations" },
          { label: "Active today", value: loading ? "…" : activeToday, Icon: Clock, tone: T.warn, delta: "Updated in last 24h" },
          { label: "Participants", value: loading ? "…" : rows.reduce((n, c) => n + (c.participants?.length ?? 0), 0), Icon: Users, tone: T.info, delta: "Across all threads" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Search participant or message…" onRefresh={() => void load(false)} refreshing={loading} />

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
        ) : filtered.length === 0 ? (
          <ListEmpty message={rows.length ? "No conversations match your search." : "No conversations yet."} />
        ) : (
          filtered.map((c, i) => {
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
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
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
