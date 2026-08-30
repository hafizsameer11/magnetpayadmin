import { Link } from "@tanstack/react-router";
import { MessageSquare, Mail, Phone, Megaphone, Bell, Shield, Tag, ChevronRight } from "lucide-react";
import { ActionMenu, TableActionTd, TableActionTh } from "@/components/admin/ActionMenu";
import type { ReactNode } from "react";
import { T } from "@/components/admin/AdminShell";
import { StatusBadge, StatusBadgeCustom, formatStatusLabel } from "@/components/admin/StatusBadge";
import { Card, fmtNGN, FlagEmoji, KPI, FilterBar, FilterChip } from "@/components/admin/Orders";
import { TablePagerFooter, useTablePage } from "@/components/admin/TablePager";

export { Card, fmtNGN, FlagEmoji, KPI, FilterBar, FilterChip };

/* ===== Tickets ===== */
export type TicketStatus = "new" | "open" | "pending" | "on_hold" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketChannel = "email" | "chat" | "whatsapp" | "phone" | "in_app";

export type TicketMessage = {
  id: string;
  by: "customer" | "agent" | "system";
  author: string;
  at: string;
  body: string;
  attachments?: { name: string; kind: "image" | "doc" }[];
  internal?: boolean;
};

export type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  queue: string;
  assignee?: string;
  customer: string;
  customerId: string;
  customerCountry: "NG" | "GH" | "KE";
  orderId?: string;
  openedAt: string;
  lastReply: string;
  ageHours: number;
  slaHours: number;
  tags: string[];
  unread: number;
  messages: TicketMessage[];
  csat?: 1 | 2 | 3 | 4 | 5;
};

