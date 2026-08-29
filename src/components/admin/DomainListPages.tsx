import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AdminShell, T } from "./AdminShell";
import { Pill } from "./UserProfile";
import { KPI, FilterBar, Card } from "./Orders";
import { FilterSelect, applyAllFilter, uniqueOptions } from "./ListFilters";
import { EscrowTable, type EscrowContract } from "./Escrow";
import { DisputeTable, type Dispute } from "./Disputes";
import { ShipmentTable, type Shipment } from "./Logistics";
import { SectionLabel, statusPillCatalog, Thumb } from "./Catalog";
import {
  fetchAdminBrands,
  fetchAdminDisputes,
  fetchAdminEscrows,
  fetchAdminShipments,
  fetchAdminTransfers,
  fetchAdminDeposits,
  fetchAdminWithdrawals,
  fetchAdminWallets,
  fmtMoney,
  resolveApiFileUrl,
  fetchAdminReconciliation,
  fetchAdminSellerTiers,
  type AdminBrand,
  type AdminEscrow,
  type AdminShipment,
} from "@/lib/api";
import { toast } from "sonner";

function toneForStatus(s: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const x = s.toLowerCase();
  if (["active", "verified", "delivered", "completed", "succeeded", "approved"].some((k) => x.includes(k))) return "success";
  if (["pending", "processing", "open", "in_transit", "customs"].some((k) => x.includes(k))) return "warn";
  if (["failed", "cancelled", "rejected", "exception"].some((k) => x.includes(k))) return "danger";
  return "neutral";
}

export function BrandsListPage() {
  const [rows, setRows] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchAdminBrands()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => !query || r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AdminShell title="Brands" description="Verified supplier brands on marketplace." breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: "Brands" }]}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Total brands" value={String(rows.length)} />
        <KPI label="Verified" value={String(rows.filter((r) => r.status === "verified").length)} tone="success" />
        <KPI label="Products linked" value={String(rows.reduce((s, r) => s + (r._count?.products ?? 0), 0))} tone="info" />
        <KPI label="Filtered" value={String(filtered.length)} />
      </div>
      <FilterBar>
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[260px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brand…" className="bg-transparent text-[12px] outline-none flex-1" />
        </div>
      </FilterBar>
      <Card padded={false} className="mt-4">
        <div className="grid px-4 h-9 items-center text-[10px] font-bold uppercase tracking-[0.14em]" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          <span>Brand</span><span>Country</span><span>Listings</span><span>Status</span>
        </div>
        {loading ? (
          <div className="py-12 grid place-items-center"><Loader2 className="size-5 animate-spin" style={{ color: T.muted }} /></div>
        ) : (
          filtered.map((r, i) => (
            <div key={r.id} className="grid px-4 h-[52px] items-center text-[12px]" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span className="font-semibold">{r.name}</span>
              <span>{r.country}</span>
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r._count?.products ?? 0}</span>
              <Pill tone={r.status === "verified" ? "success" : "warn"}>{r.status}</Pill>
            </div>
          ))
        )}
      </Card>
    </AdminShell>
  );
}

