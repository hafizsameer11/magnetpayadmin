import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Filter, Download, Plus, MoreHorizontal, ChevronDown,
  ShieldCheck, Clock, AlertTriangle, Ban, ArrowUpDown,
  Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  Pill,
  initials,
  roleLabel,
  countryFromPhone,
  kycTone,
  accountStatusPill,
  riskDot,
  fmtUSD,
  walletVolumeUsd,
} from "@/components/admin/UserProfile";
import { fetchAdminUsers, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({ meta: [{ title: "Users — MagnetPay Admin" }] }),
  component: AdminUsersList,
});

type FilterTab = "all" | "buyers" | "sellers" | "both" | "pending" | "rejected";

function kycStatus(u: AdminUser) {
  return u.kycApplications?.[0]?.status?.toUpperCase() ?? "";
}

function AdminUsersList() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");

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

  const stats = useMemo(() => {
    const pending = rows.filter((u) => {
      const k = kycStatus(u);
      return !k || k === "SUBMITTED" || k === "PENDING" || k === "DRAFT";
    }).length;
    const rejected = rows.filter((u) => kycStatus(u) === "REJECTED").length;
    const vol = rows.reduce((s, u) => s + walletVolumeUsd(u), 0);
    return { total: rows.length, pending, rejected, vol };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "buyers") list = list.filter((u) => u.role.toUpperCase() === "BUYER");
    else if (tab === "sellers") list = list.filter((u) => u.role.toUpperCase() === "SELLER");
    else if (tab === "both") list = list.filter((u) => u.role.toUpperCase() === "BOTH");
    else if (tab === "pending") {
      list = list.filter((u) => {
        const k = kycStatus(u);
        return !k || k === "SUBMITTED" || k === "PENDING" || k === "DRAFT";
      });
    } else if (tab === "rejected") list = list.filter((u) => kycStatus(u) === "REJECTED");

    if (!query.trim()) return list;
    const n = query.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(n) ||
        u.phone.toLowerCase().includes(n) ||
        (u.email ?? "").toLowerCase().includes(n) ||
        u.id.toLowerCase().includes(n),
    );
  }, [rows, query, tab]);

  const kycPillRow = (u: AdminUser) => {
    const tone = kycTone(u);
    const k = kycStatus(u);
    if (k === "APPROVED") {
      return (
        <Pill tone="success">
          <ShieldCheck className="size-2.5" strokeWidth={3} /> Verified
        </Pill>
      );
    }
    if (k === "REJECTED") {
      return (
        <Pill tone="danger">
          <Ban className="size-2.5" strokeWidth={3} /> Rejected
        </Pill>
      );
    }
    if (k === "SUBMITTED" || k === "PENDING" || k === "DRAFT") {
      return (
        <Pill tone="warn">
          <Clock className="size-2.5" strokeWidth={3} /> Pending
        </Pill>
      );
    }
    return <Pill tone="neutral">None</Pill>;
  };

  const filterTabs: { id: FilterTab; label: string; count?: number; tone?: string }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "buyers", label: "Importers" },
    { id: "sellers", label: "Suppliers" },
    { id: "both", label: "Merchants" },
    { id: "pending", label: "Pending KYC", count: stats.pending, tone: T.warn },
    { id: "rejected", label: "Rejected", count: stats.rejected, tone: T.danger },
  ];

  return (
    <AdminShell
      title="Users"
      description="Manage importers, suppliers, and merchants across the NG–CN corridor."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "People" }, { label: "Users" }]}
      actions={
        <>
          <button
            type="button"
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            <Download className="size-3.5" strokeWidth={2.4} /> Export
          </button>
          <Link
            to="/admin/users/invites"
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
            style={{ background: T.navy }}
          >
            <Plus className="size-3.5" strokeWidth={2.6} /> Invite user
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total users", val: loading ? "…" : stats.total.toLocaleString(), delta: "Live from API", tone: T.success },
          { label: "Pending KYC", val: loading ? "…" : String(stats.pending), delta: stats.pending ? "Needs review" : "All clear", tone: T.warn },
          { label: "Rejected KYC", val: loading ? "…" : String(stats.rejected), delta: "Blocked accounts", tone: T.danger },
          { label: "Est. wallet value", val: loading ? "…" : fmtUSD(stats.vol), delta: "Across all wallets", tone: T.info },
        ].map((k) => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{k.label}</p>
            <p className="mt-1.5 text-[22px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {k.val}
            </p>
            <p className="mt-2 text-[10.5px] font-semibold" style={{ color: k.tone }}>{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 flex-wrap">
        {filterTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
            style={{
              background: tab === t.id ? T.navy : T.surface,
              color: tab === t.id ? "#fff" : T.ink,
              border: `1px solid ${tab === t.id ? T.navy : T.border}`,
            }}
          >
            {t.label}
            {t.count != null ? (
              <span className="text-[10px] tabular-nums opacity-80" style={{ color: t.tone }}>{t.count}</span>
            ) : null}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg w-[260px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <Search className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, ID…"
              className="bg-transparent text-[12px] outline-none flex-1 placeholder:opacity-60"
              style={{ color: T.ink }}
            />
          </div>
          <button
            type="button"
            className="h-8 px-3 rounded-lg text-[11.5px] font-semibold flex items-center gap-1.5"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.sub }}
          >
            <Filter className="size-3.5" strokeWidth={2.2} /> Filters <ChevronDown className="size-3" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-10 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "24px 2.2fr 1fr 0.9fr 1fr 0.9fr 1.1fr 0.9fr 1fr 32px",
          }}
        >
          <span />
          <button type="button" className="flex items-center gap-1 text-left">
            User <ArrowUpDown className="size-2.5" strokeWidth={2.6} />
          </button>
          <span>Role</span>
          <span>Country</span>
          <span>KYC</span>
          <span>Risk</span>
          <button type="button" className="flex items-center gap-1 text-right justify-end">
            Wallet (est.) <ArrowUpDown className="size-2.5" strokeWidth={2.6} />
          </button>
          <span>Joined</span>
          <span>Status</span>
          <span />
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No users found.</p>
        ) : (
          filtered.map((u, i) => {
            const country = countryFromPhone(u.phone);
            const vol = walletVolumeUsd(u);
            return (
              <div
                key={u.id}
                className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
                style={{
                  gridTemplateColumns: "24px 2.2fr 1fr 0.9fr 1fr 0.9fr 1.1fr 0.9fr 1fr 32px",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <span />
                <Link to="/admin/users/$id" params={{ id: u.id }} className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold shrink-0"
                    style={{ background: `${T.navy}10`, color: T.navy }}
                  >
                    {initials(u.name || "?")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: T.ink }}>{u.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                        {u.id.slice(0, 8)}
                      </span>
                      {u.email ? (
                        <>
                          <span style={{ color: T.border }}>·</span>
                          <span className="text-[10.5px] truncate" style={{ color: T.muted }}>{u.email}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Link>
                <span style={{ color: T.ink }}>{roleLabel(u.role)}</span>
                <span style={{ color: T.ink }}>{country.flag} {country.code}</span>
                <span>{kycPillRow(u)}</span>
                <span>{riskDot(kycStatus(u) === "REJECTED" ? "danger" : "success")}</span>
                <span
                  className="text-right font-semibold tabular-nums"
                  style={{ color: vol === 0 ? T.muted : T.ink, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {fmtUSD(vol)}
                </span>
                <span className="tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <span>
                  {kycStatus(u) === "REJECTED" ? (
                    <Pill tone="danger">
                      <AlertTriangle className="size-2.5" strokeWidth={3} /> Flagged
                    </Pill>
                  ) : (
                    accountStatusPill(u)
                  )}
                </span>
                <Link
                  to="/admin/users/$id"
                  params={{ id: u.id }}
                  className="size-7 grid place-items-center rounded-md hover:bg-black/5"
                  style={{ color: T.sub }}
                >
                  <MoreHorizontal className="size-3.5" strokeWidth={2.2} />
                </Link>
              </div>
            );
          })
        )}

        {!loading && filtered.length > 0 ? (
          <div
            className="px-4 h-12 flex items-center justify-between text-[11.5px]"
            style={{ background: T.bg, borderTop: `1px solid ${T.border}`, color: T.sub }}
          >
            <span>
              Showing <span className="font-semibold" style={{ color: T.ink }}>{filtered.length}</span> of{" "}
              <span className="font-semibold tabular-nums" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>
                {rows.length}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button type="button" className="size-7 grid place-items-center rounded-md opacity-50" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <ChevronLeft className="size-3.5" strokeWidth={2.4} />
              </button>
              <button type="button" className="h-7 min-w-7 px-2 rounded-md text-[11px] font-semibold tabular-nums text-white" style={{ background: T.navy, border: `1px solid ${T.navy}`, fontFamily: "'JetBrains Mono', monospace" }}>
                1
              </button>
              <button type="button" className="size-7 grid place-items-center rounded-md opacity-50" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <ChevronRight className="size-3.5" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
