import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { ActionMenu, TableActionTd, TableActionTh } from "@/components/admin/ActionMenu";
import type { ReactNode } from "react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card, Pill, fmtCNY, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip, findListing } from "@/components/admin/Orders";
import { TablePagerFooter, useTablePage } from "@/components/admin/TablePager";
import { downloadClientCsv } from "@/lib/csv";
import { FilterSelect, applyAllFilter, uniqueOptions } from "@/components/admin/ListFilters";
import { StatusBadgeCustom } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { useMemo, useState } from "react";

export { Card, Pill, fmtCNY, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip, findListing };

export type EscrowStatus =
  | "funded" | "in_transit" | "inspection" | "pending_release"
  | "released" | "disputed" | "refunded" | "expired";

export type Milestone = {
  id: string;
  label: string;
  amountNGN: number;
  pct: number;
  status: "pending" | "released" | "disputed" | "expired";
  due?: string;
  releasedAt?: string;
};

export type EscrowContract = {
  id: string;
  orderId: string;
  listingId: string;
  buyer: string;
  buyerId: string;
  buyerCountry: "NG" | "GH" | "KE";
  seller: string;
  sellerId: string;
  sellerCountry: "CN";
  totalNGN: number;
  totalCNY: number;
  heldNGN: number;
  releasedNGN: number;
  refundedNGN: number;
  feeNGN: number;
  status: EscrowStatus;
  template: string;
  fundedAt: string;
  autoReleaseAt: string;
  daysLeft: number;
  milestones: Milestone[];
  flag?: string;
};

const ms = (id: string, label: string, amountNGN: number, pct: number, status: Milestone["status"], extra: Partial<Milestone> = {}): Milestone =>
  ({ id, label, amountNGN, pct, status, ...extra });

