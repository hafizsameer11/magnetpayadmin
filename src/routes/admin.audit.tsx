import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ScrollText, Calendar, Layers } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { fetchAdminAudit, type AdminAudit } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminAudit());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load audit log");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const today = rows.filter((a) => new Date(a.createdAt).getTime() > dayAgo).length;
    const entities = new Set(rows.map((a) => a.entity)).size;
    return { total: rows.length, today, entities };
  }, [rows]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const n = query.toLowerCase();
    return rows.filter(
      (a) =>
        a.action.toLowerCase().includes(n) ||
        a.entity.toLowerCase().includes(n) ||
        (a.entityId ?? "").toLowerCase().includes(n) ||
        a.id.toLowerCase().includes(n),
    );
  }, [rows, query]);

  return (
    <AdminShell
      title="Audit log"
      description="Record of admin and system actions across the platform."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Audit" }]}
    >
      <KpiStrip
        cols={3}
        items={[
          { label: "Total events", value: loading ? "…" : stats.total, Icon: ScrollText, tone: T.navy, delta: "Full history" },
          { label: "Last 24 hours", value: loading ? "…" : stats.today, Icon: Calendar, tone: T.warn, delta: "Recent activity" },
          { label: "Entity types", value: loading ? "…" : stats.entities, Icon: Layers, tone: T.info, delta: "Distinct resources" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Action, entity, id…" onRefresh={() => void load()} refreshing={loading} />

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.2fr 1.4fr 1fr 1fr 1.4fr",
          }}
        >
          <span>When</span>
          <span>Action</span>
          <span>Entity</span>
          <span>Entity ID</span>
          <span>Meta</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <ListEmpty message="No audit events match this filter." />
        ) : (
          filtered.map((a, i) => (
            <div
              key={a.id}
              className="grid items-center px-4 py-3 text-[12px]"
              style={{
                gridTemplateColumns: "1.2fr 1.4fr 1fr 1fr 1.4fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(a.createdAt).toLocaleString()}
              </span>
              <span className="font-medium" style={{ color: T.ink }}>
                {a.action}
              </span>
              <span
                className="inline-flex items-center px-2 h-5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit"
                style={{ background: T.bg, color: T.sub }}
              >
                {a.entity}
              </span>
              <span className="tabular-nums text-[11px]" style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}>
                {a.entityId ? a.entityId.slice(0, 8) : "—"}
              </span>
              <span className="truncate text-[11px]" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {a.meta != null ? JSON.stringify(a.meta) : "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
