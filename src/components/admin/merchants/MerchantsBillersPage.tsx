import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, ListEmpty } from "@/components/admin/ListPageKit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize } from "@/components/admin/merchants/merchantUi";
import {
  fetchMerchantBillers,
  fmtNgn,
  patchMerchantBiller,
  type AdminBiller,
} from "@/lib/merchant-admin-api";

export function MerchantsBillersPage() {
  const [tab, setTab] = useState("all");
  const [billers, setBillers] = useState<AdminBiller[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchMerchantBillers()
      .then(setBillers)
      .catch((e) => {
        setBillers([]);
        toast.error(e instanceof Error ? e.message : "Failed to load billers");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = billers
    .filter((b) => (tab === "all" ? true : b.category === tab))
    .sort((a, b) => a.sort - b.sort);

  return (
    <AdminShell
      title="Billers config"
      description="Enable providers, set display order, plans and brand colours."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Billers" },
      ]}
    >
      <MerchantsSubnav />
      <FilterTabs
        tabs={[
          { id: "all", label: "All" },
          { id: "AIRTIME", label: "Airtime" },
          { id: "DATA", label: "Data" },
          { id: "POWER", label: "Power" },
          { id: "CABLE", label: "Cable" },
        ]}
        active={tab}
        onChange={setTab}
      />
      {loading ? (
        <p className="text-[12px] py-6 text-center" style={{ color: T.muted }}>
          Loading…
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg grid place-items-center text-[11px] font-bold text-white"
                style={{ background: b.brandColor }}
              >
                {b.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[13px]">{b.name}</p>
                <p className="text-[11px]" style={{ color: T.muted }}>
                  {capitalize(b.category)} · sort {b.sort}
                </p>
              </div>
              <StatusBadge tone={b.enabled ? "success" : "neutral"}>{b.enabled ? "On" : "Off"}</StatusBadge>
            </div>
            {b.plans?.length ? (
              <ul className="mt-3 space-y-1 text-[11px]" style={{ color: T.sub }}>
                {b.plans.map((p) => (
                  <li key={p.id} className="flex justify-between gap-2">
                    <span>{p.name}</span>
                    <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmtNgn(p.priceMinor)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="h-8 px-2.5 rounded-lg text-[11px] font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
                onClick={async () => {
                  try {
                    const updated = await patchMerchantBiller(b.id, { enabled: !b.enabled });
                    setBillers((prev) => prev.map((x) => (x.id === b.id ? { ...x, ...updated, plans: x.plans } : x)));
                    toast.success(`${b.name} ${b.enabled ? "disabled" : "enabled"}`);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Update failed");
                  }
                }}
              >
                {b.enabled ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                className="h-8 px-2.5 rounded-lg text-[11px] font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
                onClick={async () => {
                  try {
                    const updated = await patchMerchantBiller(b.id, { sort: Math.max(0, b.sort - 1) });
                    setBillers((prev) => prev.map((x) => (x.id === b.id ? { ...x, ...updated, plans: x.plans } : x)));
                    toast.message("Moved up");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Update failed");
                  }
                }}
              >
                Move up
              </button>
            </div>
          </div>
        ))}
      </div>
      {!loading && !filtered.length ? <ListEmpty message="No billers." /> : null}
    </AdminShell>
  );
}
