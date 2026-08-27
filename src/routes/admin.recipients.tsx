import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminRecipients } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/recipients")({
  head: () => ({ meta: [{ title: "Recipients — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "VERIFIED" || s === "APPROVED") return "success";
  if (s === "PENDING") return "warn";
  if (s === "FAILED" || s === "REJECTED" || s === "BLOCKED") return "danger";
  return "neutral";
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchAdminRecipients()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load recipients"));
  }, []);

  const filtered = rows.filter((raw) => {
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const user = (r.user ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return (
      str(r.name).toLowerCase().includes(q) ||
      str(r.id).toLowerCase().includes(q) ||
      str(user.name).toLowerCase().includes(q) ||
      str(r.accountHint).includes(q)
    );
  });

  return (
    <AdminShell
      title="Recipients"
      description="Saved beneficiaries with verification status."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "People" }, { label: "Recipients" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total", val: rows.length },
          {
            label: "Pending",
            val: rows.filter((raw) => str((raw as Record<string, unknown>).verificationStatus).toUpperCase() === "PENDING").length,
            tone: T.warn,
          },
          {
            label: "Verified",
            val: rows.filter((raw) => str((raw as Record<string, unknown>).verificationStatus).toUpperCase() === "VERIFIED").length,
            tone: T.success,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {s.label}
            </p>
            <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.tone ?? T.ink }}>
              {s.val}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[260px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipient…"
            className="bg-transparent text-[12px] outline-none flex-1"
            style={{ color: T.ink }}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1fr 1.6fr 0.8fr 1fr 1.2fr 1.2fr 1fr",
          }}
        >
          <span>ID</span>
          <span>Name</span>
          <span>Country</span>
          <span>Rail</span>
          <span>Account</span>
          <span>Owner</span>
          <span>Status</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const status = str(r.verificationStatus, "PENDING");
          return (
            <div
              key={str(r.id)}
              className="grid items-center px-4 h-[56px] text-[12px]"
              style={{
                gridTemplateColumns: "1fr 1.6fr 0.8fr 1fr 1.2fr 1.2fr 1fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {str(r.id).slice(0, 8)}
              </span>
              <div className="min-w-0">
                <p className="font-medium truncate">{str(r.name)}</p>
                <p className="text-[10.5px] truncate" style={{ color: T.muted }}>
                  {str(r.subtitle, "")}
                </p>
              </div>
              <span>{str(r.country)}</span>
              <span className="text-[11px]">{str(r.rail)}</span>
              <span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
                {str(r.accountHint)}
              </span>
              <span className="truncate">{str(user.name)}</span>
              <Pill tone={toneFor(status)}>{status}</Pill>
            </div>
          );
        })}
        {!filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No recipients yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
