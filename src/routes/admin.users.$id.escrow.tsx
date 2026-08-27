import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader, Pill } from "@/components/admin/UserProfile";
import { fetchAdminEscrows, fetchAdminUser, fmtMoney, type AdminEscrow, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/escrow")({
  head: () => ({ meta: [{ title: "User escrow — MagnetPay Admin" }] }),
  component: UserEscrow,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "RELEASED" || s === "RESOLVED" || s === "COMPLETED") return "success";
  if (s === "DISPUTED") return "danger";
  if (s === "FUNDED" || s === "ACTIVE" || s === "IN_PROGRESS") return "warn";
  return "info";
}

function UserEscrow() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [rows, setRows] = useState<AdminEscrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [u, escrows] = await Promise.all([fetchAdminUser(id), fetchAdminEscrows()]);
        setUser(u);
        setRows(
          escrows.filter(
            (e) =>
              e.buyer?.id === id ||
              e.seller?.id === id ||
              (e as AdminEscrow & { buyerId?: string; sellerId?: string }).buyerId === id ||
              (e as AdminEscrow & { buyerId?: string; sellerId?: string }).sellerId === id,
          ),
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setUser(null);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Escrow" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell title="Escrow" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>User not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: user.name, to: `/admin/users/${user.id}` },
        { label: "Escrow" },
      ]}
    >
      <UserHeader user={user} />

      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Contracts", val: rows.length },
          { label: "Open", val: rows.filter((e) => !["RELEASED", "RESOLVED", "REFUNDED"].includes(e.status.toUpperCase())).length },
          { label: "Disputed", val: rows.filter((e) => e.status.toUpperCase() === "DISPUTED" || (e.disputes?.length ?? 0) > 0).length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{s.label}</p>
            <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr" }}
        >
          <span>Contract</span><span>Title</span><span className="text-right">Amount</span><span>Status</span><span>Created</span>
        </div>
        {rows.map((c, i) => {
          const counter = c.buyer?.id === id ? c.seller?.name : c.buyer?.name;
          return (
            <div
              key={c.id}
              className="grid items-center px-4 h-[52px] text-[12px]"
              style={{ gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <Link to="/admin/escrow/$id" params={{ id: c.id }} className="font-semibold tabular-nums" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                {c.id.slice(0, 8)}
              </Link>
              <span className="truncate" style={{ color: T.ink }}>{c.title ?? counter ?? "—"}</span>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(c.currency, c.amountMinor)}
              </span>
              <Pill tone={toneFor(c.status)}>{c.status}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
          );
        })}
        {!rows.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No escrow contracts for this user.</p>
        ) : null}
      </div>
    </AdminShell>
  );
}
