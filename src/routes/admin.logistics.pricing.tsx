import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calculator, Loader2, Plus, Save } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  createAdminParcelType,
  fetchAdminLogisticsEstimateConfig,
  fetchAdminParcelTypes,
  fmtMoney,
  patchAdminParcelType,
  previewAdminParcelEstimate,
  putAdminLogisticsEstimateConfig,
  type AdminParcelType,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logistics/pricing")({
  head: () => ({ meta: [{ title: "Estimate settings — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [types, setTypes] = useState<AdminParcelType[]>([]);
  const [fxRate, setFxRate] = useState("165000");
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTypeId, setPreviewTypeId] = useState("");
  const [previewKg, setPreviewKg] = useState("420");
  const [previewOut, setPreviewOut] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [config, parcelTypes] = await Promise.all([
        fetchAdminLogisticsEstimateConfig(),
        fetchAdminParcelTypes(),
      ]);
      setFxRate(String(config.usdNgnEstimateRate));
      setDisclaimer(config.estimateDisclaimer);
      setTypes(parcelTypes);
      if (parcelTypes[0] && !previewTypeId) setPreviewTypeId(parcelTypes[0].id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load estimate settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await putAdminLogisticsEstimateConfig({
        usdNgnEstimateRate: Number(fxRate),
        estimateDisclaimer: disclaimer.trim(),
      });
      toast.success("Estimate config saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveType = async (row: AdminParcelType) => {
    try {
      await patchAdminParcelType(row.id, {
        name: row.name,
        baseMinor: row.baseMinor,
        ratePerKgMinor: row.ratePerKgMinor,
        active: row.active,
        sortOrder: row.sortOrder,
      });
      toast.success(`${row.name} updated`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const addType = async () => {
    const code = `type_${Date.now().toString(36).slice(-4)}`;
    try {
      const row = await createAdminParcelType({
        code,
        name: "New parcel type",
        baseMinor: 180000,
        ratePerKgMinor: 2500,
        active: true,
        sortOrder: types.length,
      });
      setTypes((prev) => [...prev, row]);
      toast.success("Parcel type added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    }
  };

  const runPreview = async () => {
    if (!previewTypeId) return;
    try {
      const data = await previewAdminParcelEstimate({
        parcelTypeId: previewTypeId,
        weightKg: Number(previewKg),
      });
      setPreviewOut(`${fmtMoney("NGN", data.estimatedMinor)} · ${data.formula}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Preview failed");
    }
  };

  return (
    <AdminShell
      title="Estimate settings"
      description="Parcel-type base + rate/kg drives customer quotes. FX peg is for duty hints only — customs sets the final total."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Logistics" },
        { label: "Estimate settings" },
      ]}
      actions={
        <button
          onClick={() => void saveConfig()}
          disabled={saving || loading}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.navy }}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save FX & disclaimer
        </button>
      }
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div
                className="px-4 h-9 flex items-center text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}` }}
              >
                FX peg (estimate hints only)
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold">USD/NGN rate (kobo per $1, e.g. 165000 = ₦1,650/$)</label>
                  <input
                    value={fxRate}
                    onChange={(e) => setFxRate(e.target.value)}
                    className="mt-1 w-full h-9 px-2 rounded-md text-[12px] tabular-nums font-semibold"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold">Customer disclaimer</label>
                  <textarea
                    value={disclaimer}
                    onChange={(e) => setDisclaimer(e.target.value)}
                    rows={3}
                    className="mt-1 w-full px-2 py-2 rounded-md text-[12px] outline-none resize-y"
                    style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div
                className="px-4 h-9 flex items-center justify-between"
                style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Parcel types</span>
                <button
                  type="button"
                  onClick={() => void addType()}
                  className="h-7 px-2 rounded-md text-[11px] font-semibold flex items-center gap-1"
                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <Plus className="size-3" /> Add type
                </button>
              </div>
              {types.map((row, i) => (
                <div
                  key={row.id}
                  className="px-4 py-3 grid gap-2 md:grid-cols-[1.2fr_1fr_1fr_80px_72px]"
                  style={{ borderBottom: i < types.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <input
                    value={row.name}
                    onChange={(e) =>
                      setTypes((prev) => prev.map((t) => (t.id === row.id ? { ...t, name: e.target.value } : t)))
                    }
                    className="h-9 px-2 rounded-md text-[12px] font-semibold"
                    style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  />
                  <input
                    value={String(row.baseMinor)}
                    onChange={(e) =>
                      setTypes((prev) =>
                        prev.map((t) => (t.id === row.id ? { ...t, baseMinor: Number(e.target.value) || 0 } : t)),
                      )
                    }
                    placeholder="Base kobo"
                    className="h-9 px-2 rounded-md text-[12px] tabular-nums"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <input
                    value={String(row.ratePerKgMinor)}
                    onChange={(e) =>
                      setTypes((prev) =>
                        prev.map((t) =>
                          t.id === row.id ? { ...t, ratePerKgMinor: Number(e.target.value) || 0 } : t,
                        ),
                      )
                    }
                    placeholder="Rate/kg kobo"
                    className="h-9 px-2 rounded-md text-[12px] tabular-nums"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: T.sub }}>
                    <input
                      type="checkbox"
                      checked={row.active}
                      onChange={(e) =>
                        setTypes((prev) =>
                          prev.map((t) => (t.id === row.id ? { ...t, active: e.target.checked } : t)),
                        )
                      }
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => void saveType(row)}
                    className="h-9 rounded-lg text-[11px] font-bold text-white"
                    style={{ background: T.navy }}
                  >
                    Save
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <Calculator className="size-4" style={{ color: T.navy }} />
              <p className="text-[12px] font-bold">Live calculator</p>
            </div>
            <select
              value={previewTypeId}
              onChange={(e) => setPreviewTypeId(e.target.value)}
              className="w-full h-9 px-2 rounded-md text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              value={previewKg}
              onChange={(e) => setPreviewKg(e.target.value)}
              placeholder="Weight kg"
              className="w-full h-9 px-2 rounded-md text-[12px] tabular-nums"
              style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
            />
            <button
              onClick={() => void runPreview()}
              className="w-full h-9 rounded-lg text-[12px] font-bold text-white"
              style={{ background: T.navy }}
            >
              Preview estimate
            </button>
            {previewOut ? (
              <p className="text-[11px] leading-snug" style={{ color: T.sub }}>
                {previewOut}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
