import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Gavel, CheckCircle2, Clock } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader, getAdminUser, Pill } from "@/components/admin/UserProfile";

export const Route = createFileRoute("/admin/users/$id/escrow")({
  head: () => ({ meta: [{ title: "User escrow — MagnetPay Admin" }] }),
  component: UserEscrow,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function UserEscrow() {
  const { id } = Route.useParams();
  const u = getAdminUser(id);

  const contracts: { id: string; counter: string; role: "Buyer" | "Seller"; ms: string; amt: number; status: string; tone: Tone; dueIn: string }[] = [
    { id: "E-90412", counter: "Guangzhou Huayi Co.", role: "Buyer",  ms: "3/4 milestones", amt: 8_420,  status: "Released",  tone: "success", dueIn: "—" },
    { id: "E-90388", counter: "Foshan Ceramics",     role: "Buyer",  ms: "Awaiting QC",     amt: 3_200,  status: "Disputed",  tone: "danger",  dueIn: "Action req." },
    { id: "E-90370", counter: "Shenzhen Lumen",      role: "Buyer",  ms: "2/3 milestones", amt: 12_800, status: "In progress", tone: "info",  dueIn: "5d" },
    { id: "E-90341", counter: "Yiwu Trade Group",    role: "Buyer",  ms: "1/3 milestones", amt: 2_100,  status: "Funded",    tone: "warn",    dueIn: "12d" },
    { id: "E-90312", counter: "Hangzhou Silk Co.",   role: "Buyer",  ms: "Complete",        amt: 6_420,  status: "Released",  tone: "success", dueIn: "—" },
  ];

  const summary = [
    { I: Lock,         label: "Held value",      val: "$15,720", tone: T.navy },
    { I: Clock,        label: "Open",            val: "3",       tone: T.info },
    { I: Gavel,        label: "In dispute",      val: "1",       tone: T.danger },
    { I: CheckCircle2, label: "Released (30d)",  val: "$14,840", tone: T.success },
  ];

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: u.name, to: `/admin/users/${u.id}` },
        { label: "Escrow" },
      ]}
    >
      <UserHeader user={u} />

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {summary.map((s) => (
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
          style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1fr 2fr 0.7fr 1.4fr 1fr 1.2fr 0.8fr" }}>
          <span>Contract</span><span>Counterparty</span><span>Role</span><span>Milestones</span><span className="text-right">Amount</span><span>Status</span><span>Due in</span>
        </div>
        {contracts.map((c, i) => (
          <div key={c.id} className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)]"
            style={{ gridTemplateColumns: "1fr 2fr 0.7fr 1.4fr 1fr 1.2fr 0.8fr", borderBottom: i < contracts.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <Link to="/admin/escrow/$id" params={{ id: c.id }} className="font-semibold tabular-nums" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
              {c.id}
            </Link>
            <span style={{ color: T.ink }}>{c.counter}</span>
            <span><Pill tone="neutral">{c.role}</Pill></span>
            <span style={{ color: T.sub }}>{c.ms}</span>
            <span className="text-right tabular-nums font-bold" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>
              ${c.amt.toLocaleString()}
            </span>
            <span><Pill tone={c.tone}>{c.status}</Pill></span>
            <span className="tabular-nums" style={{ color: c.dueIn === "Action req." ? T.danger : T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{c.dueIn}</span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
