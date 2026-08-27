import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Clock, CheckCircle2, Ban, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill, initials } from "@/components/admin/UserProfile";
import { decideKyc, fetchAdminKyc, type AdminKycRow } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/kyc/")({
  head: () => ({ meta: [{ title: "KYC queue — MagnetPay Admin" }] }),
  component: KYCQueue,
});

type Tone = "success" | "warn" | "danger" | "neutral";

function KYCQueue() {
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminKycRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminKyc());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load KYC");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const mapped = rows.map((r) => ({
    ...r,
    label:
      r.status === "SUBMITTED"
        ? "Pending"
        : r.status === "APPROVED"
          ? "Approved"
          : r.status === "REJECTED"
            ? "Rejected"
            : r.status,
    tone: (r.status === "SUBMITTED" ? "warn" : r.status === "APPROVED" ? "success" : "danger") as Tone,
  }));

  const filtered = mapped.filter((r) => {
    if (tab === "pending" && r.label !== "Pending") return false;
    if (tab === "approved" && r.label !== "Approved") return false;
    if (tab === "rejected" && r.label !== "Rejected") return false;
    if (query) {
      const n = query.toLowerCase();
      if (!r.user.name.toLowerCase().includes(n) && !r.id.toLowerCase().includes(n) && !r.user.phone.includes(n))
        return false;
    }
    return true;
  });

  const tabs = [
    { id: "all" as const, label: "All", count: mapped.length },
    { id: "pending" as const, label: "Pending", count: mapped.filter((r) => r.label === "Pending").length },
    { id: "approved" as const, label: "Approved", count: mapped.filter((r) => r.label === "Approved").length },
    { id: "rejected" as const, label: "Rejected", count: mapped.filter((r) => r.label === "Rejected").length },
  ];

  return (
    <AdminShell
      title="KYC review"
      description="Individual identity verification queue. Submissions from the mobile app appear here."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "People" }, { label: "KYC" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { I: Clock, label: "Pending", val: tabs[1].count, tone: T.warn },
          { I: CheckCircle2, label: "Approved", val: tabs[2].count, tone: T.success },
          { I: Ban, label: "Rejected", val: tabs[3].count, tone: T.danger },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md grid place-items-center" style={{ background: `${s.tone}14`, color: s.tone }}>
                <s.I className="size-3.5" strokeWidth={2.4} />
              </div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                {s.label}
              </p>
            </div>
            <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {s.val}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-1.5 flex-wrap">
        {tabs.map((t) => {
          const active = tab === t.id;
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
              <span className="text-[10px] tabular-nums opacity-80">{t.count}</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 h-8 px-2.5 rounded-lg w-[220px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="bg-transparent text-[12px] outline-none flex-1"
            style={{ color: T.ink }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <>
            <div
              className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{
                color: T.muted,
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                gridTemplateColumns: "0.9fr 2fr 1fr 1fr 1.2fr 1.6fr",
              }}
            >
              <span>Case</span>
              <span>Subject</span>
              <span>Type</span>
              <span>Submitted</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filtered.map((r, i) => (
              <div
                key={r.id}
                className="grid items-center px-4 h-[60px] text-[12px]"
                style={{
                  gridTemplateColumns: "0.9fr 2fr 1fr 1fr 1.2fr 1.6fr",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <Link to="/admin/kyc/$id" params={{ id: r.id }} className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.id.slice(0, 8)}
                </Link>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold shrink-0" style={{ background: `${T.navy}10`, color: T.navy }}>
                    {initials(r.user.name || r.user.phone)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.user.name || "Unnamed"}</p>
                    <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {r.user.phone}
                    </p>
                  </div>
                </div>
                <span style={{ color: T.sub }}>{r.type}</span>
                <span className="tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(r.createdAt).toLocaleString()}
                </span>
                <Pill tone={r.tone}>{r.label}</Pill>
                <div className="flex items-center gap-2">
                  {r.label === "Pending" ? (
                    <>
                      <button
                        className="text-[10px] font-bold px-2 py-1 rounded"
                        style={{ background: `${T.success}18`, color: T.success }}
                        onClick={async () => {
                          await decideKyc(r.id, "APPROVED");
                          toast.success("Approved");
                          void load();
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="text-[10px] font-bold px-2 py-1 rounded"
                        style={{ background: `${T.danger}18`, color: T.danger }}
                        onClick={async () => {
                          await decideKyc(r.id, "REJECTED");
                          toast.error("Rejected");
                          void load();
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
            {!filtered.length ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                No KYC applications yet. Submit from the mobile app to see cases here.
              </p>
            ) : null}
          </>
        )}
      </div>
    </AdminShell>
  );
}
