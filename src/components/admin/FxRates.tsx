import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pause, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card, KPI } from "@/components/admin/Orders";
import { Switch } from "@/components/ui/switch";
import {
  fetchAdminFxPairs,
  patchAdminFxPair,
  refreshAdminFxPairs,
  setAdminFxHalted,
  type AdminFxPair,
} from "@/lib/api";

function fmtRate(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 100) return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(3).replace(/\.?0+$/, "");
  return n.toFixed(4).replace(/\.?0+$/, "");
}

function fmtSpread(n: number) {
  return `${n.toFixed(2).replace(/\.?0+$/, "")}%`;
}

function fmtAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.floor(ms / 60_000));
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  return `${Math.floor(hr / 24)} days ago`;
}

function stalestPair(rows: AdminFxPair[]) {
  if (!rows.length) return { label: "—", pair: "" };
  let oldest = rows[0];
  for (const row of rows) {
    if (new Date(row.updatedAt).getTime() < new Date(oldest.updatedAt).getTime()) oldest = row;
  }
  return { label: fmtAgo(oldest.updatedAt), pair: oldest.pair };
}

export function FxRatesPage() {
  const [rows, setRows] = useState<AdminFxPair[]>([]);
  const [halted, setHalted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [halting, setHalting] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminFxPairs();
      setRows(data.pairs);
      setHalted(data.halted);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load FX rates");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis = useMemo(() => {
    const overrides = rows.filter((r) => r.override).length;
    const avgSpread = rows.length ? rows.reduce((s, r) => s + r.spreadPct, 0) / rows.length : 0;
    const stale = stalestPair(rows);
    return {
      pairs: rows.length,
      overrides,
      avgSpread,
      staleLabel: stale.label,
      stalePair: stale.pair,
    };
  }, [rows]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshAdminFxPairs();
      setRows(data.pairs);
      toast.success("FX rates refreshed from providers");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const onHalt = async () => {
    setHalting(true);
    try {
      const next = !halted;
      const data = await setAdminFxHalted(next);
      setHalted(data.halted);
      toast.success(data.halted ? "FX conversions halted" : "FX conversions resumed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update FX status");
    } finally {
      setHalting(false);
    }
  };

  const onToggleOverride = async (row: AdminFxPair, override: boolean) => {
    setBusyKey(row.pairKey);
    try {
      const updated = await patchAdminFxPair(row.pairKey, { override });
      setRows((prev) => prev.map((r) => (r.pairKey === row.pairKey ? { ...r, ...updated } : r)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update override");
    } finally {
      setBusyKey(null);
    }
  };

  const onEditMid = async (row: AdminFxPair) => {
    const next = window.prompt(`Set mid rate for ${row.pair}`, String(row.mid));
    if (next == null) return;
    const mid = Number(next);
    if (!Number.isFinite(mid) || mid <= 0) {
      toast.error("Enter a valid positive rate");
      return;
    }
    setBusyKey(row.pairKey);
    try {
      const updated = await patchAdminFxPair(row.pairKey, { mid, override: true });
      setRows((prev) => prev.map((r) => (r.pairKey === row.pairKey ? { ...r, ...updated } : r)));
      toast.success(`${row.pair} updated`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save rate");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <AdminShell
      title="FX rates"
      description="Live mid-market rates from providers, with optional manual overrides."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX rates" }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing || loading}
            className="h-9 px-3 rounded-lg text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            {refreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void onHalt()}
            disabled={halting || loading}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: halted ? T.success : T.danger }}
          >
            {halting ? <Loader2 className="size-3.5 animate-spin" /> : <Pause className="size-3.5" />}
            {halted ? "Resume FX" : "Halt FX"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Pairs tracked" value={String(kpis.pairs)} />
        <KPI label="Manual overrides" value={String(kpis.overrides)} tone={T.accent} />
        <KPI label="Avg spread" value={fmtSpread(kpis.avgSpread)} tone={T.accent} />
        <KPI label="Stalest" value={kpis.staleLabel} hint={kpis.stalePair || undefined} tone={T.accent} />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
                <th className="px-4 py-2.5">Pair</th>
                <th className="px-2 py-2.5 text-right">Mid</th>
                <th className="px-2 py-2.5 text-right">Buy</th>
                <th className="px-2 py-2.5 text-right">Sell</th>
                <th className="px-2 py-2.5 text-right">Spread</th>
                <th className="px-2 py-2.5">Source</th>
                <th className="px-2 py-2.5 text-center">Override</th>
                <th className="px-2 py-2.5">Updated</th>
                <th className="px-2 py-2.5 pr-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center" style={{ color: T.muted }}>
                    <Loader2 className="size-5 animate-spin inline-block" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[12px]" style={{ color: T.muted }}>
                    No FX pairs configured.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = busyKey === row.pairKey;
                  return (
                    <tr key={row.pairKey} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: T.ink }}>
                        {row.pair}
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtRate(row.mid)}
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums font-semibold" style={{ color: T.success, fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtRate(row.buy)}
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums font-semibold" style={{ color: T.danger, fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtRate(row.sell)}
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums font-semibold" style={{ color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtSpread(row.spreadPct)}
                      </td>
                      <td className="px-2 py-3" style={{ color: T.sub }}>
                        {row.source}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex justify-center">
                          <Switch
                            checked={row.override}
                            disabled={busy}
                            onCheckedChange={(checked) => void onToggleOverride(row, checked)}
                            className="data-[state=checked]:bg-[#C2410C]"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap" style={{ color: T.muted }}>
                        {fmtAgo(row.updatedAt)}
                      </td>
                      <td className="px-2 py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => void onEditMid(row)}
                          disabled={busy}
                          className="size-8 grid place-items-center rounded-lg disabled:opacity-50"
                          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.muted }}
                          aria-label={`Edit ${row.pair}`}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {halted ? (
        <p className="mt-3 text-[11px] font-semibold" style={{ color: T.danger }}>
          FX is currently halted — new conversions are blocked until you resume.
        </p>
      ) : null}
    </AdminShell>
  );
}
