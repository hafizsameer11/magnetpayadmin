import { useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { MerchantsSubnav } from "@/components/admin/merchants/MerchantsSubnav";
import { sendMerchantBroadcast, type MerchantStatus, type MerchantTier } from "@/lib/merchant-admin-api";

type HistoryRow = {
  id: string;
  title: string;
  segment: string;
  channels: string;
  at: string;
  sent?: number;
};

export function MerchantsBroadcastsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tier, setTier] = useState("all");
  const [state, setState] = useState("all");
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);

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
                const result = await sendMerchantBroadcast({
                  title: title.trim(),
                  body: body.trim(),
                  tier: tier === "all" ? undefined : (tier as MerchantTier),
                  state: state === "all" ? undefined : state,
                  status: "ACTIVE" as MerchantStatus,
                });
                const channels = [push ? "Push" : null, sms ? "SMS" : null].filter(Boolean).join(" + ");
                setHistory((h) => [
                  {
                    id: `bc-${Date.now()}`,
                    title,
                    segment: `${tier === "all" ? "All tiers" : tier} · ${state === "all" ? "All states" : state}`,
                    channels,
                    at: new Date().toISOString(),
                    sent: result.sent,
                  },
                  ...h,
                ]);
                toast.success(`Broadcast sent to ${result.sent} merchants`);
                setTitle("");
                setBody("");
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
            Recent (this session)
          </p>
          {history.length ? (
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="text-[12px]">
                  <p className="font-semibold">{h.title}</p>
                  <p style={{ color: T.sub }}>
                    {h.segment} · {h.channels}
                    {h.sent != null ? ` · ${h.sent} sent` : ""}
                  </p>
                  <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(h.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px]" style={{ color: T.muted }}>
              No broadcasts sent this session.
            </p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