export const TICKETS: Ticket[] = [
  {
    id: "TCK-58210", subject: "Refund still not in my wallet 4 days later", status: "open", priority: "urgent",
    channel: "email", queue: "Payments", assignee: "Funmi A.",
    customer: "Adaeze Okafor", customerId: "USR-10241", customerCountry: "NG", orderId: "ORD-528104",
    openedAt: "Jun 24, 10:14", lastReply: "12 min ago", ageHours: 92, slaHours: 24, tags: ["refund", "wallet", "vip"], unread: 2,
    messages: [
      { id: "m1", by: "customer", author: "Adaeze Okafor", at: "Jun 24, 10:14", body: "I cancelled order ORD-528104 four days ago and was told the Γéª1.6m would be back in my wallet within 24h. It's still not there. Please escalate." },
      { id: "m2", by: "agent", author: "Funmi A.", at: "Jun 24, 11:02", body: "Hi Adaeze ΓÇö I can see the cancellation, looking into the wallet reversal now. I'll come back within the hour." },
      { id: "m3", by: "system", author: "MagnetPay", at: "Jun 25, 09:00", body: "Auto-escalated to Payments L2 ΓÇö SLA breached." },
      { id: "m4", by: "agent", author: "Funmi A.", at: "Jun 28, 09:14", body: "Update from Payments: PSP confirmed reversal queued today. Should land in wallet within 2h. Apologies for the delay.", internal: false },
    ],
  },
  {
    id: "TCK-58205", subject: "Seller hasn't shipped after 6 days", status: "pending", priority: "high",
    channel: "chat", queue: "Marketplace", assignee: "Daniel K.",
    customer: "Tolu Bankole", customerId: "USR-10182", customerCountry: "NG", orderId: "ORD-528098",
    openedAt: "Jun 26, 14:02", lastReply: "1 hr ago", ageHours: 44, slaHours: 48, tags: ["shipping"], unread: 0,
    messages: [
      { id: "m1", by: "customer", author: "Tolu Bankole", at: "Jun 26, 14:02", body: "Order ORD-528098 was supposed to ship within 48h. It's been 6 days." },
      { id: "m2", by: "agent", author: "Daniel K.", at: "Jun 26, 14:30", body: "Reaching out to the seller now." },
      { id: "m3", by: "agent", author: "Daniel K.", at: "Jun 27, 09:00", body: "Internal: Seller cited customs paperwork delay. Asked for ETA by EOD.", internal: true },
    ],
  },
  {
    id: "TCK-58199", subject: "How do I increase my withdrawal limit?", status: "new", priority: "normal",
    channel: "in_app", queue: "Compliance", customer: "Joy Mensah", customerId: "USR-08741", customerCountry: "GH",
    openedAt: "Jun 28, 06:30", lastReply: "2 hr ago", ageHours: 4, slaHours: 24, tags: ["kyc", "limits"], unread: 1,
    messages: [
      { id: "m1", by: "customer", author: "Joy Mensah", at: "Jun 28, 06:30", body: "I'm at tier 2 ΓÇö how do I unlock tier 3?" },
    ],
  },
  {
    id: "TCK-58188", subject: "Chargeback received ΓÇö what do I do?", status: "open", priority: "urgent",
    channel: "email", queue: "Payments", assignee: "Funmi A.",
    customer: "Qingdao GoldStrand", customerId: "SLR-2810", customerCountry: "NG",
    openedAt: "Jun 27, 22:10", lastReply: "30 min ago", ageHours: 12, slaHours: 24, tags: ["chargeback", "seller"], unread: 1,
    messages: [
      { id: "m1", by: "customer", author: "Qingdao GoldStrand", at: "Jun 27, 22:10", body: "We just got a chargeback notice on ORD-527918. What evidence do you need from us?" },
      { id: "m2", by: "agent", author: "Funmi A.", at: "Jun 28, 02:14", body: "Sending you the evidence pack template ΓÇö please attach POD + customer comms + product photos." },
    ],
  },
  {
    id: "TCK-58170", subject: "Cookware arrived broken ΓÇö handled by dispute team", status: "resolved", priority: "normal",
    channel: "chat", queue: "Disputes", assignee: "Daniel K.",
    customer: "Chiamaka Obi", customerId: "USR-09080", customerCountry: "NG", orderId: "ORD-527964",
    openedAt: "Jun 18, 14:02", lastReply: "2 days ago", ageHours: 240, slaHours: 96, tags: ["damaged", "dispute"], unread: 0, csat: 5,
    messages: [
      { id: "m1", by: "customer", author: "Chiamaka Obi", at: "Jun 18, 14:02", body: "Cookware broke. Photos attached.", attachments: [{ name: "broken-1.jpg", kind: "image" }, { name: "broken-2.jpg", kind: "image" }] },
      { id: "m2", by: "agent", author: "Daniel K.", at: "Jun 18, 14:30", body: "Opening dispute DSP-44018." },
      { id: "m3", by: "system", author: "MagnetPay", at: "Jun 26, 11:00", body: "Dispute resolved ΓÇö full refund issued." },
    ],
  },
  {
    id: "TCK-58145", subject: "Can't log in ΓÇö keeps asking for OTP", status: "closed", priority: "low",
    channel: "whatsapp", queue: "Account", assignee: "Sade M.",
    customer: "Femi Adeyemi", customerId: "USR-09584", customerCountry: "NG",
    openedAt: "Jun 15, 18:00", lastReply: "1 wk ago", ageHours: 312, slaHours: 24, tags: ["auth", "otp"], unread: 0, csat: 4,
    messages: [
      { id: "m1", by: "customer", author: "Femi Adeyemi", at: "Jun 15, 18:00", body: "OTP loop." },
      { id: "m2", by: "agent", author: "Sade M.", at: "Jun 15, 18:20", body: "Reset MFA ΓÇö should be working now." },
    ],
  },
  {
    id: "TCK-58133", subject: "Payout batch failed ΓÇö funds returned", status: "on_hold", priority: "high",
    channel: "email", queue: "Payments", assignee: "Funmi A.",
    customer: "Xiamen LiteBox", customerId: "SLR-2204", customerCountry: "NG",
    openedAt: "Jun 27, 13:00", lastReply: "5 hr ago", ageHours: 22, slaHours: 48, tags: ["payout", "psp"], unread: 0,
    messages: [
      { id: "m1", by: "customer", author: "Xiamen LiteBox", at: "Jun 27, 13:00", body: "Our weekly payout bounced back ΓÇö bank says account doesn't exist but it hasn't changed." },
    ],
  },
  {
    id: "TCK-58128", subject: "Want to add a Kenyan corridor for my store", status: "new", priority: "low",
    channel: "in_app", queue: "Marketplace", customer: "Hangzhou WokWise", customerId: "SLR-1402", customerCountry: "KE",
    openedAt: "Jun 28, 08:15", lastReply: "1 hr ago", ageHours: 2, slaHours: 72, tags: ["seller", "expansion"], unread: 1,
    messages: [
      { id: "m1", by: "customer", author: "Hangzhou WokWise", at: "Jun 28, 08:15", body: "We want to enable CNYΓåÆKES, what does it take?" },
    ],
  },
];

