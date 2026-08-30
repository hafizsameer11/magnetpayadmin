import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import {
  fetchAdminInspections,
  fmtMoney,
  updateAdminInspection,
  type AdminInspection,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inspections/")({
  head: () => ({ meta: [{ title: "Inspections — MagnetPay Admin" }] }),
  component: Page,
});

const STATUS_TONE: Record<string, "success" | "warn" | "danger" | "info" | "neutral"> = {
  REQUESTED: "warn",
  SCHEDULED: "info",
  IN_PROGRESS: "info",
  PASSED: "success",
  FAILED: "danger",
};

function Page() {
  const [rows, setRows] = useState<AdminInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminInspections());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load inspections");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (row: AdminInspection, status: string) => {
    if (busyId) return;
    setBusyId(row.id);
    try {
      await updateAdminInspection(row.id, { status });
      toast.success(`Inspection marked ${status.replace(/_/g, " ").toLowerCase()}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell
      title="Inspections"
      description="MagnetPay third-party inspection queue — schedule, track, and approve reports."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Inspections" },
      ]}
    >
      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.2fr 1fr 1fr 0.9fr 1.4fr",
          }}
        >
          <span>Escrow</span>
          <span>Inspector</span>
          <span>Parties</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No active inspection requests.
          </p>
        ) : (
          rows.map((row, i) => {
            const escrow = row.escrow;
            const tone = STATUS_TONE[row.status] ?? "neutral";
            return (
              <div
                key={row.id}
                className="grid items-center px-4 py-3 text-[12px] gap-2"
                style={{
                  borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : undefined,
                  gridTemplateColumns: "1.2fr 1fr 1fr 0.9fr 1.4fr",
                }}
              >
                <div>
                  <Link
                    to="/admin/escrow/$id"
                    params={{ id: row.escrowId }}
                    className="font-semibold hover:underline"
                    style={{ color: T.navy }}
                  >
                    {escrow?.title ?? row.escrowId.slice(0, 8)}
                  </Link>
                  <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>
                    {escrow ? fmtMoney(String(escrow.currency), escrow.amountMinor) : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">{row.inspector?.name ?? row.inspectorId}</p>
                  <p className="text-[10.5px]" style={{ color: T.muted }}>
                    {row.inspector?.region ?? "Partner"}
                  </p>
                </div>
                <div className="text-[11px]" style={{ color: T.sub }}>
                  <p>{escrow?.buyer?.name ?? "Buyer"}</p>
                  <p>{escrow?.seller?.name ?? "Pending seller"}</p>
                </div>
                <Pill label={row.status.replace(/_/g, " ")} tone={tone} />
                <div className="flex flex-wrap gap-1.5">
                  {row.status === "REQUESTED" ? (
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => void setStatus(row, "SCHEDULED")}
                      className="h-8 px-2.5 rounded-lg text-[10px] font-bold"
                      style={{ background: `${T.info}14`, color: T.info }}
                    >
                      Schedule
                    </button>
                  ) : null}
                  {row.status === "SCHEDULED" ? (
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => void setStatus(row, "IN_PROGRESS")}
                      className="h-8 px-2.5 rounded-lg text-[10px] font-bold"
                      style={{ background: `${T.info}14`, color: T.info }}
                    >
                      Start
                    </button>
                  ) : null}
                  {row.status === "IN_PROGRESS" || row.status === "SCHEDULED" ? (
                    <>
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => void setStatus(row, "PASSED")}
                        className="h-8 px-2.5 rounded-lg text-[10px] font-bold"
                        style={{ background: `${T.success}14`, color: T.success }}
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => {
                          const reason = window.prompt("Failure reason for buyer/seller:");
                          if (!reason?.trim()) return;
                          setBusyId(row.id);
                          void updateAdminInspection(row.id, { status: "FAILED", failedReason: reason.trim() })
                            .then(() => {
                              toast.success("Inspection marked failed");
                              return load();
                            })
                            .catch((e) => toast.error(e instanceof Error ? e.message : "Update failed"))
                            .finally(() => setBusyId(null));
                        }}
                        className="h-8 px-2.5 rounded-lg text-[10px] font-bold"
                        style={{ background: `${T.danger}14`, color: T.danger }}
                      >
                        Fail
                      </button>
                    </>
                  ) : null}
                  {row.status === "PASSED" ? (
                    <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: T.success }}>
                      <ShieldCheck className="size-3.5" /> Release unlocked
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
