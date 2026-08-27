import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminFxConversions, fmtMoney, type AdminFxConversion } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fx/orders/")({
  head: () => ({ meta: [{ title: "FX orders — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminFxConversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminFxConversions();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load FX conversions");
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
      title="FX orders"
      description="Live wallet FX conversions across the corridor."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX" }, { label: "Orders" }]}
    >
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1fr 1.2fr 1.2fr 1fr 1.4fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>From</span>
          <span>To</span>
          <span>Rate</span>
          <span>User</span>
          <span>When</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No FX conversions yet.
          </p>
        ) : (
          rows.map((o, i) => (
            <Link
              key={o.id}
              to="/admin/fx/orders/$id"
              params={{ id: o.id }}
              className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
              style={{
                gridTemplateColumns: "1fr 1.2fr 1.2fr 1fr 1.4fr 1.2fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                {o.id.slice(0, 8)}
              </span>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(o.fromCurrency, o.fromMinor)}
              </span>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(o.toCurrency, o.toMinor)}
              </span>
              <span className="tabular-nums" style={{ color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                {Number(o.rateApplied).toFixed(4)}
              </span>
              <span className="truncate">{o.user?.name ?? "—"}</span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(o.createdAt).toLocaleString()}
              </span>
            </Link>
          ))
        )}
      </div>

      {!loading && rows.length > 0 && (
        <p className="mt-3 text-[11px]" style={{ color: T.muted }}>
          <Pill tone="info">{rows.length} conversions</Pill>
        </p>
      )}
    </AdminShell>
  );
}
