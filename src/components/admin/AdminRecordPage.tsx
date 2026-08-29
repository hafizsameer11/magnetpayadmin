import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminRecords, fetchAdminTickets, fetchAdminWebhooks, fetchAdminFeatureFlags, fetchAdminJobs, fetchAdminIncidents, fetchAdminContentPages, fetchAdminHelpArticles, fetchAdminEmailTemplates, fetchAdminSmsTemplates, type AdminRecord } from "@/lib/api";
import { DOMAIN_CONFIG, type AdminRecordRow } from "@/components/admin/recordRegistry";
import { toast } from "sonner";

function statusTone(status?: string | null): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = (status ?? "").toLowerCase();
  if (["active", "verified", "live", "running", "published", "completed", "cleared", "resolved", "recovered", "success"].some((x) => s.includes(x))) return "success";
  if (["pending", "investigating", "processing", "open", "new", "review", "staging"].some((x) => s.includes(x))) return "warn";
  if (["blocked", "rejected", "critical", "failed", "danger"].some((x) => s.includes(x))) return "danger";
  if (["escalated", "filed"].some((x) => s.includes(x))) return "info";
  return "neutral";
}

function cellValue(row: AdminRecordRow, key: string) {
  if (key === "externalId") return row.externalId ?? row.id.slice(0, 8);
  if (key === "title") return row.title;
  if (key === "subtitle") return row.subtitle ?? "—";
  if (key === "status") return row.status ?? "—";
  return "—";
}

const DOMAIN_FETCH: Record<string, () => Promise<AdminRecord[]>> = {
  ticket: () => fetchAdminTickets(),
  webhook: () => fetchAdminWebhooks(),
  "feature-flag": () => fetchAdminFeatureFlags(),
  job: () => fetchAdminJobs(),
  incident: () => fetchAdminIncidents(),
  "legal-page": () => fetchAdminContentPages(),
  "help-article": () => fetchAdminHelpArticles(),
  "email-template": () => fetchAdminEmailTemplates(),
  "sms-template": () => fetchAdminSmsTemplates(),
};

