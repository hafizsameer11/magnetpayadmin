import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { createAdminLogisticsPartner, fetchAdminLogisticsPartners, type AdminLogisticsPartner } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logistics/partners/")({
  head: () => ({ meta: [{ title: "Logistics partners — MagnetPay Admin" }] }),
  component: Page,
});

const KINDS = ["FREIGHT_FORWARDER", "WAREHOUSE", "CUSTOMS_BROKER", "LAST_MILE"] as const;
const MODES = ["SEA", "AIR", "EXPRESS", "CONSOLIDATED"] as const;

function Page() {
  const [rows, setRows] = useState<AdminLogisticsPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    kind: "FREIGHT_FORWARDER" as AdminLogisticsPartner["kind"],
    modes: ["SEA"] as string[],
    active: true,
    serviceLabel: "",
    rating: "4.5",
  });

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminLogisticsPartners());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load partners");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.kind.toLowerCase().includes(q);
  });

  const toggleMode = (mode: string) => {
    setForm((prev) => ({
      ...prev,
      modes: prev.modes.includes(mode) ? prev.modes.filter((m) => m !== mode) : [...prev.modes, mode],
    }));
  };

  const create = async () => {
    if (!form.name.trim() || !form.code.trim() || form.modes.length === 0) {
      toast.error("Name, code, and at least one mode required");
      return;
    }
    setSaving(true);
    try {
      await createAdminLogisticsPartner({
        name: form.name.trim(),
        code: form.code.trim(),
        kind: form.kind,
        modes: form.modes,
        active: form.active,
        serviceLabel: form.serviceLabel || undefined,
        rating: Number(form.rating) || undefined,
      });
      toast.success("Partner created");
      setShowForm(false);
      setForm({ name: "", code: "", kind: "FREIGHT_FORWARDER", modes: ["SEA"], active: true, serviceLabel: "", rating: "4.5" });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Logistics partners"
      description="Carriers, warehouses, and brokers MagnetPay works with. Registry for ops — quote compare can use these later."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Logistics" }, { label: "Partners" }]}
      actions={
        <button
          onClick={() => setShowForm((v) => !v)}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5"
          style={{ background: T.navy }}
        >
          <Plus className="size-3.5" /> Add partner
        </button>
      }
    >
      {showForm ? (
        <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[12px] font-bold">New partner</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-9 px-2 rounded-md text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            />
            <input
              placeholder="Code (e.g. MAGNET)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="h-9 px-2 rounded-md text-[12px] tabular-nums"
              style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
            />
            <select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as AdminLogisticsPartner["kind"] })}
              className="h-9 px-2 rounded-md text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <input
              placeholder="Service label"
              value={form.serviceLabel}
              onChange={(e) => setForm({ ...form, serviceLabel: e.target.value })}
              className="h-9 px-2 rounded-md text-[12px]"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMode(m)}
                className="h-8 px-3 rounded-full text-[11px] font-bold"
                style={{
                  background: form.modes.includes(m) ? `${T.navy}15` : T.bg,
                  color: form.modes.includes(m) ? T.navy : T.muted,
                  border: `1px solid ${form.modes.includes(m) ? T.navy : T.border}`,
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={() => void create()}
            disabled={saving}
            className="h-9 px-4 rounded-lg text-[12px] font-bold text-white disabled:opacity-60"
            style={{ background: T.accent }}
          >
            {saving ? "Saving…" : "Create partner"}
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search partner…"
            className="bg-transparent text-[12px] outline-none flex-1"
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-[12px]" style={{ color: T.muted }}>
            No logistics partners yet.
          </p>
        ) : (
          <ul>
            {filtered.map((r, i) => (
              <li key={r.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <Link
                  to="/admin/logistics/partners/$id"
                  params={{ id: r.id }}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.02]"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold truncate">{r.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                      {r.code} · {r.kind.replace(/_/g, " ")} · {(r.modes ?? []).join(", ")}
                    </p>
                    {r.serviceLabel ? (
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: T.sub }}>
                        {r.serviceLabel}
                      </p>
                    ) : null}
                  </div>
                  <Pill tone={r.active ? "success" : "neutral"}>{r.active ? "Active" : "Inactive"}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
