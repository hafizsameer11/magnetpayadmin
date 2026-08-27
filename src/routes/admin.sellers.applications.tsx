import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Clock, CheckCircle2, X, Search, Building2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";

export const Route = createFileRoute("/admin/sellers/applications")({
  head: () => ({ meta: [{ title: "Seller applications — MagnetPay Admin" }] }),
  component: SellerApplications,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function SellerApplications() {
  const [tab, setTab] = useState<"all" | "submitted" | "review" | "approved" | "rejected">("submitted");
  const [query, setQuery] = useState("");

  const apps: { id: string; biz: string; country: string; category: string; submitted: string; assignee: string; readiness: number; status: string; tone: Tone }[] = [
    { id: "SA-3318", biz: "Adaeze Marketplace Ltd.",     country: "🇳🇬 Nigeria", category: "Home goods",       submitted: "2h ago",     assignee: "ops.kemi",   readiness: 82, status: "Submitted", tone: "warn" },
    { id: "SA-3317", biz: "Shenzhen Aurora Trading",     country: "🇨🇳 China",   category: "Electronics",      submitted: "Yesterday",  assignee: "ops.lin",    readiness: 91, status: "In review", tone: "info" },
    { id: "SA-3316", biz: "Lagos Mama Foods",            country: "🇳🇬 Nigeria", category: "Food & grocery",   submitted: "2 days ago", assignee: "—",          readiness: 64, status: "Submitted", tone: "warn" },
    { id: "SA-3315", biz: "Guangzhou Apex Export",       country: "🇨🇳 China",   category: "Industrial",       submitted: "3 days ago", assignee: "ops.chidi",  readiness: 100,status: "Approved",  tone: "success" },
    { id: "SA-3314", biz: "Suzhou Knockoff Inc.",        country: "🇨🇳 China",   category: "Apparel",          submitted: "5 days ago", assignee: "ops.lin",    readiness: 40, status: "Rejected",  tone: "danger" },
  ];

  const filtered = apps.filter((a) => {
    if (tab !== "all") {
      if (tab === "submitted" && a.status !== "Submitted") return false;
      if (tab === "review"    && a.status !== "In review") return false;
      if (tab === "approved"  && a.status !== "Approved")  return false;
      if (tab === "rejected"  && a.status !== "Rejected")  return false;
    }
    if (query && !a.biz.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminShell
      title="Seller applications"
      description="Pending seller onboarding requests with KYB and category review."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Sellers", to: "/admin/sellers" }, { label: "Applications" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { I: Store,        label: "Open queue",   val: apps.filter(a => a.status !== "Approved" && a.status !== "Rejected").length.toString(), tone: T.warn },
          { I: Clock,        label: "Avg time to decision", val: "1d 14h", tone: T.info },
          { I: CheckCircle2, label: "Approved (7d)", val: apps.filter(a => a.status === "Approved").length.toString(), tone: T.success },
          { I: X,            label: "Rejected (7d)", val: apps.filter(a => a.status === "Rejected").length.toString(), tone: T.danger },
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

      <div className="mt-5 flex items-center gap-1.5 flex-wrap">
        {(["all", "submitted", "review", "approved", "rejected"] as const).map((t) => {
          const active = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} className="h-8 px-3 rounded-full text-[11.5px] font-semibold capitalize"
              style={{ background: active ? T.navy : T.surface, color: active ? "#fff" : T.ink, border: `1px solid ${active ? T.navy : T.border}` }}>
              {t === "review" ? "In review" : t}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 h-8 px-2.5 rounded-lg w-[220px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search business…" className="bg-transparent text-[12px] outline-none flex-1" style={{ color: T.ink }} />
        </div>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1fr 2.4fr 1.2fr 1.2fr 1fr 1fr 1.2fr 1fr" }}>
          <span>ID</span><span>Business</span><span>Country</span><span>Category</span><span>Submitted</span><span>Assignee</span><span>Readiness</span><span>Status</span>
        </div>
        {filtered.map((a, i) => (
          <div key={a.id} className="grid items-center px-4 h-[60px] text-[12px] hover:bg-[rgba(14,59,46,0.02)]"
            style={{ gridTemplateColumns: "1fr 2.4fr 1.2fr 1.2fr 1fr 1fr 1.2fr 1fr", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>{a.id}</span>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-md grid place-items-center" style={{ background: `${T.navy}10`, color: T.navy }}>
                <Building2 className="size-4" strokeWidth={2.2} />
              </div>
              <p className="font-semibold truncate" style={{ color: T.ink }}>{a.biz}</p>
            </div>
            <span style={{ color: T.sub }}>{a.country}</span>
            <span style={{ color: T.sub }}>{a.category}</span>
            <span className="tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{a.submitted}</span>
            <span style={{ color: T.sub }}>{a.assignee}</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: T.bg }}>
                <div className="h-full" style={{ width: `${a.readiness}%`, background: a.readiness >= 80 ? T.success : a.readiness >= 60 ? T.warn : T.danger }} />
              </div>
              <span className="text-[10.5px] tabular-nums font-bold" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>{a.readiness}%</span>
            </div>
            <span><Pill tone={a.tone}>{a.status}</Pill></span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
