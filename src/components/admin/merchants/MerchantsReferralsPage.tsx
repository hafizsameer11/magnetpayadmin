import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize } from "@/components/admin/merchants/merchantUi";
import {
  fetchMerchantReferrals,
  fmtNgn,
  payoutMerchantReferral,
  type AdminMerchantReferral,
} from "@/lib/merchant-admin-api";

export function MerchantsReferralsPage() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminMerchantReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const rewardAmount = 2_500_000; // ₦25,000 minor display reference

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMerchantReferrals()
      .then((d) => {
        if (!cancelled) setRows(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setRows([]);
          toast.error(e instanceof Error ? e.message : "Failed to load referrals");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
          <p className="text-[14px] font-bold mt-1">
            {fmtNgn(rewardAmount)} per successful referred merchant (after KYB approval)
          </p>
        </div>
        <button
          type="button"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold"
          style={{ background: T.bg, border: `1px solid ${T.border}` }}
          onClick={() => toast.message("Reward rule is configured server-side")}
        >
          Edit rule
        </button>
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