export const ESCROWS: EscrowContract[] = [
  {
    id: "ESC-77120", orderId: "ORD-528104", listingId: "LST-3201",
    buyer: "Adaeze Okafor", buyerId: "USR-10241", buyerCountry: "NG",
    seller: "Shenzhen TopMax", sellerId: "SLR-2041", sellerCountry: "CN",
    totalNGN: 1618000, totalCNY: 6880, heldNGN: 1618000, releasedNGN: 0, refundedNGN: 0, feeNGN: 24270,
    status: "in_transit", template: "Goods ┬╖ 3-milestone",
    fundedAt: "Jun 24, 09:18", autoReleaseAt: "Jul 14, 09:18", daysLeft: 16,
    milestones: [
      ms("M1", "Deposit on order", 485400, 30, "released", { releasedAt: "Jun 24, 09:20" }),
      ms("M2", "Shipped & in transit", 808000, 50, "pending", { due: "Jul 04" }),
      ms("M3", "Delivered & accepted", 324600, 20, "pending", { due: "Jul 12" }),
    ],
  },
  {
    id: "ESC-77108", orderId: "ORD-528098", listingId: "LST-3202",
    buyer: "Tolu Bankole", buyerId: "USR-10182", buyerCountry: "NG",
    seller: "Guangzhou Aisha", sellerId: "SLR-1187", sellerCountry: "CN",
    totalNGN: 809100, totalCNY: 3408, heldNGN: 404550, releasedNGN: 404550, refundedNGN: 0, feeNGN: 12136,
    status: "pending_release", template: "Goods ┬╖ 2-milestone",
    fundedAt: "Jun 22, 14:08", autoReleaseAt: "Jun 30, 14:08", daysLeft: 2,
    milestones: [
      ms("M1", "Shipped", 404550, 50, "released", { releasedAt: "Jun 25, 11:00" }),
      ms("M2", "Delivered & accepted", 404550, 50, "pending", { due: "Jun 30" }),
    ],
    flag: "Auto-release in 2 days ΓÇö buyer has not confirmed receipt",
  },
  {
    id: "ESC-77091", orderId: "ORD-528077", listingId: "LST-3204",
    buyer: "Kwame Asante", buyerId: "USR-09812", buyerCountry: "GH",
    seller: "Yiwu PowerLine", sellerId: "SLR-3092", sellerCountry: "CN",
    totalNGN: 1734000, totalCNY: 7344, heldNGN: 0, releasedNGN: 1734000, refundedNGN: 0, feeNGN: 26010,
    status: "released", template: "Goods ┬╖ single release",
    fundedAt: "Jun 18, 11:44", autoReleaseAt: "Jun 27, 11:44", daysLeft: 0,
    milestones: [ ms("M1", "Delivered & accepted", 1734000, 100, "released", { releasedAt: "Jun 26, 16:20" }) ],
  },
  {
    id: "ESC-77074", orderId: "ORD-528060", listingId: "LST-3205",
    buyer: "Ngozi Eze", buyerId: "USR-09701", buyerCountry: "NG",
    seller: "Qingdao GoldStrand", sellerId: "SLR-2810", sellerCountry: "CN",
    totalNGN: 1380000, totalCNY: 5680, heldNGN: 1380000, releasedNGN: 0, refundedNGN: 0, feeNGN: 20700,
    status: "disputed", template: "Goods ┬╖ 3-milestone",
    fundedAt: "Jun 14, 08:02", autoReleaseAt: "Jul 04, 08:02", daysLeft: 6,
    milestones: [
      ms("M1", "Deposit on order", 414000, 30, "released", { releasedAt: "Jun 14, 08:05" }),
      ms("M2", "Shipped & in transit", 690000, 50, "disputed", { due: "Jun 24" }),
      ms("M3", "Delivered & accepted", 276000, 20, "pending", { due: "Jul 02" }),
    ],
    flag: "Dispute DSP-44021 opened ΓÇö customs hold, NCC compliance docs",
  },
  {
    id: "ESC-77055", orderId: "ORD-528041", listingId: "LST-3206",
    buyer: "Femi Adeyemi", buyerId: "USR-09584", buyerCountry: "NG",
    seller: "Xiamen LiteBox", sellerId: "SLR-2204", sellerCountry: "CN",
    totalNGN: 764800, totalCNY: 3240, heldNGN: 764800, releasedNGN: 0, refundedNGN: 0, feeNGN: 11472,
    status: "funded", template: "Goods ┬╖ 2-milestone",
    fundedAt: "Jun 28, 06:50", autoReleaseAt: "Jul 18, 06:50", daysLeft: 20,
    milestones: [
      ms("M1", "Shipped", 382400, 50, "pending", { due: "Jul 02" }),
      ms("M2", "Delivered & accepted", 382400, 50, "pending", { due: "Jul 14" }),
    ],
  },
  {
    id: "ESC-77036", orderId: "ORD-528022", listingId: "LST-3207",
    buyer: "Mary Wanjiru", buyerId: "USR-09410", buyerCountry: "KE",
    seller: "Dongguan SunBead", sellerId: "SLR-2418", sellerCountry: "CN",
    totalNGN: 715000, totalCNY: 2970, heldNGN: 0, releasedNGN: 715000, refundedNGN: 0, feeNGN: 10725,
    status: "released", template: "Goods ┬╖ single release",
    fundedAt: "Jun 10, 16:32", autoReleaseAt: "Jun 22, 16:32", daysLeft: 0,
    milestones: [ ms("M1", "Delivered & accepted", 715000, 100, "released", { releasedAt: "Jun 22, 09:14" }) ],
  },
  {
    id: "ESC-77011", orderId: "ORD-527990", listingId: "LST-3208",
    buyer: "Ibrahim Yusuf", buyerId: "USR-09221", buyerCountry: "NG",
    seller: "Foshan IronCraft", sellerId: "SLR-2640", sellerCountry: "CN",
    totalNGN: 603400, totalCNY: 2496, heldNGN: 0, releasedNGN: 0, refundedNGN: 603400, feeNGN: 0,
    status: "refunded", template: "Goods ┬╖ 2-milestone",
    fundedAt: "Jun 20, 10:16", autoReleaseAt: "Jul 10, 10:16", daysLeft: 0,
    milestones: [
      ms("M1", "Shipped", 301700, 50, "pending"),
      ms("M2", "Delivered & accepted", 301700, 50, "pending"),
    ],
    flag: "Full refund issued ΓÇö wrong language variant",
  },
  {
    id: "ESC-76988", orderId: "ORD-527964", listingId: "LST-3203",
    buyer: "Chiamaka Obi", buyerId: "USR-09080", buyerCountry: "NG",
    seller: "Hangzhou WokWise", sellerId: "SLR-1402", sellerCountry: "CN",
    totalNGN: 909000, totalCNY: 3800, heldNGN: 0, releasedNGN: 0, refundedNGN: 909000, feeNGN: 0,
    status: "refunded", template: "Goods ┬╖ 3-milestone",
    fundedAt: "May 30, 09:04", autoReleaseAt: "Jun 19, 09:04", daysLeft: 0,
    milestones: [
      ms("M1", "Deposit on order", 272700, 30, "released", { releasedAt: "May 30, 09:08" }),
      ms("M2", "Shipped", 454500, 50, "released", { releasedAt: "Jun 04, 12:00" }),
      ms("M3", "Delivered & accepted", 181800, 20, "disputed"),
    ],
    flag: "Items damaged on arrival ΓÇö admin override refund",
  },
  {
    id: "ESC-76960", orderId: "ORD-527940", listingId: "LST-3201",
    buyer: "Aisha Bello", buyerId: "USR-08902", buyerCountry: "NG",
    seller: "Shenzhen TopMax", sellerId: "SLR-2041", sellerCountry: "CN",
    totalNGN: 4028000, totalCNY: 17200, heldNGN: 4028000, releasedNGN: 0, refundedNGN: 0, feeNGN: 60420,
    status: "inspection", template: "Goods ┬╖ QC + 3-milestone",
    fundedAt: "Jun 26, 12:50", autoReleaseAt: "Jul 16, 12:50", daysLeft: 18,
    milestones: [
      ms("M1", "QC inspection cleared", 1208400, 30, "released", { releasedAt: "Jun 27, 14:30" }),
      ms("M2", "Shipped", 2014000, 50, "pending", { due: "Jul 06" }),
      ms("M3", "Delivered & accepted", 805600, 20, "pending", { due: "Jul 14" }),
    ],
    flag: "Bulk order ΓÇö buyer requested AQL 2.5 inspection",
  },
  {
    id: "ESC-76901", orderId: "ORD-527880", listingId: "LST-3204",
    buyer: "Samuel Okonkwo", buyerId: "USR-08620", buyerCountry: "NG",
    seller: "Yiwu PowerLine", sellerId: "SLR-3092", sellerCountry: "CN",
    totalNGN: 218000, totalCNY: 920, heldNGN: 218000, releasedNGN: 0, refundedNGN: 0, feeNGN: 3270,
    status: "expired", template: "Goods ┬╖ single release",
    fundedAt: "May 14, 08:00", autoReleaseAt: "Jun 03, 08:00", daysLeft: -25,
    milestones: [ ms("M1", "Delivered & accepted", 218000, 100, "expired") ],
    flag: "Auto-release window expired ΓÇö buyer never confirmed, no dispute opened",
  },
];

