import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  fetchAdminComplianceLimits,
  fmtMoney,
  putAdminComplianceLimits,
  type AdminComplianceLimits,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/limits")({
  head: () => ({ meta: [{ title: "KYC limits — MagnetPay Admin" }] }),
  component: Page,
});

type FormState = {
  unverifiedNgnDailyCapMinor: string;
  ngnTier1DailyCapMinor: string;
  ngnTier2DailyCapMinor: string;
  cnyDailyCapMinor: string;
  minTierDeposit: string;
  minTierWithdraw: string;
  minTierCrossBorder: string;
  minTierMarketCheckout: string;
  minTierLogistics: string;
  allowBasicWhilePending: boolean;
};

const CAP_FIELDS: { key: keyof FormState; label: string; hint: string; currency: "NGN" | "CNY" }[] = [
  { key: "unverifiedNgnDailyCapMinor", label: "Unverified NGN daily cap", hint: "0 = block deposits/withdrawals until Tier 1 submitted", currency: "NGN" },
  { key: "ngnTier1DailyCapMinor", label: "Tier 1 NGN daily cap", hint: "Default ₦500,000/day (50000000 kobo)", currency: "NGN" },
  { key: "ngnTier2DailyCapMinor", label: "Tier 2 NGN daily cap", hint: "Default ₦20M/day (2000000000 kobo)", currency: "NGN" },
  { key: "cnyDailyCapMinor", label: "CNY send / withdraw daily cap", hint: "Default ¥200,000/day (20000000 fen)", currency: "CNY" },
];

const TIER_FIELDS: { key: keyof FormState; label: string; hint: string }[] = [
  { key: "minTierDeposit", label: "Minimum tier · NGN deposit", hint: "0 = none, 1 = BVN/NIN, 2 = photo ID + liveness" },
  { key: "minTierWithdraw", label: "Minimum tier · withdraw", hint: "Applies to NGN and CNY withdrawals" },
  { key: "minTierCrossBorder", label: "Minimum tier · cross-border", hint: "CNY send + FX conversion" },
  { key: "minTierMarketCheckout", label: "Minimum tier · marketplace checkout", hint: "Escrow order placement" },
  { key: "minTierLogistics", label: "Minimum tier · logistics booking", hint: "Shipping quote book + hold" },
];

function toForm(row: AdminComplianceLimits): FormState {
  return {
    unverifiedNgnDailyCapMinor: String(row.unverifiedNgnDailyCapMinor),
    ngnTier1DailyCapMinor: String(row.ngnTier1DailyCapMinor),
    ngnTier2DailyCapMinor: String(row.ngnTier2DailyCapMinor),
    cnyDailyCapMinor: String(row.cnyDailyCapMinor),
    minTierDeposit: String(row.minTierDeposit),
    minTierWithdraw: String(row.minTierWithdraw),
    minTierCrossBorder: String(row.minTierCrossBorder),
    minTierMarketCheckout: String(row.minTierMarketCheckout),
    minTierLogistics: String(row.minTierLogistics),
    allowBasicWhilePending: row.allowBasicWhilePending,
  };
}

function Page() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setForm(toForm(await fetchAdminComplianceLimits()));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load limits");
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
      await putAdminComplianceLimits({
        unverifiedNgnDailyCapMinor: Number(form.unverifiedNgnDailyCapMinor),
        ngnTier1DailyCapMinor: Number(form.ngnTier1DailyCapMinor),
        ngnTier2DailyCapMinor: Number(form.ngnTier2DailyCapMinor),
        cnyDailyCapMinor: Number(form.cnyDailyCapMinor),
        minTierDeposit: Number(form.minTierDeposit),
        minTierWithdraw: Number(form.minTierWithdraw),
        minTierCrossBorder: Number(form.minTierCrossBorder),
        minTierMarketCheckout: Number(form.minTierMarketCheckout),
        minTierLogistics: Number(form.minTierLogistics),
        allowBasicWhilePending: form.allowBasicWhilePending,
      });
      toast.success("Compliance limits saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="KYC & daily limits"
      description="Configure tier caps and which actions require Tier 1 or Tier 2 approval. Changes apply immediately to the mobile app and API."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Limits" }]}
      actions={
        <button
          type="button"
          disabled={!form || saving}
          onClick={() => void save()}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.navy }}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save limits
        </button>
      }
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : !form ? (
        <p className="text-[13px]" style={{ color: T.danger }}>
          Could not load compliance limits.
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="size-4" style={{ color: T.navy }} strokeWidth={2.2} />
              <p className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                Daily caps (minor units)
              </p>
            </div>
            <div className="space-y-3">
              {CAP_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-[12px] font-semibold" style={{ color: T.ink }}>
                    {f.label}
                  </span>
                  <input
                    value={String(form[f.key])}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value.replace(/\D/g, "") })}
                    className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] tabular-nums"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <span className="block mt-1 text-[10.5px]" style={{ color: T.muted }}>
                    {f.hint}
                    {Number(form[f.key]) > 0 ? ` · ≈ ${fmtMoney(f.currency, form[f.key])}` : ""}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: T.muted }}>
              Minimum tier per action
            </p>
            <div className="space-y-3">
              {TIER_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-[12px] font-semibold" style={{ color: T.ink }}>
                    {f.label}
                  </span>
                  <select
                    value={String(form[f.key])}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="mt-1 w-full h-9 px-3 rounded-lg text-[12px]"
                    style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  >
                    <option value="0">0 — No verification</option>
                    <option value="1">1 — Tier 1 (BVN/NIN)</option>
                    <option value="2">2 — Tier 2 (ID + liveness)</option>
                  </select>
                  <span className="block mt-1 text-[10.5px]" style={{ color: T.muted }}>
                    {f.hint}
                  </span>
                </label>
              ))}

              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowBasicWhilePending}
                  onChange={(e) => setForm({ ...form, allowBasicWhilePending: e.target.checked })}
                  className="mt-1"
                />
                <span>
                  <span className="text-[12px] font-semibold block" style={{ color: T.ink }}>
                    Allow basic NGN ops while pending review
                  </span>
                  <span className="text-[10.5px]" style={{ color: T.muted }}>
                    Submitted users get Tier 1 daily caps before admin approval. Cross-border stays blocked until Tier 2 approved.
                  </span>
                </span>
              </label>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
