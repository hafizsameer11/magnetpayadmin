import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip, findListing } from "@/components/admin/Orders";
import { TablePagerFooter, useTablePage } from "@/components/admin/TablePager";

export { Card, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip };

export type DisputeStatus = "new" | "investigating" | "awaiting_buyer" | "awaiting_seller" | "ruling_pending" | "resolved_buyer" | "resolved_seller" | "split" | "escalated";
export type DisputeReason = "not_as_described" | "not_received" | "damaged" | "counterfeit" | "wrong_item" | "late" | "quality" | "customs_hold" | "chargeback";

export type DisputeEvidence = {
  id: string;
  side: "buyer" | "seller" | "admin" | "carrier";
  kind: "photo" | "doc" | "video" | "message" | "tracking";
  title: string;
  at: string;
  by: string;
  note?: string;
};

export type Dispute = {
  id: string;
  orderId: string;
  escrowId: string;
  listingId: string;
  amountNGN: number;
  buyer: string;
  buyerId: string;
  buyerCountry: "NG" | "GH" | "KE";
  seller: string;
  sellerId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  priority: "low" | "normal" | "high" | "critical";
  openedAt: string;
  openedBy: "buyer" | "seller";
  ageHours: number;
  slaHours: number;
  lastActivity: string;
  assignee?: string;
  evidence: DisputeEvidence[];
  summary: string;
  ruling?: { decision: string; amountToBuyer: number; amountToSeller: number; ruledAt: string; ruledBy: string; rationale: string };
};

const REASON_LABEL: Record<DisputeReason, string> = {
  not_as_described: "Not as described",
  not_received: "Not received",
  damaged: "Damaged on arrival",
  counterfeit: "Counterfeit / fake",
  wrong_item: "Wrong item sent",
  late: "Significantly late",
  quality: "Quality below spec",
  customs_hold: "Customs hold",
  chargeback: "Bank chargeback",
};