export function findEscrow(id: string | undefined) {
  if (!id) return ESCROWS[0];
  return ESCROWS.find((e) => e.id === id || e.id.endsWith(id)) ?? ESCROWS[0];
}

export const ESC_STATUS_META: Record<EscrowStatus, { c: string; label: string }> = {
  funded:           { c: T.info,    label: "Funded" },
  in_transit:       { c: "#7C3AED", label: "In transit" },
  inspection:       { c: T.warn,    label: "QC inspection" },
  pending_release:  { c: T.warn,    label: "Pending release" },
  released:         { c: T.success, label: "Released" },
  disputed:         { c: T.danger,  label: "Disputed" },
  refunded:         { c: T.accent,  label: "Refunded" },
  expired:          { c: T.muted,   label: "Expired" },
};

export function statusPillEscrow(s: EscrowStatus) {
  const m = ESC_STATUS_META[s];
  return <StatusBadgeCustom color={m.c} label={m.label} />;
}

export function EscrowTable({ rows }: { rows: EscrowContract[] }) {
  const pager = useTablePage(rows);
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
              <th className="px-2 py-2.5 pl-4">Contract</th>
              <th className="px-2 py-2.5">Ref</th>
              <th className="px-2 py-2.5">Buyer</th>
              <th className="px-2 py-2.5">Seller</th>
              <th className="px-2 py-2.5 text-right">Held</th>
              <th className="px-2 py-2.5">Progress</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">Auto-release</th>
              <TableActionTh />
            </tr>
          </thead>
          <tbody>
            {pager.slice.map((e) => {
              const released = e.milestones.filter((m) => m.status === "released").length;
              const total = e.milestones.length;
              const pct = e.totalNGN > 0 ? Math.round((e.releasedNGN / e.totalNGN) * 100) : 0;
              return (
                <tr key={e.id} className="border-t hover:bg-black/[0.015] transition" style={{ borderColor: T.border }}>
                  <td className="px-2 py-3 pl-4">
                    <Link to="/admin/escrow/$id" params={{ id: e.id }} className="font-bold tabular-nums hover:underline" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>{e.id.slice(0, 12).toUpperCase()}</Link>
                    <p className="text-[10.5px]" style={{ color: T.muted }}>{e.template}</p>
                  </td>
                  <td className="px-2 py-3">
                    <span className="font-medium tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{e.orderId}</span>
                    <p className="text-[10.5px]" style={{ color: T.muted }}>{e.fundedAt}</p>
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-medium flex items-center gap-1"><FlagEmoji c={e.buyerCountry} /> {e.buyer}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{e.buyerId}</p>
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-medium flex items-center gap-1 truncate max-w-[140px]"><FlagEmoji c={e.sellerCountry} /> {e.seller}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{e.sellerId}</p>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <p className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtNGN(e.heldNGN)}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>of {fmtNGN(e.totalNGN)}</p>
                  </td>
                  <td className="px-2 py-3 min-w-[120px]">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                      <div className="h-full" style={{ width: `${pct}%`, background: T.success }} />
                    </div>
                    <p className="mt-1 text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{released}/{total} milestones · {pct}%</p>
                  </td>
                  <td className="px-2 py-3">{statusPillEscrow(e.status)}</td>
                  <td className="px-2 py-3 text-[11px] tabular-nums" style={{ color: e.daysLeft < 0 ? T.danger : e.daysLeft <= 3 ? T.warn : T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                    {e.daysLeft < 0 ? `${Math.abs(e.daysLeft)}d overdue` : e.daysLeft === 0 ? "completed" : `${e.daysLeft}d left`}
                  </td>
                  <TableActionTd>
                    <ActionMenu
                      label={`Actions for escrow ${e.id}`}
                      items={[
                        {
                          id: "view",
                          label: "View contract",
                          onClick: () => {
                            window.location.href = `/admin/escrow/${e.id}`;
                          },
                        },
                      ]}
                    />
                  </TableActionTd>
                </tr>
              );
            })}
            {!pager.total && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-[12px]" style={{ color: T.muted }}>No escrow contracts match these filters.</td></tr>
            )}
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

export function EscrowQueuePage({
  title, description, rows, emptyHint,
}: { title: string; description: string; rows: EscrowContract[]; emptyHint?: string }) {
  const [country, setCountry] = useState("__all__");
  const [seller, setSeller] = useState("__all__");
  const [template, setTemplate] = useState("__all__");

  const filtered = useMemo(() => {
    let list = rows;
    list = applyAllFilter(list, country, (r) => r.buyerCountry);
    list = applyAllFilter(list, seller, (r) => r.seller);
    list = applyAllFilter(list, template, (r) => r.template);
    return list;
  }, [rows, country, seller, template]);

  const held = filtered.reduce((s, e) => s + e.heldNGN, 0);
  const oldest = filtered.reduce((acc, e) => Math.max(acc, Math.abs(e.daysLeft)), 0);

  const onExport = () => {
    if (!filtered.length) {
      toast.message("Nothing to export");
      return;
    }
    downloadClientCsv(
      `magnetpay-escrow-${new Date().toISOString().slice(0, 10)}.csv`,
      ["id", "ref", "buyer", "seller", "heldNGN", "totalNGN", "status", "fundedAt"],
      filtered.map((e) => ({
        id: e.id,
        ref: e.orderId,
        buyer: e.buyer,
        seller: e.seller,
        heldNGN: e.heldNGN,
        totalNGN: e.totalNGN,
        status: e.status,
        fundedAt: e.fundedAt,
      })),
    );
    toast.success("CSV downloaded");
  };

  return (
    <AdminShell
      title={title}
      description={description}
      actions={
        <button
          type="button"
          onClick={onExport}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <Download className="size-3.5" /> Export
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Contracts" value={filtered.length} />
        <KPI label="Funds held" value={fmtNGN(held)} tone={T.warn} />
        <KPI label="Avg held" value={filtered.length ? fmtNGN(Math.round(held / filtered.length)) : "—"} />
        <KPI label="Oldest" value={`${oldest}d`} hint={emptyHint} />
      </div>
      <FilterBar>
        <FilterSelect label="Country" value={country} onChange={setCountry} options={uniqueOptions(rows.map((r) => r.buyerCountry), "All")} />
        <FilterSelect label="Seller" value={seller} onChange={setSeller} options={uniqueOptions(rows.map((r) => r.seller), "Any")} />
        <FilterSelect label="Template" value={template} onChange={setTemplate} options={uniqueOptions(rows.map((r) => r.template), "All")} />
      </FilterBar>
      <EscrowTable rows={filtered} />
    </AdminShell>
  );
}

// Aggregate stats
export function escrowStats() {
  const all = ESCROWS;
  const held = all.reduce((s, e) => s + e.heldNGN, 0);
  const released = all.reduce((s, e) => s + e.releasedNGN, 0);
  const refunded = all.reduce((s, e) => s + e.refundedNGN, 0);
  const fees = all.reduce((s, e) => s + e.feeNGN, 0);
  const disputed = all.filter((e) => e.status === "disputed").length;
  const pending = all.filter((e) => e.status === "pending_release").length;
  const expired = all.filter((e) => e.status === "expired").length;
  return { held, released, refunded, fees, disputed, pending, expired, total: all.length };
}

export type EscrowTemplate = {
  id: string;
  name: string;
  category: "Goods" | "Services" | "Bulk" | "Custom";
  milestones: { label: string; pct: number; trigger: string }[];
  autoReleaseDays: number;
  inspection: boolean;
  feeBps: number;
  active: boolean;
  usage: number;
  updated: string;
};

export const ESCROW_TEMPLATES: EscrowTemplate[] = [
  {
    id: "TPL-001", name: "Goods ┬╖ 3-milestone (standard)", category: "Goods",
    milestones: [
      { label: "Deposit on order", pct: 30, trigger: "Funds received" },
      { label: "Shipped & in transit", pct: 50, trigger: "Carrier pickup scan" },
      { label: "Delivered & accepted", pct: 20, trigger: "Buyer confirms or 7-day timer" },
    ],
    autoReleaseDays: 20, inspection: false, feeBps: 150, active: true, usage: 4128, updated: "2 days ago",
  },
  {
    id: "TPL-002", name: "Goods ┬╖ 2-milestone (express)", category: "Goods",
    milestones: [
      { label: "Shipped", pct: 50, trigger: "Carrier pickup scan" },
      { label: "Delivered & accepted", pct: 50, trigger: "Buyer confirms or 5-day timer" },
    ],
    autoReleaseDays: 14, inspection: false, feeBps: 150, active: true, usage: 2890, updated: "1 wk ago",
  },
  {
    id: "TPL-003", name: "Goods ┬╖ single release", category: "Goods",
    milestones: [ { label: "Delivered & accepted", pct: 100, trigger: "Buyer confirms or 7-day timer" } ],
    autoReleaseDays: 12, inspection: false, feeBps: 150, active: true, usage: 1640, updated: "3 wks ago",
  },
  {
    id: "TPL-004", name: "Goods ┬╖ QC + 3-milestone (bulk)", category: "Bulk",
    milestones: [
      { label: "QC inspection cleared", pct: 30, trigger: "AQL 2.5 inspector report" },
      { label: "Shipped", pct: 50, trigger: "Carrier pickup scan" },
      { label: "Delivered & accepted", pct: 20, trigger: "Buyer confirms or 10-day timer" },
    ],
    autoReleaseDays: 30, inspection: true, feeBps: 200, active: true, usage: 412, updated: "4 days ago",
  },
  {
    id: "TPL-005", name: "Services ┬╖ milestone-based", category: "Services",
    milestones: [
      { label: "Project kickoff", pct: 25, trigger: "Both parties sign" },
      { label: "Midpoint review", pct: 35, trigger: "Buyer approves draft" },
      { label: "Final delivery", pct: 40, trigger: "Buyer accepts deliverable" },
    ],
    autoReleaseDays: 45, inspection: false, feeBps: 250, active: true, usage: 188, updated: "1 mo ago",
  },
  {
    id: "TPL-006", name: "Custom ┬╖ negotiated terms", category: "Custom",
    milestones: [ { label: "Custom milestones (defined per deal)", pct: 100, trigger: "Per contract" } ],
    autoReleaseDays: 60, inspection: false, feeBps: 250, active: false, usage: 22, updated: "6 mo ago",
  },
];
