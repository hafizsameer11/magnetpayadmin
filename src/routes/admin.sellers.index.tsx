import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminSellers } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sellers/")({
  head: () => ({ meta: [{ title: "Sellers — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchAdminSellers()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load sellers"));
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
      str(user.phone).includes(q)
    );
  });

  const verified = rows.filter((raw) => (raw as Record<string, unknown>).verified === true).length;

  return (
    <AdminShell
      title="Sellers"
      description="Seller stores from the marketplace API."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "People" }, { label: "Sellers" }]}
      actions={
        <>
          <Link to="/admin/sellers/applications" className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}>
            Applications
          </Link>
          <Link to="/admin/sellers/payouts" className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white" style={{ background: T.navy }}>
            Payouts
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Stores", val: rows.length },
          { label: "Verified", val: verified, tone: T.success },
          { label: "Unverified", val: rows.length - verified, tone: T.warn },
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
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search seller…"
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
            gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr",
          }}
        >
          <span>Store</span>
          <span>Owner</span>
          <span className="text-right">Products</span>
          <span>Status</span>
          <span>Created</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const products = (r._count as { products?: number } | undefined)?.products ?? 0;
          const verifiedFlag = r.verified === true;
          const tone: Tone = verifiedFlag ? "success" : "warn";
          const id = str(r.id);
          return (
            <div
              key={id}
              className="grid items-center px-4 h-[56px] text-[12px]"
              style={{
                gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div className="min-w-0">
                <Link to="/admin/sellers/$id" params={{ id }} className="font-semibold truncate hover:underline block" style={{ color: T.navy }}>
                  {str(r.name)}
                </Link>
                <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {id.slice(0, 8)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate">{str(user.name)}</p>
                <p className="text-[10.5px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {str(user.phone)}
                </p>
              </div>
              <span className="text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {products}
              </span>
              <Pill tone={tone}>{verifiedFlag ? "Verified" : "Unverified"}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.createdAt ? new Date(String(r.createdAt)).toLocaleDateString() : "—"}
              </span>
            </div>
          );
        })}
        {!filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No sellers yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
