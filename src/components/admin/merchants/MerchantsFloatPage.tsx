import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { KpiStrip, ListEmpty } from "@/components/admin/ListPageKit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DualApprovalPanel } from "@/components/admin/merchants/DualApprovalPanel";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize } from "@/components/admin/merchants/merchantUi";
import {
  decideFloatAdjustment,
  fetchFloatAdjustments,
  fetchMerchants,
  floatTotalMinor,
  fmtNgn,
  requestFloatAdjustment,
  type AdminFloatAdjustment,
  type AdminMerchantListItem,
} from "@/lib/merchant-admin-api";

const LOW_CASH_MINOR = 10_000_000; // ₦100,000

export function MerchantsFloatPage() {
  const [adjustments, setAdjustments] = useState<AdminFloatAdjustment[]>([]);
  const [merchants, setMerchants] = useState<AdminMerchantListItem[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [amountMajor, setAmountMajor] = useState("25000");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([fetchFloatAdjustments(), fetchMerchants({ status: "ACTIVE" })])
      .then(([adj, m]) => {
        setAdjustments(adj);
        setMerchants(m);
        if (!merchantId && m[0]) setMerchantId(m[0].id);
      })
      .catch((e) => {
        setAdjustments([]);
        setMerchants([]);
        toast.error(e instanceof Error ? e.message : "Failed to load float data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lowFloat = merchants.filter((m) => {
    const cash = Number(m.float?.cashMinor ?? 0);
    return Number.isFinite(cash) && cash < LOW_CASH_MINOR;
  });

  const networkFloat = merchants.reduce((s, m) => s + floatTotalMinor(m), 0);
  const pending = adjustments.filter((a) => a.status === "PENDING").length;

  return (
    <AdminShell
      title="Float management"
      description="Top-ups, low-float alerts and manual adjustments (Finance · dual approval)."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Float" },
      ]}
    >
      <MerchantsSubnav />
      <KpiStrip
        cols={3}
        items={[
          {
            label: "Network float",
            value: loading ? "…" : fmtNgn(networkFloat),
            tone: T.navy,
          },
          { label: "Low-float agents", value: lowFloat.length, tone: T.warn, Icon: AlertTriangle },
          {
            label: "Pending adjustments",
            value: pending,
            tone: T.info,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
              Low-float alerts (cash &lt; ₦100k)
            </p>
            {lowFloat.length ? (
              <ul className="space-y-2">
                {lowFloat.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px]"
                    style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  >
                    <Link to="/admin/merchants/$id" params={{ id: m.id }} className="font-semibold hover:underline">
                      {m.businessName}
                    </Link>
                    <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.warn }}>
                      Cash {fmtNgn(m.float?.cashMinor)} · Digital {fmtNgn(m.float?.digitalMinor)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <ListEmpty message={loading ? "Loading…" : "No low-float agents."} />
            )}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="px-4 py-3" style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                Float adjustments
              </p>
            </div>
            {adjustments.map((a, i) => (
              <div
                key={a.id}
                className="px-4 py-3 text-[12px]"
                style={{ borderBottom: i < adjustments.length - 1 ? `1px solid ${T.border}` : "none" }}
              >
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div>
                    <p className="font-semibold">{a.merchant?.businessName ?? "—"}</p>
                    <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {a.merchant?.agentId ?? "—"} · by {a.requestedBy?.name ?? a.requestedBy?.email ?? "—"}
                      {a.approvedBy ? ` · decided by ${a.approvedBy.name ?? a.approvedBy.email}` : ""}
                    </p>
                  </div>
                  <span
                    className="tabular-nums font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: Number(a.amountMinor) >= 0 ? T.success : T.danger,
                    }}
                  >
                    {Number(a.amountMinor) >= 0 ? "+" : ""}
                    {fmtNgn(a.amountMinor)}
                  </span>
                  <StatusBadge
                    tone={a.status === "APPROVED" ? "success" : a.status === "DENIED" ? "danger" : "warn"}
                  >
                    {capitalize(a.status)}
                  </StatusBadge>
                </div>
                <p className="mt-1" style={{ color: T.sub }}>
                  {a.reason}
                </p>
                {a.status === "PENDING" ? (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-white"
                      style={{ background: T.navy }}
                      onClick={async () => {
                        try {
                          const updated = await decideFloatAdjustment(a.id, "APPROVED");
                          setAdjustments((prev) => prev.map((x) => (x.id === a.id ? { ...x, ...updated } : x)));
                          toast.success("Second approval recorded — float adjusted");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Approve failed");
                        }
                      }}
                    >
                      Second approve
                    </button>
                    <button
                      type="button"
                      className="h-8 px-2.5 rounded-lg text-[11px] font-bold"
                      style={{ background: `${T.danger}18`, color: T.danger }}
                      onClick={async () => {
                        try {
                          const updated = await decideFloatAdjustment(a.id, "DENIED");
                          setAdjustments((prev) => prev.map((x) => (x.id === a.id ? { ...x, ...updated } : x)));
                          toast.message("Adjustment denied");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Deny failed");
                        }
                      }}
                    >
                      Deny
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!adjustments.length && !loading ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                No float adjustments yet.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl p-4 space-y-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Target merchant
            </p>
            <select
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full h-9 px-2 rounded-lg text-[12px] outline-none"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.businessName} ({m.agentId})
                </option>
              ))}
            </select>
            <label className="block text-[11px] font-semibold" style={{ color: T.sub }}>
              Amount (NGN, + credit / − debit)
              <input
                value={amountMajor}
                onChange={(e) => setAmountMajor(e.target.value)}
                className="mt-1 w-full h-9 px-2 rounded-lg text-[12px] outline-none tabular-nums"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </label>
          </div>
          <DualApprovalPanel
            title="New float adjustment"
            actionLabel="Needs second approver"
            onSubmitted={async (reason) => {
              if (!merchantId) throw new Error("Select a merchant");
              const major = Number(amountMajor.replace(/,/g, ""));
              if (!Number.isFinite(major) || major === 0) throw new Error("Invalid amount");
              const row = await requestFloatAdjustment({
                merchantId,
                amountMinor: Math.round(major * 100),
                reason,
              });
              setAdjustments((prev) => [row, ...prev]);
              toast.message("Needs second approver", {
                description: "Request queued. A second admin must confirm before funds move.",
              });
            }}
          />
        </div>
      </div>
    </AdminShell>
  );
}
