import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import {
  fetchMerchantDirectory,
  patchMerchantDirectory,
  type AdminDirectoryRow,
} from "@/lib/merchant-admin-api";

function hoursLabel(openHours: unknown) {
  if (!openHours) return "—";
  if (typeof openHours === "string") return openHours;
  try {
    return JSON.stringify(openHours);
  } catch {
    return "—";
  }
}

export function MerchantsDirectoryPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = window.setTimeout(() => {
      fetchMerchantDirectory(query.trim() || undefined)
        .then((d) => {
          if (!cancelled) setRows(d);
        })
        .catch((e) => {
          if (!cancelled) {
            setRows([]);
            toast.error(e instanceof Error ? e.message : "Failed to load directory");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, query ? 250 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query]);

  return (
    <AdminShell
      title="Agent directory"
      description="Listing visibility, coordinates, hours and Premium partner flag for public search."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Directory" },
      ]}
    >
      <MerchantsSubnav />
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Name, address, state…" />

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {loading ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          rows.map((m, i) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-[12px]"
              style={{ borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <div className="min-w-0 flex-1">
                <Link to="/admin/merchants/$id" params={{ id: m.id }} className="font-semibold hover:underline">
                  {m.premiumPartner ? <Star className="inline size-3 mr-1 -mt-0.5" style={{ color: T.warn }} /> : null}
                  {m.businessName}
                </Link>
                <p style={{ color: T.sub }}>
                  {m.address} · {m.lga}, {m.state}
                </p>
                <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {(m.lat ?? 0).toFixed(4)}, {(m.lng ?? 0).toFixed(4)} · {hoursLabel(m.openHours)} · {m.tag}
                </p>
              </div>
              <StatusBadge tone={m.listedInDirectory ? "success" : "neutral"}>
                {m.listedInDirectory ? "Listed" : "Hidden"}
              </StatusBadge>
              <button
                type="button"
                className="h-8 px-2.5 rounded-lg text-[11px] font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
                onClick={async () => {
                  try {
                    await patchMerchantDirectory(m.id, { listedInDirectory: !m.listedInDirectory });
                    setRows((prev) =>
                      prev.map((x) => (x.id === m.id ? { ...x, listedInDirectory: !x.listedInDirectory } : x)),
                    );
                    toast.success(m.listedInDirectory ? "Hidden from directory" : "Listed in directory");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Update failed");
                  }
                }}
              >
                {m.listedInDirectory ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                className="h-8 px-2.5 rounded-lg text-[11px] font-semibold"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
                onClick={async () => {
                  try {
                    await patchMerchantDirectory(m.id, { premiumPartner: !m.premiumPartner });
                    setRows((prev) =>
                      prev.map((x) => (x.id === m.id ? { ...x, premiumPartner: !x.premiumPartner } : x)),
                    );
                    toast.success("Premium flag toggled");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Update failed");
                  }
                }}
              >
                Premium
              </button>
            </div>
          ))}
        {!loading && !rows.length ? <ListEmpty message="No agents in directory." /> : null}
      </div>
    </AdminShell>
  );
}
