import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize } from "@/components/admin/merchants/merchantUi";
import {
  fetchMerchantReferralConfig,
  fetchMerchantReferrals,
  fmtNgn,
  payoutMerchantReferral,
  updateMerchantReferralConfig,
  type AdminMerchantReferral,
} from "@/lib/merchant-admin-api";

export function MerchantsReferralsPage() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminMerchantReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardMinor, setRewardMinor] = useState(500_000);
  const [editingRule, setEditingRule] = useState(false);
  const [draftReward, setDraftReward] = useState("5000");
  const [savingRule, setSavingRule] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [refs, cfg] = await Promise.all([fetchMerchantReferrals(), fetchMerchantReferralConfig()]);
      setRows(refs);
      setRewardMinor(cfg.rewardMinor);
      setDraftReward(String(Math.round(cfg.rewardMinor / 100)));
    } catch (e) {
      setRows([]);
      toast.error(e instanceof Error ? e.message : "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((r) => {
    if (tab !== "all" && r.status !== tab) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (r.referrer?.businessName ?? "").toLowerCase().includes(q) ||
      (r.referred?.businessName ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Referrals"
      description="Referral tree, reward rules and payout of rewards."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Referrals" },
      ]}
    >
      <MerchantsSubnav />
      <div
        className="rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            Reward rule
          </p>
          {editingRule ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold">₦</span>
              <input
                value={draftReward}
                onChange={(e) => setDraftReward(e.target.value.replace(/[^\d]/g, ""))}
                className="h-9 w-32 px-3 rounded-lg text-[12px] outline-none tabular-nums"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}
                inputMode="numeric"
              />
              <span className="text-[11px]" style={{ color: T.muted }}>
                major naira (saved as kobo)
              </span>
            </div>
          ) : (
            <p className="text-[14px] font-bold mt-1">
              {fmtNgn(rewardMinor)} per successful referred merchant (after KYB approval)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {editingRule ? (
            <>
              <button
                type="button"
                disabled={savingRule}
                className="h-9 px-3 rounded-lg text-[12px] font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
                onClick={() => {
                  setEditingRule(false);
                  setDraftReward(String(Math.round(rewardMinor / 100)));
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingRule || !draftReward}
                className="h-9 px-3 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
                style={{ background: T.navy }}
                onClick={async () => {
                  const major = Number(draftReward);
                  if (!Number.isFinite(major) || major <= 0) {
                    toast.error("Enter a valid reward amount");
                    return;
                  }
                  setSavingRule(true);
                  try {
                    const next = await updateMerchantReferralConfig(Math.round(major * 100));
                    setRewardMinor(next.rewardMinor);
                    setEditingRule(false);
                    toast.success("Referral reward rule updated");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Could not update reward rule");
                  } finally {
                    setSavingRule(false);
                  }
                }}
              >
                {savingRule ? "Saving…" : "Save rule"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="h-9 px-3 rounded-lg text-[12px] font-semibold"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
              onClick={() => setEditingRule(true)}
            >
              Edit rule
            </button>
          )}
        </div>
      </div>

      <FilterTabs
        tabs={[
          { id: "all", label: "All", count: rows.length },
          { id: "pending", label: "Pending" },
          { id: "earned", label: "Earned" },
          { id: "paid", label: "Paid" },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="mt-3" />
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Referrer or referred…" />

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {loading ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          filtered.map((r, i) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-[12px]"
              style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {r.referrer?.businessName ?? "—"} → {r.referred?.businessName ?? "—"}
                </p>
                <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(r.createdAt).toLocaleDateString()} · reward {fmtNgn(r.rewardMinor)}
                </p>
              </div>
              <StatusBadge tone={r.status === "paid" ? "success" : r.status === "earned" ? "info" : "warn"}>
                {capitalize(r.status)}
              </StatusBadge>
              {r.status === "earned" ? (
                <button
                  type="button"
                  className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-white"
                  style={{ background: T.navy }}
                  onClick={async () => {
                    try {
                      const updated = await payoutMerchantReferral(r.id);
                      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...updated } : x)));
                      toast.success("Referral reward paid out");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Payout failed");
                    }
                  }}
                >
                  Pay reward
                </button>
              ) : null}
            </div>
          ))}
        {!loading && !filtered.length ? <ListEmpty message="No referrals." /> : null}
      </div>
    </AdminShell>
  );
}
