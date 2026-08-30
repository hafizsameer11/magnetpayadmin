import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Building2, Clock, CheckCircle2, Ban, RefreshCw } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { decideKyb, fetchAdminKyb } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/kyb/")({
  head: () => ({ meta: [{ title: "KYB queue — MagnetPay Admin" }] }),
  component: KYBQueue,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";
type KybRow = {
  id: string;
  biz: string;
  userId: string;
  phone: string;
  licenseNo: string;
  entity: string;
  ubo: number;
  submitted: string;
  status: string;
  tone: Tone;
};

function mapKybStatus(status: string) {
  if (status === "SUBMITTED") return { label: "Pending", tone: "warn" as Tone };
  if (status === "DRAFT") return { label: "Incomplete", tone: "info" as Tone };
  if (status === "APPROVED") return { label: "Approved", tone: "success" as Tone };
  if (status === "REJECTED") return { label: "Rejected", tone: "danger" as Tone };
  return { label: status, tone: "neutral" as Tone };
}

function KYBQueue() {
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<KybRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const apiRows = await fetchAdminKyb();
      setRows(
        apiRows.map((r) => {
          const docs = (r.documents ?? {}) as Record<string, unknown>;
          const profile = (docs.profile ?? {}) as Record<string, unknown>;
          const directors = Array.isArray(docs.directors) ? docs.directors : [];
          const mapped = mapKybStatus(r.status);
          return {
            id: r.id,
            biz: r.companyName,
            userId: r.user.id.slice(0, 8),
            phone: r.user.phone,
            licenseNo: r.licenseNo ?? "—",
            entity: String(profile.entity ?? "—"),
            ubo: directors.length,
            submitted: new Date(r.updatedAt || r.createdAt).toLocaleString(),
            status: mapped.label,
            tone: mapped.tone,
          };
        }),
      );
    } catch {
      /* login required */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((r) => {
    if (tab === "pending" && r.status !== "Pending" && r.status !== "Incomplete") return false;
    if (tab === "approved" && r.status !== "Approved") return false;
    if (tab === "rejected" && r.status !== "Rejected") return false;
    if (query) {
      const n = query.toLowerCase();
      if (!r.biz.toLowerCase().includes(n) && !r.id.toLowerCase().includes(n) && !r.phone.includes(n)) return false;
    }
    return true;
  });

  const tabs: { id: typeof tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: rows.length },
    {
      id: "pending",
      label: "Pending",
      count: rows.filter((r) => r.status === "Pending" || r.status === "Incomplete").length,
    },
    { id: "approved", label: "Approved", count: rows.filter((r) => r.status === "Approved").length },
    { id: "rejected", label: "Rejected", count: rows.filter((r) => r.status === "Rejected").length },
  ];

  return (
    <AdminShell
      title="KYB review"
      description="Business identity verification queue. Submissions from the seller app appear here for approval."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "People" }, { label: "KYB" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          {
            I: Clock,
            label: "Pending",
            val: rows.filter((r) => r.status === "Pending" || r.status === "Incomplete").length.toString(),
            tone: T.warn,
          },
          { I: CheckCircle2, label: "Approved", val: rows.filter((r) => r.status === "Approved").length.toString(), tone: T.success },
          { I: Ban, label: "Rejected", val: rows.filter((r) => r.status === "Rejected").length.toString(), tone: T.danger },
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
              <span className="text-[10px] tabular-nums opacity-80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {t.count}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => void load()}
          className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, color: T.ink, border: `1px solid ${T.border}` }}
          disabled={loading}
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2.2} />
          Refresh
        </button>
        <div className="ml-auto flex items-center gap-2 h-8 px-2.5 rounded-lg w-[220px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business…"
            className="bg-transparent text-[12px] outline-none flex-1"
            style={{ color: T.ink }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "0.9fr 2.2fr 1.2fr 1.1fr 0.6fr 1.2fr 1.6fr",
          }}
        >
          <span>Case</span>
          <span>Business</span>
          <span>License</span>
          <span>Entity</span>
          <span>UBOs</span>
          <span>Submitted</span>
          <span>Actions</span>
        </div>
        {filtered.map((r, i) => (
          <div
            key={r.id}
            className="grid items-center px-4 h-[60px] text-[12px]"
            style={{
              gridTemplateColumns: "0.9fr 2.2fr 1.2fr 1.1fr 0.6fr 1.2fr 1.6fr",
              borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <Link to="/admin/kyb/$id" params={{ id: r.id }} className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
              {r.id.slice(0, 8)}
            </Link>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-md grid place-items-center shrink-0" style={{ background: `${T.navy}10`, color: T.navy }}>
                <Building2 className="size-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate" style={{ color: T.ink }}>
                  {r.biz}
                </p>
                <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.phone}
                </p>
              </div>
            </div>
            <span className="tabular-nums truncate" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
              {r.licenseNo}
            </span>
            <span className="truncate" style={{ color: T.sub }}>
              {r.entity}
            </span>
            <span className="tabular-nums font-semibold" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>
              {r.ubo}
            </span>
            <span className="tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
              {r.submitted}
            </span>
            <div className="flex items-center gap-2">
              <Pill tone={r.tone}>{r.status}</Pill>
              {r.status === "Pending" ? (
                <>
                  <button
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${T.success}18`, color: T.success }}
                    onClick={async () => {
                      await decideKyb(r.id, "APPROVED");
                      toast.success("KYB approved");
                      void load();
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${T.danger}18`, color: T.danger }}
                    onClick={async () => {
                      await decideKyb(r.id, "REJECTED");
                      toast.error("KYB rejected");
                      void load();
                    }}
                  >
                    Reject
                  </button>
                </>
              ) : r.status === "Incomplete" ? (
                <span className="text-[10px] font-semibold" style={{ color: T.muted }}>
                  Awaiting docs
                </span>
              ) : null}
            </div>
          </div>
        ))}
        {!filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No KYB submissions yet. Seller KYB from the mobile app will appear here.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
