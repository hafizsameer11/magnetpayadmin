import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, Bell, ShieldCheck, Ship, Banknote, TrendingUp,
  Package, MessageCircle, AlertCircle, CheckCheck, Settings,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MagnetPay" }] }),
  component: NotificationsPage,
});

type N = {
  id: string;
  I: typeof Bell;
  tint: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  to?: string;
};

function NotificationsPage() {
  const navy = "#0E3B2E";
  const bg = "#F6F1E7";
  const surface = "#FFFFFF";
  const border = "#E7DFCE";
  const accent = "#C2410C";
  const ink = "#1B1A17";
  const sub = "#5B5749";
  const muted = "#8A8472";
  const success = "#0E7C5C";

  const initial: N[] = [
    { id: "n1", I: TrendingUp, tint: accent, title: "FX rate alert · CNY/NGN", body: "Your target 224.50 hit. Lock in before 6pm.", time: "2m", unread: true, to: "/fx" },
    { id: "n2", I: ShieldCheck, tint: navy, title: "Escrow E-771 funded", body: "¥48,200 held. Awaiting shipment scan.", time: "18m", unread: true, to: "/escrow" },
    { id: "n3", I: Banknote, tint: success, title: "Payout ready", body: "₦12,480,000 cleared to GTBank ••4421.", time: "1h", unread: true, to: "/withdraw" },
    { id: "n4", I: Ship, tint: navy, title: "Shipment SH-2241 cleared customs", body: "Apapa, Lagos · ETA Mon, Jul 1.", time: "3h", to: "/logistics" },
    { id: "n5", I: Package, tint: sub, title: "Order #M-10238 confirmed", body: "Hangzhou Magnetics Co. accepted.", time: "5h", to: "/market" },
    { id: "n6", I: MessageCircle, tint: sub, title: "Tunde sent a message", body: "“Can we move pickup to Saturday?”", time: "Yesterday", to: "/messages" },
    { id: "n7", I: AlertCircle, tint: "#B45309", title: "KYC document expiring", body: "Re-upload utility bill within 14 days.", time: "2d", to: "/me" },
  ];

  const [items, setItems] = useState<N[]>(initial);
  const unread = items.filter((n) => n.unread).length;
  const markAll = () => setItems((xs) => xs.map((x) => ({ ...x, unread: false })));

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={navy}>
        <div
          className="relative min-h-full pb-16"
          style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to="/home"
              aria-label="Back"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: muted }}>
                Inbox
              </p>
              <h1 className="text-[15px] font-extrabold leading-tight">Notifications</h1>
            </div>
            <Link
              to="/settings/notifications"
              aria-label="Notification settings"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <Settings className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          <section className="px-4 mt-1 flex items-center justify-between">
            <p className="text-[12px]" style={{ color: sub }}>
              <span className="font-bold" style={{ color: ink }}>{unread}</span> unread
            </p>
            <button
              onClick={markAll}
              className="text-[11.5px] font-bold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ background: surface, border: `1px solid ${border}`, color: navy }}
            >
              <CheckCheck className="size-3.5" strokeWidth={2.6} /> Mark all read
            </button>
          </section>

          <section className="px-4 mt-3 space-y-2">
            {items.map((n) => {
              const Row = (
                <div
                  className="flex items-start gap-3 p-3 rounded-2xl"
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    boxShadow: n.unread ? `inset 3px 0 0 ${n.tint}` : undefined,
                  }}
                >
                  <div
                    className="size-9 grid place-items-center rounded-xl shrink-0"
                    style={{ background: `${n.tint}14`, color: n.tint }}
                  >
                    <n.I className="size-4" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold truncate">{n.title}</p>
                      {n.unread && <span className="size-1.5 rounded-full shrink-0" style={{ background: accent }} />}
                    </div>
                    <p className="text-[12px] mt-0.5 leading-snug" style={{ color: sub }}>
                      {n.body}
                    </p>
                    <p className="text-[10.5px] mt-1 font-bold uppercase tracking-wider" style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {n.time}
                    </p>
                  </div>
                </div>
              );
              return n.to ? (
                <Link key={n.id} to={n.to} className="block active:opacity-80">
                  {Row}
                </Link>
              ) : (
                <div key={n.id}>{Row}</div>
              );
            })}
          </section>

          <p className="text-center text-[10.5px] mt-6" style={{ color: muted }}>
            You’re all caught up.
          </p>
        </div>
      </PhoneFrame>
    </>
  );
}