export function EscrowListPage({ filter }: { filter?: string }) {
  const [rows, setRows] = useState<AdminEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("__all__");
  const [seller, setSeller] = useState("__all__");
  const [template, setTemplate] = useState("__all__");

  useEffect(() => {
    void fetchAdminEscrows()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const mapped: EscrowContract[] = rows.map((e) => {
    const heldNGN = Math.round(Number(e.amountMinor) / 100 * 229);
    const ms = (e.milestones ?? []) as { id: string; title: string; amountMinor: string | number; amountBps: number; status: string }[];
    const released = ms.filter((m) => m.status === "RELEASED").reduce((s, m) => s + Number(m.amountMinor), 0);
    return {
      id: e.id,
      orderId: e.id.slice(0, 8).toUpperCase(),
      listingId: e.id.slice(0, 8).toUpperCase(),
      buyer: e.buyer?.name ?? "Buyer",
      buyerId: e.buyer?.id ?? "—",
      buyerCountry: "NG",
      seller: e.seller?.name ?? "Seller",
      sellerId: e.seller?.id ?? "—",
      sellerCountry: "CN",
      totalNGN: heldNGN,
      totalCNY: Number(e.amountMinor) / 100,
      heldNGN,
      releasedNGN: Math.round(released / 100 * 229),
      refundedNGN: 0,
      feeNGN: Math.round(heldNGN * 0.015),
      status: (e.status === "DISPUTED" ? "disputed" : e.status === "ACTIVE" ? "in_transit" : "pending_release") as EscrowContract["status"],
      template: "Standard 3-milestone",
      fundedAt: new Date(e.createdAt).toLocaleDateString(),
      autoReleaseAt: "—",
      daysLeft: Math.max(0, 30 - Math.floor((Date.now() - new Date(e.createdAt).getTime()) / 86_400_000)),
      milestones: ms.map((m) => ({
        id: m.id,
        label: m.title,
        amountNGN: Math.round(Number(m.amountMinor) / 100 * 229),
        pct: m.amountBps / 100,
        status: (m.status === "RELEASED" ? "released" : m.status === "DISPUTED" ? "disputed" : "pending") as "released" | "disputed" | "pending",
      })),
    };
  });

  const filtered = useMemo(() => {
    let list = filter
      ? mapped.filter((r) => r.status === filter || (filter === "pending-release" && r.status === "pending_release"))
      : mapped;
    list = applyAllFilter(list, country, (r) => r.buyerCountry);
    list = applyAllFilter(list, seller, (r) => r.seller);
    list = applyAllFilter(list, template, (r) => r.template);
    return list;
  }, [mapped, filter, country, seller, template]);

  const held = filtered.reduce((s, e) => s + e.heldNGN, 0);
  const stats = {
    contracts: filtered.length,
    heldLabel: `₦${held.toLocaleString()}`,
    avgDays: filtered.length ? Math.round(filtered.reduce((s, e) => s + e.daysLeft, 0) / filtered.length) : 0,
    oldest: filtered[0]?.fundedAt ?? "—",
  };

  return (
    <AdminShell title="Escrow contracts" description="Funded escrow awaiting milestone release." breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow" }]}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI label="Contracts" value={String(stats.contracts)} />
        <KPI label="Funds held" value={stats.heldLabel} tone="warn" />
        <KPI label="Avg held" value={`${stats.avgDays}d`} tone="info" />
        <KPI label="Oldest" value={stats.oldest} tone="danger" />
      </div>
      <FilterBar>
        <FilterSelect label="Country" value={country} onChange={setCountry} options={uniqueOptions(mapped.map((r) => r.buyerCountry), "All")} />
        <FilterSelect label="Seller" value={seller} onChange={setSeller} options={uniqueOptions(mapped.map((r) => r.seller), "Any")} />
        <FilterSelect label="Template" value={template} onChange={setTemplate} options={uniqueOptions(mapped.map((r) => r.template), "All")} />
      </FilterBar>
      {loading ? <Loader2 className="size-5 animate-spin mx-auto my-16" style={{ color: T.muted }} /> : <EscrowTable rows={filtered} />}
    </AdminShell>
  );
}

export function DisputesListPage() {
  const [rows, setRows] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminDisputes()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const mapped: Dispute[] = rows.map((d) => {
    const rawStatus = String((d as { status?: string }).status ?? "OPEN").toLowerCase();
    const status: Dispute["status"] =
      d.outcome || rawStatus.includes("resolved")
        ? "resolved_buyer"
        : rawStatus.includes("escalat")
          ? "escalated"
          : rawStatus.includes("invest")
            ? "investigating"
            : "new";
    return {
    id: d.id,
    orderId: d.escrowId.slice(0, 8).toUpperCase(),
    escrowId: d.escrowId,
    listingId: "—",
    amountNGN: Math.round(Number(d.escrow?.amountMinor ?? 0) / 100 * 229),
    buyer: d.openedBy?.name ?? "Buyer",
    buyerId: d.openedBy?.id ?? "—",
    buyerCountry: "NG",
    seller: d.escrow?.seller?.name ?? "Seller",
    sellerId: d.escrow?.seller?.id ?? "—",
    reason: "not_as_described",
    status,
    priority: ((d as { priority?: string }).priority ?? "normal") as Dispute["priority"],
    openedAt: new Date(d.createdAt).toLocaleDateString(),
    openedBy: "buyer",
    ageHours: Math.floor((Date.now() - new Date(d.createdAt).getTime()) / 3600_000),
    slaHours: 72,
    lastActivity: new Date(d.updatedAt ?? d.createdAt).toLocaleDateString(),
    assignee: (d as { assignee?: { name?: string } }).assignee?.name,
    evidence: [],
    summary: d.reason,
  };
  });

  const open = mapped.filter((x) => !x.status.startsWith("resolved"));
  const stats = {
    open: open.length,
    atStakeLabel: `₦${open.reduce((s, x) => s + x.amountNGN, 0).toLocaleString()}`,
    overSla: open.filter((x) => x.ageHours >= x.slaHours).length,
    critical: open.filter((x) => x.priority === "critical").length,
  };

  return (
    <AdminShell title="Disputes" description="Open and resolved buyer–seller disputes." breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes" }]}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI label="Open" value={String(stats.open)} tone="warn" />
        <KPI label="At stake" value={stats.atStakeLabel} tone="danger" />
        <KPI label="Over SLA" value={String(stats.overSla)} tone="danger" />
        <KPI label="Critical" value={String(stats.critical)} tone="info" />
      </div>
      {loading ? <Loader2 className="size-5 animate-spin mx-auto my-16" style={{ color: T.muted }} /> : <DisputeTable rows={mapped} />}
    </AdminShell>
  );
}

export function ShipmentsListPage() {
  const [rows, setRows] = useState<AdminShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "transit" | "customs" | "topup" | "delivered">("all");

  useEffect(() => {
    void fetchAdminShipments()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((s) => {
    const st = s.status?.toUpperCase() ?? "";
    if (tab === "transit") return ["IN_TRANSIT", "HOLD_LOCKED", "SETTLEMENT_PENDING", "READY_FOR_POD"].includes(st);
    if (tab === "customs") return st === "CUSTOMS";
    if (tab === "topup") return st === "TOP_UP_REQUIRED";
    if (tab === "delivered") return st === "DELIVERED";
    return true;
  });

  const mapStatus = (status: string): Shipment["status"] => {
    const s = status.toUpperCase();
    if (s === "IN_TRANSIT" || s === "HOLD_LOCKED" || s === "SETTLEMENT_PENDING" || s === "READY_FOR_POD") return "in_transit";
    if (s === "CUSTOMS") return "customs";
    if (s === "TOP_UP_REQUIRED") return "customs";
    if (s === "DELIVERED") return "delivered";
    return "label_created";
  };

  const mapped: Shipment[] = filtered.map((s) => ({
    id: s.id,
    orderId: s.id.slice(0, 8),
    buyer: s.user?.name ?? "Buyer",
    buyerCountry: "NG",
    seller: "Supplier",
    carrier: "MagnetExpress",
    service: s.mode ?? "SEA",
    tracking: s.ref ?? s.id.slice(0, 8),
    weightKg: 0,
    pieces: 1,
    declaredValueNGN: 0,
    costNGN: Number(s.hold?.lockedMinor ?? 0) / 100,
    status: mapStatus(s.status),
    origin: s.route?.split("→")[0]?.trim() ?? "Guangzhou",
    destination: s.route?.split("→")[1]?.trim() ?? "Lagos",
    pickup: s.route?.split("→")[0]?.trim() ?? "Guangzhou",
    eta: "—",
    legs: [],
    insurance: false,
  }));

  return (
    <AdminShell title="Shipments" description="Cross-border cargo in transit and customs." breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Shipments" }]}>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <KPI label="Total" value={String(rows.length)} />
        <KPI label="In transit" value={String(rows.filter((r) => ["IN_TRANSIT", "HOLD_LOCKED", "SETTLEMENT_PENDING", "READY_FOR_POD"].includes(r.status)).length)} tone="info" />
        <KPI label="Customs" value={String(rows.filter((r) => r.status === "CUSTOMS").length)} tone="warn" />
        <KPI label="Top-up due" value={String(rows.filter((r) => r.status === "TOP_UP_REQUIRED").length)} tone="danger" />
        <KPI label="Delivered" value={String(rows.filter((r) => r.status === "DELIVERED").length)} tone="success" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["all", "All"],
            ["transit", "In transit"],
            ["customs", "Customs"],
            ["topup", "Top-up due"],
            ["delivered", "Delivered"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className="h-8 px-3 rounded-lg text-[11.5px] font-semibold"
            style={{
              background: tab === k ? T.navy : T.surface,
              border: `1px solid ${tab === k ? T.navy : T.border}`,
              color: tab === k ? "#fff" : T.ink,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? <Loader2 className="size-5 animate-spin mx-auto my-16" style={{ color: T.muted }} /> : <ShipmentTable rows={mapped} />}
    </AdminShell>
  );
}

export function MoneyTransfersPage() {
  return <MoneyTablePage title="Transactions" path="/admin/transactions" loader={fetchAdminTransfers} amountKey="amountMinor" />;
}

export function MoneyDepositsPage() {
  return <MoneyTablePage title="Deposits" path="/admin/deposits" loader={fetchAdminDeposits} amountKey="amountMinor" />;
}

export function MoneyWithdrawalsPage() {
  return <MoneyTablePage title="Withdrawals" path="/admin/withdrawals" loader={fetchAdminWithdrawals} amountKey="amountMinor" />;
}

export function MoneyWalletsPage() {
  return <MoneyTablePage title="Wallets" path="/admin/wallets" loader={fetchAdminWallets} amountKey="balanceMinor" />;
}

function MoneyTablePage({
  title,
  path,
  loader,
  amountKey,
}: {
  title: string;
  path: string;
  loader: () => Promise<unknown[]>;
  amountKey: string;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loader()
      .then((d) => setRows(d as Record<string, unknown>[]))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title={title} description={`Live ${title.toLowerCase()} from API.`} breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: title }]}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI label="Records" value={String(rows.length)} />
        <KPI label="Pending" value={String(rows.filter((r) => toneForStatus(String(r.status ?? "")) === "warn").length)} tone="warn" />
        <KPI label="Completed" value={String(rows.filter((r) => toneForStatus(String(r.status ?? "")) === "success").length)} tone="success" />
        <KPI label="Failed" value={String(rows.filter((r) => toneForStatus(String(r.status ?? "")) === "danger").length)} tone="danger" />
      </div>
      <Card padded={false}>
        <div className="grid px-4 h-9 items-center text-[10px] font-bold uppercase tracking-[0.14em]" style={{ gridTemplateColumns: "1.2fr 1fr 1fr 1fr", color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          <span>ID</span><span>User</span><span>Status</span><span className="text-right">Amount</span>
        </div>
        {loading ? (
          <div className="py-12 grid place-items-center"><Loader2 className="size-5 animate-spin" style={{ color: T.muted }} /></div>
        ) : (
          rows.slice(0, 50).map((r, i) => {
            const id = String(r.id ?? i);
            const user = (r.user ?? {}) as Record<string, unknown>;
            return (
              <Link
                key={id}
                to={`${path}/$id` as never}
                params={{ id } as never}
                className="grid px-4 h-[52px] items-center text-[12px] hover:opacity-90"
                style={{ gridTemplateColumns: "1.2fr 1fr 1fr 1fr", borderBottom: i < Math.min(rows.length, 50) - 1 ? `1px solid ${T.border}` : "none" }}
              >
                <span className="font-semibold tabular-nums truncate" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>{id.slice(0, 10)}</span>
                <span className="truncate">{String(user.name ?? "—")}</span>
                <Pill tone={toneForStatus(String(r.status ?? ""))}>{String(r.status ?? "—")}</Pill>
                <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtMoney(String(r.currency ?? "NGN"), r[amountKey] as string | number)}
                </span>
              </Link>
            );
          })
        )}
      </Card>
    </AdminShell>
  );
}

export function InventoryAlertsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void import("@/lib/api").then(({ fetchAdminProducts }) =>
      fetchAdminProducts().then((d) => setRows(d as Record<string, unknown>[])),
    );
  }, []);

  const low = rows.filter((r) => {
    const stock = r.stock as number | null;
    return stock != null && stock < 100;
  });

  return (
    <AdminShell title="Inventory alerts" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: "Inventory" }]}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <KPI label="Low stock" value={String(low.length)} tone="warn" />
        <KPI label="Out of stock" value={String(rows.filter((r) => r.stock === 0).length)} tone="danger" />
        <KPI label="Total SKUs" value={String(rows.length)} />
      </div>
      <Card padded={false}>
        {low.slice(0, 30).map((r, i) => {
          const id = String(r.id);
          const img = r.imageUrl ? resolveApiFileUrl(String(r.imageUrl)) : "";
          return (
            <Link key={id} to="/admin/listings/$id" params={{ id }} className="flex items-center gap-3 px-4 py-3 text-[12px]" style={{ borderBottom: `1px solid ${T.border}` }}>
              {img ? <Thumb src={img} alt="" size={36} /> : null}
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{String(r.title)}</p>
                <p className="text-[10.5px]" style={{ color: T.muted }}>Stock {String(r.stock)} · MOQ {String(r.moq ?? "—")}</p>
              </div>
              {statusPillCatalog(r.active ? "active" : "pending")}
            </Link>
          );
        })}
      </Card>
    </AdminShell>
  );
}

