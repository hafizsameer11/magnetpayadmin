import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { T } from "./AdminShell";
import { Pill } from "./UserProfile";
import { Card } from "./Catalog";
import { txnPill, txnTypePill, type TxnType, type TxnStatus } from "./Money";
import { fmtMoney } from "@/lib/api";

export function MoneyBackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to as never} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3" style={{ color: T.sub }}>
      <ChevronLeft className="size-3.5" strokeWidth={2.4} /> {label}
    </Link>
  );
}

export function KVGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-[12.5px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      {children}
    </div>
  );
}

export function KV({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </p>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}

export type Tone = "success" | "warn" | "danger" | "info" | "neutral";

export function toneForTxnStatus(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "SUCCEEDED" || s === "COMPLETED" || s === "SETTLED" || s === "APPROVED") return "success";
  if (s === "PENDING" || s === "PROCESSING" || s === "CREATED" || s === "REVIEW") return "warn";
  if (s === "FAILED" || s === "CANCELLED" || s === "REJECTED") return "danger";
  return "neutral";
}

export function mapTxnType(status: string, rail?: string): TxnType {
  const r = (rail ?? "").toLowerCase();
  if (r.includes("escrow")) return "escrow_hold";
  if (r.includes("fee")) return "fee";
  return "transfer";
}

export function mapTxnStatus(status: string): TxnStatus {
  const s = status.toLowerCase();
  if (s === "succeeded" || s === "completed" || s === "approved") return "succeeded";
  if (s === "failed" || s === "rejected") return "failed";
  if (s === "review") return "review";
  return "pending";
}

