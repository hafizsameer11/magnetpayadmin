import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, ListEmpty, ListTableShell, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge, StatusCell } from "@/components/admin/StatusBadge";
import { DualApprovalPanel } from "@/components/admin/merchants/DualApprovalPanel";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize, txStatusTone } from "@/components/admin/merchants/merchantUi";
import {
  createMerchantDispute,
  fetchMerchantTransaction,
  fetchMerchantTransactions,
  fmtNgn,
  kindLabel,
  reverseMerchantTransaction,
  type AdminMerchantTx,
} from "@/lib/merchant-admin-api";

const COLS = ["1.4fr", "0.7fr", "1.2fr", "0.7fr", "0.8fr", "0.8fr", "0.9fr"];

export function MerchantsTransactionsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [rows, setRows] = useState<AdminMerchantTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMerchantTransactions({
      status: status === "all" ? undefined : status,
      kind: kind === "all" ? undefined : kind,
    })
      .then((d) => {
        if (!cancelled) setRows(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setRows([]);
          toast.error(e instanceof Error ? e.message : "Failed to load transactions");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, kind]);

  const filtered = rows.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.ref.toLowerCase().includes(q) ||
      (t.merchant?.agentId ?? "").toLowerCase().includes(q) ||
      (t.merchant?.businessName ?? "").toLowerCase().includes(q) ||
      (t.counterparty ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Merchant transactions"
      description="All till activity — cash out, cash in, bills and transfers."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Transactions" },
      ]}
    >
      <MerchantsSubnav />
      <FilterTabs
        tabs={[
          { id: "all", label: "All", count: rows.length },
          { id: "PENDING", label: "Pending" },
          { id: "COMPLETED", label: "Completed" },
          { id: "FAILED", label: "Failed" },
          { id: "DISPUTED", label: "Disputed" },
          { id: "REVERSED", label: "Reversed" },
        ]}
        active={status}
        onChange={setStatus}
      />
      <div className="mt-3 flex flex-wrap gap-1.5 mb-3">
        {(["all", "CASH_OUT", "CASH_IN", "BILL", "TRANSFER"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className="h-7 px-2.5 rounded-full text-[11px] font-semibold"
            style={{
              background: kind === k ? T.navy : T.surface,
              color: kind === k ? "#fff" : T.ink,
              border: `1px solid ${kind === k ? T.navy : T.border}`,
            }}
          >
            {k === "all" ? "All types" : kindLabel(k)}
          </button>
        ))}
      </div>
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Ref, agent, merchant…" />

      <ListTableShell
        columns={["Reference", "Type", "Merchant", "Status", "→Amount", "→Fees", "When"]}
        template={COLS.join(" ")}
        minWidth={920}
      >
        {loading ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          filtered.map((t, i) => (
            <div
              key={t.ref}
              className="grid items-center px-4 min-h-[52px] text-[12px]"
              style={{
                gridTemplateColumns: COLS.join(" "),
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <Link
                to="/admin/merchants/transactions/$ref"
                params={{ ref: t.ref }}
                className="tabular-nums font-semibold hover:underline truncate"
                style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t.ref}
              </Link>
              <span style={{ color: T.sub }}>{kindLabel(t.kind)}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{t.merchant?.businessName ?? "—"}</p>
                <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {t.merchant?.agentId ?? "—"}
                </p>
              </div>
              <StatusCell>
                <StatusBadge tone={txStatusTone(t.status)}>{capitalize(t.status)}</StatusBadge>
              </StatusCell>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtNgn(t.amountMinor)}
              </span>
              <span className="text-right tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>
                P {fmtNgn(t.platformFeeMinor)} · A {fmtNgn(t.agentFeeMinor)}
              </span>
              <span className="tabular-nums text-[11px]" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(t.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        {!loading && !filtered.length ? <ListEmpty message="No transactions match." /> : null}
      </ListTableShell>
    </AdminShell>
  );
}

export function MerchantTxDetailPage({ refId }: { refId: string }) {
  const [tx, setTx] = useState<AdminMerchantTx | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMerchantTransaction(refId)
      .then((d) => {
        if (!cancelled) setTx(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setTx(null);
          toast.error(e instanceof Error ? e.message : "Failed to load transaction");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refId]);

  if (loading && !tx) {
    return (
      <AdminShell
        title="Transaction"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Merchants", to: "/admin/merchants/transactions" },
          { label: refId },
        ]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Loading…
        </p>
      </AdminShell>
    );
  }

  if (!tx) {
    return (
      <AdminShell
        title="Transaction"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Merchants", to: "/admin/merchants/transactions" },
          { label: refId },
        ]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Transaction not found.
        </p>
      </AdminShell>
    );
  }

  const timeline: { at: string; label: string }[] = [
    { at: tx.createdAt, label: "Created" },
    ...(tx.status === "COMPLETED" || tx.status === "REVERSED" || tx.status === "DISPUTED"
      ? [{ at: tx.createdAt, label: `Status: ${capitalize(tx.status)}` }]
      : []),
  ];

  return (
    <AdminShell
      title={tx.ref}
      description={`${kindLabel(tx.kind)} · ${tx.merchant?.businessName ?? "—"}`}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Transactions", to: "/admin/merchants/transactions" },
        { label: tx.ref },
      ]}
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            className="h-9 px-3 rounded-lg text-[12px] font-semibold"
            style={{ background: `${T.warn}18`, color: T.warn, border: `1px solid ${T.warn}40` }}
            onClick={async () => {
              try {
                await createMerchantDispute({
                  merchantId: tx.merchantId,
                  txRef: tx.ref,
                  reason: "Marked disputed from admin",
                });
                setTx({ ...tx, status: "DISPUTED" });
                toast.message("Marked disputed");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
            }}
          >
            Mark disputed
          </button>
        </div>
      }
    >
      <MerchantsSubnav />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <StatusBadge tone={txStatusTone(tx.status)}>{capitalize(tx.status)}</StatusBadge>
            <span className="text-[12px]" style={{ color: T.sub }}>
              Counterparty: {tx.counterpartyName ?? tx.counterparty ?? "—"}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-[12px]">
            {[
              ["Amount", fmtNgn(tx.amountMinor)],
              ["Platform fee", fmtNgn(tx.platformFeeMinor)],
              ["Agent charge", fmtNgn(tx.agentFeeMinor)],
              ["Customer total", fmtNgn(tx.customerTotalMinor)],
              ["Counterparty", tx.counterparty ?? "—"],
              ["Merchant", `${tx.merchant?.businessName ?? "—"} (${tx.merchant?.agentId ?? "—"})`],
              ["Biller", tx.biller?.name ?? "—"],
              ["Bill account", tx.billAccount ?? "—"],
              ["Token", tx.token ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.muted }}>
                  {k}
                </dt>
                <dd
                  className="mt-0.5 font-semibold tabular-nums"
                  style={{
                    fontFamily:
                      k.includes("fee") || k.includes("Amount") || k.includes("total") || k.includes("charge")
                        ? "'JetBrains Mono', monospace"
                        : undefined,
                  }}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <div className="pt-3 border-t" style={{ borderColor: T.border }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
              Timeline
            </p>
            <ul className="space-y-2">
              {timeline.map((ev) => (
                <li key={ev.at + ev.label} className="flex gap-3 text-[12px]">
                  <span className="tabular-nums shrink-0" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(ev.at).toLocaleString()}
                  </span>
                  <span>{ev.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DualApprovalPanel
          title="Reverse / refund"
          actionLabel="Needs second approver"
          onSubmitted={async (reason) => {
            const updated = await reverseMerchantTransaction(tx.ref, reason);
            setTx({ ...tx, ...updated });
            toast.message("Reversal recorded", {
              description: "Transaction marked REVERSED. Dual-approval meta stored.",
            });
          }}
        />
      </div>
    </AdminShell>
  );
}
