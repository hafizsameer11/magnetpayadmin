import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize, tierTone } from "@/components/admin/merchants/merchantUi";
import {
  fetchMerchantTiers,
  fmtNgn,
  upsertMerchantTier,
  type AdminMerchantTierRule,
  type MerchantTier,
} from "@/lib/merchant-admin-api";

export function MerchantsTiersPage() {
  const [rules, setRules] = useState<AdminMerchantTierRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchMerchantTiers()
      .then(setRules)
      .catch((e) => {
        setRules([]);
        toast.error(e instanceof Error ? e.message : "Failed to load tiers");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const edit = async (
    rule: AdminMerchantTierRule,
    field: "monthlyVolumeThreshold" | "dailyLimitMinor" | "singleLimitMinor",
  ) => {
    const current =
      field === "monthlyVolumeThreshold"
        ? Math.round(Number(rule.monthlyVolumeThreshold) / 100)
        : Math.round(Number(rule[field]) / 100);
    const v = window.prompt(`Edit ${field} (NGN major)`, String(current));
    if (v == null) return;
    const major = Number(v.replace(/,/g, ""));
    if (!Number.isFinite(major)) {
      toast.error("Invalid number");
      return;
    }
    const minor = Math.round(major * 100);
    try {
      const updated = await upsertMerchantTier({
        tier: rule.tier as MerchantTier,
        monthlyVolumeThreshold:
          field === "monthlyVolumeThreshold" ? minor : rule.monthlyVolumeThreshold,
        dailyLimitMinor: field === "dailyLimitMinor" ? minor : rule.dailyLimitMinor,
        singleLimitMinor: field === "singleLimitMinor" ? minor : rule.singleLimitMinor,
      });
      setRules((prev) => {
        const idx = prev.findIndex((r) => r.tier === updated.tier);
        if (idx < 0) return [...prev, updated];
        return prev.map((r, i) => (i === idx ? updated : r));
      });
      toast.success("Tier rule updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <AdminShell
      title="Tiers & limits"
      description="Volume thresholds, daily and single-transaction limits."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Tiers" },
      ]}
    >
      <MerchantsSubnav />
      {loading ? (
        <p className="text-[12px] py-6 text-center" style={{ color: T.muted }}>
          Loading…
        </p>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {rules.map((r) => (
          <div key={r.tier} className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <StatusBadge tone={tierTone(r.tier)}>{capitalize(r.tier)}</StatusBadge>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-2">
                <dt style={{ color: T.sub }}>Monthly volume</dt>
                <dd>
                  <button
                    type="button"
                    className="font-bold tabular-nums hover:underline"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    onClick={() => void edit(r, "monthlyVolumeThreshold")}
                  >
                    {fmtNgn(r.monthlyVolumeThreshold)}
                  </button>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt style={{ color: T.sub }}>Daily limit</dt>
                <dd>
                  <button
                    type="button"
                    className="font-bold tabular-nums hover:underline"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    onClick={() => void edit(r, "dailyLimitMinor")}
                  >
                    {fmtNgn(r.dailyLimitMinor)}
                  </button>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt style={{ color: T.sub }}>Single tx</dt>
                <dd>
                  <button
                    type="button"
                    className="font-bold tabular-nums hover:underline"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    onClick={() => void edit(r, "singleLimitMinor")}
                  >
                    {fmtNgn(r.singleLimitMinor)}
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        ))}
        {!loading && !rules.length ? (
          <p className="text-[12px] col-span-3 text-center" style={{ color: T.muted }}>
            No tier rules configured.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
