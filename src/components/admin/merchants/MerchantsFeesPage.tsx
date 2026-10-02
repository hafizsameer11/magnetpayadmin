import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize, tierTone } from "@/components/admin/merchants/merchantUi";
import {
  createMerchantFee,
  fetchMerchantFees,
  fmtNgn,
  type AdminMerchantFeeRule,
} from "@/lib/merchant-admin-api";

export function MerchantsFeesPage() {
  const [rules, setRules] = useState<AdminMerchantFeeRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchMerchantFees()
      .then(setRules)
      .catch((e) => {
        setRules([]);
        toast.error(e instanceof Error ? e.message : "Failed to load fees");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell
      title="Fees & pricing"
      description="Platform fee tiers per service, caps and per-tier overrides. Versioned with effective dates."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Fees" },
      ]}
      actions={
        <button
          type="button"
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white"
          style={{ background: T.navy }}
          onClick={async () => {
            const base = rules[0];
            if (!base) {
              toast.error("No existing rule to version from");
              return;
            }
            try {
              const next = await createMerchantFee({
                service: base.service,
                minAmount: base.minAmount,
                maxAmount: base.maxAmount ?? null,
                feeType: base.feeType === "percent" ? "percent" : "flat",
                value: base.value,
                tier: base.tier ?? null,
                version: (base.version ?? 1) + 1,
              });
              setRules((prev) => [next, ...prev]);
              toast.success("New fee rule version created");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Create failed");
            }
          }}
        >
          New version
        </button>
      }
    >
      <MerchantsSubnav />
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.2fr 1fr 0.8fr 0.9fr 0.7fr 0.8fr 0.6fr",
          }}
        >
          <span>Service</span>
          <span>Amount band</span>
          <span>Fee</span>
          <span>Tier</span>
          <span>Effective</span>
          <span>Version</span>
          <span />
        </div>
        {loading ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          rules.map((r, i) => (
            <div
              key={r.id}
              className="grid items-center px-4 min-h-[48px] text-[12px]"
              style={{
                gridTemplateColumns: "1.2fr 1fr 0.8fr 0.9fr 0.7fr 0.8fr 0.6fr",
                borderBottom: i < rules.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="font-semibold">{r.service}</span>
              <span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
                {fmtNgn(r.minAmount)} – {r.maxAmount == null ? "∞" : fmtNgn(r.maxAmount)}
              </span>
              <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {r.feeType === "percent" ? `${r.value}%` : fmtNgn(r.value)}
              </span>
              <StatusBadge tone={!r.tier || r.tier === "all" ? "neutral" : tierTone(r.tier)}>
                {capitalize(r.tier ?? "all")}
              </StatusBadge>
              <span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>
                {String(r.effectiveFrom).slice(0, 10)}
              </span>
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                v{r.version}
              </span>
              <button
                type="button"
                className="text-[10px] font-bold justify-self-end"
                style={{ color: T.info }}
                onClick={async () => {
                  const v = window.prompt("New fee value", String(r.value));
                  if (v == null) return;
                  const n = Number(v);
                  if (!Number.isFinite(n)) {
                    toast.error("Invalid value");
                    return;
                  }
                  try {
                    const next = await createMerchantFee({
                      service: r.service,
                      minAmount: r.minAmount,
                      maxAmount: r.maxAmount ?? null,
                      feeType: r.feeType === "percent" ? "percent" : "flat",
                      value: n,
                      tier: r.tier ?? null,
                      version: (r.version ?? 1) + 1,
                    });
                    setRules((prev) => [next, ...prev]);
                    toast.success("Fee updated (new version)");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Update failed");
                  }
                }}
              >
                Edit
              </button>
            </div>
          ))}
        {!loading && !rules.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No fee rules yet.
          </p>
        ) : null}
      </div>
      <p className="mt-3 text-[11px]" style={{ color: T.muted }}>
        Edits create a new versioned fee rule (API has no PATCH). Flat amounts are in minor units.
      </p>
    </AdminShell>
  );
}
