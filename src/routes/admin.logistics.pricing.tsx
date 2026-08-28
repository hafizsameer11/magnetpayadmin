import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calculator, Loader2, Save } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  fetchAdminFreightPricing,
  fmtMoney,
  previewAdminFreightQuote,
  putAdminFreightPricing,
  type AdminFreightPricing,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logistics/pricing")({
  head: () => ({ meta: [{ title: "Freight pricing — MagnetPay Admin" }] }),
  component: Page,
});

type FormState = {
  airBaseMinor: string;
  seaBaseMinor: string;
  expressBaseMinor: string;
  consolidatedBaseMinor: string;
  cbmMultiplier: string;
  weightMultiplier: string;
};

const FIELDS: { key: keyof FormState; label: string; hint: string }[] = [
  { key: "seaBaseMinor", label: "SEA base (kobo)", hint: "Default 180000 = ₦1,800" },
  { key: "airBaseMinor", label: "AIR base (kobo)", hint: "Default 450000 = ₦4,500" },
  { key: "expressBaseMinor", label: "EXPRESS base (kobo)", hint: "Default 600000 = ₦6,000" },
  { key: "consolidatedBaseMinor", label: "CONSOLIDATED base (kobo)", hint: "Default 220000 = ₦2,200" },
  { key: "cbmMultiplier", label: "CBM multiplier", hint: "Added as ceil(cbm × multiplier)" },
  { key: "weightMultiplier", label: "Weight multiplier", hint: "Added as ceil(kg × multiplier)" },
];

function toForm(row: AdminFreightPricing): FormState {
  return {
    airBaseMinor: String(row.airBaseMinor),
    seaBaseMinor: String(row.seaBaseMinor),
    expressBaseMinor: String(row.expressBaseMinor),
    consolidatedBaseMinor: String(row.consolidatedBaseMinor),
    cbmMultiplier: String(row.cbmMultiplier),
    weightMultiplier: String(row.weightMultiplier),
  };
}

function Page() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ cbm: string; weightKg: string; mode: string }>({
    cbm: "1.8",
    weightKg: "420",
    mode: "SEA",
  });
  const [previewOut, setPreviewOut] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminFreightPricing();
      setForm(toForm(data));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load pricing");
      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        airBaseMinor: Number(form.airBaseMinor),
        seaBaseMinor: Number(form.seaBaseMinor),
        expressBaseMinor: Number(form.expressBaseMinor),
        consolidatedBaseMinor: Number(form.consolidatedBaseMinor),
        cbmMultiplier: Number(form.cbmMultiplier),
        weightMultiplier: Number(form.weightMultiplier),
      };
      await putAdminFreightPricing(payload);
      toast.success("Freight pricing saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const runPreview = async () => {
    try {
      const data = await previewAdminFreightQuote({
        cbm: Number(preview.cbm),
        weightKg: Number(preview.weightKg),
        mode: preview.mode,
      });
      setPreviewOut(`${fmtMoney("NGN", data.estimatedMinor)} · ${data.formula}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Preview failed");
    }
  };

  return (
    <AdminShell
      title="Freight pricing"
      description="Quote formula used by POST /logistics/quotes — base(mode) + ceil(cbm×mult) + ceil(kg×mult), stored in kobo."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Logistics" },
        { label: "Freight pricing" },
      ]}
      actions={
        <button
          onClick={() => void save()}
          disabled={saving || loading || !form}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.navy }}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? "Saving…" : "Save pricing"}
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div
            className="px-4 h-9 flex items-center text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}` }}
          >
            Rate configuration (minor units / kobo)
          </div>
          {loading ? (
            <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : !form ? (
            <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
              Could not load freight pricing.
            </p>
          ) : (
            FIELDS.map((f, i) => (
              <div
                key={f.key}
                className="px-4 py-3 grid gap-1"
                style={{ borderBottom: i < FIELDS.length - 1 ? `1px solid ${T.border}` : "none" }}
              >
                <label className="text-[11px] font-bold" style={{ color: T.ink }}>
                  {f.label}
                </label>
                <p className="text-[10.5px]" style={{ color: T.muted }}>
                  {f.hint}
                </p>
                <input
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="mt-1 h-9 px-2 rounded-md text-[12px] outline-none tabular-nums font-semibold"
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    color: T.accent,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <Calculator className="size-4" style={{ color: T.navy }} />
            <p className="text-[12px] font-bold">Live preview</p>
          </div>
          <select
            value={preview.mode}
            onChange={(e) => setPreview({ ...preview, mode: e.target.value })}
            className="w-full h-9 px-2 rounded-md text-[12px]"
            style={{ background: T.bg, border: `1px solid ${T.border}` }}
          >
            {["SEA", "AIR", "EXPRESS", "CONSOLIDATED"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={preview.cbm}
            onChange={(e) => setPreview({ ...preview, cbm: e.target.value })}
            placeholder="CBM"
            className="w-full h-9 px-2 rounded-md text-[12px] tabular-nums"
            style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
          />
          <input
            value={preview.weightKg}
            onChange={(e) => setPreview({ ...preview, weightKg: e.target.value })}
            placeholder="Weight kg"
            className="w-full h-9 px-2 rounded-md text-[12px] tabular-nums"
            style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button
            onClick={() => void runPreview()}
            className="w-full h-9 rounded-lg text-[12px] font-bold text-white"
            style={{ background: T.navy }}
          >
            Calculate quote
          </button>
          {previewOut ? (
            <p className="text-[11px] leading-snug" style={{ color: T.sub }}>
              {previewOut}
            </p>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
