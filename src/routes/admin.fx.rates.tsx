import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminFxRates, putAdminFxRates, type AdminFee } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fx/rates")({
  head: () => ({ meta: [{ title: "FX rates — MagnetPay Admin" }] }),
  component: Page,
});

type EditRow = { key: string; value: string };

function Page() {
  const [rows, setRows] = useState<EditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminFxRates();
      setRows(
        data.map((f: AdminFee) => ({
          key: f.key,
          value: String(f.value),
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load FX rates");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = (index: number, patch: Partial<EditRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await putAdminFxRates(
        rows.map((r) => {
          const n = Number(r.value);
          return {
            key: r.key,
            value: Number.isFinite(n) ? Math.round(n) : 0,
          };
        }),
      );
      toast.success("FX rates saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="FX rates"
      description="Corridor FX config keys (integer values as stored). Changes apply on the next conversion."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX" }, { label: "Rates" }]}
      actions={
        <button
          onClick={() => void save()}
          disabled={saving || loading || rows.length === 0}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.navy }}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? "Saving…" : "Save rates"}
        </button>
      }
    >
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.5fr 1fr",
          }}
        >
          <span>Key</span>
          <span>Value</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No FX rate keys configured.
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.key + i}
              className="grid items-center px-4 py-2.5 gap-2 text-[12px]"
              style={{
                gridTemplateColumns: "1.5fr 1fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <input
                value={r.key}
                onChange={(e) => update(i, { key: e.target.value })}
                className="h-8 px-2 rounded-md text-[12px] outline-none tabular-nums"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}
              />
              <input
                value={r.value}
                onChange={(e) => update(i, { value: e.target.value })}
                className="h-8 px-2 rounded-md text-[12px] outline-none tabular-nums font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