export function findTicket(id: string | undefined) {
  if (!id) return TICKETS[0];
  return TICKETS.find((t) => t.id === id || t.id.endsWith(id)) ?? TICKETS[0];
}

export const TCK_STATUS_META: Record<TicketStatus, { c: string; label: string }> = {
  new:      { c: T.danger,  label: "New" },
  open:     { c: T.info,    label: "Open" },
  pending:  { c: T.warn,    label: "Pending customer" },
  on_hold:  { c: "#7C3AED", label: "On hold" },
  resolved: { c: T.success, label: "Resolved" },
  closed:   { c: T.muted,   label: "Closed" },
};

export function statusPillTicket(s: TicketStatus) {
  const m = TCK_STATUS_META[s];
  return <StatusBadgeCustom color={m.c} label={m.label} />;
}

export function priorityDot(p: TicketPriority) {
  const tone = p === "urgent" ? "danger" : p === "high" ? "warn" : p === "normal" ? "info" : "neutral";
  return <StatusBadge tone={tone as "danger" | "warn" | "info" | "neutral"} dot={false}>{formatStatusLabel(p)}</StatusBadge>;
}

export function channelIcon(c: TicketChannel) {
  const I = c === "email" ? Mail : c === "chat" ? MessageSquare : c === "phone" ? Phone : c === "whatsapp" ? MessageSquare : Bell;
  return <I className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />;
}

export function slaBarTck({ age, sla }: { age: number; sla: number }) {
  const pct = Math.min(100, Math.round((age / sla) * 100));
  const over = age >= sla;
  const c = over ? T.danger : pct >= 75 ? T.warn : pct >= 40 ? T.info : T.success;
  return (
    <div className="min-w-[90px]">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
        <div className="h-full" style={{ width: `${pct}%`, background: c }} />
      </div>
      <p className="mt-1 text-[10.5px] tabular-nums" style={{ color: c, fontFamily: "'JetBrains Mono', monospace" }}>
        {over ? `+${age - sla}h over` : `${age}h / ${sla}h`}
      </p>
    </div>
  );
}

export function ticketStats() {
  const open = TICKETS.filter((t) => t.status !== "resolved" && t.status !== "closed");
  const overdue = open.filter((t) => t.ageHours >= t.slaHours).length;
  const urgent = open.filter((t) => t.priority === "urgent").length;
  const unassigned = open.filter((t) => !t.assignee).length;
  return { open: open.length, overdue, urgent, unassigned, total: TICKETS.length };
}