export const DISPUTES: Dispute[] = [
  {
    id: "DSP-44021", orderId: "ORD-528060", escrowId: "ESC-77074", listingId: "LST-3205",
    amountNGN: 1380000, buyer: "Ngozi Eze", buyerId: "USR-09701", buyerCountry: "NG",
    seller: "Qingdao GoldStrand", sellerId: "SLR-2810",
    reason: "customs_hold", status: "investigating", priority: "high",
    openedAt: "Jun 25, 10:14", openedBy: "buyer", ageHours: 76, slaHours: 96,
    lastActivity: "1 hr ago", assignee: "Funmi A.",
    summary: "Shipment stuck at LOS customs ΓÇö NCC compliance docs requested but seller has not provided FCC/SONCAP certificates.",
    evidence: [
      { id: "EV-1", side: "buyer", kind: "photo", title: "Customs hold notice", at: "Jun 25, 10:18", by: "Ngozi Eze", note: "Photo of NCC bond notice" },
      { id: "EV-2", side: "buyer", kind: "doc", title: "Order invoice + payment proof", at: "Jun 25, 10:22", by: "Ngozi Eze" },
      { id: "EV-3", side: "admin", kind: "message", title: "Requested SONCAP from seller", at: "Jun 26, 09:00", by: "Funmi A." },
      { id: "EV-4", side: "seller", kind: "doc", title: "Generic CE certificate (insufficient)", at: "Jun 26, 18:42", by: "Qingdao GoldStrand", note: "Does not satisfy NCC requirements" },
      { id: "EV-5", side: "carrier", kind: "tracking", title: "MEX2X8810044NG ΓÇö held since Jun 24", at: "Jun 27, 02:00", by: "MagnetExpress" },
    ],
  },
  {
    id: "DSP-44018", orderId: "ORD-527964", escrowId: "ESC-76988", listingId: "LST-3203",
    amountNGN: 909000, buyer: "Chiamaka Obi", buyerId: "USR-09080", buyerCountry: "NG",
    seller: "Hangzhou WokWise", sellerId: "SLR-1402",
    reason: "damaged", status: "resolved_buyer", priority: "normal",
    openedAt: "Jun 18, 14:02", openedBy: "buyer", ageHours: 240, slaHours: 96,
    lastActivity: "2 days ago", assignee: "Daniel K.",
    summary: "Cookware set arrived with two broken handles and a dented lid. Photo evidence clear; seller did not contest.",
    evidence: [
      { id: "EV-10", side: "buyer", kind: "photo", title: "4 photos of broken cookware", at: "Jun 18, 14:08", by: "Chiamaka Obi" },
      { id: "EV-11", side: "buyer", kind: "video", title: "Unboxing video (32s)", at: "Jun 18, 14:12", by: "Chiamaka Obi" },
      { id: "EV-12", side: "seller", kind: "message", title: "Accepted refund", at: "Jun 20, 09:00", by: "Hangzhou WokWise" },
    ],
    ruling: { decision: "Full refund to buyer", amountToBuyer: 909000, amountToSeller: 0, ruledAt: "Jun 26, 11:00", ruledBy: "Daniel K.", rationale: "Damage clearly photographed; seller accepted liability. Carrier insurance claim filed separately." },
  },
  {
    id: "DSP-44015", orderId: "ORD-528098", escrowId: "ESC-77108", listingId: "LST-3202",
    amountNGN: 809100, buyer: "Tolu Bankole", buyerId: "USR-10182", buyerCountry: "NG",
    seller: "Guangzhou Aisha", sellerId: "SLR-1187",
    reason: "not_as_described", status: "awaiting_seller", priority: "normal",
    openedAt: "Jun 27, 08:30", openedBy: "buyer", ageHours: 30, slaHours: 96,
    lastActivity: "3 hr ago", assignee: "Funmi A.",
    summary: "Buyer says Ankara fabric pattern is different colorway than listing ΓÇö claims listing shows red/gold, received navy/gold.",
    evidence: [
      { id: "EV-20", side: "buyer", kind: "photo", title: "Received fabric photo", at: "Jun 27, 08:34", by: "Tolu Bankole" },
      { id: "EV-21", side: "buyer", kind: "photo", title: "Listing screenshot", at: "Jun 27, 08:35", by: "Tolu Bankole" },
    ],
  },
  {
    id: "DSP-44009", orderId: "ORD-527880", escrowId: "ESC-76901", listingId: "LST-3204",
    amountNGN: 218000, buyer: "Samuel Okonkwo", buyerId: "USR-08620", buyerCountry: "NG",
    seller: "Yiwu PowerLine", sellerId: "SLR-3092",
    reason: "not_received", status: "escalated", priority: "critical",
    openedAt: "Jun 14, 09:00", openedBy: "buyer", ageHours: 336, slaHours: 96,
    lastActivity: "5 days ago", assignee: "Daniel K.",
    summary: "Tracking shows delivered but buyer never received. Carrier POD signature does not match buyer's name. Possible porch theft or misdelivery.",
    evidence: [
      { id: "EV-30", side: "carrier", kind: "tracking", title: "POD signature: 'O. SAMUEL'", at: "Jun 17, 14:30", by: "MagnetExpress" },
      { id: "EV-31", side: "buyer", kind: "doc", title: "ID + signature comparison", at: "Jun 18, 10:00", by: "Samuel Okonkwo" },
      { id: "EV-32", side: "admin", kind: "message", title: "Escalated to carrier investigation", at: "Jun 20, 15:00", by: "Daniel K." },
    ],
  },
  {
    id: "DSP-44006", orderId: "ORD-528104", escrowId: "ESC-77120", listingId: "LST-3201",
    amountNGN: 1618000, buyer: "Adaeze Okafor", buyerId: "USR-10241", buyerCountry: "NG",
    seller: "Shenzhen TopMax", sellerId: "SLR-2041",
    reason: "quality", status: "ruling_pending", priority: "high",
    openedAt: "Jun 27, 15:42", openedBy: "buyer", ageHours: 18, slaHours: 96,
    lastActivity: "44 min ago", assignee: "Funmi A.",
    summary: "Buyer claims 12 of 80 chargers fail QC ΓÇö output voltage unstable. Seller offered 20% partial refund; buyer wants full replacement.",
    evidence: [
      { id: "EV-40", side: "buyer", kind: "video", title: "Voltage test on 12 units (2min)", at: "Jun 27, 15:48", by: "Adaeze Okafor" },
      { id: "EV-41", side: "buyer", kind: "photo", title: "Multimeter readings", at: "Jun 27, 15:50", by: "Adaeze Okafor" },
      { id: "EV-42", side: "seller", kind: "message", title: "Offer: 20% refund + free replacements next order", at: "Jun 28, 02:14", by: "Shenzhen TopMax" },
      { id: "EV-43", side: "admin", kind: "doc", title: "QC sample test by 3rd party", at: "Jun 28, 09:30", by: "MagnetPay QC" },
    ],
  },
  {
    id: "DSP-44002", orderId: "ORD-527990", escrowId: "ESC-77011", listingId: "LST-3208",
    amountNGN: 603400, buyer: "Ibrahim Yusuf", buyerId: "USR-09221", buyerCountry: "NG",
    seller: "Foshan IronCraft", sellerId: "SLR-2640",
    reason: "wrong_item", status: "resolved_seller", priority: "low",
    openedAt: "Jun 21, 11:00", openedBy: "buyer", ageHours: 168, slaHours: 96,
    lastActivity: "4 days ago", assignee: "Daniel K.",
    summary: "Buyer claimed wrong language variant ΓÇö investigation showed buyer ordered the variant they received.",
    evidence: [
      { id: "EV-50", side: "buyer", kind: "photo", title: "Received item", at: "Jun 21, 11:04", by: "Ibrahim Yusuf" },
      { id: "EV-51", side: "admin", kind: "doc", title: "Order config snapshot at checkout", at: "Jun 22, 09:00", by: "Daniel K." },
    ],
    ruling: { decision: "Ruled in favor of seller ΓÇö order matched buyer's selected variant", amountToBuyer: 0, amountToSeller: 603400, ruledAt: "Jun 24, 14:00", ruledBy: "Daniel K.", rationale: "Order configuration log clearly shows buyer selected the English variant they received. No seller error." },
  },
  {
    id: "DSP-44031", orderId: "ORD-528041", escrowId: "ESC-77055", listingId: "LST-3206",
    amountNGN: 764800, buyer: "Femi Adeyemi", buyerId: "USR-09584", buyerCountry: "NG",
    seller: "Xiamen LiteBox", sellerId: "SLR-2204",
    reason: "late", status: "new", priority: "low",
    openedAt: "Jun 28, 06:00", openedBy: "buyer", ageHours: 4, slaHours: 96,
    lastActivity: "2 hr ago",
    summary: "Buyer reports shipment is 6 days past promised ETA. Carrier scans show transfer delay at Guangzhou hub.",
    evidence: [
      { id: "EV-60", side: "buyer", kind: "tracking", title: "Tracking screenshot", at: "Jun 28, 06:02", by: "Femi Adeyemi" },
    ],
  },
  {
    id: "DSP-44028", orderId: "ORD-528022", escrowId: "ESC-77036", listingId: "LST-3207",
    amountNGN: 715000, buyer: "Mary Wanjiru", buyerId: "USR-09410", buyerCountry: "KE",
    seller: "Dongguan SunBead", sellerId: "SLR-2418",
    reason: "counterfeit", status: "awaiting_buyer", priority: "high",
    openedAt: "Jun 26, 13:00", openedBy: "buyer", ageHours: 50, slaHours: 96,
    lastActivity: "8 hr ago", assignee: "Funmi A.",
    summary: "Buyer claims hair extensions are synthetic, not human hair as listed. Awaiting independent lab test photos from buyer.",
    evidence: [
      { id: "EV-70", side: "buyer", kind: "photo", title: "Burn test photo", at: "Jun 26, 13:14", by: "Mary Wanjiru" },
      { id: "EV-71", side: "admin", kind: "message", title: "Requested lab certificate", at: "Jun 27, 10:00", by: "Funmi A." },
    ],
  },
  {
    id: "DSP-44035", orderId: "ORD-527918", escrowId: "ESC-76940", listingId: "LST-3204",
    amountNGN: 585000, buyer: "Joy Mensah", buyerId: "USR-08741", buyerCountry: "GH",
    seller: "Yiwu PowerLine", sellerId: "SLR-3092",
    reason: "chargeback", status: "new", priority: "critical",
    openedAt: "Jun 28, 04:30", openedBy: "buyer", ageHours: 5, slaHours: 48,
    lastActivity: "30 min ago",
    summary: "Card issuer initiated chargeback (reason: 'product not received') ΓÇö buyer says they actually received and are disputing fraud on the card.",
    evidence: [
      { id: "EV-80", side: "buyer", kind: "doc", title: "Card statement showing disputed txn", at: "Jun 28, 04:32", by: "Joy Mensah" },
    ],
  },
];

