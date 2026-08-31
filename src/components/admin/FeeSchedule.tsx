import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card } from "@/components/admin/Catalog";
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

function feeHint(key: string) {
  if (key === "escrow_fee_bps") return "Basis points charged on funded escrow (150 = 1.5%)";
  if (key === "fx.halted") return "1 halts live FX conversions · 0 allows trading";
  if (key.startsWith("fx.manual.")) return "Manual override flag for this pair";
  if (key.startsWith("fx.")) return "Stored as integer minor units / scaled rate";
  return null;
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
    () => rows.some((r, i) => r.value !== saved[i]?.value || r.key !== saved[i]?.key),
    [rows, saved],
  );

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
      <div className="max-w-3xl">
        <div
          className="grid items-center px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: T.muted, gridTemplateColumns: "1fr minmax(120px, 200px)" }}
        >
          <span>Key</span>
          <span className="text-right sm:text-left">Value</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <p className="text-center text-[12.5px] py-8" style={{ color: T.muted }}>
              No fee rules configured.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => {
              const hint = feeHint(r.key);
              return (
                <Card key={r.key} padded={false} className="overflow-hidden">
                  <div
                    className="grid items-center gap-3 px-4 py-3 sm:py-3.5"
                    style={{ gridTemplateColumns: "1fr minmax(120px, 200px)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold font-mono truncate" style={{ color: T.ink }}>
                        {r.key}
                      </p>
                      {hint ? (
                        <p className="mt-0.5 text-[10.5px] leading-snug hidden sm:block" style={{ color: T.muted }}>
                          {hint}
                        </p>
                      ) : null}
                    </div>
                    <input
                      value={r.value}
                      onChange={(e) => updateValue(i, e.target.value.replace(/[^\d-]/g, ""))}
                      inputMode="numeric"
                      aria-label={`Value for ${r.key}`}
                      className="h-9 px-3 rounded-lg text-[13px] font-bold font-mono tabular-nums text-right sm:text-left outline-none transition-shadow focus-visible:ring-2"
                      style={{
                        background: T.bg,
                        border: `1px solid ${T.border}`,
                        color: T.accent,
                        boxShadow: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${T.navy}33`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && rows.length > 0 ? (
          <p className="mt-4 text-[11px]" style={{ color: T.muted }}>
            {rows.length} configuration {rows.length === 1 ? "key" : "keys"}
            {dirty ? " · unsaved changes" : " · all changes saved"}
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
