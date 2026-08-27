import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminShipment, type AdminShipment } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shipments/$id")({
  head: () => ({ meta: [{ title: "Shipment detail — MagnetPay Admin" }] }),
  component: Page,
});

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "DELIVERED" || s === "COMPLETED") return "success";
  if (s === "EXCEPTION" || s === "RETURNED" || s === "FAILED" || s === "CANCELLED") return "danger";
  if (s === "IN_TRANSIT" || s === "CUSTOMS") return "info";
  return "warn";
}

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminShipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminShipment(id);
        if (!cancelled) setRow(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load shipment");
          setRow(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminShell
        title="Shipment"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Shipments", to: "/admin/shipments" }, { label: id }]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell
        title="Shipment"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Shipments", to: "/admin/shipments" }, { label: id }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Shipment not found.
        </p>
      </AdminShell>
    );
  }

  const events = row.events ?? [];

  return (
    <AdminShell
      title={`Shipment ${row.id.slice(0, 8)}`}
      description={row.mode ? `Mode ${row.mode}` : "Shipment detail"}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Shipments", to: "/admin/shipments" },
        { label: row.id.slice(0, 8) },
      ]}
      actions={
        <Link
          to="/admin/shipments"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between">
              <Pill tone={statusTone(row.status)}>{row.status}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(row.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Mode
                </p>
                <p className="mt-1 font-semibold">{row.mode ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  ID
                </p>
                <p className="mt-1 text-[11px] tabular-nums break-all" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {row.id}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="px-4 h-10 flex items-center" style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                Events
              </p>
            </div>
            {events.length === 0 ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                No tracking events.
              </p>
            ) : (
              events.map((ev, i) => (
                <div
                  key={String(ev.id ?? i)}
                  className="px-4 py-3 text-[12px]"
                  style={{ borderBottom: i < events.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <p className="font-semibold">{String(ev.status ?? "Event")}</p>
                  {ev.message != null && (
                    <p className="text-[11px]" style={{ color: T.sub }}>
                      {String(ev.message)}
                    </p>
                  )}
                  {ev.createdAt && (
                    <p className="text-[11px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(String(ev.createdAt)).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              User
            </p>
            <p className="mt-1.5 font-semibold">{row.user?.name ?? "—"}</p>
            {row.user && (
              <Link
                to="/admin/users/$id"
                params={{ id: row.user.id }}
                className="text-[11px] tabular-nums hover:underline"
                style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {row.user.id.slice(0, 8)}
              </Link>
            )}
            {row.user?.phone && (
              <p className="text-[11px] tabular-nums mt-1" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {row.user.phone}
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
