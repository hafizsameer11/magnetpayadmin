import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminAudit, type AdminAudit } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/aml/")({
  head: () => ({ meta: [{ title: "AML cases — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const audit = await fetchAdminAudit();
        const aml = audit.filter((a) => a.action.toLowerCase().startsWith("aml") || a.action.toLowerCase().includes("aml"));
        if (!cancelled) setRows(aml);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load AML audit");
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

  return (
    <AdminShell
      title="AML cases"
      description="Audit events whose action starts with or includes “aml”. Empty is expected when no AML API exists yet."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "AML" }]}
    >
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
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No AML audit events.
          </p>
        ) : (
          rows.map((a, i) => (
            <div
              key={a.id}
              className="grid items-center px-4 h-[48px] text-[12px]"
              style={{
                gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1.2fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {a.id.slice(0, 8)}
              </span>
              <Pill tone="warn">{a.action}</Pill>
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