export function TxnDetailBody({
  id,
  status,
  currency,
  amountMinor,
  nombaRef,
  sender,
  recipient,
  createdAt,
}: {
  id: string;
  status: string;
  currency: string;
  amountMinor: string | number;
  nombaRef?: string | null;
  sender?: { id?: string; name?: string; phone?: string };
  recipient?: { name?: string; accountHint?: string; rail?: string };
  createdAt?: string;
}) {
  const rail = recipient?.rail ?? "Wallet";
  const txnStatus = mapTxnStatus(status);
  const txnType = mapTxnType(status, rail);

  return (
    <>
      <MoneyBackLink to="/admin/transactions" label="All transactions" />
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Transaction
            </p>
            <p className="mt-1 text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {txnTypePill(txnType)}
            {txnPill(txnStatus)}
          </div>
        </div>
        <p className="mt-3 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtMoney(currency, amountMinor)}
        </p>
      </Card>
      <KVGrid>
        <KV label="Amount" v={<span className="font-bold tabular-nums text-[14px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtMoney(currency, amountMinor)}</span>} />
        <KV label="Status" v={<Pill tone={toneForTxnStatus(status)}>{status}</Pill>} />
        <KV label="Rail" v={rail} />
        <KV label="Reference" v={<span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{nombaRef ?? "—"}</span>} />
        <KV
          label="Sender"
          v={
            sender?.id ? (
              <Link to="/admin/users/$id" params={{ id: sender.id }} className="font-semibold hover:underline" style={{ color: T.navy }}>
                {sender.name ?? "—"}
              </Link>
            ) : (
              (sender?.name ?? "—")
            )
          }
        />
        <KV label="Sender phone" v={<span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{sender?.phone ?? "—"}</span>} />
        <KV label="Recipient" v={recipient?.name ?? "—"} />
        <KV label="Account hint" v={<span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{recipient?.accountHint ?? "—"}</span>} />
        <KV label="When" v={createdAt ? new Date(createdAt).toLocaleString() : "—"} />
      </KVGrid>
    </>
  );
}

function riskFromAmount(currency: string, amountMinor: string | number, status: string) {
  const major = Number(amountMinor) / 100;
  const ngn = currency === "NGN" ? major : currency === "USD" ? major * 1600 : major * 229;
  if (String(status).toUpperCase().includes("FAIL")) return { label: "High", tone: T.danger };
  if (ngn >= 500_000) return { label: "Medium", tone: T.warn };
  return { label: "Low", tone: T.success };
}

export function DepositDetailBody({
  row,
}: {
  row: {
    id: string;
    status: string;
    currency: string;
    amountMinor: string | number;
    method?: string;
    user?: { id?: string; name?: string; phone?: string };
    createdAt?: string;
    providerRef?: string | null;
  };
}) {
  return (
    <>
      <MoneyBackLink to="/admin/deposits" label="All deposits" />
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {row.id.slice(0, 12)}
          </p>
          <Pill tone={toneForTxnStatus(row.status)}>{row.status}</Pill>
        </div>
        <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtMoney(row.currency, row.amountMinor)}
        </p>
      </Card>
      <KVGrid>
        <KV label="Amount" v={fmtMoney(row.currency, row.amountMinor)} />
        <KV label="Method" v={row.method ?? "—"} />
        <KV label="Status" v={<Pill tone={toneForTxnStatus(row.status)}>{row.status}</Pill>} />
        <KV
          label="Depositor"
          v={
            row.user?.id ? (
              <Link to="/admin/users/$id" params={{ id: row.user.id }} className="hover:underline font-semibold" style={{ color: T.navy }}>
                {row.user.name}
              </Link>
            ) : (
              (row.user?.name ?? "—")
            )
          }
        />
        <KV label="Phone" v={row.user?.phone ?? "—"} />
        <KV label="Provider ref" v={row.providerRef ?? "—"} />
        <KV label="Risk score" v={<span style={{ color: riskFromAmount(row.currency, row.amountMinor, row.status).tone }}>{riskFromAmount(row.currency, row.amountMinor, row.status).label}</span>} />
        <KV label="When" v={row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"} />
      </KVGrid>
    </>
  );
}

export function WithdrawalDetailBody({
  row,
  actions,
}: {
  row: {
    id: string;
    status: string;
    currency: string;
    amountMinor: string | number;
    rail?: string;
    destination?: string;
    providerRef?: string | null;
    user?: { id?: string; name?: string; phone?: string };
    createdAt?: string;
  };
  actions?: React.ReactNode;
}) {
  return (
    <>
      <MoneyBackLink to="/admin/withdrawals" label="Withdrawal queue" />
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {row.id.slice(0, 12)}
          </p>
          <div className="flex items-center gap-2">
            <Pill tone={toneForTxnStatus(row.status)}>{row.status}</Pill>
            {actions}
          </div>
        </div>
        <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtMoney(row.currency, row.amountMinor)}
        </p>
      </Card>
      <KVGrid>
        <KV label="Amount" v={fmtMoney(row.currency, row.amountMinor)} />
        <KV label="Rail" v={row.rail ?? "—"} />
        <KV label="Destination" v={row.destination ?? "—"} />
        <KV label="Provider ref" v={row.providerRef ?? "—"} />
        <KV
          label="Requester"
          v={
            row.user?.id ? (
              <Link to="/admin/users/$id" params={{ id: row.user.id }} className="hover:underline font-semibold" style={{ color: T.navy }}>
                {row.user.name}
              </Link>
            ) : (
              (row.user?.name ?? "—")
            )
          }
        />
        <KV label="Risk score" v={<span style={{ color: riskFromAmount(row.currency, row.amountMinor, row.status).tone }}>{riskFromAmount(row.currency, row.amountMinor, row.status).label}</span>} />
        <KV label="Review note" v={String(row.status).toUpperCase().includes("PEND") ? "Pending manual review" : "—"} />
        <KV label="Requested" v={row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"} />
      </KVGrid>
    </>
  );
}

export function WalletDetailBody({
  user,
  wallets,
}: {
  user: { id: string; name: string; phone: string };
  wallets: { currency: string; balanceMinor: string | number; holdMinor: string | number }[];
}) {
  const totalHold = wallets.reduce((s, w) => s + Number(w.holdMinor || 0), 0);

  return (
    <>
      <MoneyBackLink to="/admin/wallets" label="All wallets" />
      <Card>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
          Account
        </p>
        <p className="mt-1 text-[16px] font-bold">{user.name}</p>
        <Link to="/admin/users/$id" params={{ id: user.id }} className="text-[11px] tabular-nums hover:underline" style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}>
          {user.id}
        </Link>
      </Card>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Currencies", val: String(wallets.length) },
          { label: "Hold Σ", val: fmtMoney(wallets[0]?.currency ?? "NGN", totalHold) },
          { label: "Escrow (est.)", val: "—" },
          { label: "Lifetime", val: "—" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {k.label}
            </p>
            <p className="mt-2 text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {k.val}
            </p>
          </div>
        ))}
      </div>
      <Card className="mt-4" padded={false}>
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[12px] font-bold">Balances</p>
        </div>
        {wallets.map((w, i) => (
          <div key={i} className="px-4 py-3 flex justify-between text-[12px]" style={{ borderBottom: i < wallets.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span className="font-bold">{w.currency}</span>
            <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtMoney(w.currency, w.balanceMinor)}
              {Number(w.holdMinor) > 0 ? ` · hold ${fmtMoney(w.currency, w.holdMinor)}` : ""}
            </span>
          </div>
        ))}
      </Card>
    </>
  );
}
