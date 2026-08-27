import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader, getAdminUser, Pill } from "@/components/admin/UserProfile";

export const Route = createFileRoute("/admin/users/$id/tickets")({
  head: () => ({ meta: [{ title: "User tickets — MagnetPay Admin" }] }),
  component: UserTickets,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function UserTickets() {
  const { id } = Route.useParams();
  const u = getAdminUser(id);

  const tickets: { id: string; subject: string; queue: string; opened: string; agent: string; status: string; tone: Tone; lastReply: string }[] = [
    { id: "TK-9921", subject: "Refund request — order O-30180",   queue: "Refunds",  opened: "10 Jun",  agent: "ops.kemi",      status: "Open",      tone: "warn",    lastReply: "4h ago" },
    { id: "TK-9874", subject: "Cannot withdraw to Zenith Bank",   queue: "Wallets",  opened: "05 Jun",  agent: "ops.chidi",     status: "Pending",   tone: "info",    lastReply: "2d ago" },
    { id: "TK-9712", subject: "KYC document re-upload needed",    queue: "KYC",      opened: "28 May",  agent: "ops.lin",       status: "Resolved",  tone: "success", lastReply: "5d ago" },
    { id: "TK-9544", subject: "Shipment stuck in customs",        queue: "Logistics",opened: "20 May",  agent: "ops.fatima",    status: "Resolved",  tone: "success", lastReply: "2w ago" },
    { id: "TK-9410", subject: "FX rate discrepancy on receipt",   queue: "FX",       opened: "12 May",  agent: "ops.kemi",      status: "Closed",    tone: "neutral", lastReply: "3w ago" },
  ];

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: u.name, to: `/admin/users/${u.id}` },
        { label: "Tickets" },
      ]}
    >
      <UserHeader user={u} />

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { I: MessageSquare, label: "All tickets",  val: tickets.length.toString(), tone: T.info },
          { I: Clock,         label: "Open",         val: tickets.filter(t => t.status === "Open").length.toString(), tone: T.warn },
          { I: CheckCircle2,  label: "Resolved",     val: tickets.filter(t => t.status === "Resolved").length.toString(), tone: T.success },
          { I: Clock,         label: "Avg first reply", val: "1h 12m", tone: T.navy },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md grid place-items-center" style={{ background: `${s.tone}14`, color: s.tone }}>
                <s.I className="size-3.5" strokeWidth={2.4} />
              </div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{s.label}</p>
            </div>
            <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1fr 2.4fr 0.9fr 0.9fr 1fr 1fr 1fr" }}>
          <span>Ticket</span><span>Subject</span><span>Queue</span><span>Opened</span><span>Agent</span><span>Status</span><span>Last reply</span>
        </div>
        {tickets.map((t, i) => (
          <div key={t.id} className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)]"
            style={{ gridTemplateColumns: "1fr 2.4fr 0.9fr 0.9fr 1fr 1fr 1fr", borderBottom: i < tickets.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <Link to="/admin/tickets/$id" params={{ id: t.id }} className="font-semibold tabular-nums" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
              {t.id}
            </Link>
            <span className="truncate" style={{ color: T.ink }}>{t.subject}</span>
            <span style={{ color: T.sub }}>{t.queue}</span>
            <span className="tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{t.opened}</span>
            <span style={{ color: T.sub }}>{t.agent}</span>
            <span><Pill tone={t.tone}>{t.status}</Pill></span>
            <span className="tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{t.lastReply}</span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
