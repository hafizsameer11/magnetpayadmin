import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldAlert, AlertTriangle, Clock } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminAudit, type AdminAudit } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fraud-cases/")({
  head: () => ({ meta: [{ title: "Fraud cases — MagnetPay Admin" }] }),
  component: Page,
});

function isFraud(a: AdminAudit) {
  const action = a.action.toLowerCase();
  return action.startsWith("fraud") || action.includes("fraud");
}

function Page() {
  const [allRows, setAllRows] = useState<AdminAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setAllRows(await fetchAdminAudit());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load fraud audit");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => allRows.filter(isFraud), [allRows]);

  const stats = useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = rows.filter((a) => new Date(a.createdAt).getTime() > dayAgo).length;
    const entities = new Set(rows.map((a) => a.entity)).size;
    return { total: rows.length, recent, entities };
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
      title="Fraud cases"
      description="Audit events flagged for fraud — derived from the platform audit log."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Fraud" }]}
    >
      <KpiStrip
        cols={3}
        items={[
          { label: "Fraud events", value: loading ? "…" : stats.total, Icon: ShieldAlert, tone: T.danger, delta: "All time" },
          { label: "Last 24 hours", value: loading ? "…" : stats.recent, Icon: Clock, tone: T.warn, delta: "Recent activity" },
          { label: "Entity types", value: loading ? "…" : stats.entities, Icon: AlertTriangle, tone: T.info, delta: "Distinct sources" },
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
            gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>Action</span>
          <span>Entity</span>
          <span>Entity ID</span>
          <span>When</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <ListEmpty message="No fraud audit events." />
        ) : (
          filtered.map((a, i) => (
            <div
              key={a.id}
              className="grid items-center px-4 h-[48px] text-[12px]"
              style={{
                gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1.2fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {a.id.slice(0, 8)}
              </span>
              <Pill tone="danger">{a.action}</Pill>
              <span className="truncate">{a.entity}</span>
              <span className="tabular-nums truncate" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
                {a.entityId?.slice(0, 8) ?? "—"}
              </span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
