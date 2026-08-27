import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell, AlertTriangle, ShieldCheck, Lock, Gavel, Coins, Truck, Wallet,
  Users, MessageSquare, CheckCircle2, Inbox, Filter, Settings,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MagnetPay Admin" }] }),
  component: AdminNotifications,
});

type Sev = "critical" | "high" | "medium" | "info";
type Cat = "compliance" | "disputes" | "fx" | "logistics" | "wallets" | "users" | "system";

type Notif = {
  id: string;
  sev: Sev;
  cat: Cat;
  I: typeof Users;
  title: string;
  body: string;
  time: string;
  href: string;
  unread: boolean;
};

const CAT_LABEL: Record<Cat, string> = {
  compliance: "Compliance",
  disputes: "Disputes",
  fx: "FX",
  logistics: "Logistics",
  wallets: "Wallets",
  users: "Users",
  system: "System",
};

const SEV_COLOR = (s: Sev) =>
  s === "critical" ? T.danger : s === "high" ? T.accent : s === "medium" ? T.warn : T.info;

const SEED: Notif[] = [
  { id: "N-9912", sev: "critical", cat: "disputes",   I: Gavel,         title: "Dispute D-44218 breached 48h SLA", body: "Buyer Chidi Okoro vs. Foshan Ceramics. Awaiting ruling.", time: "3 min ago",  href: "/admin/disputes/D-44218", unread: true },
  { id: "N-9911", sev: "high",     cat: "compliance", I: AlertTriangle, title: "AML rule R-12 flagged 6 transactions",  body: "All from corridor NGN→CNY in the last hour. Review queue updated.", time: "11 min ago", href: "/admin/aml", unread: true },
  { id: "N-9910", sev: "high",     cat: "fx",         I: Coins,         title: "FX corridor NGN→CNY spread > 1.8%",     body: "Target 1.5%. Provider Flutterwave widening quote.", time: "22 min ago", href: "/admin/fx/spreads", unread: true },
  { id: "N-9909", sev: "medium",   cat: "logistics",  I: Truck,         title: "8 shipments stuck in customs > 72h",    body: "Lagos hub. Broker on it; needs admin nudge to escalate.", time: "47 min ago", href: "/admin/shipments/exceptions", unread: true },
  { id: "N-9908", sev: "medium",   cat: "wallets",    I: Wallet,        title: "Provider 'Flutterwave' balance low",    body: "Settlement balance below $50k threshold. Top up recommended.", time: "1h ago",     href: "/admin/fx/liquidity", unread: true },
  { id: "N-9907", sev: "info",     cat: "users",      I: Users,         title: "12 KYC submissions awaiting > 24h",     body: "Oldest is 38h old. Reassign queue to clear SLA.", time: "2h ago",     href: "/admin/kyc", unread: true },
  { id: "N-9906", sev: "info",     cat: "system",     I: ShieldCheck,   title: "Admin login from new device",            body: "ops.lin@magnetpay.io · Shenzhen · Chrome on macOS.", time: "3h ago",     href: "/admin/audit", unread: false },
  { id: "N-9905", sev: "medium",   cat: "disputes",   I: MessageSquare, title: "Ticket TK-9921 reopened by buyer",      body: "Refund request escalated. SLA clock restarted.", time: "5h ago",     href: "/admin/tickets/TK-9921", unread: false },
  { id: "N-9904", sev: "info",     cat: "system",     I: CheckCircle2,  title: "Nightly reconciliation complete",       body: "PSP statements matched ledger with 0 exceptions.", time: "8h ago",     href: "/admin/reconciliation", unread: false },
  { id: "N-9903", sev: "info",     cat: "fx",         I: Coins,         title: "FX rate auto-refreshed (CNY/NGN)",       body: "1 CNY = ₦229.04. Source: provider aggregate.", time: "9h ago",     href: "/admin/fx/rates", unread: false },
  { id: "N-9902", sev: "high",     cat: "compliance", I: Lock,          title: "Sanctions screening: 1 new hit",        body: "Subject: Hangzhou Silk Co. — fuzzy match (62%).", time: "yesterday",  href: "/admin/sanctions", unread: false },
  { id: "N-9901", sev: "info",     cat: "users",      I: Users,         title: "Seller Foshan Ceramics flagged 'High risk'", body: "Rule engine elevated risk after 3 disputes in 30d.", time: "yesterday", href: "/admin/sellers/SE-441", unread: false },
];

const TABS: { id: "all" | "unread" | Sev; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "unread",   label: "Unread" },
  { id: "critical", label: "Critical" },
  { id: "high",     label: "High" },
  { id: "medium",   label: "Medium" },
  { id: "info",     label: "Info" },
];

