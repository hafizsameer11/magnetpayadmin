import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill, initials } from "@/components/admin/UserProfile";
import { fetchAdminShipments, type AdminShipment } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shipments/")({
  head: () => ({ meta: [{ title: "Shipments — MagnetPay Admin" }] }),
  component: Page,
});

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "DELIVERED" || s === "COMPLETED") return "success";
  if (s === "EXCEPTION" || s === "RETURNED" || s === "FAILED") return "danger";
  if (s === "IN_TRANSIT" || s === "CUSTOMS" || s === "PICKED_UP") return "info";
  if (s === "PENDING" || s === "CREATED") return "warn";
  return "neutral";
}

function Page() {
  const [rows, setRows] = useState<AdminShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminShipments();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load shipments");
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
      (s) =>
        s.id.toLowerCase().includes(n) ||
        s.status.toLowerCase().includes(n) ||
        (s.mode ?? "").toLowerCase().includes(n) ||
        (s.user?.name ?? "").toLowerCase().includes(n),
    );
  }, [rows, query]);

  return (
    <AdminShell
      title="Shipments"
      description="Cross-border and last-mile shipments."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Logistics" }, { label: "Shipments" }]}
    >
      <div className="mb-4 flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Search className="size-3.5" style={{ color: T.muted }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ID, status, user…"
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
            gridTemplateColumns: "1fr 1fr 1fr 1.6fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>Status</span>
          <span>Mode</span>
          <span>User</span>
          <span>Created</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No shipments found.
          </p>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s.id}
              className="grid items-center px-4 h-[52px] text-[12px]"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr 1.6fr 1.2fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <Link
                to="/admin/shipments/$id"
                params={{ id: s.id }}
                className="tabular-nums font-semibold hover:underline"
                style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {s.id.slice(0, 8)}
              </Link>
              <Pill tone={statusTone(s.status)}>{s.status}</Pill>
              <span style={{ color: T.sub }}>{s.mode ?? "—"}</span>
              <div className="flex items-center gap-2 min-w-0">
                {s.user ? (
                  <>
                    <div
                      className="size-7 rounded-full grid place-items-center text-[9.5px] font-bold shrink-0"
                      style={{ background: `${T.navy}10`, color: T.navy }}
                    >
                      {initials(s.user.name || "?")}
                    </div>
                    <span className="truncate font-medium" style={{ color: T.ink }}>
                      {s.user.name}
                    </span>
                  </>
                ) : (
                  <span style={{ color: T.muted }}>—</span>
                )}
              </div>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(s.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