export function findDispute(id: string | undefined) {
  if (!id) return DISPUTES[0];
  return DISPUTES.find((d) => d.id === id || d.id.endsWith(id)) ?? DISPUTES[0];
}

export const DSP_STATUS_META: Record<DisputeStatus, { c: string; label: string }> = {
  new:              { c: T.danger,  label: "New" },
  investigating:    { c: T.info,    label: "Investigating" },
  awaiting_buyer:   { c: T.warn,    label: "Awaiting buyer" },
  awaiting_seller:  { c: T.warn,    label: "Awaiting seller" },
  ruling_pending:   { c: "#7C3AED", label: "Ruling pending" },
  resolved_buyer:   { c: T.success, label: "Resolved ┬╖ buyer" },
  resolved_seller:  { c: T.success, label: "Resolved ┬╖ seller" },
  split:            { c: T.accent,  label: "Split decision" },
  escalated:        { c: T.danger,  label: "Escalated" },
};

export function statusPillDispute(s: DisputeStatus) {
  const m = DSP_STATUS_META[s];
  return (
    <span className="inline-flex items-center gap-1 px-2 h-5 rounded-md text-[10.5px] font-bold uppercase tracking-wider" style={{ background: `${m.c}14`, color: m.c }}>
      <span className="size-1.5 rounded-full" style={{ background: m.c }} /> {m.label}
    </span>
  );
}