function AdminNotifications() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [cat, setCat] = useState<"all" | Cat>("all");
  const [items, setItems] = useState<Notif[]>(SEED);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (cat !== "all" && n.cat !== cat) return false;
      if (tab === "all") return true;
      if (tab === "unread") return n.unread;
      return n.sev === tab;
    });
  }, [items, tab, cat]);

  const unreadCount = items.filter((n) => n.unread).length;

  function markAllRead() {
    setItems((xs) => xs.map((n) => ({ ...n, unread: false })));
  }
  function toggleRead(id: string) {
    setItems((xs) => xs.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  }

  const cats: ("all" | Cat)[] = ["all", "compliance", "disputes", "fx", "logistics", "wallets", "users", "system"];

  return (
    <AdminShell
      title="Notifications"
      description="Platform alerts, system events and queue triggers for admin staff."
      actions={
        <>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold disabled:opacity-50"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            <CheckCircle2 className="size-3.5" strokeWidth={2.4} /> Mark all read
          </button>
          <Link
            to="/admin/settings/general"
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            <Settings className="size-3.5" strokeWidth={2.4} /> Preferences
          </Link>
        </>
      }
    >
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { I: Bell,          label: "Total",    val: items.length,                                       tone: T.navy },
          { I: Inbox,         label: "Unread",   val: unreadCount,                                        tone: T.accent },
          { I: AlertTriangle, label: "Critical", val: items.filter((n) => n.sev === "critical").length,   tone: T.danger },
          { I: Gavel,         label: "Today",    val: items.filter((n) => /min|h ago/.test(n.time)).length, tone: T.info },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3.5"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="size-7 rounded-md grid place-items-center"
                style={{ background: `${s.tone}14`, color: s.tone }}
              >
                <s.I className="size-3.5" strokeWidth={2.4} />
              </div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                {s.label}
              </p>
            </div>
            <p
              className="mt-2 text-[22px] font-bold tabular-nums leading-none"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {s.val}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-5 flex items-center gap-1.5 flex-wrap">
        {TABS.map((t) => {
          const active = tab === t.id;
          const count =
            t.id === "all" ? items.length :
            t.id === "unread" ? unreadCount :
            items.filter((n) => n.sev === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
              style={{
                background: active ? T.navy : T.surface,
                color: active ? "#fff" : T.ink,
                border: `1px solid ${active ? T.navy : T.border}`,
              }}
            >
              {t.label}
              <span
                className="text-[10px] tabular-nums opacity-80"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {count}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <Filter className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as "all" | Cat)}
            className="h-8 px-2.5 pr-7 rounded-lg text-[11.5px] font-semibold outline-none"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : CAT_LABEL[c as Cat]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: T.surface, border: `1px dashed ${T.border}`, color: T.sub }}
          >
            <Inbox className="mx-auto size-7 mb-2" strokeWidth={1.8} style={{ color: T.muted }} />
            <p className="text-[13px] font-semibold" style={{ color: T.ink }}>You're all caught up</p>
            <p className="mt-1 text-[12px]">Nothing matches the current filters.</p>
          </div>
        ) : (
          <ul
            className="rounded-xl overflow-hidden"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            {filtered.map((n, i) => {
              const c = SEV_COLOR(n.sev);
              return (
                <li
                  key={n.id}
                  className="flex items-stretch group"
                  style={{
                    borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                    background: n.unread ? "rgba(194,65,12,0.025)" : "transparent",
                  }}
                >
                  {/* Severity rail */}
                  <span className="w-1 shrink-0" style={{ background: n.unread ? c : "transparent" }} />

                  <Link to={n.href} className="flex-1 flex items-start gap-3 px-4 py-3.5 min-w-0">
                    <div
                      className="size-9 rounded-lg grid place-items-center shrink-0"
                      style={{ background: `${c}14`, color: c }}
                    >
                      <n.I className="size-4" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={"text-[13px] truncate " + (n.unread ? "font-bold" : "font-semibold")}
                          style={{ color: T.ink }}
                        >
                          {n.title}
                        </p>
                        <span
                          className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-[0.12em]"
                          style={{ background: `${c}14`, color: c }}
                        >
                          {n.sev}
                        </span>
                        <span
                          className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-[0.12em]"
                          style={{ background: T.bg, color: T.sub, border: `1px solid ${T.border}` }}
                        >
                          {CAT_LABEL[n.cat]}
                        </span>
                        {n.unread && (
                          <span
                            className="size-1.5 rounded-full"
                            style={{ background: T.accent }}
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="mt-1 text-[12px] truncate" style={{ color: T.sub }}>
                        {n.body}
                      </p>
                      <p
                        className="mt-1 text-[10.5px] tabular-nums"
                        style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {n.id} · {n.time}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => toggleRead(n.id)}
                    className="px-3 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition shrink-0"
                    style={{ color: T.navy }}
                    aria-label={n.unread ? "Mark read" : "Mark unread"}
                  >
                    {n.unread ? "Mark read" : "Mark unread"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
