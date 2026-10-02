import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize, disputeTone } from "@/components/admin/merchants/merchantUi";
import { fetchMerchantDisputes, type AdminMerchantDispute } from "@/lib/merchant-admin-api";

export function MerchantsDisputesPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState<AdminMerchantDispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMerchantDisputes()
      .then((d) => {
        if (!cancelled) setRows(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setRows([]);
          toast.error(e instanceof Error ? e.message : "Failed to load disputes");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = rows.filter((d) => {
    if (tab !== "all" && d.status !== tab) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (d.txRef ?? "").toLowerCase().includes(q) ||
      (d.merchant?.businessName ?? "").toLowerCase().includes(q) ||
      d.reason.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Merchant disputes"
      description="Tickets from “Report a problem” on till receipts."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Disputes" },
      ]}
    >
      <MerchantsSubnav />
      <FilterTabs
        tabs={[
          { id: "all", label: "All", count: rows.length },
          { id: "open", label: "Open" },
          { id: "assigned", label: "Assigned" },
          { id: "resolved", label: "Resolved" },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="mt-3" />
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Tx ref, merchant, reason…" />

      <div className="space-y-3">
        {loading ? (
          <p className="text-[12px] py-6 text-center" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          filtered.map((d) => (
            <div key={d.id} className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-bold">{d.txRef ?? "No tx ref"}</p>
                  <p className="text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {d.merchant?.agentId ?? "—"} · {d.merchant?.businessName ?? "—"}
                  </p>
                </div>
                <StatusBadge tone={disputeTone(d.status)}>{capitalize(d.status)}</StatusBadge>
              </div>
              <p className="mt-2 text-[12px]" style={{ color: T.sub }}>
                {d.reason}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: T.muted }}>
                Assignee: {d.assigneeId ?? "Unassigned"} · {new Date(d.createdAt).toLocaleString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="h-8 px-2.5 rounded-lg text-[11px] font-semibold"
                  style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  onClick={() => toast.message("Dispute assign/update API not exposed yet — status is read-only")}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="h-8 px-2.5 rounded-lg text-[11px] font-semibold"
                  style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  onClick={() => toast.message("Messaging not available via API yet")}
                >
                  Message
                </button>
                <button
                  type="button"
                  className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-white"
                  style={{ background: T.navy }}
                  onClick={() => toast.message("Resolve endpoint not available yet")}
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        {!loading && !filtered.length ? <ListEmpty message="No disputes." /> : null}
      </div>
    </AdminShell>
  );
}