export function TicketTable({ rows }: { rows: Ticket[] }) {
  const pager = useTablePage(rows);
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
              <th className="px-2 py-2.5 pl-4">Ticket</th>
              <th className="px-2 py-2.5">Customer</th>
              <th className="px-2 py-2.5">Queue</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">Priority</th>
              <th className="px-2 py-2.5">SLA</th>
              <th className="px-2 py-2.5">Assignee</th>
              <TableActionTh />
            </tr>
          </thead>
          <tbody>
            {pager.slice.map((t) => (
              <tr key={t.id} className="border-t hover:bg-black/[0.015] transition" style={{ borderColor: T.border }}>
                <td className="px-2 py-3 pl-4">
                  <div className="flex items-center gap-1.5">
                    {channelIcon(t.channel)}
                    <Link to="/admin/tickets/$id" params={{ id: t.id }} className="font-bold tabular-nums hover:underline" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>{t.id}</Link>
                    {t.unread > 0 && <span className="px-1.5 h-4 rounded-full text-[9.5px] font-bold text-white grid place-items-center" style={{ background: T.danger }}>{t.unread}</span>}
                  </div>
                  <p className="text-[11.5px] mt-0.5 truncate max-w-[320px]" style={{ color: T.ink }}>{t.subject}</p>
                  <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{t.openedAt} ┬╖ last {t.lastReply}</p>
                </td>
                <td className="px-2 py-3">
                  <p className="font-medium text-[11.5px] flex items-center gap-1"><FlagEmoji c={t.customerCountry} /> {t.customer}</p>
                  {t.orderId && <Link to="/admin/orders/$id" params={{ id: t.orderId }} className="text-[10.5px] tabular-nums hover:underline" style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}>{t.orderId}</Link>}
                </td>
                <td className="px-2 py-3 text-[11.5px]">{t.queue}</td>
                <td className="px-2 py-3">{statusPillTicket(t.status)}</td>
                <td className="px-2 py-3">{priorityDot(t.priority)}</td>
                <td className="px-2 py-3">{slaBarTck({ age: t.ageHours, sla: t.slaHours })}</td>
                <td className="px-2 py-3 text-[11.5px]">{t.assignee ?? <span style={{ color: T.muted }}>Unassigned</span>}</td>
                <TableActionTd>
                  <ActionMenu
                    label={`Actions for ticket ${t.id}`}
                    items={[
                      {
                        id: "view",
                        label: "View ticket",
                        onClick: () => {
                          window.location.href = `/admin/tickets/${t.id}`;
                        },
                      },
                      ...(t.orderId
                        ? [
                            {
                              id: "order",
                              label: "View order",
                              onClick: () => {
                                window.location.href = `/admin/orders/${t.orderId}`;
                              },
                            },
                          ]
                        : []),
                    ]}
                  />
                </TableActionTd>
              </tr>
            ))}
            {!pager.total && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[12px]" style={{ color: T.muted }}>No tickets match these filters.</td></tr>
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

/* ===== Queues ===== */
export type Queue = {
  id: string;
  name: string;
  desc: string;
  members: { name: string; role: string }[];
  rules: { cond: string; action: string }[];
  open: number;
  sla: number;
  csat: number;
};

export const QUEUES: Queue[] = [
  { id: "Q-PAY", name: "Payments", desc: "Wallets, payouts, refunds, chargebacks.", sla: 24, open: 142, csat: 4.4,
    members: [{ name: "Funmi A.", role: "Lead" }, { name: "Daniel K.", role: "Agent" }, { name: "Sade M.", role: "Agent" }],
    rules: [
      { cond: "tag = refund OR subject contains 'wallet'", action: "Route to Payments ┬╖ priority urgent" },
      { cond: "tag = chargeback", action: "Route to Payments L2 ┬╖ assign Funmi A." },
    ] },
  { id: "Q-MKT", name: "Marketplace", desc: "Listings, shipping, seller operations.", sla: 48, open: 88, csat: 4.2,
    members: [{ name: "Daniel K.", role: "Lead" }, { name: "Aisha B.", role: "Agent" }],
    rules: [{ cond: "tag = shipping AND age > 24h", action: "Escalate to Logistics lead" }] },
  { id: "Q-DSP", name: "Disputes", desc: "Buyer/seller conflict resolution.", sla: 96, open: 34, csat: 4.5,
    members: [{ name: "Daniel K.", role: "Lead" }, { name: "Funmi A.", role: "Agent" }],
    rules: [{ cond: "dispute opened", action: "Auto-create ticket ┬╖ assign to dispute owner" }] },
  { id: "Q-CMP", name: "Compliance", desc: "KYC/KYB, limits, sanctions.", sla: 24, open: 56, csat: 4.6,
    members: [{ name: "Sade M.", role: "Lead" }],
    rules: [{ cond: "tag = kyc OR tag = limits", action: "Route to Compliance ┬╖ SLA 24h" }] },
  { id: "Q-ACC", name: "Account", desc: "Login, OTP, profile, security.", sla: 12, open: 41, csat: 4.7,
    members: [{ name: "Sade M.", role: "Lead" }, { name: "Aisha B.", role: "Agent" }],
    rules: [{ cond: "tag = auth OR subject contains 'login'", action: "Route to Account ┬╖ priority high" }] },
];

/* ===== Macros ===== */
export type Macro = {
  id: string;
  name: string;
  shortcut: string;
  scope: "Payments" | "Marketplace" | "Disputes" | "Compliance" | "Account" | "General";
  body: string;
  usage: number;
  lastUsed: string;
};

export const MACROS: Macro[] = [
  { id: "MAC-001", name: "Refund queued ΓÇö wallet", shortcut: "/refund-wallet", scope: "Payments", usage: 412, lastUsed: "12 min ago",
    body: "Hi {{customer_name}},\n\nGood news ΓÇö your refund of {{amount}} for order {{order_id}} has been queued and should land in your MagnetPay wallet within 2 hours.\n\nWe'll send you a confirmation as soon as it settles.\n\nApologies for the delay.\n\nΓÇö MagnetPay Support" },
  { id: "MAC-002", name: "KYC tier 3 requirements", shortcut: "/kyc-t3", scope: "Compliance", usage: 207, lastUsed: "1 hr ago",
    body: "To unlock Tier 3 limits ({{tier3_limits}}), please submit:\n\n1. Proof of address (utility bill < 3 months)\n2. Bank statement (last 3 months)\n3. Source of funds declaration\n\nUpload from your profile ΓåÆ KYC settings. Reviews take 24-48h." },
  { id: "MAC-003", name: "Seller shipping reminder", shortcut: "/seller-ship", scope: "Marketplace", usage: 189, lastUsed: "3 hr ago",
    body: "Hi {{seller_name}},\n\nThe buyer on {{order_id}} is asking about their shipment. Please update tracking within 24h or escalate to your account manager.\n\nThanks." },
  { id: "MAC-004", name: "Chargeback evidence pack", shortcut: "/cb-evidence", scope: "Payments", usage: 84, lastUsed: "30 min ago",
    body: "For chargeback {{cb_id}}, please attach:\nΓÇó Proof of delivery (carrier POD)\nΓÇó Customer comms transcript\nΓÇó Product photos / specs\nΓÇó Refund policy acknowledgement\n\nDeadline: {{cb_deadline}}." },
  { id: "MAC-005", name: "Account unlock ΓÇö OTP reset", shortcut: "/otp-reset", scope: "Account", usage: 318, lastUsed: "44 min ago",
    body: "Your MFA has been reset. Please log in and re-enrol your authenticator app. If you continue to see OTP issues, reply here." },
  { id: "MAC-006", name: "Dispute opened ΓÇö buyer", shortcut: "/dsp-buyer", scope: "Disputes", usage: 142, lastUsed: "2 hr ago",
    body: "We've opened dispute {{dispute_id}} on your behalf. The seller has 48h to respond. You'll be notified at each step." },
];

/* ===== Chats (marketplace) ===== */
export type ChatThread = {
  id: string;
  buyer: string;
  buyerId: string;
  buyerCountry: "NG" | "GH" | "KE";
  seller: string;
  sellerId: string;
  listingId: string;
  lastMessage: string;
  lastAt: string;
  msgCount: number;
  unreadFlags: number;
  state: "active" | "frozen" | "flagged" | "closed";
  riskScore: number;
  riskReasons: string[];
  messages: { id: string; by: "buyer" | "seller"; at: string; body: string; flagged?: string }[];
};

export const CHATS: ChatThread[] = [
  {
    id: "CHT-3210", buyer: "Adaeze Okafor", buyerId: "USR-10241", buyerCountry: "NG",
    seller: "Shenzhen TopMax", sellerId: "SLR-2041", listingId: "LST-3201",
    lastMessage: "Send me your bank details directly and I'll pay 20% off.", lastAt: "14 min ago",
    msgCount: 28, unreadFlags: 2, state: "flagged", riskScore: 92, riskReasons: ["off-platform payment", "external phone"],
    messages: [
      { id: "c1", by: "buyer", at: "Jun 27, 15:00", body: "Hi, do you have 80 in stock?" },
      { id: "c2", by: "seller", at: "Jun 27, 15:04", body: "Yes, 200 available." },
      { id: "c3", by: "seller", at: "Jun 28, 08:20", body: "Send me your bank details directly and I'll pay 20% off.", flagged: "Off-platform payment attempt" },
      { id: "c4", by: "seller", at: "Jun 28, 08:21", body: "WhatsApp me +86 138-0000-0000.", flagged: "Contact info shared" },
    ],
  },
  {
    id: "CHT-3208", buyer: "Tolu Bankole", buyerId: "USR-10182", buyerCountry: "NG",
    seller: "Hangzhou WokWise", sellerId: "SLR-1402", listingId: "LST-3203",
    lastMessage: "Tracking is updated ΓÇö please confirm receipt.", lastAt: "1 hr ago",
    msgCount: 14, unreadFlags: 0, state: "active", riskScore: 12, riskReasons: [],
    messages: [
      { id: "c1", by: "buyer", at: "Jun 26, 14:02", body: "Any update on shipping?" },
      { id: "c2", by: "seller", at: "Jun 28, 09:10", body: "Tracking is updated ΓÇö please confirm receipt." },
    ],
  },
  {
    id: "CHT-3204", buyer: "Mary Wanjiru", buyerId: "USR-09410", buyerCountry: "KE",
    seller: "Dongguan SunBead", sellerId: "SLR-2418", listingId: "LST-3207",
    lastMessage: "I will refund only via Western Union.", lastAt: "8 hr ago",
    msgCount: 22, unreadFlags: 3, state: "frozen", riskScore: 87, riskReasons: ["off-platform refund", "fraud pattern"],
    messages: [
      { id: "c1", by: "buyer", at: "Jun 26, 13:00", body: "These are synthetic, I want refund." },
      { id: "c2", by: "seller", at: "Jun 27, 04:30", body: "I will refund only via Western Union.", flagged: "Off-platform refund" },
    ],
  },
  {
    id: "CHT-3199", buyer: "Joy Mensah", buyerId: "USR-08741", buyerCountry: "GH",
    seller: "Yiwu PowerLine", sellerId: "SLR-3092", listingId: "LST-3204",
    lastMessage: "Thanks, received in good condition.", lastAt: "2 days ago",
    msgCount: 9, unreadFlags: 0, state: "closed", riskScore: 4, riskReasons: [],
    messages: [
      { id: "c1", by: "buyer", at: "Jun 25, 10:00", body: "Got it, thanks!" },
    ],
  },
  {
    id: "CHT-3195", buyer: "Femi Adeyemi", buyerId: "USR-09584", buyerCountry: "NG",
    seller: "Xiamen LiteBox", sellerId: "SLR-2204", listingId: "LST-3206",
    lastMessage: "Can you make it 60 units instead of 50?", lastAt: "3 hr ago",
    msgCount: 6, unreadFlags: 0, state: "active", riskScore: 8, riskReasons: [],
    messages: [
      { id: "c1", by: "buyer", at: "Jun 28, 05:30", body: "Can you make it 60 units instead of 50?" },
    ],
  },
];

export function findChat(id: string | undefined) {
  if (!id) return CHATS[0];
  return CHATS.find((c) => c.id === id || c.id.endsWith(id)) ?? CHATS[0];
}

export function chatStatePill(s: ChatThread["state"]) {
  const map = { active: T.success, flagged: T.danger, frozen: T.warn, closed: T.muted };
  return <StatusBadgeCustom color={map[s]} label={formatStatusLabel(s)} />;
}

export function riskPill(score: number) {
  const c = score >= 75 ? T.danger : score >= 40 ? T.warn : T.success;
  return <StatusBadgeCustom color={c} label={String(score)} dot={false} />;
}

/* ===== Announcements ===== */
export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "All users" | "Buyers" | "Sellers" | "Nigeria" | "Ghana" | "Kenya" | "Tier 3+";
  channels: ("in_app" | "email" | "push" | "sms")[];
  status: "draft" | "scheduled" | "sending" | "sent" | "archived";
  scheduledFor?: string;
  sentAt?: string;
  reach: number;
  opens?: number;
  clicks?: number;
  authoredBy: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  { id: "ANN-2041", title: "Scheduled maintenance ΓÇö Jul 02 02:00-03:00 WAT", body: "MagnetPay wallet and payout APIs will be briefly unavailable during the maintenance window. Marketplace browsing remains online.", audience: "All users", channels: ["in_app", "email", "push"], status: "scheduled", scheduledFor: "Jul 02, 01:00", reach: 184201, authoredBy: "Funmi A.", ctaLabel: "Read status page", ctaUrl: "/status" },
  { id: "ANN-2038", title: "New corridor: CNY ΓåÆ KES is now live", body: "Sellers in Kenya can now accept CNY payments directly. Sign up your store to enable.", audience: "Sellers", channels: ["in_app", "email"], status: "sent", sentAt: "Jun 26, 09:00", reach: 12042, opens: 7281, clicks: 1844, authoredBy: "Daniel K.", ctaLabel: "Enable corridor", ctaUrl: "/seller/corridors" },
  { id: "ANN-2035", title: "Verify your account by Jul 15", body: "All buyers must complete Tier 2 KYC by Jul 15 to keep using card payments.", audience: "Buyers", channels: ["in_app", "email", "sms"], status: "sending", reach: 92410, authoredBy: "Sade M.", ctaLabel: "Verify now", ctaUrl: "/kyc" },
  { id: "ANN-2030", title: "FX promo: 0% spread on first Γéª100k", body: "Limited-time CNYΓåÆNGN promo for new wallets.", audience: "Nigeria", channels: ["in_app", "push"], status: "sent", sentAt: "Jun 20, 11:00", reach: 84100, opens: 41922, clicks: 7012, authoredBy: "Funmi A." },
  { id: "ANN-2024", title: "Draft: Q3 roadmap teaser", body: "...", audience: "All users", channels: ["in_app"], status: "draft", reach: 0, authoredBy: "Daniel K." },
];

