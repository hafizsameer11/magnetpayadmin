import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminMoneyLedger } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ledger")({
  head: () => ({ meta: [{ title: "Ledger — MagnetPay Admin" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search.userId === "string" ? search.userId : undefined,
  }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "SUCCEEDED" || s === "COMPLETED" || s === "OK") return "success";
  if (s === "PENDING") return "warn";
  if (s === "FAILED") return "danger";
  return "neutral";
}

function Page() {
  const { userId } = Route.useSearch();
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchAdminMoneyLedger(userId)
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load ledger"));
  }, [userId]);

  const filtered = rows.filter((raw) => {
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const user = (r.user ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return (
      str(r.description ?? r.title).toLowerCase().includes(q) ||
      str(r.type ?? r.kind).toLowerCase().includes(q) ||
      str(r.id).toLowerCase().includes(q) ||
      str(user.name).toLowerCase().includes(q) ||
      str(r.amountDisplay).includes(q)
    );
  });

  return (
    <AdminShell
      title={userId ? "User ledger" : "Ledger"}
      description={userId ? "Wallet activity for this user." : "Activity feed from wallet ledger transactions."}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Money" },
        ...(userId ? [{ label: "Wallets", to: "/admin/wallets" as const }, { label: userId.slice(0, 8) }] : [{ label: "Ledger" }]),
      ]}
    >
      {userId ? (
        <Link
          to="/admin/wallets/$userId"
          params={{ userId }}
          className="inline-block mb-4 text-[12px] font-semibold"
          style={{ color: T.navy }}
        >
          ← Back to wallet
        </Link>
      ) : null}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Entries
          </p>
          <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {rows.length}
          </p>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Showing
          </p>
          <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {filtered.length}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, kind, user…"
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
            gridTemplateColumns: "1fr 1.2fr 2fr 1.2fr 1fr 1fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>Kind</span>
          <span>Title</span>
          <span>User</span>
          <span className="text-right">Amount</span>
          <span>Status</span>
          <span>When</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const status = str(r.status, "—");
          const positive = r.amountPositive === true;
          return (
            <div
              key={str(r.id)}
              className="grid items-center px-4 h-[54px] text-[12px]"
              style={{
                gridTemplateColumns: "1fr 1.2fr 2fr 1.2fr 1fr 1fr 1.2fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {str(r.id).slice(0, 8)}
              </span>
              <span className="text-[11px]" style={{ color: T.sub }}>
                {str(r.type ?? r.kind)}
              </span>
              <div className="min-w-0">
                <p className="font-medium truncate">{str(r.description ?? r.title)}</p>
                <p className="text-[10.5px] truncate" style={{ color: T.muted }}>
                  {str(r.subtitle, "")}
                </p>
              </div>
              <span className="truncate">{str(user.name)}</span>
              <span
                className="text-right tabular-nums font-bold"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: positive ? T.success : T.ink }}
              >
                {str(r.amountDisplay)}
              </span>
              {status !== "—" ? <Pill tone={toneFor(status)}>{status}</Pill> : <span style={{ color: T.muted }}>—</span>}
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.createdAt ? new Date(String(r.createdAt)).toLocaleString() : "—"}
              </span>
            </div>
          );
        })}
        {!filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No ledger entries yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
