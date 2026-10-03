import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2, KeyRound, LogOut, MapPin, Phone, Star, Users,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { StatusBadge, StatusCell } from "@/components/admin/StatusBadge";
import { DualApprovalPanel } from "@/components/admin/merchants/DualApprovalPanel";
import {
  capitalize,
  merchantStatusTone,
  tierTone,
  txStatusTone,
  settlementTone,
} from "@/components/admin/merchants/merchantUi";
import {
  addMerchantNote,
  approveMerchant,
  decideMerchantKybDoc,
  docLabel,
  fetchMerchant,
  fetchMerchantAudit,
  fetchMerchantNotes,
  fetchMerchantTransactions,
  floatTotalMinor,
  fmtNgn,
  forceMerchantPasscodeReset,
  kindLabel,
  logoutMerchantSessions,
  patchMerchant,
  requestFloatAdjustment,
  type AdminMerchantAudit,
  type AdminMerchantDetail,
  type AdminMerchantTx,
  type MerchantStatus,
  type MerchantTier,
} from "@/lib/merchant-admin-api";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "kyb", label: "KYB" },
  { id: "transactions", label: "Transactions" },
  { id: "settlements", label: "Settlements" },
  { id: "staff", label: "Staff & Branches" },
  { id: "audit", label: "Audit" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function MerchantDetailPage({ id, tab = "overview" }: { id: string; tab?: string }) {
  const [merchant, setMerchant] = useState<AdminMerchantDetail | null>(null);
  const [txs, setTxs] = useState<AdminMerchantTx[]>([]);
  const [audit, setAudit] = useState<AdminMerchantAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const activeTab = (TABS.some((t) => t.id === tab) ? tab : "overview") as TabId;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const m = await fetchMerchant(id);
      setMerchant(m);
      const [txRows, auditRows, noteRows] = await Promise.all([
        fetchMerchantTransactions({ merchantId: m.id }).catch(() => [] as AdminMerchantTx[]),
        fetchMerchantAudit().catch(() => [] as AdminMerchantAudit[]),
        fetchMerchantNotes(m.id).catch(() => []),
      ]);
      setTxs(txRows);
      setNotes(
        noteRows.map((n) => {
          const meta = n.meta as { note?: string } | null;
          return `${meta?.note ?? "Note"} · ${new Date(n.createdAt).toLocaleString()}`;
        }),
      );
      setAudit(
        auditRows.filter(
          (a) =>
            a.entityId === m.id ||
            a.entityId === m.agentId ||
            (typeof a.meta === "object" &&
              a.meta != null &&
              JSON.stringify(a.meta).includes(m.id)),
        ),
      );
    } catch (e) {
      setMerchant(null);
      toast.error(e instanceof Error ? e.message : "Failed to load merchant");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !merchant) {
    return (
      <AdminShell
        title="Merchant"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Merchants", to: "/admin/merchants" },
          { label: id },
        ]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Loading…
        </p>
      </AdminShell>
    );
  }

  if (!merchant) {
    return (
      <AdminShell
        title="Merchant"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Merchants", to: "/admin/merchants" },
          { label: id },
        ]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Merchant not found.
        </p>
      </AdminShell>
    );
  }

  const docs = merchant.documents ?? [];
  const settlements = merchant.settlements ?? [];
  const accountLast4 = merchant.settlementAccount?.slice(-4) ?? "————";

  const setStatus = async (status: MerchantStatus, msg: string) => {
    try {
      const updated = await patchMerchant(merchant.id, { status, reason: msg });
      setMerchant({ ...merchant, ...updated });
      toast.success(msg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const setTier = async (tier: MerchantTier) => {
    try {
      const updated = await patchMerchant(merchant.id, { tier });
      setMerchant({ ...merchant, ...updated });
      toast.success(`Tier changed to ${capitalize(tier)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants/list" },
        { label: merchant.businessName },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          {merchant.status === "PENDING" ? (
            <button
              type="button"
              className="h-9 px-3 rounded-lg text-[12px] font-bold text-white"
              style={{ background: T.success }}
              onClick={async () => {
                try {
                  const updated = await approveMerchant(merchant.id);
                  setMerchant({ ...merchant, ...updated });
                  toast.success("Merchant approved — starter limit lifted");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Approve failed");
                }
              }}
            >
              Approve
            </button>
          ) : null}
          {merchant.status === "ACTIVE" ? (
            <button
              type="button"
              className="h-9 px-3 rounded-lg text-[12px] font-bold"
              style={{ background: `${T.danger}18`, color: T.danger, border: `1px solid ${T.danger}40` }}
              onClick={() => void setStatus("SUSPENDED", "Merchant suspended")}
            >
              Suspend
            </button>
          ) : null}
          {merchant.status === "SUSPENDED" ? (
            <button
              type="button"
              className="h-9 px-3 rounded-lg text-[12px] font-bold text-white"
              style={{ background: T.navy }}
              onClick={() => void setStatus("ACTIVE", "Merchant reactivated")}
            >
              Reactivate
            </button>
          ) : null}
          <select
            className="h-9 px-2 rounded-lg text-[12px] font-semibold outline-none"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
            value={merchant.tier}
            onChange={(e) => void setTier(e.target.value as MerchantTier)}
          >
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
            <option value="PLATINUM">Platinum</option>
          </select>
        </div>
      }
    >
      <div className="rounded-xl p-4 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-12 rounded-xl grid place-items-center shrink-0" style={{ background: `${T.navy}12`, color: T.navy }}>
              <Building2 className="size-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-bold leading-tight">{merchant.businessName}</h2>
                {merchant.premiumPartner ? (
                  <StatusBadge tone="warn">
                    <Star className="size-3" /> Premium
                  </StatusBadge>
                ) : null}
                <StatusBadge tone={merchantStatusTone(merchant.status)}>{capitalize(merchant.status)}</StatusBadge>
                <StatusBadge tone={tierTone(merchant.tier)}>{capitalize(merchant.tier)}</StatusBadge>
              </div>
              <p className="mt-1 text-[12px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {merchant.agentId} · {merchant.tag}
              </p>
              <p className="mt-1 text-[12px] flex flex-wrap gap-3" style={{ color: T.sub }}>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" /> {merchant.address}, {merchant.lga}, {merchant.state}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3" /> {merchant.phone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" /> {merchant.ownerName || merchant.user?.name || "—"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="h-8 px-2.5 rounded-lg text-[11px] font-semibold"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
              onClick={async () => {
                try {
                  const updated = await patchMerchant(merchant.id, {
                    premiumPartner: !merchant.premiumPartner,
                  });
                  setMerchant({ ...merchant, ...updated });
                  toast.success(merchant.premiumPartner ? "Premium partner removed" : "Premium partner enabled");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Update failed");
                }
              }}
            >
              Toggle premium
            </button>
            <button
              type="button"
              className="h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
              onClick={() => {
                void (async () => {
                  try {
                    await forceMerchantPasscodeReset(merchant.id);
                    toast.success("Till passcode cleared — merchant must set a new one");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Reset failed");
                  }
                })();
              }}
            >
              <KeyRound className="size-3" /> Force passcode reset
            </button>
            <button
              type="button"
              className="h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
              onClick={() => {
                void (async () => {
                  try {
                    const r = await logoutMerchantSessions(merchant.id);
                    toast.success(`Logged out ${r.cleared} session(s)`);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Logout failed");
                  }
                })();
              }}
            >
              <LogOut className="size-3" /> Log out devices
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 border-t pt-3" style={{ borderColor: T.border }}>
          {TABS.map((t) => {
            const on = activeTab === t.id;
            return (
              <Link
                key={t.id}
                to="/admin/merchants/$id"
                params={{ id: merchant.id }}
                search={{ tab: t.id }}
                className="h-8 px-3 rounded-full text-[11.5px] font-semibold inline-flex items-center"
                style={{
                  background: on ? T.navy : "transparent",
                  color: on ? "#fff" : T.ink,
                  border: `1px solid ${on ? T.navy : T.border}`,
                }}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Cash float", val: fmtNgn(merchant.float?.cashMinor) },
                { label: "Digital float", val: fmtNgn(merchant.float?.digitalMinor) },
                { label: "Total float", val: fmtNgn(floatTotalMinor(merchant)) },
                { label: "Earnings pending", val: fmtNgn(merchant.unpaidEarningsMinor) },
                { label: "Daily limit", val: fmtNgn(merchant.dailyLimit) },
                { label: "Type", val: capitalize(merchant.businessType) },
                { label: "Staff", val: String(merchant.staff?.length ?? 0) },
                { label: "Branches", val: String(merchant.branches?.length ?? 0) },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.muted }}>
                    {s.label}
                  </p>
                  <p className="mt-1.5 text-[15px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
                Settlement bank
              </p>
              <p className="text-[13px] font-semibold">
                {merchant.settlementBank ?? "—"} · ****{accountLast4}
              </p>
              <p className="text-[11px] mt-1" style={{ color: T.muted }}>
                Bank changes pause payouts for 24 hours.
              </p>
              <button
                type="button"
                className="mt-3 h-8 px-3 rounded-lg text-[11px] font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
                onClick={async () => {
                  const next = window.prompt(
                    "Override daily limit (NGN major)",
                    String(Math.round(Number(merchant.dailyLimit) / 100)),
                  );
                  if (!next) return;
                  const major = Number(next.replace(/,/g, ""));
                  if (!Number.isFinite(major) || major < 0) {
                    toast.error("Invalid limit");
                    return;
                  }
                  try {
                    const updated = await patchMerchant(merchant.id, {
                      dailyLimit: Math.round(major * 100),
                      reason: "Daily limit override",
                    });
                    setMerchant({ ...merchant, ...updated });
                    toast.success(`Daily limit set to ${fmtNgn(Math.round(major * 100))}`);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Update failed");
                  }
                }}
              >
                Override daily limit
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
                Notes
              </p>
              <ul className="space-y-1.5 text-[12px] mb-3" style={{ color: T.sub }}>
                {notes.length ? notes.map((n) => <li key={n}>• {n}</li>) : <li style={{ color: T.muted }}>No notes yet.</li>}
              </ul>
              <div className="flex gap-2">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note…"
                  className="flex-1 h-8 px-2 rounded-lg text-[12px] outline-none"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                />
                <button
                  type="button"
                  className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-white"
                  style={{ background: T.navy }}
                  onClick={() => {
                    void (async () => {
                      if (!note.trim()) return;
                      try {
                        await addMerchantNote(merchant.id, note.trim());
                        setNote("");
                        toast.success("Note saved");
                        await load();
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Could not save note");
                      }
                    })();
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            <DualApprovalPanel
              title="Manual float adjust (Finance)"
              actionLabel="Needs second approver"
              onSubmitted={async (reason) => {
                const amt = window.prompt("Amount in NGN (positive = credit digital float)", "25000");
                if (!amt) throw new Error("Amount required");
                const major = Number(amt.replace(/,/g, ""));
                if (!Number.isFinite(major) || major === 0) throw new Error("Invalid amount");
                await requestFloatAdjustment({
                  merchantId: merchant.id,
                  amountMinor: Math.round(major * 100),
                  reason,
                });
                toast.message("Needs second approver", {
                  description: "Float adjustment queued for dual approval.",
                });
              }}
            />
          </div>
        </div>
      ) : null}

      {activeTab === "kyb" ? (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="px-4 py-3 flex flex-wrap gap-3 items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
            <div className="text-[12px]" style={{ color: T.sub }}>
              BVN ****{merchant.bvnLast4 ?? "————"} {merchant.bvnVerified ? "✓" : "✗"} · NIN{" "}
              {merchant.ninVerified ? "verified" : "unverified"}
            </div>
            {merchant.status === "PENDING" ? (
              <button
                type="button"
                className="h-8 px-3 rounded-lg text-[11px] font-bold text-white"
                style={{ background: T.success }}
                onClick={async () => {
                  try {
                    const updated = await approveMerchant(merchant.id);
                    setMerchant({ ...merchant, ...updated });
                    toast.success("Application approved — merchant notified");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Approve failed");
                  }
                }}
              >
                Approve whole application
              </button>
            ) : null}
          </div>
          {docs.map((d, i) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-[12px]"
              style={{ borderBottom: i < docs.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <div className="min-w-[140px] font-semibold">{docLabel(d.kind)}</div>
              <StatusCell>
                <StatusBadge tone={d.status === "APPROVED" ? "success" : d.status === "REJECTED" ? "danger" : "warn"}>
                  {capitalize(d.status)}
                </StatusBadge>
              </StatusCell>
              <span className="text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(d.createdAt).toLocaleString()}
              </span>
              {d.rejectReason ? (
                <span className="text-[11px]" style={{ color: T.danger }}>
                  {d.rejectReason}
                </span>
              ) : null}
              <div className="ml-auto flex gap-2">
                {d.status === "PENDING" ? (
                  <>
                    <button
                      type="button"
                      className="text-[10px] font-bold px-2 py-1 rounded"
                      style={{ background: `${T.success}18`, color: T.success }}
                      onClick={async () => {
                        try {
                          const updated = await decideMerchantKybDoc(d.id, "APPROVED");
                          setMerchant({
                            ...merchant,
                            documents: docs.map((x) => (x.id === d.id ? { ...x, ...updated } : x)),
                          });
                          toast.success(`${docLabel(d.kind)} approved`);
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
                        const reason = window.prompt("Reject reason", "Blurry image — please re-upload") ?? "";
                        if (!reason.trim()) return;
                        try {
                          const updated = await decideMerchantKybDoc(d.id, "REJECTED", reason);
                          setMerchant({
                            ...merchant,
                            documents: docs.map((x) => (x.id === d.id ? { ...x, ...updated } : x)),
                          });
                          toast.error(`${docLabel(d.kind)} rejected`);
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Failed");
                        }
                      }}
                    >
                      Reject
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
          {!docs.length ? (
            <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
              No documents uploaded.
            </p>
          ) : null}
        </div>
      ) : null}

      {activeTab === "transactions" ? (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {txs.map((t, i) => (
            <Link
              key={t.ref}
              to="/admin/merchants/transactions/$ref"
              params={{ ref: t.ref }}
              className="flex items-center gap-3 px-4 py-3 text-[12px] hover:opacity-90"
              style={{ borderBottom: i < txs.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.navy, minWidth: 160 }}>
                {t.ref}
              </span>
              <span style={{ color: T.sub }}>{kindLabel(t.kind)}</span>
              <StatusBadge tone={txStatusTone(t.status)}>{capitalize(t.status)}</StatusBadge>
              <span className="ml-auto tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtNgn(t.amountMinor)}
              </span>
            </Link>
          ))}
          {!txs.length ? (
            <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
              No transactions for this merchant.
            </p>
          ) : null}
        </div>
      ) : null}

      {activeTab === "settlements" ? (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {settlements.map((s, i) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-[12px]"
              style={{ borderBottom: i < settlements.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {String(s.batchDate).slice(0, 10)}
              </span>
              <span>
                {s.bank} · ****{s.accountLast4}
              </span>
              <StatusBadge tone={settlementTone(s.status)}>{capitalize(s.status)}</StatusBadge>
              <span className="ml-auto tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtNgn(s.amountMinor)}
              </span>
            </div>
          ))}
          {!settlements.length ? (
            <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
              No settlements yet.
            </p>
          ) : null}
        </div>
      ) : null}

      {activeTab === "staff" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
              Staff
            </p>
            {merchant.staff?.length ? (
              <ul className="space-y-2">
                {merchant.staff.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-[12px] gap-2">
                    <span className="font-semibold">{s.name}</span>
                    <span style={{ color: T.muted }}>{capitalize(s.role)}</span>
                    <StatusBadge tone={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Disabled"}</StatusBadge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px]" style={{ color: T.muted }}>
                No staff accounts.
              </p>
            )}
          </div>
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
              Branches
            </p>
            {merchant.branches?.length ? (
              <ul className="space-y-2">
                {merchant.branches.map((b) => (
                  <li key={b.id} className="text-[12px]">
                    <p className="font-semibold">{b.name}</p>
                    <p style={{ color: T.muted }}>{b.address || "—"}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px]" style={{ color: T.muted }}>
                No branches.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "audit" ? (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {audit.map((a, i) => (
            <div
              key={a.id}
              className="px-4 py-3 text-[12px]"
              style={{ borderBottom: i < audit.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <div className="flex flex-wrap gap-2 justify-between">
                <span className="font-semibold">{a.action}</span>
                <span className="tabular-nums text-[11px]" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ color: T.sub }}>
                {a.actor?.name ?? a.actor?.email ?? a.actorId ?? "—"} · {a.entity}/{a.entityId}
              </p>
            </div>
          ))}
          {!audit.length ? (
            <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
              No audit entries for this merchant.
            </p>
          ) : null}
        </div>
      ) : null}
    </AdminShell>
  );
}
