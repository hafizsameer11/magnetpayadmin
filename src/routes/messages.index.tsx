import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search, Filter, ShieldCheck, FileText, Package2, Pin } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/messages/")({
  head: () => ({ meta: [{ title: "Messages — MagnetPay" }] }),
  component: Inbox,
});

type Tab = "all" | "quotes" | "orders" | "escrow";

type Thread = {
  id: string;
  who: string;
  role: "Supplier" | "Buyer" | "Mediator";
  last: string;
  time: string;
  unread: number;
  online?: boolean;
  pinned?: boolean;
  attach?: { kind: "quote" | "order" | "escrow"; ref: string; meta: string };
  tab: Exclude<Tab, "all">;
};

const THREADS: Thread[] = [
  {
    id: "t1",
    who: "Guangzhou Huayi Co.",
    role: "Supplier",
    last: "We can do ¥51 at 300 units, same terms. Crate packing.",
    time: "14:18",
    unread: 2,
    online: true,
    pinned: true,
    attach: { kind: "quote", ref: "Q-441", meta: "¥51/unit · 21d" },
    tab: "quotes",
  },
  {
    id: "t2",
    who: "Adaeze · Mediator",
    role: "Mediator",
    last: "Could you confirm the carton numbers affected?",
    time: "12:05",
    unread: 1,
    online: true,
    attach: { kind: "escrow", ref: "E-2204", meta: "Dispute D-4421" },
    tab: "escrow",
  },
  {
    id: "t3",
    who: "Shenzhen Lumica",
    role: "Supplier",
    last: "Samples shipped via SF Express, tracking SF1281...",
    time: "10:42",
    unread: 0,
    attach: { kind: "order", ref: "O-1187", meta: "Sample · 5 pcs" },
    tab: "orders",
  },
  {
    id: "t4",
    who: "Wenzhou Marine",
    role: "Supplier",
    last: "Updated proforma attached. Lead time confirmed at 18 days.",
    time: "Yest",
    unread: 0,
    attach: { kind: "quote", ref: "Q-438", meta: "¥58/unit · 18d" },
    tab: "quotes",
  },
  {
    id: "t5",
    who: "Adekunle Logistics",
    role: "Supplier",
    last: "Container at Apapa. Customs cleared 09:20.",
    time: "Yest",
    unread: 0,
    attach: { kind: "order", ref: "O-1162", meta: "FOB · LCL" },
    tab: "orders",
  },
  {
    id: "t6",
    who: "Shanghai PumpCo",
    role: "Supplier",
    last: "Thank you. We will reduce to ¥49 if 400+ units.",
    time: "Mar 22",
    unread: 0,
    tab: "quotes",
  },
];

