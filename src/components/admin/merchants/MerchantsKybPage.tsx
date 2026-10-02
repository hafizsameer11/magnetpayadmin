import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { StatusBadge, StatusCell } from "@/components/admin/StatusBadge";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { capitalize, merchantStatusTone } from "@/components/admin/merchants/merchantUi";
import {
  approveMerchant,
  decideMerchantKybDoc,
  docLabel,
  fetchMerchantKybQueue,
  type AdminMerchantDoc,
} from "@/lib/merchant-admin-api";

type KybGroup = {
  merchantId: string;
  agentId: string;
  businessName: string;
  businessType?: string;
  status: string;
  createdAt: string;
  docs: AdminMerchantDoc[];
};

function groupDocs(docs: AdminMerchantDoc[]): KybGroup[] {
  const map = new Map<string, KybGroup>();
  for (const d of docs) {
    const m = d.merchant;
    if (!m) continue;
    let g = map.get(m.id);
    if (!g) {
      g = {
        merchantId: m.id,
        agentId: m.agentId,
        businessName: m.businessName,
        businessType: m.businessType,
        status: m.status,
        createdAt: m.createdAt,
        docs: [],
      };
      map.set(m.id, g);
    }
    g.docs.push(d);
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function MerchantsKybPage() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<AdminMerchantDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchMerchantKybQueue()
      .then(setDocs)
      .catch((e) => {
        setDocs([]);
        toast.error(e instanceof Error ? e.message : "Failed to load KYB queue");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => groupDocs(docs), [docs]);

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups.filter(
      (m) =>
        m.businessName.toLowerCase().includes(q) ||
        m.agentId.toLowerCase().includes(q),
    );
  }, [groups, query]);

  return (
    <AdminShell
      title="Merchant KYB queue"
      description="Oldest submissions first. Review per document, then approve the application."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "KYB" },
      ]}
    >
      <MerchantsSubnav />
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Search KYB queue…" />

      <div className="space-y-3">
        {loading ? (
          <p className="text-[12px] py-6 text-center" style={{ color: T.muted }}>
            Loading…
          </p>
        ) : null}
        {!loading &&
          filtered.map((m) => {
            const submitted = new Date(m.createdAt);
            const hours = Math.floor((Date.now() - submitted.getTime()) / 3_600_000);
            return (
              <div key={m.merchantId} className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to="/admin/merchants/$id"
                      params={{ id: m.merchantId }}
                      search={{ tab: "kyb" }}
                      className="text-[14px] font-bold hover:underline"
                      style={{ color: T.ink }}
                    >
                      {m.businessName}
                    </Link>
                    <p className="text-[11px] tabular-nums mt-0.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {m.agentId} · {m.businessType ?? "—"} · SLA {hours}h in queue
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusCell>
                      <StatusBadge tone={merchantStatusTone(m.status)}>{capitalize(m.status)}</StatusBadge>
                    </StatusCell>
                    <button
                      type="button"
                      className="h-8 px-3 rounded-lg text-[11px] font-bold text-white"
                      style={{ background: T.success }}
                      onClick={async () => {
                        try {
                          await approveMerchant(m.merchantId);
                          setDocs((prev) => prev.filter((d) => d.merchantId !== m.merchantId));
                          toast.success("Application approved — merchant notified");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Approve failed");
                        }
                      }}
                    >
                      Approve application
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  {m.docs.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                      style={{ background: T.bg, border: `1px solid ${T.border}` }}
                    >
                      <span className="font-semibold min-w-[120px]">{docLabel(d.kind)}</span>
                      <StatusBadge tone={d.status === "APPROVED" ? "success" : d.status === "REJECTED" ? "danger" : "warn"}>
                        {capitalize(d.status)}
                      </StatusBadge>
                      {d.rejectReason ? (
                        <span className="text-[11px]" style={{ color: T.danger }}>
                          {d.rejectReason}
                        </span>
                      ) : null}
                      <div className="ml-auto flex gap-1.5">
                        {d.status !== "APPROVED" ? (
                          <button
                            type="button"
                            className="text-[10px] font-bold px-2 py-1 rounded"
                            style={{ background: `${T.success}18`, color: T.success }}
                            onClick={async () => {
                              try {
                                await decideMerchantKybDoc(d.id, "APPROVED");
                                setDocs((prev) => prev.filter((x) => x.id !== d.id));
                                toast.success(`${docLabel(d.kind)} approved`);
                              } catch (e) {
                                toast.error(e instanceof Error ? e.message : "Failed");
                              }
                            }}
                          >
                            Approve
                          </button>
                        ) : null}
                        {d.status !== "REJECTED" ? (
                          <button
                            type="button"
                            className="text-[10px] font-bold px-2 py-1 rounded"
                            style={{ background: `${T.danger}18`, color: T.danger }}
                            onClick={async () => {
                              const reason =
                                window.prompt("Reject reason (preset or free text)", "Unclear photo — resubmit") ?? "";
                              if (!reason.trim()) return;
                              try {
                                await decideMerchantKybDoc(d.id, "REJECTED", reason);
                                setDocs((prev) => prev.filter((x) => x.id !== d.id));
                                toast.error(`${docLabel(d.kind)} rejected — merchant notified`);
                              } catch (e) {
                                toast.error(e instanceof Error ? e.message : "Failed");
                              }
                            }}
                          >
                            Reject
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        {!loading && !filtered.length ? <ListEmpty message="KYB queue is empty." /> : null}
      </div>
    </AdminShell>
  );
}
