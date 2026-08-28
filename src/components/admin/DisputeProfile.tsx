import { Link } from "@tanstack/react-router";
import { ChevronLeft, FileText, Scale } from "lucide-react";
import { T } from "./AdminShell";
import { DetailTabNav } from "./DetailTabNav";
import { Pill } from "./UserProfile";
import { Card } from "./Catalog";
import { priorityPill, reasonLabel, slaBar, statusPillDispute, type DisputeReason } from "./Disputes";
import { fmtMoney, type AdminDispute } from "@/lib/api";

const DISPUTE_TABS = [
  { to: "/admin/disputes/$id/", label: "Overview", exact: true },
  { to: "/admin/disputes/$id/evidence", label: "Evidence" },
  { to: "/admin/disputes/$id/ruling", label: "Ruling" },
] as const;

export function DisputeTabNav({ id }: { id: string }) {
  return <DetailTabNav tabs={[...DISPUTE_TABS]} params={{ id }} />;
}

function parseEvidence(evidence: unknown): { title: string; at: string; side?: string }[] {
  if (!evidence) return [];
  if (Array.isArray(evidence)) {
    return evidence.map((e, i) => {
      const o = e as Record<string, unknown>;
      return {
        title: String(o.title ?? o.kind ?? `Evidence ${i + 1}`),
        at: String(o.at ?? o.createdAt ?? "—"),
        side: o.side != null ? String(o.side) : undefined,
      };
    });
  }
  if (typeof evidence === "object") {
    return [{ title: JSON.stringify(evidence).slice(0, 80), at: "—" }];
  }
  return [{ title: String(evidence), at: "—" }];
}

export function DisputeHeader({ row }: { row: AdminDispute }) {
  const escrow = row.escrow;
  const amount = escrow?.amountMinor;
  const currency = escrow?.currency ?? "NGN";

  return (
    <>
      <Link to="/admin/disputes" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> All disputes
      </Link>
      <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {row.id}
              </h2>
              {priorityPill("high")}
              {row.outcome ? <Pill tone="success">{row.outcome}</Pill> : statusPillDispute("investigating")}
            </div>
            <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
              {(row.reason in { not_as_described: 1, not_received: 1, damaged: 1, counterfeit: 1, wrong_item: 1, late: 1, quality: 1, customs_hold: 1, chargeback: 1 }
                ? reasonLabel(row.reason as DisputeReason)
                : row.reason)}{" "}
              · opened {new Date(row.createdAt).toLocaleString()}
            </p>
          </div>
          {amount != null ? (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                At stake
              </p>
              <p className="text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(currency, amount)}
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-4 pt-3 flex items-center gap-6 flex-wrap" style={{ borderTop: `1px solid ${T.border}` }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: T.muted }}>
              SLA
            </p>
            {slaBar({ age: 12, sla: 48 })}
          </div>
          {row.escrowId ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: T.muted }}>
                Escrow
              </p>
              <Link to="/admin/escrow/$id" params={{ id: row.escrowId }} className="text-[12px] font-bold tabular-nums hover:underline" style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}>
                {row.escrowId.slice(0, 12)}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
      <DisputeTabNav id={row.id} />
    </>
  );
}

export function DisputeEvidencePanel({ row }: { row: AdminDispute }) {
  const items = parseEvidence(row.evidence);

  return (
    <Card className="mt-4" padded={false}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <FileText className="size-4" style={{ color: T.info }} />
        <p className="text-[12px] font-bold">Evidence timeline</p>
      </div>
      {items.length ? (
        <div className="relative pl-8 pr-4 py-2">
          <div className="absolute left-4 top-3 bottom-3 w-px" style={{ background: T.border }} />
          {items.map((e, i) => (
            <div key={i} className="relative py-3">
              <span className="absolute -left-[18px] top-4 size-2 rounded-full" style={{ background: T.info }} />
              <p className="text-[12.5px] font-semibold">{e.title}</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>
                {e.side ? `${e.side} · ` : ""}
                {e.at}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
          No evidence uploaded yet.
        </p>
      )}
    </Card>
  );
}

export function DisputeRulingPanel({
  row,
  outcome,
  setOutcome,
  onSubmit,
  busy,
}: {
  row: AdminDispute;
  outcome: string;
  setOutcome: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
}) {
  const OUTCOMES = ["RELEASE_TO_SELLER", "REFUND_TO_BUYER", "SPLIT"];

  return (
    <Card className="mt-4">
      <p className="text-[13px] font-bold flex items-center gap-2">
        <Scale className="size-4" style={{ color: T.navy }} /> Ruling
      </p>
      <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
        {row.reason}
      </p>
      {!row.outcome ? (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          >
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <button type="submit" disabled={busy} className="h-9 px-4 rounded-lg text-[12px] font-bold text-white disabled:opacity-60" style={{ background: T.navy }}>
            Submit ruling
          </button>
        </form>
      ) : (
        <p className="mt-3 text-[12px] font-semibold" style={{ color: T.success }}>
          Resolved: {row.outcome}
        </p>
      )}
    </Card>
  );
}

export type EscrowMilestone = {
  label?: string;
  name?: string;
  status?: string;
  amountMinor?: string | number;
  releasedMinor?: string | number;
};

export function EscrowMilestones({ milestones, totalMinor, currency }: { milestones: EscrowMilestone[]; totalMinor: string | number; currency: string }) {
  const total = Number(totalMinor) || 1;
  const released = milestones.filter((m) => String(m.status).toLowerCase() === "released").length;
  const pct = milestones.length ? Math.round((released / milestones.length) * 100) : 0;
  const amountReleased = milestones
    .filter((m) => String(m.status).toLowerCase() === "released")
    .reduce((s, m) => s + Number(m.releasedMinor ?? m.amountMinor ?? 0), 0);

  return (
    <Card className="mt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
        Milestone progress
      </p>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
        <div className="h-full" style={{ width: `${pct}%`, background: T.success }} />
      </div>
      <p className="mt-2 text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
        {released}/{milestones.length || 1} milestones · {pct}% · {fmtMoney(currency, amountReleased)} of {fmtMoney(currency, totalMinor)}
      </p>
      {milestones.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {milestones.map((m, i) => (
            <li key={i} className="flex items-center justify-between text-[12px] p-2 rounded-lg" style={{ background: T.bg }}>
              <span>{m.label ?? m.name ?? `Milestone ${i + 1}`}</span>
              <Pill tone={String(m.status).toLowerCase() === "released" ? "success" : "warn"}>{m.status ?? "pending"}</Pill>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[12px]" style={{ color: T.sub }}>
          Single-release escrow (no milestone breakdown in API).
        </p>
      )}
    </Card>
  );
}
