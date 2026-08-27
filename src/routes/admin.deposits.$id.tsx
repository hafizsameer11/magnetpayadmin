import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminDeposit, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/deposits/$id")({
  head: () => ({ meta: [{ title: "Deposit — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "SUCCEEDED" || s === "COMPLETED" || s === "APPROVED") return "success";
  if (s === "PENDING" || s === "PROCESSING") return "warn";
  if (s === "FAILED" || s === "REJECTED") return "danger";
  return "neutral";
}

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminDeposit(id)
      .then((d) => setRow((d ?? null) as Record<string, unknown> | null))
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load deposit");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Deposit" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Deposits", to: "/admin/deposits" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Deposit" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Deposits", to: "/admin/deposits" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>
          Deposit not found.
        </p>
      </AdminShell>
    );
  }

  const user = (row.user ?? {}) as Record<string, unknown>;
  const status = str(row.status);
  const currency = str(row.currency, "NGN");

  return (
    <AdminShell
      title={str(row.id).slice(0, 8)}
      description={`${str(user.name)} · ${fmtMoney(currency, row.amountMinor as string | number)}`}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Deposits", to: "/admin/deposits" }, { label: str(row.id).slice(0, 8) }]}
      actions={<Pill tone={toneFor(status)}>{status}</Pill>}
    >
      <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-[12.5px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <KV label="Amount" v={<span className="font-bold tabular-nums text-[14px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtMoney(currency, row.amountMinor as string | number)}</span>} />
        <KV label="Method" v={str(row.method)} />
        <KV label="Status" v={<Pill tone={toneFor(status)}>{status}</Pill>} />
        <KV label="Depositor" v={str(user.name)} />
        <KV label="Phone" v={<span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{str(user.phone)}</span>} />
        <KV label="User ID" v={<span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{str(user.id).slice(0, 8)}</span>} />
        <KV label="When" v={row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : "—"} />
      </div>
      <Link to="/admin/deposits" className="mt-4 inline-flex text-[11px] font-semibold items-center gap-1" style={{ color: T.sub }}>
        <ArrowLeft className="size-3" /> Back
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