export function reasonLabel(r: DisputeReason) { return REASON_LABEL[r]; }

export function priorityPill(p: Dispute["priority"]) {
  const c = p === "critical" ? T.danger : p === "high" ? T.warn : p === "normal" ? T.info : T.muted;
  return (
    <span className="inline-flex items-center px-1.5 h-4 rounded text-[9.5px] font-bold uppercase tracking-wider" style={{ background: `${c}14`, color: c }}>{p}</span>
  );
}

export function slaBar({ age, sla }: { age: number; sla: number }) {
  const pct = Math.min(100, Math.round((age / sla) * 100));
  const over = age >= sla;
  const c = over ? T.danger : pct >= 75 ? T.warn : pct >= 40 ? T.info : T.success;
  return (
    <div className="min-w-[100px]">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
        <div className="h-full" style={{ width: `${pct}%`, background: c }} />
      </div>
      <p className="mt-1 text-[10.5px] tabular-nums" style={{ color: c, fontFamily: "'JetBrains Mono', monospace" }}>
        {over ? `+${age - sla}h over` : `${age}h / ${sla}h`}
      </p>
    </div>
  );
}

export function DisputeTable({ rows }: { rows: Dispute[] }) {
  const pager = useTablePage(rows);
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
              <th className="px-2 py-2.5 pl-4">Dispute</th>
              <th className="px-2 py-2.5">Reason</th>
              <th className="px-2 py-2.5">Parties</th>
              <th className="px-2 py-2.5 text-right">At stake</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">SLA</th>
              <th className="px-2 py-2.5">Assignee</th>
              <th className="px-2 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {pager.slice.map((d) => (
              <tr key={d.id} className="border-t hover:bg-black/[0.015] transition" style={{ borderColor: T.border }}>
                <td className="px-2 py-3 pl-4">
                  <div className="flex items-center gap-1.5">
                    <Link to="/admin/disputes/$id" params={{ id: d.id }} className="font-bold tabular-nums hover:underline" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>{d.id.slice(0, 8).toUpperCase()}</Link>
                    {priorityPill(d.priority)}
                  </div>
                  <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{d.orderId} · {d.openedAt}</p>
                </td>
                <td className="px-2 py-3">
                  <p className="font-medium">{REASON_LABEL[d.reason]}</p>
                  <p className="text-[10.5px]" style={{ color: T.muted }}>opened by {d.openedBy}</p>
                </td>
                <td className="px-2 py-3">
                  <p className="font-medium text-[11.5px] flex items-center gap-1"><FlagEmoji c={d.buyerCountry} /> {d.buyer}</p>
                  <p className="text-[10.5px] truncate max-w-[160px]" style={{ color: T.muted }}>vs {d.seller}</p>
                </td>
                <td className="px-2 py-3 text-right">
                  <p className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtNGN(d.amountNGN)}</p>
                  <Link to="/admin/escrow/$id" params={{ id: d.escrowId }} className="text-[10.5px] tabular-nums hover:underline" style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}>{d.escrowId.slice(0, 12).toUpperCase()}</Link>
                </td>
                <td className="px-2 py-3">{statusPillDispute(d.status)}</td>
                <td className="px-2 py-3">{slaBar({ age: d.ageHours, sla: d.slaHours })}</td>
                <td className="px-2 py-3 text-[11.5px]">{d.assignee ?? <span style={{ color: T.muted }}>Unassigned</span>}</td>
                <td className="px-2 py-3">
                  <Link to="/admin/disputes/$id" params={{ id: d.id }} className="size-7 grid place-items-center rounded-md hover:bg-black/5">
                    <MoreHorizontal className="size-4" style={{ color: T.muted }} />
                  </Link>
                </td>
              </tr>
            ))}
            {!pager.total && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[12px]" style={{ color: T.muted }}>No disputes match these filters.</td></tr>
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

export function disputesStats() {
  const open = DISPUTES.filter((d) => !d.status.startsWith("resolved"));
  const atStake = open.reduce((s, d) => s + d.amountNGN, 0);
  const overSLA = open.filter((d) => d.ageHours >= d.slaHours).length;
  const critical = open.filter((d) => d.priority === "critical").length;
  return { open: open.length, atStake, overSLA, critical, total: DISPUTES.length };
}

export function evidenceKindIcon(k: DisputeEvidence["kind"]): ReactNode {
  const map = { photo: "≡ƒô╖", doc: "≡ƒôä", video: "≡ƒÄ¼", message: "≡ƒÆ¼", tracking: "≡ƒôª" };
  return <span className="text-[14px] leading-none">{map[k]}</span>;
}

export function AdminShellRe(props: Parameters<typeof AdminShell>[0]) { return <AdminShell {...props} />; }
