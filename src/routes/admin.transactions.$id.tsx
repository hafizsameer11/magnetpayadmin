import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminTransfers, fmtMoney, type AdminTransfer } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/transactions/$id")({
  head: () => ({ meta: [{ title: "Transaction — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "SUCCEEDED" || s === "COMPLETED" || s === "SETTLED") return "success";
  if (s === "PENDING" || s === "PROCESSING" || s === "CREATED") return "warn";
  if (s === "FAILED" || s === "CANCELLED") return "danger";
  return "neutral";
}

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminTransfer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminTransfers()
      .then((list) => {
        const found = list.find((t) => t.id === id) ?? null;
        setRow(found);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load transfer");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Transaction" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Transactions", to: "/admin/transactions" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Transaction" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Transactions", to: "/admin/transactions" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>
          Transfer <span className="font-mono font-semibold">{id}</span> not found.
        </p>
        <Link to="/admin/transactions" className="mt-3 inline-flex text-[11px] font-semibold items-center gap-1" style={{ color: T.sub }}>
          <ArrowLeft className="size-3" /> Back
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={row.id.slice(0, 8)}
      description={`${row.sender?.name ?? "Sender"} · ${fmtMoney(row.currency, row.amountMinor)}`}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Transactions", to: "/admin/transactions" }, { label: row.id.slice(0, 8) }]}
      actions={<Pill tone={toneFor(row.status)}>{row.status}</Pill>}
    >
      <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-[12.5px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <KV label="Amount" v={<span className="font-bold tabular-nums text-[14px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtMoney(row.currency, row.amountMinor)}</span>} />
        <KV label="Status" v={<Pill tone={toneFor(row.status)}>{row.status}</Pill>} />
        <KV label="Nomba ref" v={<span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.nombaRef ?? "—"}</span>} />
        <KV label="Sender" v={row.sender?.name ?? "—"} />
        <KV label="Sender phone" v={<span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.sender?.phone ?? "—"}</span>} />
        <KV label="Recipient" v={row.recipient?.name ?? "—"} />
        <KV label="Account hint" v={<span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.recipient?.accountHint ?? "—"}</span>} />
        <KV label="Rail" v={row.recipient?.rail ?? "—"} />
        <KV label="When" v={row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"} />
      </div>
      <Link to="/admin/transactions" className="mt-4 inline-flex text-[11px] font-semibold items-center gap-1" style={{ color: T.sub }}>
        <ArrowLeft className="size-3" /> Back to transactions
      </Link>
    </AdminShell>
  );
}

function KV({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </p>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}