export function ReconciliationPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminReconciliation()
      .then((d) => setData(d as Record<string, unknown>))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const deposits = (data?.deposits ?? []) as { status: string; _count: number; _sum: { amountMinor: string | null } }[];
  const withdrawals = (data?.withdrawals ?? []) as { status: string; _count: number; _sum: { amountMinor: string | null } }[];

  return (
    <AdminShell title="Reconciliation" description="Deposit vs withdrawal balance snapshot." breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Reconciliation" }]}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI label="Status" value={String(data?.status ?? "—")} tone={data?.status === "balanced" ? "success" : "warn"} />
        <KPI label="Transfers" value={String(data?.transfers ?? "—")} tone="info" />
        <KPI label="Deposit groups" value={String(deposits.length)} />
        <KPI label="Withdrawal groups" value={String(withdrawals.length)} />
      </div>
      {loading ? (
        <Loader2 className="size-5 animate-spin mx-auto my-16" style={{ color: T.muted }} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <Card padded={false}>
            <div className="px-4 py-3 font-bold text-[12px]" style={{ borderBottom: `1px solid ${T.border}` }}>Deposits by status</div>
            {deposits.map((d, i) => (
              <div key={d.status} className="px-4 py-3 flex justify-between text-[12px]" style={{ borderBottom: i < deposits.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <Pill tone={toneForStatus(d.status)}>{d.status}</Pill>
                <span className="tabular-nums font-bold">{d._count} · {fmtMoney("NGN", d._sum?.amountMinor ?? 0)}</span>
              </div>
            ))}
          </Card>
          <Card padded={false}>
            <div className="px-4 py-3 font-bold text-[12px]" style={{ borderBottom: `1px solid ${T.border}` }}>Withdrawals by status</div>
            {withdrawals.map((d, i) => (
              <div key={d.status} className="px-4 py-3 flex justify-between text-[12px]" style={{ borderBottom: i < withdrawals.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <Pill tone={toneForStatus(d.status)}>{d.status}</Pill>
                <span className="tabular-nums font-bold">{d._count} · {fmtMoney("NGN", d._sum?.amountMinor ?? 0)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
      {data?.lastRun ? (
        <p className="mt-4 text-[11px]" style={{ color: T.muted }}>Last run: {new Date(String(data.lastRun)).toLocaleString()}</p>
      ) : null}
    </AdminShell>
  );
}

export function SellerTiersPage() {
  const [rows, setRows] = useState<{ id: string; name: string; minOrders?: number; verified?: boolean; title?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminSellerTiers()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Seller tiers" description="Tier thresholds and verification requirements." breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Sellers", to: "/admin/sellers" }, { label: "Tiers" }]}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI label="Tiers" value={String(rows.length)} />
        <KPI label="Verified tiers" value={String(rows.filter((r) => r.verified).length)} tone="success" />
        <KPI label="Min orders (max)" value={String(Math.max(0, ...rows.map((r) => r.minOrders ?? 0)))} tone="info" />
        <KPI label="Active" value={String(rows.filter((r) => (r.status ?? "active") !== "inactive").length)} />
      </div>
      <Card padded={false}>
        <div className="grid px-4 h-9 items-center text-[10px] font-bold uppercase tracking-[0.14em]" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          <span>Tier</span><span>Min orders</span><span>Verified</span><span>Status</span>
        </div>
        {loading ? (
          <div className="py-12 grid place-items-center"><Loader2 className="size-5 animate-spin" style={{ color: T.muted }} /></div>
        ) : (
          rows.map((r, i) => (
            <div key={r.id} className="grid px-4 h-[52px] items-center text-[12px]" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span className="font-semibold">{r.name ?? r.title ?? r.id}</span>
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.minOrders ?? 0}</span>
              <Pill tone={r.verified ? "success" : "neutral"}>{r.verified ? "Yes" : "No"}</Pill>
              <Pill tone={toneForStatus(String(r.status ?? "active"))}>{r.status ?? "active"}</Pill>
            </div>
          ))
        )}
      </Card>
    </AdminShell>
  );
}
