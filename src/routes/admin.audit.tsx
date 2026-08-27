import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminAudit();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load audit log");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      description="Record of admin actions across the platform."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Audit" }]}
    >
      <div className="mb-4 flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Search className="size-3.5" style={{ color: T.muted }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Action, entity, id…"
          className="bg-transparent text-[12px] outline-none flex-1"
          style={{ color: T.ink }}
        />
      </div>

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
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No audit events yet.
          </p>
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
