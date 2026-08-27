import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Loader2, Users } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill, initials } from "@/components/admin/UserProfile";
import { fetchAdminUsers, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({ meta: [{ title: "Users — MagnetPay Admin" }] }),
  component: AdminUsersList,
});

function kycTone(status?: string): "success" | "warn" | "danger" | "neutral" {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "SUBMITTED" || status === "PENDING") return "warn";
  return "neutral";
}

function AdminUsersList() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminUsers();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load users");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const n = query.toLowerCase();
    return rows.filter(
      (u) =>
        u.name.toLowerCase().includes(n) ||
        u.phone.toLowerCase().includes(n) ||
        (u.email ?? "").toLowerCase().includes(n) ||
        u.id.toLowerCase().includes(n) ||
        u.role.toLowerCase().includes(n),
    );
  }, [rows, query]);

  return (
    <AdminShell
      title="Users"
      description="Manage importers, suppliers, and merchants across the NG–CN corridor."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "People" }, { label: "Users" }]}
      actions={
        <Link
          to="/admin/users/invites"
          className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
          style={{ background: T.navy }}
        >
          <Plus className="size-3.5" strokeWidth={2.6} /> Invite user
        </Link>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md grid place-items-center" style={{ background: `${T.info}14`, color: T.info }}>
              <Users className="size-3.5" strokeWidth={2.4} />
            </div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              Total users
            </p>
          </div>
          <p className="mt-2 text-[22px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {loading ? "…" : rows.length}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 flex-wrap">
        <div
          className="flex items-center gap-2 h-8 px-2.5 rounded-lg w-[260px]"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <Search className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email…"
            className="bg-transparent text-[12px] outline-none flex-1 placeholder:opacity-60"
            style={{ color: T.ink }}
          />
        </div>
        <Link
          to="/admin/users/invites"
          className="h-8 px-3 rounded-lg text-[11.5px] font-semibold"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          Invites
        </Link>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-10 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "0.8fr 1.6fr 1.2fr 1.4fr 0.9fr 0.9fr 1fr",
          }}
        >
          <span>ID</span>
          <span>Name</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Role</span>
          <span>KYC</span>
          <span>Created</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No users found.
          </p>
        ) : (
          filtered.map((u, i) => {
            const kyc = u.kycApplications?.[0]?.status;
            return (
              <Link
                key={u.id}
                to="/admin/users/$id"
                params={{ id: u.id }}
                className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
                style={{
                  gridTemplateColumns: "0.8fr 1.6fr 1.2fr 1.4fr 0.9fr 0.9fr 1fr",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <span className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                  {u.id.slice(0, 8)}
                </span>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold shrink-0"
                    style={{ background: `${T.navy}10`, color: T.navy }}
                  >
                    {initials(u.name || "?")}
                  </div>
                  <p className="font-semibold truncate" style={{ color: T.ink }}>
                    {u.name}
                  </p>
                </div>
                <span className="tabular-nums truncate" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                  {u.phone}
                </span>
                <span className="truncate" style={{ color: T.sub }}>
                  {u.email || "—"}
                </span>
                <span style={{ color: T.ink }}>{u.role}</span>
                <span>
                  {kyc ? <Pill tone={kycTone(kyc)}>{kyc}</Pill> : <Pill tone="neutral">None</Pill>}
                </span>
                <span className="tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
