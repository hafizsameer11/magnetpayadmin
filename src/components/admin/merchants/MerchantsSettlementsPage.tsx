import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, ListEmpty, ListTableShell, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge, StatusCell } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize, settlementTone } from "@/components/admin/merchants/merchantUi";
import {
  decideMerchantBankChange,
  fetchMerchantBankChanges,
  fetchMerchantSettlements,
  fmtNgn,
  holdMerchantSettlement,
  retryMerchantSettlement,
  type AdminBankChange,
  type AdminMerchantSettlement,
} from "@/lib/merchant-admin-api";

const COLS = ["0.9fr", "1.4fr", "1.2fr", "0.7fr", "0.8fr", "1fr"];

export function MerchantsSettlementsPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState<AdminMerchantSettlement[]>([]);
  const [bankChanges, setBankChanges] = useState<AdminBankChange[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchMerchantSettlements(tab === "all" ? undefined : tab),
      fetchMerchantBankChanges(),
    ])
      .then(([settlements, banks]) => {
        setRows(settlements);
        setBankChanges(banks);
      })
      .catch((e) => {
        setRows([]);
        setBankChanges([]);
        toast.error(e instanceof Error ? e.message : "Failed to load settlements");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = rows.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (s.merchant?.businessName ?? "").toLowerCase().includes(q) ||
      (s.merchant?.agentId ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Settlements & payouts"
      description="Nightly batch at 21:00 — queued, paid, failed and held."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Settlements" },
      ]}
    >
      <MerchantsSubnav />
      <FilterTabs
        tabs={[
          { id: "all", label: "All", count: rows.length },
          { id: "QUEUED", label: "Queued" },
          { id: "PAID", label: "Paid" },
          { id: "FAILED", label: "Failed" },
          { id: "HELD", label: "Held" },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="mt-3" />
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Merchant or agent ID…" />

      <ListTableShell
        columns={["Batch", "Merchant", "Bank", "Status", "→Amount", "Actions"]}
        template={COLS.join(" ")}
        minWidth={860}
      >
        {loading ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          filtered.map((s, i) => (
            <div
              key={s.id}
              className="grid items-center px-4 min-h-[52px] text-[12px]"
              style={{
                gridTemplateColumns: COLS.join(" "),
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {String(s.batchDate).slice(0, 10)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold truncate">{s.merchant?.businessName ?? "—"}</p>
                <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.merchant?.agentId ?? "—"}
                </p>
              </div>
              <span style={{ color: T.sub }}>
                {s.bank} · ****{s.accountLast4}
              </span>
              <StatusCell>
                <StatusBadge tone={settlementTone(s.status)}>{capitalize(s.status)}</StatusBadge>
              </StatusCell>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtNgn(s.amountMinor)}
              </span>
              <div className="flex gap-1.5 justify-end">
                {s.status === "FAILED" ? (
                  <button
                    type="button"
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${T.info}18`, color: T.info }}
                    onClick={async () => {
                      try {
                        const updated = await retryMerchantSettlement(s.id);
                        setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, ...updated } : r)));
                        toast.success("Payout retried");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Retry failed");
                      }
                    }}
                  >
                    Retry
                  </button>
                ) : null}
                {s.status === "QUEUED" || s.status === "PAID" ? (
                  <button
                    type="button"
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${T.warn}18`, color: T.warn }}
                    onClick={async () => {
                      try {
                        const updated = await holdMerchantSettlement(s.id);
                        setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, ...updated } : r)));
                        toast.message("Payout held");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Hold failed");
                      }
                    }}
                  >
                    Hold
                  </button>
                ) : null}
                {s.status === "HELD" ? (
                  <button
                    type="button"
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${T.success}18`, color: T.success }}
                    onClick={async () => {
                      try {
                        const updated = await retryMerchantSettlement(s.id);
                        setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, ...updated } : r)));
                        toast.success("Hold released / retried");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Release failed");
                      }
                    }}
                  >
                    Release
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        {!loading && !filtered.length ? <ListEmpty message="No settlements." /> : null}
      </ListTableShell>

      <div className="mt-6 rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
          Settlement bank change requests (24h pause)
        </p>
        <div className="space-y-2">
          {bankChanges.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center gap-3 rounded-lg px-3 py-2.5 text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{b.merchant?.businessName ?? "—"}</p>
                <p style={{ color: T.sub }}>
                  {b.oldBank ?? "—"} → {b.newBank}
                </p>
                <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {b.merchant?.agentId ?? "—"} · {new Date(b.requestedAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge tone={b.status === "APPROVED" ? "success" : b.status === "DENIED" ? "danger" : "warn"}>
                {capitalize(b.status)}
              </StatusBadge>
              {b.status === "PENDING" ? (
                <>
                  <button
                    type="button"
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${T.success}18`, color: T.success }}
                    onClick={async () => {
                      try {
                        await decideMerchantBankChange(b.id, "APPROVED");
                        setBankChanges((prev) => prev.filter((x) => x.id !== b.id));
                        toast.success("Bank change approved");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${T.danger}18`, color: T.danger }}
                    onClick={async () => {
                      try {
                        await decideMerchantBankChange(b.id, "DENIED");
                        setBankChanges((prev) => prev.filter((x) => x.id !== b.id));
                        toast.error("Bank change denied");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                  >
                    Deny
                  </button>
                </>
              ) : null}
            </div>
          ))}
          {!bankChanges.length ? (
            <p className="text-[12px]" style={{ color: T.muted }}>
              No pending bank changes.
            </p>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
