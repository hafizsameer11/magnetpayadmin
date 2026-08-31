import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { StatusCell } from "@/components/admin/StatusBadge";
import { fetchAdminRecords, fetchAdminTickets, fetchAdminWebhooks, fetchAdminFeatureFlags, fetchAdminJobs, fetchAdminIncidents, fetchAdminContentPages, fetchAdminHelpArticles, fetchAdminEmailTemplates, fetchAdminSmsTemplates, patchAdminRecord, createAdminRecord, type AdminRecord } from "@/lib/api";
import { FilterSelect, applyAllFilter, uniqueOptions } from "./ListFilters";
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
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExtId, setNewExtId] = useState("");
  const PAGE_SIZE = 25;

  const reload = async () => {
    setLoading(true);
    try {
      const loader = DOMAIN_FETCH[domain] ?? (() => fetchAdminRecords(domain));
      const data = await loader();
      setRows(
        data.map((r) => ({
          ...r,
          payload: (r.payload ?? {}) as Record<string, unknown>,
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
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
    let list = rows;
    list = applyAllFilter(list, statusFilter, (r) => r.status ?? "");
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle ?? "").toLowerCase().includes(q) ||
        (r.externalId ?? "").toLowerCase().includes(q) ||
        (r.status ?? "").toLowerCase().includes(q),
    );
  }, [rows, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [query, domain, statusFilter]);

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
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.ink }}>{k.label}</p>
            <p className="mt-1.5 text-[22px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
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
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={uniqueOptions(rows.map((r) => r.status ?? ""), "All")} />
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold"
          style={{ background: T.navy, color: "#fff" }}
        >
          {creating ? "Cancel" : "New record"}
        </button>
      </div>

      {creating ? (
        <div className="rounded-xl p-4 mb-4 flex flex-wrap items-end gap-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <label className="flex flex-col gap-1 text-[11px]" style={{ color: T.sub }}>
            Title
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-9 px-3 rounded-lg text-[12px] min-w-[200px]"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px]" style={{ color: T.sub }}>
            External ID
            <input
              value={newExtId}
              onChange={(e) => setNewExtId(e.target.value)}
              className="h-9 px-3 rounded-lg text-[12px] min-w-[140px]"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            />
          </label>
          <button
            type="button"
            disabled={!newTitle.trim()}
            onClick={() => {
              void (async () => {
                try {
                  await createAdminRecord({
                    domain,
                    title: newTitle.trim(),
                    externalId: newExtId.trim() || undefined,
                    status: "active",
                  });
                  toast.success("Record created");
                  setNewTitle("");
                  setNewExtId("");
                  setCreating(false);
                  await reload();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Create failed");
                }
              })();
            }}
            className="h-9 px-4 rounded-lg text-[12px] font-semibold disabled:opacity-50"
            style={{ background: T.accent, color: "#fff" }}
          >
            Create
          </button>
        </div>
      ) : null}

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
                    <StatusCell key={col.key}>
                      <Pill tone={statusTone(row.status)}>{String(row.status ?? "—")}</Pill>
                    </StatusCell>
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
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editVersionLabel, setEditVersionLabel] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editBody, setEditBody] = useState("");
  const isLegal = domain === "legal-page";

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const { fetchAdminRecord } = await import("@/lib/api");
        const data = await fetchAdminRecord(id);
        setRow(data);
        setEditTitle(data.title);
        setEditSubtitle(data.subtitle ?? "");
        setEditStatus(data.status ?? "");
        const p = (data.payload ?? {}) as Record<string, unknown>;
        setEditSlug(String(p.slug ?? ""));
        setEditVersionLabel(String(p.versionLabel ?? data.subtitle ?? ""));
        setEditIcon(String(p.icon ?? "file-text"));
        setEditBody(String(p.body ?? ""));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setRow(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const updated = await patchAdminRecord(row.id, {
        title: editTitle.trim() || row.title,
        subtitle: editSubtitle.trim() || undefined,
        status: editStatus.trim() || undefined,
        ...(isLegal
          ? {
              payload: {
                ...payload,
                slug: editSlug.trim() || payload.slug,
                versionLabel: editVersionLabel.trim() || editSubtitle.trim() || undefined,
                icon: editIcon.trim() || payload.icon,
                body: editBody,
              },
            }
          : {}),
      });
      setRow(updated);
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

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
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="ml-auto h-8 px-3 rounded-lg text-[11.5px] font-semibold disabled:opacity-50"
          style={{ background: T.navy, color: "#fff" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>Edit</p>
          <div className="space-y-3 text-[12px]">
            <label className="block">
              <span style={{ color: T.sub }}>Title</span>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 w-full h-9 px-3 rounded-lg"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              />
            </label>
            <label className="block">
              <span style={{ color: T.sub }}>Details</span>
              <input
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                className="mt-1 w-full h-9 px-3 rounded-lg"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              />
            </label>
            <label className="block">
              <span style={{ color: T.sub }}>Status</span>
              <input
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="mt-1 w-full h-9 px-3 rounded-lg"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              />
            </label>
            {isLegal ? (
              <>
                <label className="block">
                  <span style={{ color: T.sub }}>Slug (URL key)</span>
                  <input
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder="terms"
                    className="mt-1 w-full h-9 px-3 rounded-lg"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                  />
                </label>
                <label className="block">
                  <span style={{ color: T.sub }}>Version label (shown in app)</span>
                  <input
                    value={editVersionLabel}
                    onChange={(e) => setEditVersionLabel(e.target.value)}
                    placeholder="Updated 4 Jun 2026"
                    className="mt-1 w-full h-9 px-3 rounded-lg"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                  />
                </label>
                <label className="block">
                  <span style={{ color: T.sub }}>Icon key</span>
                  <input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    placeholder="file-text, shield-check, scale, cookie, globe"
                    className="mt-1 w-full h-9 px-3 rounded-lg"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                  />
                </label>
                <label className="block">
                  <span style={{ color: T.sub }}>Document body</span>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={16}
                    className="mt-1 w-full px-3 py-2 rounded-lg resize-y font-mono text-[11px] leading-relaxed"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                  />
                </label>
              </>
            ) : null}
          </div>
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
