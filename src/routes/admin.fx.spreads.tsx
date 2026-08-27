import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminFees, fetchAdminFxRates, type AdminFee } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fx/spreads")({
  head: () => ({ meta: [{ title: "FX spreads — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"rates" | "fees">("rates");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rates = await fetchAdminFxRates();
        const spreadRates = rates.filter((r) => r.key.toLowerCase().includes("spread"));
        if (spreadRates.length > 0) {
          if (!cancelled) {
            setRows(spreadRates);
            setSource("rates");
          }
          return;
        }
        const fees = await fetchAdminFees();
        const fxFees = fees.filter(
          (f) => f.key.toLowerCase().includes("fx") || f.key.toLowerCase().includes("spread"),
        );
        if (!cancelled) {
          setRows(fxFees);
          setSource("fees");
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load spreads");
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
      title="FX spreads"
      description={
        source === "rates"
          ? "FX rate keys containing “spread”."
          : "FX-related fee config (no dedicated spread keys found)."
      }
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX" }, { label: "Spreads" }]}
    >
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.5fr 1fr 1fr",
          }}
        >
          <span>Key</span>
          <span>Value</span>
          <span>Label</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No spread or FX fee keys found.
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.id ?? r.key}
              className="grid items-center px-4 h-[48px] text-[12px]"
              style={{
                gridTemplateColumns: "1.5fr 1fr 1fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {r.key}
              </span>
              <span className="tabular-nums font-bold" style={{ color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                {String(r.value)}
              </span>
              <span className="truncate" style={{ color: T.sub }}>
                {r.label ?? "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
