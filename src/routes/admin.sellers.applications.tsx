import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Store, Clock, CheckCircle2, X, Search, Building2, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminKyb, type AdminKybRow } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sellers/applications")({
  head: () => ({ meta: [{ title: "Seller applications — MagnetPay Admin" }] }),
  component: SellerApplications,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "APPROVED") return "success";
  if (s === "REJECTED") return "danger";
  if (s === "PENDING" || s === "SUBMITTED") return "warn";
  return "info";
}

function labelFor(status: string) {
  const s = status.toUpperCase();
  if (s === "APPROVED") return "Approved";
  if (s === "REJECTED") return "Rejected";
  if (s === "PENDING" || s === "SUBMITTED") return "Submitted";
  return status;
}

function SellerApplications() {
  const [tab, setTab] = useState<"all" | "submitted" | "approved" | "rejected">("submitted");
  const [query, setQuery] = useState("");
  const [apps, setApps] = useState<AdminKybRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setApps(await fetchAdminKyb());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load applications");
        setApps([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = apps.filter((a) => {
    const s = a.status.toUpperCase();
    if (tab === "submitted" && s !== "PENDING" && s !== "SUBMITTED") return false;
    if (tab === "approved" && s !== "APPROVED") return false;
    if (tab === "rejected" && s !== "REJECTED") return false;
    if (query && !a.companyName.toLowerCase().includes(query.toLowerCase()) && !a.user.name.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <AdminShell
      title="Seller applications"
      description="KYB submissions from the API — review and approve in KYB queue."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Sellers", to: "/admin/sellers" }, { label: "Applications" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { I: Store, label: "Open queue", val: apps.filter((a) => !["APPROVED", "REJECTED"].includes(a.status.toUpperCase())).length.toString(), tone: T.warn },
          { I: Clock, label: "Total", val: apps.length.toString(), tone: T.info },
          { I: CheckCircle2, label: "Approved", val: apps.filter((a) => a.status.toUpperCase() === "APPROVED").length.toString(), tone: T.success },
          { I: X, label: "Rejected", val: apps.filter((a) => a.status.toUpperCase() === "REJECTED").length.toString(), tone: T.danger },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md grid place-items-center" style={{ background: `${s.tone}14`, color: s.tone }}>
                <s.I className="size-3.5" strokeWidth={2.4} />
              </div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.ink }}>{s.label}</p>
            </div>
            <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["all", "submitted", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="h-8 px-3 rounded-full text-[11.5px] font-semibold capitalize"
            style={{
              background: tab === t ? T.navy : T.surface,
              color: tab === t ? "#fff" : T.ink,
              border: `1px solid ${tab === t ? T.navy : T.border}`,
            }}
          >
            {t}
          </button>
        ))}
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg ml-auto w-[240px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search business…" className="bg-transparent text-[12px] outline-none flex-1" />
        </div>
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {filtered.map((a, i) => (
            <div
              key={a.id}
              className="grid items-center px-4 h-[58px] text-[12px]"
              style={{ gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1fr", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <Link to="/admin/kyb/$id" params={{ id: a.id }} className="font-semibold tabular-nums" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                {a.id.slice(0, 8)}
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="size-3.5 shrink-0" style={{ color: T.muted }} />
                <span className="truncate font-semibold">{a.companyName}</span>
              </div>
              <span className="truncate" style={{ color: T.sub }}>{a.user.name}</span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
              <Pill tone={toneFor(a.status)}>{labelFor(a.status)}</Pill>
            </div>
          ))}
          {!filtered.length ? (
            <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No seller applications in this view.</p>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}
