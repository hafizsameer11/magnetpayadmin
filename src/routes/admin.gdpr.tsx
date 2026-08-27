import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminAudit } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/gdpr")({
  head: () => ({ meta: [{ title: "Gdpr — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<unknown[] | Record<string, unknown> | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminAudit();
        setRows(Array.isArray(data) ? data : [data]);
        setErr("");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];

  return (
    <AdminShell
      title="Gdpr"
      description="Live data from API. Empty until records exist."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Gdpr" }]}
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : err ? (
        <p className="text-[13px]" style={{ color: T.danger }}>{err}</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[13px] font-semibold" style={{ color: T.ink }}>No records yet</p>
          <p className="mt-1 text-[12px]" style={{ color: T.muted }}>This screen is API-backed. Data will appear when available.</p>
          <Link to="/admin" className="inline-block mt-4 text-[12px] font-semibold" style={{ color: T.navy }}>Back to overview</Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted, borderBottom: `1px solid ${T.border}` }}>
            {list.length} record{list.length === 1 ? "" : "s"} from API
          </div>
          <ul>
            {list.slice(0, 50).map((row, i) => {
              const r = row as Record<string, unknown>;
              const id = String(r.id ?? r.key ?? i);
              const label = String(r.name ?? r.title ?? r.action ?? r.companyName ?? r.status ?? r.key ?? id);
              return (
                <li key={id + "-" + i} className="px-4 py-3 text-[12.5px] flex justify-between gap-3" style={{ borderBottom: i < Math.min(list.length, 50) - 1 ? `1px solid ${T.border}` : "none" }}>
                  <span className="font-semibold truncate" style={{ color: T.ink }}>{label}</span>
                  <span className="tabular-nums shrink-0" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{id.slice(0, 12)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </AdminShell>
  );
}