function Inbox() {
  const t = escrowTheme;
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const tabs: { k: Tab; l: string; n: number }[] = [
    { k: "all", l: "All", n: THREADS.length },
    { k: "quotes", l: "Quotes", n: THREADS.filter((x) => x.tab === "quotes").length },
    { k: "orders", l: "Orders", n: THREADS.filter((x) => x.tab === "orders").length },
    { k: "escrow", l: "Escrow", n: THREADS.filter((x) => x.tab === "escrow").length },
  ];

  const list = THREADS.filter(
    (x) =>
      (tab === "all" || x.tab === tab) &&
      (q === "" || (x.who + " " + x.last).toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-10"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header
            className="px-4 pt-12 pb-3 flex items-center justify-between sticky top-0 z-20"
            style={{ background: t.bg, borderBottom: `1px solid ${t.border}` }}
          >
            <Link
              to="/home"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: t.muted }}
              >
                Inbox
              </p>
              <p className="text-[14px] font-bold">Messages</p>
            </div>
            <button
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.sub }}
            >
              <Filter className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          <section className="px-4 pt-3">
            <div
              className="flex items-center gap-2 h-11 px-3 rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search people, quotes, orders…"
                className="flex-1 bg-transparent outline-none text-[12.5px]"
                style={{ color: t.ink }}
              />
            </div>
          </section>

          <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
            {tabs.map((x) => {
              const on = tab === x.k;
              return (
                <button
                  key={x.k}
                  onClick={() => setTab(x.k)}
                  className="shrink-0 h-8 px-3 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                  style={{
                    background: on ? t.navy : t.surface,
                    color: on ? "#fff" : t.sub,
                    border: `1px solid ${on ? t.navy : t.border}`,
                  }}
                >
                  {x.l}
                  <span
                    className="text-[9.5px] tabular-nums px-1.5 rounded-full"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: on ? "rgba(255,255,255,0.18)" : `${t.muted}15`,
                      color: on ? "#fff" : t.muted,
                    }}
                  >
                    {x.n}
                  </span>
                </button>
              );
            })}
          </section>

          <section className="px-4 mt-3 space-y-2">
            {list.map((th) => (
              <Link
                key={th.id}
                to="/messages/$id"
                params={{ id: th.id }}
                className="block rounded-2xl p-3"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div
                      className="size-10 rounded-full grid place-items-center text-[12px] font-bold"
                      style={{
                        background:
                          th.role === "Mediator"
                            ? `${t.info}15`
                            : th.role === "Buyer"
                              ? `${t.accent}15`
                              : `${t.navy}10`,
                        color:
                          th.role === "Mediator"
                            ? t.info
                            : th.role === "Buyer"
                              ? t.accent
                              : t.navy,
                      }}
                    >
                      {th.who
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    {th.online && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full"
                        style={{ background: t.success, boxShadow: `0 0 0 2px ${t.surface}` }}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-bold truncate flex-1">{th.who}</p>
                      {th.pinned && (
                        <Pin
                          className="size-3 shrink-0"
                          strokeWidth={2.4}
                          style={{ color: t.muted }}
                        />
                      )}
                      <p
                        className="text-[10px] tabular-nums shrink-0"
                        style={{
                          color: th.unread ? t.accent : t.muted,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {th.time}
                      </p>
                    </div>
                    <p
                      className="text-[9.5px] font-bold uppercase tracking-[0.12em] mt-0.5"
                      style={{
                        color:
                          th.role === "Mediator"
                            ? t.info
                            : th.role === "Buyer"
                              ? t.accent
                              : t.muted,
                      }}
                    >
                      {th.role}
                    </p>
                    <p
                      className="text-[12px] leading-snug mt-1 line-clamp-2"
                      style={{ color: th.unread ? t.ink : t.sub }}
                    >
                      {th.last}
                    </p>

                    {th.attach && (
                      <div
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1"
                        style={{
                          background: t.bg,
                          border: `1px solid ${t.border}`,
                          color: t.sub,
                        }}
                      >
                        {th.attach.kind === "quote" && (
                          <FileText
                            className="size-3"
                            strokeWidth={2.4}
                            style={{ color: t.accent }}
                          />
                        )}
                        {th.attach.kind === "order" && (
                          <Package2
                            className="size-3"
                            strokeWidth={2.4}
                            style={{ color: t.navy }}
                          />
                        )}
                        {th.attach.kind === "escrow" && (
                          <ShieldCheck
                            className="size-3"
                            strokeWidth={2.4}
                            style={{ color: t.info }}
                          />
                        )}
                        <span className="text-[10px] font-bold">{th.attach.ref}</span>
                        <span
                          className="text-[10px] tabular-nums"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: t.muted }}
                        >
                          · {th.attach.meta}
                        </span>
                      </div>
                    )}
                  </div>

                  {th.unread > 0 && (
                    <span
                      className="shrink-0 min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center text-white tabular-nums"
                      style={{
                        background: t.accent,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {th.unread}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {list.length === 0 && (
              <p
                className="text-center text-[11.5px] py-12"
                style={{ color: t.muted }}
              >
                No conversations match.
              </p>
            )}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
