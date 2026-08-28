import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminLogisticsPartner, patchAdminLogisticsPartner, type AdminLogisticsPartner } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logistics/partners/$id")({
  head: () => ({ meta: [{ title: "Partner detail — MagnetPay Admin" }] }),
  component: Page,
});

const KINDS = ["FREIGHT_FORWARDER", "WAREHOUSE", "CUSTOMS_BROKER", "LAST_MILE"] as const;
const MODES = ["SEA", "AIR", "EXPRESS", "CONSOLIDATED"] as const;

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminLogisticsPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminLogisticsPartner(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load partner");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await patchAdminLogisticsPartner(id, {
        name: row.name,
        code: row.code,
        kind: row.kind,
        modes: row.modes,
        active: row.active,
        rating: row.rating ?? null,
        serviceLabel: row.serviceLabel ?? null,
        contactName: row.contactName ?? null,
        contactPhone: row.contactPhone ?? null,
        contactEmail: row.contactEmail ?? null,
        notes: row.notes ?? null,
      });
      toast.success("Partner updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleMode = (mode: string) => {
    if (!row) return;
    const modes = row.modes.includes(mode) ? row.modes.filter((m) => m !== mode) : [...row.modes, mode];
    setRow({ ...row, modes });
  };

  if (loading) {
    return (
      <AdminShell title="Partner" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Partners", to: "/admin/logistics/partners" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Partner" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Partners", to: "/admin/logistics/partners" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>
          Partner not found.
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={row.name}
      description={`${row.code} · ${row.kind.replace(/_/g, " ")}`}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Partners", to: "/admin/logistics/partners" },
        { label: row.code },
      ]}
      actions={
        <>
          <Link
            to="/admin/logistics/partners"
            className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            <ArrowLeft className="size-3.5" /> Back
          </Link>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: T.navy }}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save
          </button>
        </>
      }
    >
      <div className="rounded-xl p-4 space-y-4 max-w-2xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between">
          <Pill tone={row.active ? "success" : "neutral"}>{row.active ? "Active" : "Inactive"}</Pill>
          <label className="flex items-center gap-2 text-[12px]">
            <input type="checkbox" checked={row.active} onChange={(e) => setRow({ ...row, active: e.target.checked })} />
            Active on platform
          </label>
        </div>

        {[
          { label: "Name", key: "name" as const },
          { label: "Code", key: "code" as const },
          { label: "Service label", key: "serviceLabel" as const },
          { label: "Contact name", key: "contactName" as const },
          { label: "Contact phone", key: "contactPhone" as const },
          { label: "Contact email", key: "contactEmail" as const },
        ].map((f) => (
          <div key={f.key}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: T.muted }}>
              {f.label}
            </p>
            <input
              value={(row[f.key] as string | null | undefined) ?? ""}
              onChange={(e) => setRow({ ...row, [f.key]: e.target.value })}
              className="w-full h-9 px-2 rounded-md text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            />
          </div>
        ))}

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: T.muted }}>
            Kind
          </p>
          <select
            value={row.kind}
            onChange={(e) => setRow({ ...row, kind: e.target.value as AdminLogisticsPartner["kind"] })}
            className="w-full h-9 px-2 rounded-md text-[12px]"
            style={{ background: T.bg, border: `1px solid ${T.border}` }}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: T.muted }}>
            Modes
          </p>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMode(m)}
                className="h-8 px-3 rounded-full text-[11px] font-bold"
                style={{
                  background: row.modes.includes(m) ? `${T.navy}15` : T.bg,
                  color: row.modes.includes(m) ? T.navy : T.muted,
                  border: `1px solid ${row.modes.includes(m) ? T.navy : T.border}`,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: T.muted }}>
            Rating (0–5)
          </p>
          <input
            value={row.rating ?? ""}
            onChange={(e) => setRow({ ...row, rating: e.target.value ? Number(e.target.value) : null })}
            className="w-full h-9 px-2 rounded-md text-[12px] tabular-nums"
            style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: T.muted }}>
            Notes
          </p>
          <textarea
            value={row.notes ?? ""}
            onChange={(e) => setRow({ ...row, notes: e.target.value })}
            rows={4}
            className="w-full px-2 py-2 rounded-md text-[12px] outline-none resize-y"
            style={{ background: T.bg, border: `1px solid ${T.border}` }}
          />
        </div>
      </div>
    </AdminShell>
  );
}
