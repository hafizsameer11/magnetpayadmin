import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Star } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, ListEmpty, ListTableShell, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge, StatusCell } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize, merchantStatusTone, tierTone } from "@/components/admin/merchants/merchantUi";
import {
  downloadCsv,
  fetchMerchants,
  floatTotalMinor,
  fmtNgn,
  type AdminMerchantListItem,
} from "@/lib/merchant-admin-api";

const COLS = ["1.8fr", "0.9fr", "0.7fr", "0.85fr", "1fr", "0.9fr", "0.9fr", "0.75fr"];

export function MerchantsListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [tier, setTier] = useState<"all" | "SILVER" | "GOLD" | "PLATINUM">("all");
  const [rows, setRows] = useState<AdminMerchantListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = window.setTimeout(() => {
      fetchMerchants({
        status: status === "all" ? undefined : status,
        q: query.trim() || undefined,
        tier: tier === "all" ? undefined : tier,
      })
        .then((d) => {
          if (!cancelled) setRows(d);
        })
        .catch((e) => {
          if (!cancelled) {
            setRows([]);
            toast.error(e instanceof Error ? e.message : "Failed to load merchants");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, query ? 250 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [status, tier, query]);

  const statusTabs = useMemo(
    () => [
      { id: "all", label: "All", count: status === "all" ? rows.length : undefined },
      { id: "PENDING", label: "Pending KYB" },
      { id: "ACTIVE", label: "Active" },
      { id: "SUSPENDED", label: "Suspended" },
      { id: "CLOSED", label: "Closed" },
    ],
    [rows.length, status],
  );

  return (
    <AdminShell
      title="Merchants list"
      description="Search by name, agent ID, phone or tag. Filter by status, tier and location."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "List" },
      ]}
      actions={
        <button
          type="button"
          onClick={() => {
            downloadCsv(
              `merchants-${new Date().toISOString().slice(0, 10)}.csv`,
              ["agentId", "businessName", "status", "tier", "state", "phone", "floatMinor"],
              rows.map((m) => [
                m.agentId,
                m.businessName,
                m.status,
                m.tier,
                m.state ?? "",
                m.phone ?? "",
                floatTotalMinor(m),
              ]),
            );
            toast.success(`Exported ${rows.length} merchants`);
          }}
          className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
          style={{ background: T.navy }}
        >
          <Download className="size-3.5" strokeWidth={2.4} />
          Export CSV
        </button>
      }
    >
      <MerchantsSubnav />
      <FilterTabs tabs={statusTabs} active={status} onChange={setStatus} />
      <div className="mt-3 flex flex-wrap gap-1.5 mb-3">
        {(["all", "SILVER", "GOLD", "PLATINUM"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className="h-7 px-2.5 rounded-full text-[11px] font-semibold"
            style={{
              background: tier === t ? T.navy : T.surface,
              color: tier === t ? "#fff" : T.ink,
              border: `1px solid ${tier === t ? T.navy : T.border}`,
            }}
          >
            {t === "all" ? "All tiers" : capitalize(t)}
          </button>
        ))}
      </div>
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Name, MP-AG-####, phone, @tag…" />

      <ListTableShell
        columns={["Merchant", "Agent ID", "Tier", "Status", "Location", "→Float", "→Earnings", "Type"]}
        template={COLS.join(" ")}
        minWidth={980}
      >
        {loading ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          rows.map((m, i) => (
            <div
              key={m.id}
              className="grid items-center px-4 min-h-[56px] text-[12px]"
              style={{
                gridTemplateColumns: COLS.join(" "),
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div className="min-w-0 py-2">
                <Link
                  to="/admin/merchants/$id"
                  params={{ id: m.id }}
                  className="font-semibold hover:underline truncate block"
                  style={{ color: T.ink }}
                >
                  {m.premiumPartner ? <Star className="inline size-3 mr-1 -mt-0.5" style={{ color: T.warn }} /> : null}
                  {m.businessName}
                </Link>
                <p className="text-[10px] truncate" style={{ color: T.muted }}>
                  {m.tag} · {m.ownerName || m.user?.name || "—"}
                </p>
              </div>
              <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.navy }}>
                {m.agentId}
              </span>
              <StatusCell>
                <StatusBadge tone={tierTone(m.tier)}>{capitalize(m.tier)}</StatusBadge>
              </StatusCell>
              <StatusCell>
                <StatusBadge tone={merchantStatusTone(m.status)}>{capitalize(m.status)}</StatusBadge>
              </StatusCell>
              <span className="truncate" style={{ color: T.sub }}>
                {m.state} / {m.lga}
              </span>
              <span className="text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtNgn(floatTotalMinor(m))}
              </span>
              <span className="text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
                {fmtNgn(m.unpaidEarningsMinor)}
              </span>
              <span style={{ color: T.muted }}>
                {String(m.businessType).toUpperCase() === "REGISTERED" ? "Reg." : "Unreg."}
              </span>
            </div>
          ))}
        {!loading && !rows.length ? <ListEmpty message="No merchants match your filters." /> : null}
      </ListTableShell>
    </AdminShell>
  );
}
