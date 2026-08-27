import { createFileRoute, Link } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronLeft, Search, UserPlus, Star, Building2, Smartphone, CreditCard, MoreHorizontal } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/recipients/")({
  head: () => ({ meta: [{ title: "Recipients — MagnetPay" }] }),
  component: Recipients,
});

type Channel = "bank_cn" | "alipay" | "wechat" | "wire_usd";

const META: Record<Channel, { label: string; I: any; tint: string }> = {
  bank_cn:  { label: "CN bank",   I: Building2,  tint: "#0E3B2E" },
  alipay:   { label: "Alipay",    I: Smartphone, tint: "#1677FF" },
  wechat:   { label: "WeChat",    I: Smartphone, tint: "#07C160" },
  wire_usd: { label: "USD wire",  I: CreditCard, tint: "#C2410C" },
};

const LIST = [
  { id: "1", name: "Wei Chen",                sub: "Shenzhen Electronics Co.", channel: "bank_cn" as const, initial: "WC", last: "Paid ¥8,400 · 3d ago", starred: true },
  { id: "2", name: "Guangzhou Huayi Textiles",sub: "Supplier · verified",      channel: "bank_cn" as const, initial: "GH", last: "Paid ¥18,400 · 1w ago", starred: true },
  { id: "3", name: "Liu Mei",                 sub: "Yiwu sourcing agent",      channel: "alipay"  as const, initial: "LM", last: "Paid ¥1,200 · 2w ago" },
  { id: "4", name: "Foshan Ceramics Ltd.",    sub: "Order #A-1241",            channel: "bank_cn" as const, initial: "FC" },
  { id: "5", name: "Zhang Hao",               sub: "Logistics · Shanghai",     channel: "wechat"  as const, initial: "ZH" },
  { id: "6", name: "Apex Trading LLC",        sub: "USD wire · Delaware",      channel: "wire_usd" as const, initial: "AT", last: "Paid $4,200 · 5d ago" },
  { id: "7", name: "Hangzhou Smart Tools",    sub: "New supplier",             channel: "bank_cn" as const, initial: "HS" },
];

function Recipients() {
  useRoleGuard(["buyer", "both"], "Recipients are only used for buyer accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | Channel>("all");

  const tabs: { id: "all" | Channel; label: string }[] = [
    { id: "all", label: "All" },
    { id: "bank_cn", label: "CN bank" },
    { id: "alipay", label: "Alipay" },
    { id: "wechat", label: "WeChat" },
    { id: "wire_usd", label: "USD wire" },
  ];

  const filtered = LIST.filter((r) =>
    (tab === "all" || r.channel === tab) &&
    (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.sub.toLowerCase().includes(q.toLowerCase()))
  );
  const starred = filtered.filter((r) => r.starred);
  const rest = filtered.filter((r) => !r.starred);

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Recipients</p>
              <p className="text-[13px] font-bold">Beneficiaries</p>
            </div>
            <Link to="/recipients/new" className="size-9 grid place-items-center rounded-full" style={{ background: navy, color: "#fff" }}>
              <UserPlus className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl flex items-center gap-2 px-3.5 h-12" style={{ background: surface, border: `1px solid ${border}` }}>
              <Search className="size-4" style={{ color: muted }} strokeWidth={2.4} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipients"
                className="flex-1 bg-transparent outline-none text-[13px]" />
            </div>

            <div className="mt-3 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {tabs.map((t) => {
                const active = t.id === tab;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition"
                    style={{
                      background: active ? navy : surface,
                      color: active ? "#fff" : sub,
                      border: `1px solid ${active ? navy : border}`,
                    }}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          {starred.length > 0 && (
            <Section title="Saved" muted={muted}>
              {starred.map((r) => <Row key={r.id} r={r} surface={surface} border={border} ink={ink} sub={sub} muted={muted} accent={accent} />)}
            </Section>
          )}
          {rest.length > 0 && (
            <Section title="All recipients" muted={muted}>
              {rest.map((r) => <Row key={r.id} r={r} surface={surface} border={border} ink={ink} sub={sub} muted={muted} accent={accent} />)}
            </Section>
          )}
          {filtered.length === 0 && (
            <p className="px-4 mt-8 text-center text-[12px]" style={{ color: muted }}>No matches. Tap + to add a new recipient.</p>
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

function Row({ r, surface, border, ink, sub, muted, accent }: any) {
  const m = META[r.channel as Channel];
  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-2xl"
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
      <Link to="/send/amount" search={{ rid: r.id, name: r.name, channel: r.channel === "wire_usd" ? "bank" : r.channel === "bank_cn" ? "bank" : r.channel }}
        className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: `${accent}14`, color: accent }}>
        Pay
      </Link>
      <button onClick={() => toast(`${r.name}`, { description: "Edit · Star · Delete coming soon" })}
        aria-label="More actions" className="size-7 grid place-items-center rounded-full" style={{ color: muted }}>
        <MoreHorizontal className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}