export function AdminRecordListPage({ domain }: { domain: string }) {
  const config = DOMAIN_CONFIG[domain] ?? {
    domain,
    title: domain.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: "Operations records for this area.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: domain }],
    columns: [
      { key: "externalId", label: "ID", mono: true },
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Details" },
      { key: "status", label: "Status" },
    ],
  };

  const [rows, setRows] = useState<AdminRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const loader = DOMAIN_FETCH[domain] ?? (() => fetchAdminRecords(domain));
        const data = await loader();
        if (!cancelled) {
          setRows(
            data.map((r) => ({
              ...r,
              payload: (r.payload ?? {}) as Record<string, unknown>,
            })),
          );
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [domain]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle ?? "").toLowerCase().includes(q) ||
        (r.externalId ?? "").toLowerCase().includes(q) ||
        (r.status ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [query, domain]);

  const kpis = config.kpi?.(rows) ?? [
    { label: "Total", val: String(rows.length) },
    { label: "Active", val: String(rows.filter((r) => statusTone(r.status) === "success").length), tone: T.success },
    { label: "Pending", val: String(rows.filter((r) => statusTone(r.status) === "warn").length), tone: T.warn },
    { label: "Filtered", val: String(filtered.length), tone: T.info },
  ];

  const gridCols = `repeat(${config.columns.length}, minmax(0, 1fr))`;

  return (
    <AdminShell title={config.title} description={config.description} breadcrumbs={config.breadcrumbs}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{k.label}</p>
            <p className="mt-1.5 text-[22px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: k.tone ?? T.ink }}>
              {loading ? "…" : k.val}
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
            placeholder="Search…"
            className="bg-transparent text-[12px] outline-none flex-1"
            style={{ color: T.ink }}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-10 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: gridCols }}
        >
          {config.columns.map((c) => (
            <span key={c.key} className={c.align === "right" ? "text-right" : ""}>{c.label}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-[13px]" style={{ color: T.muted }}>No records yet.</p>
        ) : (
          pageRows.map((row, i) => (
            <Link
              key={row.id}
              to="/admin/records/$id"
              params={{ id: row.id }}
              search={{ domain }}
              className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
              style={{
                gridTemplateColumns: gridCols,
                borderBottom: i < pageRows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              {config.columns.map((col) => {
                const content = col.render ? col.render(row) : cellValue(row, col.key);
                if (col.key === "status") {
                  return (
                    <span key={col.key}>
                      <Pill tone={statusTone(row.status)}>{String(row.status ?? "—")}</Pill>
                    </span>
                  );
                }
                return (
                  <span
                    key={col.key}
                    className={`truncate ${col.align === "right" ? "text-right font-semibold" : ""} ${col.mono ? "tabular-nums" : ""}`}
                    style={{
                      color: col.key === "externalId" ? T.navy : T.ink,
                      fontFamily: col.mono ? "'JetBrains Mono', monospace" : undefined,
                    }}
                  >
                    {content}
                  </span>
                );
              })}
            </Link>
          ))
        )}

        {!loading && filtered.length > 0 ? (
          <div className="px-4 h-12 flex items-center justify-between text-[11.5px]" style={{ background: T.bg, borderTop: `1px solid ${T.border}`, color: T.sub }}>
            <span>
              Showing <span className="font-semibold" style={{ color: T.ink }}>{page * PAGE_SIZE + 1}–{Math.min(filtered.length, page * PAGE_SIZE + pageRows.length)}</span> of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="size-7 grid place-items-center rounded-md disabled:opacity-40"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="size-7 grid place-items-center rounded-md text-white text-[11px] font-bold" style={{ background: T.navy }}>
                {page + 1}
              </span>
              <button
                type="button"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="size-7 grid place-items-center rounded-md disabled:opacity-40"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

export function AdminRecordDetailPage({ domain, id }: { domain: string; id: string }) {
  const config = DOMAIN_CONFIG[domain];
  const [row, setRow] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const { fetchAdminRecord } = await import("@/lib/api");
        setRow(await fetchAdminRecord(id));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setRow(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Detail" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Not found" breadcrumbs={[{ label: "Admin", to: "/admin" }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Record not found.</p>
      </AdminShell>
    );
  }

  const payload = (row.payload ?? {}) as Record<string, unknown>;

  return (
    <AdminShell
      title={row.title}
      description={row.subtitle ?? undefined}
      breadcrumbs={[...(config?.breadcrumbs ?? [{ label: "Admin", to: "/admin" }]), { label: row.externalId ?? row.id.slice(0, 8) }]}
    >
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-2 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Pill tone={statusTone(row.status)}>{row.status ?? "—"}</Pill>
        {row.externalId ? (
          <span className="text-[11px] tabular-nums font-semibold" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{row.externalId}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>Summary</p>
          <dl className="space-y-2 text-[12px]">
            <div className="flex justify-between gap-3"><dt style={{ color: T.sub }}>Title</dt><dd className="font-semibold text-right">{row.title}</dd></div>
            {row.subtitle ? <div className="flex justify-between gap-3"><dt style={{ color: T.sub }}>Details</dt><dd className="text-right">{row.subtitle}</dd></div> : null}
            <div className="flex justify-between gap-3"><dt style={{ color: T.sub }}>Created</dt><dd className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{new Date(row.createdAt).toLocaleString()}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>Payload</p>
          <dl className="space-y-2 text-[12px]">
            {Object.entries(payload).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt style={{ color: T.sub }}>{k}</dt>
                <dd className="font-semibold text-right truncate max-w-[60%]">{String(v)}</dd>
              </div>
            ))}
            {Object.keys(payload).length === 0 ? <p style={{ color: T.muted }}>No extra fields.</p> : null}
          </dl>
        </div>
      </div>
    </AdminShell>
  );
}
