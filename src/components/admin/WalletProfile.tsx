import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ChevronLeft,
  Copy,
  ExternalLink,
  Lock,
  LockOpen,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import { Card, SectionLabel } from "./Catalog";
import { Pill, countryFromPhone, initials } from "./UserProfile";
import { txnPill, txnTypePill } from "./Money";
import { mapTxnType, mapTxnStatus } from "./MoneyProfiles";
import { fmtMoney, type AdminWalletDetail, type AdminWalletAccessStatus } from "@/lib/api";

export function walletRefId(userId: string) {
  return `WLT-${userId.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

function copyText(label: string, value: string) {
  void navigator.clipboard.writeText(value).then(
    () => toast.success(`${label} copied`),
    () => toast.error("Could not copy"),
  );
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function walletStatusPill(status: AdminWalletAccessStatus) {
  if (status === "frozen") return <Pill tone="danger">Frozen</Pill>;
  if (status === "limited") return <Pill tone="warn">Limited</Pill>;
  return <Pill tone="success">Active</Pill>;
}

function roleLabel(role: string) {
  if (role === "SELLER") return "Seller";
  if (role === "BOTH") return "Buyer & seller";
  if (role === "BUYER") return "Buyer";
  return role.replace(/_/g, " ");
}

function QuickAction({
  I,
  label,
  onClick,
  disabled,
  danger,
  href,
}: {
  I: typeof ExternalLink;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  href?: string;
}) {
  const className =
    "h-10 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 w-full";
  const style = {
    background: T.surface,
    border: `1px solid ${danger ? `${T.danger}40` : T.border}`,
    color: danger ? T.danger : T.ink,
  };

  if (href) {
    return (
      <Link to={href as never} className={className} style={style}>
        <I className="size-3.5" strokeWidth={2.2} /> {label}
      </Link>
    );
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className} style={style}>
      <I className="size-3.5" strokeWidth={2.2} /> {label}
    </button>
  );
}

export function WalletHeroCard({ detail }: { detail: AdminWalletDetail }) {
  const country = countryFromPhone(detail.user.phone);
  const metrics = [
    { I: Coins, label: "Currencies", val: String(detail.stats.currencyCount), tone: T.navy },
    {
      I: Lock,
      label: "Hold Σ",
      val: fmtMoney("NGN", detail.stats.totalHoldMinor),
      tone: T.warn,
    },
    {
      I: ShieldCheck,
      label: "Escrow (est.)",
      val: Number(detail.stats.escrowMinorNgn) > 0 ? fmtMoney("NGN", detail.stats.escrowMinorNgn) : "—",
      tone: T.info,
    },
    {
      I: TrendingUp,
      label: "Lifetime",
      val: Number(detail.stats.lifetimeMinorNgn) > 0 ? fmtMoney("NGN", detail.stats.lifetimeMinorNgn) : "—",
      tone: T.success,
    },
  ];

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 flex gap-4">
        <div
          className="size-28 rounded-xl grid place-items-center text-[22px] font-bold shrink-0"
          style={{ background: `${T.navy}10`, color: T.navy, border: `1px solid ${T.border}` }}
        >
          {initials(detail.user.name || "?")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {walletStatusPill(detail.status)}
            <span className="text-[11px] tabular-nums font-semibold" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              {walletRefId(detail.user.id)}
            </span>
            <span style={{ color: T.muted }}>·</span>
            <span className="text-[11px] font-semibold" style={{ color: T.sub }}>
              {country.flag} {country.code}
            </span>
          </div>
          <h2 className="mt-2 text-[17px] font-bold leading-snug">{detail.user.name || "Unnamed user"}</h2>
          <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
            {roleLabel(detail.user.role)} · {detail.user.phone}
            {detail.user.email ? ` · ${detail.user.email}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {detail.wallets.map((w) => (
              <span
                key={w.id}
                className="text-[11px] tabular-nums px-2 h-7 rounded-lg inline-flex items-center font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {fmtMoney(w.currency, w.balanceMinor)}
                {Number(w.holdMinor) > 0 ? ` · hold ${fmtMoney(w.currency, w.holdMinor)}` : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg px-3 py-2.5" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-1.5">
              <m.I className="size-3.5" strokeWidth={2.2} style={{ color: m.tone }} />
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                {m.label}
              </p>
            </div>
            <p className="mt-1.5 text-[17px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
              {m.val}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WalletSidebar({
  detail,
  busy,
  onAdjust,
  onToggleFreeze,
}: {
  detail: AdminWalletDetail;
  busy?: boolean;
  onAdjust?: () => void;
  onToggleFreeze?: () => void;
}) {
  const frozen = detail.status === "frozen";

  return (
    <div className="space-y-3">
      <Card>
        <SectionLabel>Account</SectionLabel>
        <Link to="/admin/users/$id" params={{ id: detail.user.id }} className="mt-2 block text-[14px] font-bold hover:underline" style={{ color: T.ink }}>
          {detail.user.name}
        </Link>
        <button
          type="button"
          onClick={() => copyText("User ID", detail.user.id)}
          className="mt-1 text-[11px] tabular-nums inline-flex items-center gap-1 hover:opacity-80"
          style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {detail.user.id}
          <Copy className="size-3" strokeWidth={2.2} />
        </button>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {walletStatusPill(detail.status)}
          <Pill tone="neutral">{roleLabel(detail.user.role)}</Pill>
        </div>
      </Card>

      <Card>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <QuickAction I={ExternalLink} label="View user" href={`/admin/users/${detail.user.id}`} />
          <QuickAction I={ArrowLeftRight} label="Ledger" href={`/admin/ledger?userId=${detail.user.id}`} />
          <QuickAction I={Wallet} label="Adjust" disabled={busy} onClick={onAdjust} />
          <QuickAction
            I={frozen ? LockOpen : Lock}
            label={frozen ? "Unfreeze" : "Freeze"}
            danger={!frozen}
            disabled={busy}
            onClick={onToggleFreeze}
          />
        </div>
      </Card>

      <Card>
        <SectionLabel>Activity</SectionLabel>
        <dl className="mt-2 space-y-2.5 text-[12px]">
          <Row label="30D txns" value={String(detail.stats.txns30d)} />
          <Row label="Last txn" value={timeAgo(detail.stats.lastTxnAt)} />
          <Row label="Pending deposits" value={String(detail.pendingDeposits)} />
          <Row label="Pending withdrawals" value={String(detail.pendingWithdrawals)} />
          <Row label="Active escrows" value={String(detail.activeEscrows)} />
        </dl>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt style={{ color: T.muted }}>{label}</dt>
      <dd className="font-bold tabular-nums text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </dd>
    </div>
  );
}

export function WalletBalancesPanel({ detail }: { detail: AdminWalletDetail }) {
  return (
    <Card padded={false}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
        <p className="text-[12px] font-bold">Balances</p>
        <p className="text-[10.5px]" style={{ color: T.muted }}>
          Available = balance − hold
        </p>
      </div>
      <div
        className="grid px-4 h-9 items-center text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1fr 1.2fr 1.2fr 1.2fr" }}
      >
        <span>Currency</span>
        <span className="text-right">Balance</span>
        <span className="text-right">On hold</span>
        <span className="text-right">Available</span>
      </div>
      {detail.wallets.map((w, i) => (
        <div
          key={w.id}
          className="grid px-4 py-3 text-[12px] items-center"
          style={{
            gridTemplateColumns: "1fr 1.2fr 1.2fr 1.2fr",
            borderBottom: i < detail.wallets.length - 1 ? `1px solid ${T.border}` : "none",
          }}
        >
          <span className="font-bold">{w.currency}</span>
          <span className="text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtMoney(w.currency, w.balanceMinor)}
          </span>
          <span className="text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: Number(w.holdMinor) > 0 ? T.warn : T.muted }}>
            {Number(w.holdMinor) > 0 ? fmtMoney(w.currency, w.holdMinor) : "—"}
          </span>
          <span className="text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtMoney(w.currency, w.availableMinor)}
          </span>
        </div>
      ))}
    </Card>
  );
}

export function WalletTransactionsPanel({ detail }: { detail: AdminWalletDetail }) {
  return (
    <Card padded={false}>
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <p className="text-[12px] font-bold">Recent transactions</p>
        <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>
          Latest wallet activity for this user
        </p>
      </div>
      {!detail.transactions.length ? (
        <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
          No transactions yet.
        </p>
      ) : (
        detail.transactions.map((t, i) => {
          const txnType = mapTxnType(t.status ?? "", t.kind);
          const txnStatus = mapTxnStatus(t.status ?? "");
          return (
            <div
              key={t.id}
              className="grid px-4 py-3 text-[12px] items-center gap-2"
              style={{
                gridTemplateColumns: "1.2fr 2fr 1fr 1fr",
                borderBottom: i < detail.transactions.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{t.title}</p>
                <p className="text-[10.5px] truncate" style={{ color: T.muted }}>
                  {t.subtitle || t.kind}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {txnTypePill(txnType)}
                {t.status ? txnPill(txnStatus) : null}
              </div>
              <span
                className="text-right tabular-nums font-bold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: t.amountPositive ? T.success : T.ink,
                }}
              >
                {t.amountDisplay}
              </span>
              <span className="text-right text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(t.createdAt).toLocaleString()}
              </span>
            </div>
          );
        })
      )}
    </Card>
  );
}

export function WalletEscrowPanel({ detail }: { detail: AdminWalletDetail }) {
  if (!detail.escrowMilestones.length) return null;
  return (
    <Card padded={false}>
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <p className="text-[12px] font-bold">Funded escrow milestones</p>
      </div>
      {detail.escrowMilestones.map((m, i) => (
        <div
          key={m.id}
          className="px-4 py-3 flex items-center justify-between gap-3 text-[12px]"
          style={{ borderBottom: i < detail.escrowMilestones.length - 1 ? `1px solid ${T.border}` : "none" }}
        >
          <div className="min-w-0">
            <Link to="/admin/escrow/$id" params={{ id: m.escrowId }} className="font-semibold hover:underline" style={{ color: T.navy }}>
              {m.escrowTitle}
            </Link>
            <p className="text-[10.5px] mt-0.5 truncate" style={{ color: T.muted }}>
              {m.label} · {m.escrowStatus.replace(/_/g, " ")}
            </p>
          </div>
          <span className="tabular-nums font-bold shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtMoney(m.currency, m.amountMinor)}
          </span>
        </div>
      ))}
    </Card>
  );
}

export function WalletOverview({
  detail,
  busy,
  onAdjust,
  onToggleFreeze,
}: {
  detail: AdminWalletDetail;
  busy?: boolean;
  onAdjust?: () => void;
  onToggleFreeze?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <WalletHeroCard detail={detail} />
        <WalletBalancesPanel detail={detail} />
        <WalletTransactionsPanel detail={detail} />
        <WalletEscrowPanel detail={detail} />
      </div>
      <WalletSidebar detail={detail} busy={busy} onAdjust={onAdjust} onToggleFreeze={onToggleFreeze} />
    </div>
  );
}

export function WalletAdjustForm({
  currencies,
  busy,
  onSubmit,
  onCancel,
}: {
  currencies: string[];
  busy?: boolean;
  onSubmit: (payload: { currency: string; amountMajor: string; direction: "credit" | "debit"; note: string }) => void;
  onCancel: () => void;
}) {
  const [currency, setCurrency] = useState(currencies[0] ?? "NGN");
  const [amountMajor, setAmountMajor] = useState("");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [note, setNote] = useState("");

  return (
    <Card>
      <SectionLabel>Manual adjustment</SectionLabel>
      <div className="mt-3 space-y-3">
        <label className="block text-[11px] font-semibold" style={{ color: T.sub }}>
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] font-semibold" style={{ color: T.sub }}>
          Direction
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "credit" | "debit")}
            className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          >
            <option value="credit">Credit (add funds)</option>
            <option value="debit">Debit (remove funds)</option>
          </select>
        </label>
        <label className="block text-[11px] font-semibold" style={{ color: T.sub }}>
          Amount (major units)
          <input
            value={amountMajor}
            onChange={(e) => setAmountMajor(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0.00"
            className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] outline-none tabular-nums"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}
          />
        </label>
        <label className="block text-[11px] font-semibold" style={{ color: T.sub }}>
          Note (required)
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adjustment"
            className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          />
        </label>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit({ currency, amountMajor, direction, note })}
            className="flex-1 h-9 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
            style={{ background: T.navy }}
          >
            {busy ? "Saving…" : "Apply adjustment"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="h-9 px-4 rounded-lg text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Card>
  );
}

export function WalletBackLink() {
  return (
    <Link to="/admin/wallets" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3" style={{ color: T.sub }}>
      <ChevronLeft className="size-3.5" strokeWidth={2.4} /> All wallets
    </Link>
  );
}
