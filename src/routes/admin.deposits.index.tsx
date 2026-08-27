import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminDeposits, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/deposits/")({
  head: () => ({ meta: [{ title: "Deposits — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "SUCCEEDED" || s === "COMPLETED" || s === "APPROVED") return "success";
  if (s === "PENDING" || s === "PROCESSING") return "warn";
  if (s === "FAILED" || s === "REJECTED") return "danger";
  return "neutral";
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchAdminDeposits()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load deposits"));
  }, []);

  const filtered = rows.filter((raw) => {
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const user = (r.user ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return (
      str(r.id).toLowerCase().includes(q) ||
      str(user.name).toLowerCase().includes(q) ||
      str(user.phone).includes(q) ||
      str(r.method).toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Deposits"
      description="Inbound funds across all rails."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Deposits" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total", val: rows.length },
          {
            label: "Pending",
            val: rows.filter((raw) => {
              const s = str((raw as Record<string, unknown>).status).toUpperCase();
              return s === "PENDING" || s === "PROCESSING";
            }).length,
            tone: T.warn,
          },
          {
            label: "Failed",
            val: rows.filter((raw) => str((raw as Record<string, unknown>).status).toUpperCase() === "FAILED").length,
            tone: T.danger,
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
            placeholder="ID, user, method…"
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
            gridTemplateColumns: "1.1fr 1.6fr 1fr 1.2fr 1fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>User</span>
          <span className="text-right">Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>When</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const id = str(r.id);
          const status = str(r.status);
          return (
            <div
              key={id}
              className="grid items-center px-4 h-[58px] text-[12px]"
              style={{
                gridTemplateColumns: "1.1fr 1.6fr 1fr 1.2fr 1fr 1.2fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <Link
                to="/admin/deposits/$id"
                params={{ id }}
                className="font-bold tabular-nums hover:underline"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: T.navy }}
              >
                {id.slice(0, 8)}
              </Link>
              <div className="min-w-0">
                <p className="font-medium truncate">{str(user.name)}</p>
                <p className="text-[10.5px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {str(user.phone)}
                </p>
              </div>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(str(r.currency, "NGN"), r.amountMinor as string | number)}
              </span>
              <span className="truncate text-[11px]" style={{ color: T.sub }}>
                {str(r.method)}
              </span>
              <Pill tone={toneFor(status)}>{status}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.createdAt ? new Date(String(r.createdAt)).toLocaleString() : "—"}
              </span>
            </div>
          );
        })}
        {!filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No deposits yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
