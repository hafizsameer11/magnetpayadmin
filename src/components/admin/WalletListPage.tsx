import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "./AdminShell";
import { KPI, FilterBar, Card } from "./Orders";
import { FilterSelect, applyAllFilter, uniqueOptions } from "./ListFilters";
import { countryFromPhone } from "./UserProfile";
import { StatusBadge, toneFromStatus } from "./StatusBadge";
import { walletUserRefId } from "./WalletProfile";
import { downloadClientCsv } from "@/lib/csv";
import { fetchAdminWalletHolders, fmtMoney, type AdminWalletHolder, type AdminWalletOverview } from "@/lib/api";
import { useTablePage, TablePagerFooter } from "./TablePager";

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

function holderType(role: string) {
  if (role === "SELLER") return "seller";
  if (role === "BOTH") return "buyer & seller";
  return "buyer";
}

function platformRef(holder: AdminWalletHolder) {
  return walletUserRefId(holder.user.id, holder.user.role, holder.user.name);
}

function PlatformWalletCard({ holder }: { holder: AdminWalletHolder }) {
  const ref = platformRef(holder);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Platform · {ref}
          </p>
          <p className="mt-1 text-[14px] font-bold">{holder.user.name}</p>
        </div>
        <StatusBadge tone={toneFromStatus(holder.status)}>{holder.status}</StatusBadge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {holder.wallets.map((w) => (
          <div
            key={w.id}
            className="rounded-lg px-3 py-2 min-w-[88px]"
            style={{ background: T.bg, border: `1px solid ${T.border}` }}
          >
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: T.muted }}>
              {w.currency}
            </p>
            <p className="mt-1 text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtMoney(w.currency, w.balanceMinor)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WalletTable({ rows }: { rows: AdminWalletHolder[] }) {
  const pager = useTablePage(rows);

  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
              <th className="px-2 py-2.5 pl-4">User</th>
              <th className="px-2 py-2.5">Type</th>
              <th className="px-2 py-2.5">Balances</th>
              <th className="px-2 py-2.5 text-right">Escrow</th>
              <th className="px-2 py-2.5 text-right">Lifetime</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">Last tx</th>
              <th className="px-2 py-2.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {pager.slice.map((h) => {
              const country = countryFromPhone(h.user.phone);
              const ref = walletUserRefId(h.user.id, h.user.role, h.user.name);
              return (
                <tr key={h.user.id} className="border-t hover:bg-black/[0.015] transition" style={{ borderColor: T.border }}>
                  <td className="px-2 py-3 pl-4 min-w-[220px]">
                    <Link to="/admin/wallets/$userId" params={{ userId: h.user.id }} className="block hover:underline">
                      <p className="font-semibold flex items-center gap-1.5">
                        <span className="text-[11px]">{country.code !== "—" ? country.code : "🌍"}</span>
                        {h.user.name}
                      </p>
                      <p className="text-[10.5px] mt-0.5 truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                        {ref}
                        {h.user.email ? ` · ${h.user.email}` : ""}
                      </p>
                    </Link>
                  </td>
                  <td className="px-2 py-3 capitalize" style={{ color: T.sub }}>
                    {holderType(h.user.role)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {h.wallets.map((w) => (
                        <span
                          key={w.id}
                          className="text-[10.5px] tabular-nums px-1.5 h-6 rounded inline-flex items-center font-semibold"
                          style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {fmtMoney(w.currency, w.balanceMinor)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Number(h.stats.escrowMinorNgn) > 0 ? fmtMoney("NGN", h.stats.escrowMinorNgn) : "—"}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Number(h.stats.lifetimeMinorNgn) > 0 ? fmtMoney("NGN", h.stats.lifetimeMinorNgn) : "—"}
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge tone={toneFromStatus(h.status)}>{h.status}</StatusBadge>
                  </td>
                  <td className="px-2 py-3 text-[11px]" style={{ color: T.muted }}>
                    {timeAgo(h.stats.lastTxnAt)}
                  </td>
                  <td className="px-2 py-3">
                    <Link
                      to="/admin/wallets/$userId"
                      params={{ userId: h.user.id }}
                      className="size-7 grid place-items-center rounded-md hover:bg-black/5"
                    >
                      <MoreHorizontal className="size-4" style={{ color: T.muted }} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!pager.total ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[12px]" style={{ color: T.muted }}>
                  No wallets match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <TablePagerFooter
        from={pager.from}
        to={pager.to}
        total={pager.total}
        page={pager.page}
        pageCount={pager.pageCount}
        onPrev={() => pager.setPage((p) => Math.max(0, p - 1))}
        onNext={() => pager.setPage((p) => Math.min(pager.pageCount - 1, p + 1))}
      />
    </Card>
  );
}

export function WalletListPage() {
  const [overview, setOverview] = useState<AdminWalletOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("__all__");
  const [currencyFilter, setCurrencyFilter] = useState("__all__");
  const [countryFilter, setCountryFilter] = useState("__all__");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setOverview(await fetchAdminWalletHolders());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load wallets");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const holders = overview?.holders ?? [];
  const summary = overview?.summary;
  const platformWallets = overview?.platformWallets ?? [];

  const filtered = useMemo(() => {
    let list = holders;
    list = applyAllFilter(list, typeFilter, (h) => holderType(h.user.role));
    list = applyAllFilter(list, countryFilter, (h) => countryFromPhone(h.user.phone).code);
    list = applyAllFilter(list, statusFilter, (h) => h.status);
    if (currencyFilter !== "__all__") {
      list = list.filter((h) => h.wallets.some((w) => w.currency === currencyFilter));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((h) => {
        const ref = walletUserRefId(h.user.id, h.user.role, h.user.name).toLowerCase();
        return (
          h.user.name.toLowerCase().includes(q) ||
          (h.user.email ?? "").toLowerCase().includes(q) ||
          ref.includes(q) ||
          h.user.id.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [holders, query, typeFilter, currencyFilter, countryFilter, statusFilter]);

  const onExport = () => {
    if (!filtered.length) {
      toast.message("Nothing to export");
      return;
    }
    setExporting(true);
    try {
      downloadClientCsv(
        `magnetpay-wallets-${new Date().toISOString().slice(0, 10)}.csv`,
        ["ref", "name", "email", "type", "status", "escrowNgn", "lifetimeNgn", "lastTxn"],
        filtered.map((h) => ({
          ref: walletUserRefId(h.user.id, h.user.role, h.user.name),
          name: h.user.name,
          email: h.user.email ?? "",
          type: holderType(h.user.role),
          status: h.status,
          escrowNgn: Number(h.stats.escrowMinorNgn) / 100,
          lifetimeNgn: Number(h.stats.lifetimeMinorNgn) / 100,
          lastTxn: h.stats.lastTxnAt ?? "",
        })),
      );
      toast.success("CSV downloaded");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminShell
      title="Wallets"
      description="Every user, seller, and platform wallet across all currencies."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Wallets" }]}
      actions={
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <Download className="size-3.5" /> Export
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <KPI
          label="Total balance (NGN)"
          value={loading || !summary ? "…" : fmtMoney("NGN", summary.totalNgnMinor)}
          hint={summary ? `${summary.walletCount} wallets` : undefined}
          tone={T.success}
        />
        <KPI
          label="Total balance (CNY)"
          value={loading || !summary ? "…" : fmtMoney("CNY", summary.totalCnyMinor)}
          tone={T.success}
        />
        <KPI
          label="In escrow"
          value={loading || !summary ? "…" : fmtMoney("NGN", summary.escrowMinorNgn)}
          hint="Held against orders"
          tone={T.success}
        />
        <KPI label="Frozen" value={loading || !summary ? "…" : summary.frozenCount} tone={T.danger} />
        <KPI label="Limited" value={loading || !summary ? "…" : summary.limitedCount} tone={T.warn} />
      </div>

      {platformWallets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {platformWallets.map((h) => (
            <PlatformWalletCard key={h.user.id} holder={h} />
          ))}
        </div>
      ) : null}

      <FilterBar>
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5 shrink-0" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="User, email, wallet ID…"
            className="bg-transparent text-[12px] outline-none flex-1 min-w-0"
            style={{ color: T.ink }}
          />
        </div>
        <FilterSelect
          label="Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={uniqueOptions(holders.map((h) => holderType(h.user.role)), "All")}
        />
        <FilterSelect
          label="Currency"
          value={currencyFilter}
          onChange={setCurrencyFilter}
          options={uniqueOptions(
            holders.flatMap((h) => h.wallets.map((w) => w.currency)),
            "All",
          )}
        />
        <FilterSelect
          label="Country"
          value={countryFilter}
          onChange={setCountryFilter}
          options={uniqueOptions(holders.map((h) => countryFromPhone(h.user.phone).code), "All")}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={uniqueOptions(holders.map((h) => h.status), "All")}
        />
      </FilterBar>

      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <WalletTable rows={filtered} />
      )}
    </AdminShell>
  );
}
