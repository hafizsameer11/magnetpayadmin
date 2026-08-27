import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill, initials } from "@/components/admin/UserProfile";
import { fetchAdminWallets, fmtMoney, type AdminWallet } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/wallets/$userId")({
  head: () => ({ meta: [{ title: "Wallet detail — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { userId } = Route.useParams();
  const [rows, setRows] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const all = await fetchAdminWallets();
        const filtered = all.filter((w) => w.user.id === userId);
        if (!cancelled) setRows(filtered);
        if (!cancelled && filtered.length === 0) toast.message("No wallets for this user");
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load wallets");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const user = rows[0]?.user;

  return (
    <AdminShell
      title={user ? `${user.name} · Wallets` : "User wallets"}
      description={user?.phone ?? userId}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Wallets", to: "/admin/wallets" },
        { label: user?.name ?? userId.slice(0, 8) },
      ]}
      actions={
        <Link
          to="/admin/wallets"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      }
    >
      {user && (
        <div className="mb-4 rounded-xl p-4 flex items-center gap-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div
            className="size-10 rounded-full grid place-items-center text-[12px] font-bold"
            style={{ background: `${T.navy}10`, color: T.navy }}
          >
            {initials(user.name || "?")}
          </div>
          <div>
            <p className="font-bold">{user.name}</p>
            <Link
              to="/admin/users/$id"
              params={{ id: user.id }}
              className="text-[11px] tabular-nums hover:underline"
              style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {user.id.slice(0, 8)}
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1fr 1.4fr 1.4fr 1fr",
          }}
        >
          <span>Currency</span>
          <span>Balance</span>
          <span>Hold</span>
          <span>Wallet ID</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No wallets for this user.
          </p>
        ) : (
          rows.map((w, i) => (
            <div
              key={w.id}
              className="grid items-center px-4 h-[52px] text-[12px]"
              style={{
                gridTemplateColumns: "1fr 1.4fr 1.4fr 1fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <Pill tone="info">{w.currency}</Pill>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(w.currency, w.balanceMinor)}
              </span>
              <span className="tabular-nums" style={{ color: T.warn, fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(w.currency, w.holdMinor)}
              </span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {w.id.slice(0, 8)}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
