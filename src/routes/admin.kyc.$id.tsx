import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  X,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Eye,
  Loader2,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill, initials } from "@/components/admin/UserProfile";
import { decideKyc, fetchAdminKycById, type AdminKycRow } from "@/lib/api";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";

export const Route = createFileRoute("/admin/kyc/$id")({
  head: () => ({ meta: [{ title: "KYC case — MagnetPay Admin" }] }),
  component: KYCDetail,
});

function fileUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function KYCDetail() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminKycRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<null | "approve" | "reject">(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminKycById(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load KYC");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const payload = (row?.payload ?? {}) as Record<string, unknown>;
  const docs = useMemo(() => {
    const list: { name: string; url: string }[] = [];
    if (typeof payload.idPhotoUrl === "string" && payload.idPhotoUrl) {
      list.push({ name: String(payload.idType ?? "ID photo"), url: String(payload.idPhotoUrl) });
    }
    if (typeof payload.selfieUrl === "string" && payload.selfieUrl) {
      list.push({ name: "Selfie liveness", url: String(payload.selfieUrl) });
    }
    return list;
  }, [payload]);

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
      await decideKyc(row.id, decision === "approve" ? "APPROVED" : "REJECTED", note || undefined);
      toast.success(decision === "approve" ? "KYC approved" : "KYC rejected");
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
      <AdminShell title="KYC case" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "KYC", to: "/admin/kyc" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="KYC case" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "KYC", to: "/admin/kyc" }, { label: id }]}>
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
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "KYC", to: "/admin/kyc" },
        { label: id.slice(0, 8) },
      ]}
    >
      <Link to="/admin/kyc" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> KYC queue
      </Link>

      <div className="rounded-xl p-4 flex items-start gap-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="size-14 rounded-full grid place-items-center text-[15px] font-bold shrink-0" style={{ background: `${T.navy}10`, color: T.navy }}>
          {initials(row.user.name || row.user.phone)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-bold leading-tight">{row.user.name || "Unnamed user"}</h2>
            <Pill tone={statusTone}>{statusLabel}</Pill>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-[0.12em]" style={{ background: `${T.navy}14`, color: T.navy }}>
              {row.type} · Tier {row.tier ?? 1}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
            <span>{row.user.phone}</span>
            {row.user.email ? (
              <>
                <span>·</span>
                <span>{row.user.email}</span>
              </>
            ) : null}
            <span>·</span>
            <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date(row.createdAt).toLocaleString()}
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
                {docs.length} files
              </span>
            </div>
            <ul>
              {docs.map((d, i) => (
                <li
                  key={d.url + d.name}
                  className="px-4 h-14 flex items-center gap-3"
                  style={{ borderBottom: i < docs.length - 1 ? `1px solid ${T.border}` : "none" }}
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
                    aria-label="Open"
                  >
                    <Eye className="size-3.5" strokeWidth={2.2} />
                  </a>
                </li>
              ))}
              {!docs.length ? (
                <li className="px-4 py-6 text-[12px]" style={{ color: T.muted }}>
                  No uploaded images in this application payload.
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="size-4" strokeWidth={2.4} style={{ color: T.navy }} />
              <h3 className="text-[13px] font-bold">Identity fields</h3>
            </div>
            <dl className="space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt style={{ color: T.muted }}>ID type</dt>
                <dd className="font-semibold">{row.type}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: T.muted }}>Number</dt>
                <dd className="font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {String(payload.number ?? "—")}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: T.muted }}>Document</dt>
                <dd className="font-semibold text-right">{String(payload.idType ?? "—")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: T.muted }}>Selfie</dt>
                <dd className="font-semibold">{payload.selfie ? "Yes" : "—"}</dd>
              </div>
              {payload.adminNote ? (
                <div className="pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
                  <dt style={{ color: T.muted }}>Admin note</dt>
                  <dd className="mt-1">{String(payload.adminNote)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