export function findAnnouncement(id: string | undefined) {
  if (!id) return ANNOUNCEMENTS[0];
  return ANNOUNCEMENTS.find((a) => a.id === id || a.id.endsWith(id)) ?? ANNOUNCEMENTS[0];
}

export function annStatusPill(s: Announcement["status"]) {
  const map: Record<Announcement["status"], string> = { draft: T.muted, scheduled: T.info, sending: T.warn, sent: T.success, archived: T.muted };
  return <StatusBadgeCustom color={map[s]} label={formatStatusLabel(s)} />;
}

/* ===== Templates ===== */
export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  category: "Transactional" | "Auth" | "Marketing" | "Notifications";
  lastEdited: string;
  editor: string;
  active: boolean;
  preheader: string;
  body: string;
  vars: string[];
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: "EM-001", name: "Order confirmed", subject: "Your MagnetPay order {{order_id}} is confirmed", category: "Transactional", lastEdited: "Jun 26", editor: "Funmi A.", active: true,
    preheader: "Thanks for shopping ΓÇö here's what happens next.", vars: ["customer_name", "order_id", "amount", "eta"],
    body: "Hi {{customer_name}},\n\nWe've received your payment for order {{order_id}} ({{amount}}). Your seller has been notified and will ship within 48 hours.\n\nEstimated delivery: {{eta}}.\n\nΓÇö MagnetPay" },
  { id: "EM-002", name: "Order shipped", subject: "Your order {{order_id}} is on the way", category: "Transactional", lastEdited: "Jun 22", editor: "Daniel K.", active: true,
    preheader: "Tracking is now available.", vars: ["customer_name", "order_id", "carrier", "tracking", "eta"],
    body: "Hi {{customer_name}},\n\n{{order_id}} has shipped via {{carrier}}.\nTracking: {{tracking}}\nETA: {{eta}}" },
  { id: "EM-003", name: "Password reset", subject: "Reset your MagnetPay password", category: "Auth", lastEdited: "May 30", editor: "Sade M.", active: true,
    preheader: "Link valid for 60 minutes.", vars: ["customer_name", "reset_url"],
    body: "Hi {{customer_name}},\n\nClick to reset: {{reset_url}}\n\nIf you didn't request this, ignore this email." },
  { id: "EM-004", name: "Refund issued", subject: "Refund of {{amount}} issued", category: "Transactional", lastEdited: "Jun 18", editor: "Funmi A.", active: true,
    preheader: "Funds will appear within 2 hours.", vars: ["customer_name", "amount", "order_id"],
    body: "We've issued a refund of {{amount}} for {{order_id}}." },
  { id: "EM-005", name: "Weekly seller digest", subject: "Your week on MagnetPay", category: "Marketing", lastEdited: "Jun 10", editor: "Daniel K.", active: false,
    preheader: "Sales, payouts and tips.", vars: ["seller_name", "weekly_gmv", "orders"],
    body: "Hi {{seller_name}}, here's your week: {{weekly_gmv}} across {{orders}} orders." },
];

