import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronLeft, CheckCircle2, X, AlertTriangle, FileText, Eye, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { decideKyb, fetchAdminKybById, type AdminKybRow } from "@/lib/api";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";

export const Route = createFileRoute("/admin/kyb/$id")({
  head: () => ({ meta: [{ title: "KYB case — MagnetPay Admin" }] }),
  component: KYBDetail,
});

function fileUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function KYBDetail() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminKybRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<null | "approve" | "reject">(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminKybById(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load KYB");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const docsPayload = (row?.documents ?? {}) as Record<string, unknown>;
  const profile = (docsPayload.profile ?? {}) as Record<string, unknown>;
  const directors = Array.isArray(docsPayload.directors) ? (docsPayload.directors as { n?: string; r?: string }[]) : [];
  const files = useMemo(() => {
    const list = Array.isArray(docsPayload.files) ? docsPayload.files : [];
    return list
      .filter((f): f is { label: string; url: string; fileName?: string } => !!f && typeof f === "object" && "url" in f)
      .map((f) => ({ name: String(f.label || f.fileName || "Document"), url: String(f.url) }));
  }, [docsPayload]);

  const statusTone =
    row?.status === "APPROVED" ? "success" : row?.status === "REJECTED" ? "danger" : "warn";
  const statusLabel =
    row?.status === "SUBMITTED"
      ? "Pending review"
      : row?.status === "APPROVED"
        ? "Approved"
        : row?.status === "REJECTED"
          ? "Rejected"
          : row?.status ?? "…";

  const confirm = async () => {
    if (!decision || !row || busy) return;
    setBusy(true);
    try {
      await decideKyb(row.id, decision === "approve" ? "APPROVED" : "REJECTED", note || undefined);
      toast.success(decision === "approve" ? "KYB approved" : "KYB rejected");
      setDecision(null);
      setNote("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="KYB case" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "KYB", to: "/admin/kyb" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="KYB case" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "KYB", to: "/admin/kyb" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>
          Case not found.
        </p>
      </AdminShell>
    );
  }

  const pending = row.status === "SUBMITTED" || row.status === "DRAFT";

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "KYB", to: "/admin/kyb" }, { label: id.slice(0, 8) }]}
    >
      <Link to="/admin/kyb" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> KYB queue
      </Link>

      <div className="rounded-xl p-4 flex items-start gap-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="size-14 rounded-lg grid place-items-center shrink-0" style={{ background: `${T.navy}10`, color: T.navy }}>
          <Building2 className="size-6" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-bold leading-tight">{row.companyName}</h2>
            <Pill tone={statusTone}>{statusLabel}</Pill>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
            <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {row.licenseNo || "—"}
            </span>
            <span>·</span>
            <span>{row.user.name || row.user.phone}</span>
            <span>·</span>
            <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date(row.updatedAt || row.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        {pending ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDecision("reject")}
              className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold"
              style={{ background: `${T.danger}14`, color: T.danger, border: `1px solid ${T.danger}26` }}
            >
              <X className="size-3.5" strokeWidth={2.6} /> Reject
            </button>
            <button
              onClick={() => setDecision("approve")}
              className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
              style={{ background: T.success }}
            >
              <CheckCircle2 className="size-3.5" strokeWidth={2.6} /> Approve
            </button>
          </div>
        ) : null}
      </div>

      {decision ? (
        <div
          className="mt-3 rounded-xl p-3 text-[12px] flex flex-col gap-2"
          style={{ background: T.surface, border: `1.5px solid ${decision === "approve" ? T.success : T.danger}`, color: T.ink }}
        >
          <div className="flex items-center gap-2">
            {decision === "approve" ? (
              <>
                <CheckCircle2 className="size-4" strokeWidth={2.6} style={{ color: T.success }} /> Marked for approval
              </>
            ) : (
              <>
                <AlertTriangle className="size-4" strokeWidth={2.6} style={{ color: T.danger }} /> Marked for rejection
              </>
            )}
            <button onClick={() => setDecision(null)} className="ml-auto text-[11px] font-semibold" style={{ color: T.sub }}>
              Cancel
            </button>
            <button
              className="h-7 px-3 rounded-md text-[11px] font-bold text-white disabled:opacity-50"
              style={{ background: decision === "approve" ? T.success : T.danger }}
              disabled={busy}
              onClick={() => void confirm()}
            >
              Confirm {decision}
            </button>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note for audit trail"
            className="h-9 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          />
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="px-4 h-12 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
              <FileText className="size-4" strokeWidth={2.4} style={{ color: T.navy }} />
              <h3 className="text-[13px] font-bold">Submitted documents</h3>
              <span className="ml-auto text-[10.5px]" style={{ color: T.muted }}>
                {files.length} files
              </span>
            </div>
            <ul>
              {files.map((d, i) => (
                <li
                  key={d.url + d.name}
                  className="px-4 h-14 flex items-center gap-3"
                  style={{ borderBottom: i < files.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <div className="size-9 rounded-lg grid place-items-center" style={{ background: `${T.navy}10`, color: T.navy }}>
                    <FileText className="size-4" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold truncate" style={{ color: T.ink }}>
                      {d.name}
                    </p>
                    <p className="text-[10.5px] truncate" style={{ color: T.muted }}>
                      {d.url}
                    </p>
                  </div>
                  <a
                    href={fileUrl(d.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="size-8 grid place-items-center rounded-md hover:bg-black/5"
                    style={{ color: T.sub }}
                  >
                    <Eye className="size-3.5" strokeWidth={2.2} />
                  </a>
                </li>
              ))}
              {!files.length ? (
                <li className="px-4 py-6 text-[12px]" style={{ color: T.muted }}>
                  No uploaded files on this KYB profile.
                </li>
              ) : null}
            </ul>
          </div>

          {directors.length ? (
            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <h3 className="text-[13px] font-bold mb-3">Beneficial owners</h3>
              <ul className="space-y-2">
                {directors.map((d, i) => (
                  <li key={i} className="text-[12.5px] flex justify-between gap-3">
                    <span className="font-semibold">{d.n ?? "—"}</span>
                    <span style={{ color: T.muted }}>{d.r ?? ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <h3 className="text-[13px] font-bold mb-3">Business profile</h3>
          <dl className="space-y-2 text-[12px]">
            {[
              ["Legal rep", profile.legalRep],
              ["Brand", profile.brand],
              ["Province", profile.province],
              ["Entity", profile.entity],
              ["Category", profile.category],
              ["Volume", profile.volume],
              ["Address", profile.address],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-3">
                <dt style={{ color: T.muted }}>{k}</dt>
                <dd className="font-semibold text-right">{String(v ?? "—")}</dd>
              </div>
            ))}
            {docsPayload.adminNote ? (
              <div className="pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
                <dt style={{ color: T.muted }}>Admin note</dt>
                <dd className="mt-1">{String(docsPayload.adminNote)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </AdminShell>
  );
}
