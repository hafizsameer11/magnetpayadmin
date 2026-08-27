import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminAudit, type AdminAudit } from "@/lib/api";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Activity — MagnetPay Admin" }] }),
  component: AdminNotifications,
});

function entityHref(row: AdminAudit): string {
  const id = row.entityId ?? "";
  switch (row.entity) {
    case "User":
      return `/admin/users/${id}`;
    case "MarketOrder":
      return `/admin/orders/${id}`;
    case "Escrow":
      return `/admin/escrow/${id}`;
    case "KycApplication":
      return `/admin/kyc/${id}`;
    case "BusinessProfile":
      return `/admin/kyb/${id}`;
    case "WithdrawalRequest":
      return `/admin/withdrawals/${id}`;
    default:
      return "/admin/audit";
  }
}

function AdminNotifications() {
  const [rows, setRows] = useState<AdminAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "today">("all");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setRows(await fetchAdminAudit());
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return rows.filter((r) => new Date(r.createdAt) >= start);
    }
    return rows;
  }, [rows, tab]);

  return (
    <AdminShell
      title="Activity feed"
      description="Recent admin and system events from the audit log."
    >
      <div className="flex items-center gap-2 mb-4">
        {(["all", "today"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="h-8 px-3 rounded-full text-[11.5px] font-semibold capitalize"
            style={{
              background: tab === t ? T.navy : T.surface,
              color: tab === t ? "#fff" : T.ink,
              border: `1px solid ${tab === t ? T.navy : T.border}`,
            }}
          >
            {t === "all" ? "All activity" : "Today"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: T.surface, border: `1px dashed ${T.border}` }}>
          <Bell className="size-8 mx-auto mb-3" style={{ color: T.muted }} />
          <p className="text-[13px] font-semibold" style={{ color: T.ink }}>No activity yet</p>
          <p className="mt-1 text-[12px]" style={{ color: T.sub }}>Audit events will appear here as staff take actions.</p>
        </div>
      ) : (
        <ul className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {filtered.slice(0, 100).map((r, i) => (
            <li key={r.id} style={{ borderBottom: i < Math.min(filtered.length, 100) - 1 ? `1px solid ${T.border}` : "none" }}>
              <Link to={entityHref(r) as never} className="flex items-start gap-3 px-4 py-3 hover:bg-[rgba(14,59,46,0.03)]">
                <div className="size-8 rounded-lg grid place-items-center shrink-0 mt-0.5" style={{ background: `${T.info}14`, color: T.info }}>
                  <Bell className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: T.ink }}>{r.action}</p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: T.sub }}>
                    {r.entity}{r.entityId ? ` · ${r.entityId.slice(0, 8)}` : ""}
                  </p>
                </div>
                <span className="text-[10.5px] tabular-nums shrink-0" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
