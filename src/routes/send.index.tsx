import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { useState } from "react";
import { ChevronLeft, Search, UserPlus, Star, Building2, Smartphone, ScanLine } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/send/")({
  head: () => ({ meta: [{ title: "Send to China — MagnetPay" }] }),
  component: SendRecipients,
});

type Recipient = {
  id: string; name: string; sub: string;
  channel: "bank" | "alipay" | "wechat" | "unionpay";
  initial: string; last?: string; starred?: boolean;
};

const CHANNEL_META = {
  bank: { label: "Bank · ICBC", I: Building2, tint: "#0E3B2E" },
  alipay: { label: "Alipay", I: Smartphone, tint: "#1677FF" },
  wechat: { label: "WeChat Pay", I: Smartphone, tint: "#07C160" },
  unionpay: { label: "UnionPay", I: Building2, tint: "#C2410C" },
} as const;

const RECIPIENTS: Recipient[] = [
  { id: "1", name: "Wei Chen", sub: "Shenzhen Electronics Co.", channel: "bank", initial: "WC", last: "Paid ¥8,400 · 3 days ago", starred: true },
  { id: "2", name: "Guangzhou Huayi Textiles", sub: "Supplier · verified", channel: "unionpay", initial: "GH", last: "Paid ¥18,400 · last week", starred: true },
  { id: "3", name: "Liu Mei", sub: "Yiwu sourcing agent", channel: "alipay", initial: "LM", last: "Paid ¥1,200 · 2 weeks ago" },
  { id: "4", name: "Foshan Ceramics Ltd.", sub: "Order #A-1241", channel: "bank", initial: "FC" },
  { id: "5", name: "Zhang Hao", sub: "Logistics · Shanghai", channel: "wechat", initial: "ZH" },
  { id: "6", name: "Hangzhou Smart Tools", sub: "New supplier", channel: "bank", initial: "HS" },
];

function SendRecipients() {
  useRoleGuard(["buyer", "both"], "Sending CNY to China isn't available for seller accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = RECIPIENTS.filter((r) =>
    !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.sub.toLowerCase().includes(q.toLowerCase())
  );
  const starred = filtered.filter((r) => r.starred);
  const all = filtered.filter((r) => !r.starred);

  const pick = (r: Recipient) =>
    navigate({ to: "/send/amount", search: { rid: r.id, name: r.name, channel: r.channel } });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Send to 🇨🇳</p>
              <p className="text-[13px] font-bold">Pick recipient</p>
            </div>
            <button className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ScanLine className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl flex items-center gap-2 px-3.5 h-12" style={{ background: surface, border: `1px solid ${border}` }}>
              <Search className="size-4" style={{ color: muted }} strokeWidth={2.4} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, bank or Alipay ID"
                className="flex-1 bg-transparent outline-none text-[13px]" />
            </div>

            <Link to="/send/details" search={{ rid: "new", name: "New recipient", channel: "bank" as const }}
              className="mt-3 flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: `${accent}10`, border: `1px dashed ${accent}55` }}>
              <div className="size-10 rounded-full grid place-items-center" style={{ background: accent, color: "#fff" }}>
                <UserPlus className="size-5" strokeWidth={2.3} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">Add new recipient</p>
                <p className="text-[10.5px]" style={{ color: sub }}>Bank · Alipay · WeChat · UnionPay</p>
              </div>
            </Link>
          </section>

          {starred.length > 0 && (
            <Section title="Saved" muted={muted}>
              {starred.map((r) => <Row key={r.id} r={r} onPick={pick} surface={surface} border={border} ink={ink} sub={sub} muted={muted} />)}
            </Section>
          )}

          {all.length > 0 && (
            <Section title="Recent & contacts" muted={muted}>
              {all.map((r) => <Row key={r.id} r={r} onPick={pick} surface={surface} border={border} ink={ink} sub={sub} muted={muted} />)}
            </Section>
          )}

          {filtered.length === 0 && (
            <section className="px-4 mt-8 text-center">
              <p className="text-[12px]" style={{ color: muted }}>No matches. Tap "Add new recipient".</p>
            </section>
          )}
        </div>
      </PhoneFrame>
    </>
  );
}

function Section({ title, children, muted }: { title: string; children: React.ReactNode; muted: string }) {
  return (
    <section className="px-4 mt-5">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>{title}</p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ r, onPick, surface, border, ink, sub, muted }: any) {
  const m = CHANNEL_META[r.channel as keyof typeof CHANNEL_META];
  return (
    <button onClick={() => onPick(r)} className="w-full flex items-center gap-3 p-3 rounded-2xl text-left active:scale-[0.99] transition"
      style={{ background: surface, border: `1px solid ${border}` }}>
      <div className="size-11 rounded-full grid place-items-center text-[12px] font-bold text-white relative" style={{ background: m.tint }}>
        {r.initial}
        {r.starred && (
          <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full grid place-items-center bg-white">
            <Star className="size-2.5 fill-amber-400 text-amber-400" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: ink }}>{r.name}</p>
        <p className="text-[10.5px] truncate" style={{ color: sub }}>{r.sub}</p>
        {r.last && <p className="text-[10px] mt-0.5" style={{ color: muted }}>{r.last}</p>}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold" style={{ color: m.tint }}>{m.label}</p>
      </div>
    </button>
  );
}
