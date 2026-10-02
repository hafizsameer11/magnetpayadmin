import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { fetchMerchantAudit, type AdminMerchantAudit } from "@/lib/merchant-admin-api";

function metaSnippet(meta: unknown) {
  if (meta == null) return "—";
  if (typeof meta === "string") return meta;
  try {
    const o = meta as { reason?: string; before?: unknown; after?: unknown };
    if (o.reason) return String(o.reason);
    const before = o.before != null ? JSON.stringify(o.before).slice(0, 40) : "—";
    const after = o.after != null ? JSON.stringify(o.after).slice(0, 40) : "—";
    return `${before} → ${after}`;
  } catch {
    return "—";
  }
}

export function MerchantsAuditPage() {
  const [query, setQuery] = useState("");
  const [all, setAll] = useState<AdminMerchantAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMerchantAudit()
      .then((d) => {
        if (!cancelled) setAll(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setAll([]);
          toast.error(e instanceof Error ? e.message : "Failed to load audit");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((a) => {
      const actor = a.actor?.name ?? a.actor?.email ?? a.actorId ?? "";
      return (
        actor.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        (a.entityId ?? "").toLowerCase().includes(q) ||
        a.entity.toLowerCase().includes(q) ||
        metaSnippet(a.meta).toLowerCase().includes(q)
      );
    });
  }, [query, all]);

  return (
    <AdminShell
      title="Merchant admin audit"
      description="Every admin action with actor, time, before/after values and reason."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Audit" },
      ]}
    >
      <MerchantsSubnav />
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Actor, action, entity, reason…" />

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.1fr 1.2fr 0.9fr 1fr 1.4fr 1.2fr",
          }}
        >
          <span>When</span>
          <span>Actor</span>
          <span>Action</span>
          <span>Entity</span>
          <span>Before → After</span>
          <span>Reason</span>
        </div>
        {loading ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          rows.map((a, i) => {
            const meta = a.meta as { reason?: string } | null | undefined;
            return (
              <div
                key={a.id}
                className="grid items-start px-4 py-3 text-[12px]"
                style={{
                  gridTemplateColumns: "1.1fr 1.2fr 0.9fr 1fr 1.4fr 1.2fr",
                  borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>
                  {new Date(a.createdAt).toLocaleString()}
                </span>
                <span className="font-semibold">{a.actor?.name ?? a.actor?.email ?? a.actorId ?? "—"}</span>
                <span style={{ color: T.navy }}>{a.action}</span>
                <span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
                  {a.entity}/{a.entityId ?? "—"}
                </span>
                <span style={{ color: T.sub }}>{metaSnippet(a.meta)}</span>
                <span style={{ color: T.muted }}>{meta?.reason ?? "—"}</span>
              </div>
            );
          })}
        {!loading && !rows.length ? <ListEmpty message="No audit entries." /> : null}
      </div>
    </AdminShell>
  );
}
