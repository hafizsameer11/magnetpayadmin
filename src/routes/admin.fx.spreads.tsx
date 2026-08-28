import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KPI } from "@/components/admin/Orders";
import { fetchAdminFxSpreads } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fx/spreads")({
  head: () => ({ meta: [{ title: "FX spreads — MagnetPay Admin" }] }),
  component: Page,
});

type SpreadRow = { pair?: string; tier?: string; spread?: number; key?: string; value?: string; label?: string };

function Page() {
  const [rows, setRows] = useState<SpreadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminFxSpreads()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load spreads"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell
      title="FX spreads"
      description="Corridor spread tiers from fee config."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX" }, { label: "Spreads" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <KPI label="Pairs" value={String(new Set(rows.map((r) => r.pair ?? r.key)).size)} />
        <KPI label="Tiers" value={String(rows.length)} tone="info" />
        <KPI label="Avg spread" value={rows.length ? `${(rows.reduce((s, r) => s + Number(r.spread ?? r.value ?? 0), 0) / rows.length).toFixed(2)}%` : "—"} tone="warn" />
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1.5fr 1fr 1fr" }}
        >
          <span>Pair / key</span>
          <span>Tier</span>
          <span className="text-right">Spread</span>
        </div>
        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No spread config found.</p>
        ) : (
          rows.map((r, i) => (
            <div
              key={`${r.pair ?? r.key}-${r.tier ?? i}`}
              className="grid items-center px-4 h-[48px] text-[12px]"
              style={{ gridTemplateColumns: "1.5fr 1fr 1fr", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <span className="font-semibold truncate">{r.pair ?? r.key ?? "—"}</span>
              <span style={{ color: T.sub }}>{r.tier ?? r.label ?? "—"}</span>
              <span className="text-right tabular-nums font-bold" style={{ color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.spread != null ? `${r.spread}%` : String(r.value ?? "—")}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