export function findEmailTemplate(id: string | undefined) {
  if (!id) return EMAIL_TEMPLATES[0];
  return EMAIL_TEMPLATES.find((t) => t.id === id || t.id.endsWith(id)) ?? EMAIL_TEMPLATES[0];
}

export type SmsTemplate = {
  id: string;
  name: string;
  category: "Auth" | "Transactional" | "Marketing";
  body: string;
  vars: string[];
  lastEdited: string;
  active: boolean;
  segments: number;
};

export const SMS_TEMPLATES: SmsTemplate[] = [
  { id: "SM-001", name: "OTP login", category: "Auth", body: "MagnetPay: {{code}} is your login code. Expires in 5 min. Never share.", vars: ["code"], lastEdited: "Jun 14", active: true, segments: 1 },
  { id: "SM-002", name: "Order shipped", category: "Transactional", body: "MagnetPay: {{order_id}} shipped via {{carrier}}. Track: {{short_url}}", vars: ["order_id", "carrier", "short_url"], lastEdited: "Jun 20", active: true, segments: 1 },
  { id: "SM-003", name: "Withdrawal initiated", category: "Transactional", body: "MagnetPay: Withdrawal of {{amount}} initiated. ETA {{eta}}. Not you? Reply STOP.", vars: ["amount", "eta"], lastEdited: "Jun 11", active: true, segments: 1 },
  { id: "SM-004", name: "KYC reminder", category: "Marketing", body: "MagnetPay: Verify by Jul 15 to keep using card payments. Tap: {{short_url}}", vars: ["short_url"], lastEdited: "Jun 24", active: true, segments: 1 },
  { id: "SM-005", name: "Chargeback alert", category: "Transactional", body: "MagnetPay: Chargeback received on {{order_id}}. Action needed within 48h.", vars: ["order_id"], lastEdited: "Jun 16", active: false, segments: 1 },
];

/* ===== shared chrome ===== */
export function SectionHead({ title, hint, right }: { title: string; hint?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="text-[14px] font-bold">{title}</h2>
        {hint && <p className="text-[11.5px]" style={{ color: T.muted }}>{hint}</p>}
      </div>
      {right}
    </div>
  );
}

export function PrimaryBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="h-9 px-3.5 rounded-lg text-[12.5px] font-semibold text-white cursor-pointer hover:opacity-90 transition" style={{ background: T.navy }}>
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="h-9 px-3 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-black/[0.03] transition" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}>
      {children}
    </button>
  );
}

export { Megaphone, Shield, Tag, ChevronRight, MessageSquare, Mail, Bell };
