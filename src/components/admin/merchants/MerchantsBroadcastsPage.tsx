import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import {
  fetchMerchantBroadcasts,
  sendMerchantBroadcast,
  type AdminMerchantBroadcast,
  type MerchantStatus,
  type MerchantTier,
} from "@/lib/merchant-admin-api";

export function MerchantsBroadcastsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tier, setTier] = useState("all");
  const [state, setState] = useState("all");
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AdminMerchantBroadcast[]>([]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      setHistory(await fetchMerchantBroadcasts());
    } catch (e) {
      setHistory([]);
      toast.error(e instanceof Error ? e.message : "Failed to load broadcast history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  return (
    <AdminShell
      title="Broadcasts"
      description="Send alerts to all merchants or a segment (tier, state) via push / SMS."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Merchants", to: "/admin/merchants" },
        { label: "Broadcasts" },
      ]}
    >
      <MerchantsSubnav />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <Megaphone className="size-4" style={{ color: T.navy }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Compose
            </p>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full h-9 px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Message body…"
            className="w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-y"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="h-9 px-2 rounded-lg text-[12px] outline-none"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            >
              <option value="all">All tiers</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="h-9 px-2 rounded-lg text-[12px] outline-none"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            >
              <option value="all">All states</option>
              <option value="Lagos">Lagos</option>
              <option value="FCT">FCT</option>
              <option value="Rivers">Rivers</option>
              <option value="Kano">Kano</option>
            </select>
          </div>
          <div className="flex gap-4 text-[12px] font-semibold">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} className="accent-[#0E3B2E]" />
              Push
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="accent-[#0E3B2E]" />
              SMS (notif only)
            </label>
          </div>
          <button
            type="button"
            disabled={!title.trim() || !body.trim() || (!push && !sms) || busy}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
            style={{ background: T.navy }}
            onClick={async () => {
              setBusy(true);
              try {
                const channels: Array<"push" | "sms"> = [];
                if (push) channels.push("push");
                if (sms) channels.push("sms");
                const result = await sendMerchantBroadcast({
                  title: title.trim(),
                  body: body.trim(),
                  tier: tier === "all" ? undefined : (tier as MerchantTier),
                  state: state === "all" ? undefined : state,
                  status: "ACTIVE" as MerchantStatus,
                  channels,
                });
                toast.success(`Broadcast sent to ${result.sent} merchants`);
                setTitle("");
                setBody("");
                await loadHistory();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Broadcast failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Sending…" : "Send broadcast"}
          </button>
        </div>

        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
            Recent broadcasts
          </p>
          {loading ? (
            <p className="text-[12px]" style={{ color: T.muted }}>
              Loading…
            </p>
          ) : history.length ? (
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="text-[12px]">
                  <p className="font-semibold">{h.title}</p>
                  <p style={{ color: T.sub }}>
                    {h.tier ? String(h.tier) : "All tiers"} · {h.state ? String(h.state) : "All states"} ·{" "}
                    {(h.channels ?? []).map((c) => String(c).toUpperCase()).join(" + ") || "PUSH"}
                    {` · ${h.sent} sent`}
                  </p>
                  <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px]" style={{ color: T.muted }}>
              No broadcasts yet.
            </p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
