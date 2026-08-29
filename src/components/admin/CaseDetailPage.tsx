import { Link } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell, T } from "./AdminShell";
import { Card } from "./Catalog";
import { sevPill, statePill, riskBar, SectionTitle } from "./Compliance";
import { Pill } from "./UserProfile";
import { fetchAdminRecord, patchAdminRecord, type AdminRecord } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { toast } from "sonner";

function p(row: AdminRecord, key: string) {
  const v = row.payload[key];
  if (v == null) return "—";
  return String(v);
}

export function CaseDetailPage({
  id,
  domain,
  title,
  listPath,
  listLabel,
}: {
  id: string;
  domain: string;
  title: string;
  listPath: string;
  listLabel: string;
}) {
  const [row, setRow] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminRecord(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load case");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const runAction = async (action: "assign" | "escalate" | "clear") => {
    if (!row || acting) return;
    setActing(action);
    try {
      const me = getSessionUser();
      const payload = { ...(row.payload as Record<string, unknown>) };
      if (action === "assign") {
        payload.assignee = me?.name ?? "Admin";
        await patchAdminRecord(row.id, { status: "investigating", payload });
        toast.success("Case assigned to you");
      } else if (action === "escalate") {
        payload.escalatedAt = new Date().toISOString();
        await patchAdminRecord(row.id, { status: "escalated", payload });
        toast.success("Case escalated");
      } else {
        payload.clearedAt = new Date().toISOString();
        await patchAdminRecord(row.id, { status: "cleared", payload });
        toast.success("Case cleared");
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <AdminShell title={title} breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: listLabel, to: listPath as never }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title={title} breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: listLabel, to: listPath as never }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Record not found.</p>
      </AdminShell>
    );
  }

  const sevRaw = row.payload.severity;
  const severity =
    sevRaw === "low" || sevRaw === "medium" || sevRaw === "high" || sevRaw === "critical" ? sevRaw : null;
  const riskScore = Number(row.payload.riskScore ?? row.payload.risk ?? 0);

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: listLabel, to: listPath as never }, { label: row.externalId ?? row.id.slice(0, 8) }]}
    >
      <Link to={listPath as never} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> {listLabel}
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              {row.externalId ?? row.id.slice(0, 12)}
            </p>
            <h2 className="mt-1 text-[18px] font-bold">{row.title}</h2>
            <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
              {row.subtitle ?? p(row, "trigger")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {row.status ? statePill(row.status) : null}
            {severity ? sevPill(severity) : null}
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <SectionTitle title="Summary" sub={p(row, "summary") !== "—" ? p(row, "summary") : undefined} />
            <dl className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
              <Field label="Subject" value={row.title} />
              <Field label="Trigger" value={row.subtitle ?? p(row, "trigger")} />
              <Field label="Country" value={p(row, "country")} />
              <Field label="Amount" value={p(row, "amountNGN") !== "—" ? `₦${Number(row.payload.amountNGN).toLocaleString()}` : p(row, "lossNGN") !== "—" ? `₦${Number(row.payload.lossNGN).toLocaleString()}` : "—"} />
              <Field label="Assignee" value={p(row, "assignee")} />
              <Field label="Opened" value={new Date(row.createdAt).toLocaleString()} />
            </dl>
          </Card>
          <Card padded={false}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <p className="text-[12px] font-bold">Payload</p>
            </div>
            <pre className="p-4 text-[11px] overflow-auto max-h-64" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
              {JSON.stringify(row.payload, null, 2)}
            </pre>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Risk score" />
            <div className="mt-3">{riskBar(Number.isFinite(riskScore) ? riskScore : 40)}</div>
          </Card>
          <Card>
            <SectionTitle title="Actions" />
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                disabled={!!acting}
                onClick={() => void runAction("assign")}
                className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white disabled:opacity-60"
                style={{ background: T.navy }}
              >
                {acting === "assign" ? "Assigning…" : "Assign to me"}
              </button>
              <button
                type="button"
                disabled={!!acting}
                onClick={() => void runAction("escalate")}
                className="h-9 px-3 rounded-lg text-[12px] font-semibold disabled:opacity-60"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              >
                {acting === "escalate" ? "Escalating…" : "Escalate"}
              </button>
              <button
                type="button"
                disabled={!!acting}
                onClick={() => void runAction("clear")}
                className="h-9 px-3 rounded-lg text-[12px] font-semibold disabled:opacity-60"
                style={{ background: `${T.success}18`, color: T.success }}
              >
                {acting === "clear" ? "Clearing…" : "Clear case"}
              </button>
            </div>
          </Card>
          <Card>
            <Pill tone="info">{domain}</Pill>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

export function TicketDetailPage({ id }: { id: string }) {
  return (
    <CaseDetailPage id={id} domain="ticket" title="Support ticket" listPath="/admin/tickets" listLabel="Tickets" />
  );
}

export function CarrierDetailPage({ id }: { id: string }) {
  return (
    <CaseDetailPage id={id} domain="carrier" title="Carrier" listPath="/admin/carriers" listLabel="Carriers" />
  );
}

export function AmlDetailPage({ id }: { id: string }) {
  return <CaseDetailPage id={id} domain="aml" title="AML case" listPath="/admin/aml" listLabel="AML" />;
}
