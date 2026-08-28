import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import {
  addAdminShipmentDocument,
  advanceAdminShipment,
  deleteAdminShipmentDocument,
  fetchAdminShipment,
  fetchAdminShipmentDocumentKinds,
  fmtMoney,
  resolveApiFileUrl,
  settleAdminShipment,
  uploadAdminFile,
  type AdminShipment,
  type AdminShipmentDocument,
  type ShipmentCostLine,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shipments/$id")({
  head: () => ({ meta: [{ title: "Shipment detail — MagnetPay Admin" }] }),
  component: Page,
});

const NEXT: Record<string, string> = {
  HOLD_LOCKED: "IN_TRANSIT",
  IN_TRANSIT: "CUSTOMS",
  CUSTOMS: "SETTLEMENT_PENDING",
  SETTLEMENT_PENDING: "READY_FOR_POD",
  TOP_UP_REQUIRED: "READY_FOR_POD",
  READY_FOR_POD: "DELIVERED",
};

const STATUSES = ["IN_TRANSIT", "CUSTOMS", "SETTLEMENT_PENDING", "READY_FOR_POD", "DELIVERED"] as const;

const DEFAULT_COST_LINES = [
  { label: "Freight / handling", ngn: "" },
  { label: "Customs duty", ngn: "" },
  { label: "VAT / levies", ngn: "" },
  { label: "Clearing agent", ngn: "" },
];

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "DELIVERED" || s === "COMPLETED") return "success";
  if (s === "EXCEPTION" || s === "RETURNED" || s === "FAILED" || s === "CANCELLED") return "danger";
  if (s === "IN_TRANSIT" || s === "CUSTOMS") return "info";
  return "warn";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminShipment | null>(null);
  const [docKinds, setDocKinds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [message, setMessage] = useState("");
  const [skipPod, setSkipPod] = useState(true);
  const [settleNotes, setSettleNotes] = useState("");
  const [costLines, setCostLines] = useState(DEFAULT_COST_LINES.map((l) => ({ ...l })));
  const [docKind, setDocKind] = useState("customs_clearance");
  const [docNote, setDocNote] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminShipment(id);
      setRow(data);
      const next = NEXT[data.status?.toUpperCase() ?? ""];
      if (next) setTargetStatus(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load shipment");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    void fetchAdminShipmentDocumentKinds()
      .then(setDocKinds)
      .catch(() => setDocKinds(["customs_clearance", "customs_duty_receipt", "commercial_invoice", "other"]));
  }, [id]);

  const documents = (row?.documents ?? []) as AdminShipmentDocument[];
  const costTotalMinor = useMemo(() => {
    return costLines.reduce((sum, line) => {
      const n = Number(String(line.ngn).replace(/,/g, ""));
      if (!Number.isFinite(n) || n <= 0) return sum;
      return sum + Math.round(n * 100);
    }, 0);
  }, [costLines]);

  const advance = async (useNext?: boolean) => {
    setBusy(true);
    try {
      await advanceAdminShipment(id, {
        status: useNext ? undefined : targetStatus || undefined,
        message: message.trim() || undefined,
        skipPodCheck: skipPod,
      });
      toast.success("Shipment status updated");
      setMessage("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Advance failed");
    } finally {
      setBusy(false);
    }
  };

  const settle = async () => {
    const breakdown: ShipmentCostLine[] = costLines
      .map((l) => ({
        label: l.label.trim(),
        amountMinor: Math.round(Number(String(l.ngn).replace(/,/g, "")) * 100),
      }))
      .filter((l) => l.label && l.amountMinor > 0);

    if (breakdown.length === 0) {
      toast.error("Add at least one cost line with an amount");
      return;
    }

    setBusy(true);
    try {
      await settleAdminShipment(id, {
        breakdown,
        notes: settleNotes.trim() || undefined,
        finalMinor: costTotalMinor,
      });
      toast.success("Customs settlement recorded");
      setSettleNotes("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Settle failed");
    } finally {
      setBusy(false);
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile) {
      toast.error("Choose a file to upload");
      return;
    }
    setBusy(true);
    try {
      const contentBase64 = await fileToBase64(uploadFile);
      const uploaded = await uploadAdminFile(uploadFile.name, contentBase64, uploadFile.type || undefined);
      await addAdminShipmentDocument(id, {
        kind: docKind,
        name: uploaded.name || uploadFile.name,
        url: uploaded.url,
        note: docNote.trim() || undefined,
      });
      toast.success("Document uploaded");
      setUploadFile(null);
      setDocNote("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const removeDocument = async (docId: string) => {
    setBusy(true);
    try {
      await deleteAdminShipmentDocument(id, docId);
      toast.success("Document removed");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell
        title="Shipment"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Shipments", to: "/admin/shipments" }, { label: id }]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell
        title="Shipment"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Shipments", to: "/admin/shipments" }, { label: id }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Shipment not found.
        </p>
      </AdminShell>
    );
  }

  const events = row.events ?? [];
  const nextStatus = NEXT[row.status?.toUpperCase() ?? ""];
  const canSettle = row.hold && !row.settlement;
  const breakdown = row.settlement?.breakdown ?? [];

  return (
    <AdminShell
      title={row.ref ? `Shipment ${row.ref}` : `Shipment ${row.id.slice(0, 8)}`}
      description={row.route ?? (row.mode ? `Mode ${row.mode}` : "Shipment detail")}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Shipments", to: "/admin/shipments" },
        { label: row.ref ?? row.id.slice(0, 8) },
      ]}
      actions={
        <Link
          to="/admin/shipments"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between">
              <Pill tone={statusTone(row.status)}>{row.status}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(row.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Mode
                </p>
                <p className="mt-1 font-semibold">{row.mode ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Ref
                </p>
                <p className="mt-1 font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {row.ref ?? "—"}
                </p>
              </div>
              {row.hold ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                    Hold locked
                  </p>
                  <p className="mt-1 font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtMoney(row.hold.currency ?? "NGN", row.hold.lockedMinor)}
                  </p>
                </div>
              ) : null}
              {row.settlement ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                    Final settled
                  </p>
                  <p className="mt-1 font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtMoney(row.settlement.currency ?? "NGN", row.settlement.finalMinor)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="px-4 h-10 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                Documents ({documents.length})
              </p>
            </div>
            {documents.length === 0 ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                No documents uploaded yet.
              </p>
            ) : (
              documents.map((doc, i) => (
                <div
                  key={doc.id}
                  className="px-4 py-3 flex items-center gap-3 text-[12px]"
                  style={{ borderBottom: i < documents.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{doc.name}</p>
                    <p className="text-[10.5px] uppercase tracking-wide" style={{ color: T.muted }}>
                      {doc.kind.replace(/_/g, " ")}
                    </p>
                  </div>
                  <a
                    href={resolveApiFileUrl(doc.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-2 rounded-md flex items-center gap-1 text-[11px] font-semibold shrink-0"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.info }}
                  >
                    <ExternalLink className="size-3" /> Open
                  </a>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeDocument(doc.id)}
                    className="size-8 rounded-md grid place-items-center shrink-0 disabled:opacity-50"
                    style={{ background: `${T.danger}10`, color: T.danger, border: `1px solid ${T.danger}33` }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
            <div className="p-4 space-y-3" style={{ borderTop: documents.length ? `1px solid ${T.border}` : "none", background: T.bg }}>
              <p className="text-[11px] font-bold">Upload document</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select
                  value={docKind}
                  onChange={(e) => setDocKind(e.target.value)}
                  className="h-9 px-2 rounded-md text-[12px]"
                  style={{ background: T.surface, border: `1px solid ${T.border}` }}
                >
                  {docKinds.map((k) => (
                    <option key={k} value={k}>
                      {k.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  accept="image/*,.pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="h-9 text-[11px]"
                />
              </div>
              <input
                value={docNote}
                onChange={(e) => setDocNote(e.target.value)}
                placeholder="Note for timeline (optional)"
                className="w-full h-9 px-2 rounded-md text-[12px]"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              />
              <button
                type="button"
                disabled={busy || !uploadFile}
                onClick={() => void uploadDocument()}
                className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
                style={{ background: T.navy }}
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                Upload to shipment
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="px-4 h-10 flex items-center" style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                Events
              </p>
            </div>
            {events.length === 0 ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                No tracking events.
              </p>
            ) : (
              events.map((ev, i) => (
                <div
                  key={String(ev.id ?? i)}
                  className="px-4 py-3 text-[12px]"
                  style={{ borderBottom: i < events.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <p className="font-semibold">{String(ev.status ?? "Event")}</p>
                  {ev.message != null && (
                    <p className="text-[11px]" style={{ color: T.sub }}>
                      {String(ev.message)}
                    </p>
                  )}
                  {ev.createdAt && (
                    <p className="text-[11px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(String(ev.createdAt)).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              User
            </p>
            <p className="mt-1.5 font-semibold">{row.user?.name ?? "—"}</p>
            {row.user && (
              <Link
                to="/admin/users/$id"
                params={{ id: row.user.id }}
                className="text-[11px] tabular-nums hover:underline"
                style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {row.user.id.slice(0, 8)}
              </Link>
            )}
          </div>

          <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[12px] font-bold">Ops — update status</p>
            {nextStatus ? (
              <p className="text-[11px]" style={{ color: T.sub }}>
                Next step: <span className="font-bold" style={{ color: T.ink }}>{nextStatus.replace(/_/g, " ")}</span>
              </p>
            ) : null}
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full h-9 px-2 rounded-md text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Event note (optional)"
              className="w-full h-9 px-2 rounded-md text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            />
            <label className="flex items-center gap-2 text-[11px]" style={{ color: T.sub }}>
              <input type="checkbox" checked={skipPod} onChange={(e) => setSkipPod(e.target.checked)} />
              Skip POD check (admin)
            </label>
            <div className="flex flex-col gap-2">
              {nextStatus ? (
                <button
                  disabled={busy}
                  onClick={() => void advance(true)}
                  className="w-full h-9 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                  style={{ background: T.navy }}
                >
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
                  Advance to {nextStatus.replace(/_/g, " ")}
                </button>
              ) : null}
              <button
                disabled={busy || !targetStatus}
                onClick={() => void advance(false)}
                className="w-full h-9 rounded-lg text-[12px] font-semibold disabled:opacity-60"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              >
                Set status → {targetStatus.replace(/_/g, " ")}
              </button>
            </div>
          </div>

          {canSettle ? (
            <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[12px] font-bold">Ops — customs cost & settlement</p>
              <p className="text-[11px] leading-snug" style={{ color: T.sub }}>
                Itemize clearing costs in ₦. Total is saved to the buyer shipment and drives cashback or top-up vs hold{" "}
                {fmtMoney(row.hold?.currency ?? "NGN", row.hold?.lockedMinor)}.
              </p>
              {costLines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_32px] gap-2 items-center">
                  <input
                    value={line.label}
                    onChange={(e) =>
                      setCostLines((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))
                    }
                    className="h-9 px-2 rounded-md text-[12px]"
                    style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  />
                  <input
                    value={line.ngn}
                    onChange={(e) =>
                      setCostLines((prev) => prev.map((x, idx) => (idx === i ? { ...x, ngn: e.target.value } : x)))
                    }
                    placeholder="₦"
                    className="h-9 px-2 rounded-md text-[12px] tabular-nums"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <button
                    type="button"
                    onClick={() => setCostLines((prev) => prev.filter((_, idx) => idx !== i))}
                    className="size-8 rounded-md grid place-items-center"
                    style={{ color: T.muted, border: `1px solid ${T.border}` }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCostLines((prev) => [...prev, { label: "Other charge", ngn: "" }])}
                className="h-8 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              >
                <Plus className="size-3.5" /> Add line
              </button>
              <div className="rounded-lg px-3 py-2 flex justify-between text-[12px]" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <span style={{ color: T.muted }}>Total final</span>
                <span className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtMoney("NGN", costTotalMinor)}
                </span>
              </div>
              <textarea
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
                placeholder="Internal / buyer-visible settlement notes (optional)"
                rows={3}
                className="w-full px-2 py-2 rounded-md text-[12px] outline-none resize-y"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
              />
              <button
                disabled={busy || costTotalMinor <= 0}
                onClick={() => void settle()}
                className="w-full h-9 rounded-lg text-[12px] font-bold text-white disabled:opacity-60"
                style={{ background: T.accent }}
              >
                Record settlement & notify buyer
              </button>
            </div>
          ) : row.settlement ? (
            <div className="rounded-xl p-4 text-[11px] space-y-2" style={{ background: `${T.success}08`, border: `1px solid ${T.success}33` }}>
              <p className="font-bold" style={{ color: T.success }}>
                Settled
              </p>
              {Array.isArray(breakdown) && breakdown.length > 0 ? (
                <ul className="space-y-1">
                  {breakdown.map((line, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span style={{ color: T.sub }}>{line.label}</span>
                      <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtMoney("NGN", line.amountMinor)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {row.settlement.notes ? (
                <p style={{ color: T.sub }}>{row.settlement.notes}</p>
              ) : null}
              {Number(row.settlement.cashbackMinor) > 0 ? (
                <p style={{ color: T.sub }}>Cashback: {fmtMoney("NGN", row.settlement.cashbackMinor)}</p>
              ) : null}
              {Number(row.settlement.topUpMinor) > 0 ? (
                <p style={{ color: T.warn }}>Top-up due: {fmtMoney("NGN", row.settlement.topUpMinor)}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
