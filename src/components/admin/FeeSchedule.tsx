import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card, KPI } from "@/components/admin/Orders";
import { fetchAdminFees, putAdminFees, type AdminFee } from "@/lib/api";

type EditRow = { key: string; value: string };

function sortFeeRows(rows: EditRow[]) {
  return [...rows].sort((a, b) => {
    const rank = (key: string) => {
      if (key.startsWith("escrow")) return 0;
      if (key.startsWith("fx.")) return 1;
      return 2;
    };
    const ra = rank(a.key);
    const rb = rank(b.key);
    if (ra !== rb) return ra - rb;
    return a.key.localeCompare(b.key);
  });
}

function feeCategory(key: string) {
  if (key.startsWith("escrow")) return "Platform";
  if (key.startsWith("fx.")) return "FX";
  return "Other";
}

function feeHint(key: string) {
  if (key === "escrow_fee_bps") return "Basis points on funded escrow (150 = 1.5%)";
  if (key === "fx.halted") return "1 halts conversions · 0 allows trading";
  if (key.startsWith("fx.manual.")) return "Manual override flag for pair";
  if (key.startsWith("fx.")) return "Integer minor units / scaled rate";
  return "Platform configuration value";
}

function fmtBps(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${(n / 100).toFixed(2)}%`;
}

export function FeeSchedulePage() {
  const [rows, setRows] = useState<EditRow[]>([]);
  const [saved, setSaved] = useState<EditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminFees();
      const mapped = sortFeeRows(
        data.map((f: AdminFee) => ({
          key: f.key,
          value: String(f.value),
        })),
      );
      setRows(mapped);
      setSaved(mapped);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load fees");
      setRows([]);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const dirty = useMemo(
    () => rows.some((r, i) => r.value !== saved[i]?.value),
    [rows, saved],
  );

  const kpis = useMemo(() => {
    const escrow = rows.find((r) => r.key === "escrow_fee_bps");
    const fxKeys = rows.filter((r) => r.key.startsWith("fx.")).length;
    const platformKeys = rows.filter((r) => r.key.startsWith("escrow")).length;
    return {
      total: rows.length,
      platformKeys,
      fxKeys,
      escrowBps: escrow ? fmtBps(escrow.value) : "—",
    };
  }, [rows]);

  const updateValue = (index: number, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, value } : r)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await putAdminFees(
        rows.map((r) => {
          const n = Number(r.value);
          return {
            key: r.key,
            value: Number.isFinite(n) ? Math.round(n) : 0,
          };
        }),
      );
      toast.success("Fee schedule saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Fee schedule"
      description="Platform fees (integer values as configured). Changes take effect on the next transaction."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Settings" }, { label: "Fees" }]}
      actions={
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || loading || rows.length === 0 || !dirty}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.navy }}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? "Saving…" : "Save fees"}
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Config keys" value={String(kpis.total)} />
        <KPI label="Escrow fee" value={kpis.escrowBps} tone={T.accent} hint="escrow_fee_bps" />
        <KPI label="Platform keys" value={String(kpis.platformKeys)} />
        <KPI label="FX keys" value={String(kpis.fxKeys)} tone={T.info} />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
                <th className="px-4 py-2.5">Key</th>
                <th className="px-2 py-2.5">Category</th>
                <th className="px-2 py-2.5">Description</th>
                <th className="px-4 py-2.5 text-right w-[180px]">Value</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center" style={{ color: T.muted }}>
                    <Loader2 className="size-5 animate-spin inline-block" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[12px]" style={{ color: T.muted }}>
                    No fee rules configured.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const changed = r.value !== saved[i]?.value;
                  const category = feeCategory(r.key);
                  return (
                    <tr key={r.key} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td className="px-4 py-3 font-semibold font-mono" style={{ color: T.ink }}>
                        {r.key}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className="inline-flex px-2 h-5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: category === "FX" ? `${T.info}12` : category === "Platform" ? `${T.success}12` : `${T.muted}14`,
                            color: category === "FX" ? T.info : category === "Platform" ? T.success : T.sub,
                          }}
                        >
                          {category}
                        </span>
                      </td>
                      <td className="px-2 py-3" style={{ color: T.sub }}>
                        {feeHint(r.key)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          value={r.value}
                          onChange={(e) => updateValue(i, e.target.value.replace(/[^\d-]/g, ""))}
                          inputMode="numeric"
                          aria-label={`Value for ${r.key}`}
                          className="h-8 w-full max-w-[140px] ml-auto px-2.5 rounded-md text-[12px] font-bold font-mono tabular-nums text-right outline-none"
                          style={{
                            background: changed ? `${T.accent}08` : T.bg,
                            border: `1px solid ${changed ? T.accent : T.border}`,
                            color: T.accent,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {dirty ? (
        <p className="mt-3 text-[11px] font-semibold" style={{ color: T.warn }}>
          You have unsaved changes — click Save fees to apply on the next transaction.
        </p>
      ) : null}
    </AdminShell>
  );
}
