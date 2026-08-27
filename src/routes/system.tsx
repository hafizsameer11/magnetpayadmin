import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  Wallet, Package, ShieldCheck, Truck, Inbox, Loader2, AlertTriangle,
  WifiOff, Wrench, Download, CheckCircle2, RefreshCw, ArrowRight, ChevronLeft,
  Plus, MessageSquare,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

type StateKey =
  | "empty-wallet" | "empty-orders" | "empty-escrow" | "empty-shipments" | "empty-inbox"
  | "loading" | "error" | "offline" | "maintenance" | "force-update" | "success";

const ORDER: StateKey[] = [
  "empty-wallet", "empty-orders", "empty-escrow", "empty-shipments", "empty-inbox",
  "loading", "error", "offline", "maintenance", "force-update", "success",
];

const LABELS: Record<StateKey, string> = {
  "empty-wallet": "Empty · Wallet",
  "empty-orders": "Empty · Orders",
  "empty-escrow": "Empty · Escrow",
  "empty-shipments": "Empty · Shipments",
  "empty-inbox": "Empty · Inbox",
  "loading": "Loading",
  "error": "Error · Retry",
  "offline": "Offline",
  "maintenance": "Maintenance",
  "force-update": "Force update",
  "success": "Success · Receipt",
};

export const Route = createFileRoute("/system")({
  head: () => ({ meta: [{ title: "System states — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>): { state: StateKey } => ({
    state: ORDER.includes(s.state as StateKey) ? (s.state as StateKey) : "empty-wallet",
  }),
  component: SystemStates,
});

const t = {
  navy: "#0E3B2E", bg: "#F6F1E7", surface: "#FFFFFF", border: "#E7DFCE",
  ink: "#1B1A17", sub: "#5B5749", muted: "#8A8472",
  accent: "#C2410C", success: "#0F766E", info: "#1E40AF", danger: "#B91C1C", warn: "#A16207",
};

function SystemStates() {
  const { state } = useSearch({ from: "/system" }) as { state: StateKey };
  const idx = ORDER.indexOf(state);
  const prev = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
  const next = ORDER[(idx + 1) % ORDER.length];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-24" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between" style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}>
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>System state</p>
              <p className="text-[13px] font-bold">{LABELS[state]}</p>
            </div>
            <div className="text-[10px] tabular-nums px-2 py-1 rounded-full" style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.sub, fontFamily: "'JetBrains Mono', monospace" }}>
              {idx + 1}/{ORDER.length}
            </div>
          </header>

          {/* Picker */}
          <div className="px-4 pt-3 pb-2 overflow-x-auto">
            <div className="flex gap-1.5 w-max">
              {ORDER.map((k) => (
                <Link key={k} to="/system" search={{ state: k }}
                  className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
                  style={{
                    background: k === state ? t.navy : t.surface,
                    color: k === state ? "#fff" : t.sub,
                    border: `1px solid ${k === state ? t.navy : t.border}`,
                  }}>
                  {LABELS[k]}
                </Link>
              ))}
            </div>
          </div>

          <section className="px-4 mt-3">
            {state === "empty-wallet" && (
              <Empty Icon={Wallet} title="Fund your wallet" body="Add NGN, USD, or CNY to start sending, paying suppliers, or holding funds in escrow." primary={{ to: "/deposit", label: "Add money" }} secondary={{ to: "/home", label: "Learn how it works" }} />
            )}
            {state === "empty-orders" && (
              <Empty Icon={Package} title="No orders yet" body="When you buy from the marketplace, your orders appear here with live status and documents." primary={{ to: "/market", label: "Browse marketplace" }} secondary={{ to: "/home", label: "Back to home" }} />
            )}
            {state === "empty-escrow" && (
              <Empty Icon={ShieldCheck} title="Start your first escrow" body="Hold funds safely until your supplier ships and you confirm receipt. Releases happen only when conditions are met." primary={{ to: "/escrow/new", label: "New escrow" }} secondary={{ to: "/escrow", label: "See how escrow works" }} />
            )}
            {state === "empty-shipments" && (
              <Empty Icon={Truck} title="No shipments tracked" body="Book a quote with a freight partner or attach an existing tracking number to monitor your goods." primary={{ to: "/logistics/quote", label: "Get a quote" }} secondary={{ to: "/logistics", label: "View logistics hub" }} />
            )}
            {state === "empty-inbox" && (
              <Empty Icon={Inbox} title="Inbox is clear" body="Messages with suppliers, buyers, and the MagnetPay team will appear here." primary={{ to: "/messages", label: "Start a message" }} />
            )}

            {state === "loading" && <Loading />}
            {state === "error" && <ErrorRetry />}
            {state === "offline" && <Offline />}
            {state === "maintenance" && <Maintenance />}
            {state === "force-update" && <ForceUpdate />}
            {state === "success" && <SuccessReceipt />}
          </section>

          {/* Prev / Next */}
          <div className="px-4 mt-6 grid grid-cols-2 gap-2">
            <Link to="/system" search={{ state: prev }}
              className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} /> Prev
            </Link>
            <Link to="/system" search={{ state: next }}
              className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
              style={{ background: t.navy, color: "#fff" }}>
              Next <ArrowRight className="size-4" strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl p-5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>{children}</div>;
}

function Empty({
  Icon, title, body, primary, secondary,
}: {
  Icon: typeof Wallet; title: string; body: string;
  primary: { to: string; label: string };
  secondary?: { to: string; label: string };
}) {
  return (
    <Card>
      <div className="size-14 rounded-2xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
        <Icon className="size-6" strokeWidth={2.2} />
      </div>
      <h2 className="mt-3 text-[18px] font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: t.sub }}>{body}</p>
      <div className="mt-4 space-y-2">
        <a href={primary.to} className="block h-11 rounded-2xl text-center leading-[44px] text-[12.5px] font-bold" style={{ background: t.navy, color: "#fff" }}>
          <span className="inline-flex items-center gap-1.5"><Plus className="size-4" strokeWidth={2.6} />{primary.label}</span>
        </a>
        {secondary && (
          <a href={secondary.to} className="block h-11 rounded-2xl text-center leading-[44px] text-[12.5px] font-bold" style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.ink }}>
            {secondary.label}
          </a>
        )}
      </div>
    </Card>
  );
}

function Loading() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" style={{ color: t.navy }} strokeWidth={2.6} />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Loading</p>
      </div>
      <div className="mt-4 space-y-3">
        <Skel w="60%" h={14} />
        <Skel w="100%" h={56} />
        <Skel w="100%" h={56} />
        <Skel w="40%" h={14} />
        <div className="grid grid-cols-2 gap-2">
          <Skel w="100%" h={72} />
          <Skel w="100%" h={72} />
        </div>
      </div>
    </Card>
  );
}

function Skel({ w, h }: { w: string; h: number }) {
  return <div className="rounded-xl animate-pulse" style={{ width: w, height: h, background: t.bg, border: `1px solid ${t.border}` }} />;
}

function ErrorRetry() {
  const [retrying, setRetrying] = useState(false);
  return (
    <Card>
      <div className="size-14 rounded-2xl grid place-items-center" style={{ background: `${t.danger}12`, color: t.danger }}>
        <AlertTriangle className="size-6" strokeWidth={2.2} />
      </div>
      <h2 className="mt-3 text-[18px] font-bold tracking-tight">Something went wrong</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: t.sub }}>
        We couldn't load this page. Your funds are safe — this is a display issue only.
      </p>
      <div className="mt-3 rounded-xl px-3 py-2 text-[10.5px] font-mono" style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>
        ref · ERR-AX42-7910 · code 500
      </div>
      <div className="mt-4 space-y-2">
        <button onClick={() => { setRetrying(true); setTimeout(() => setRetrying(false), 1200); }}
          className="w-full h-11 rounded-2xl text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5"
          style={{ background: t.navy, color: "#fff" }}>
          {retrying ? <Loader2 className="size-4 animate-spin" strokeWidth={2.6} /> : <RefreshCw className="size-4" strokeWidth={2.6} />}
          {retrying ? "Retrying…" : "Try again"}
        </button>
        <Link to="/help" className="block h-11 rounded-2xl text-center leading-[44px] text-[12.5px] font-bold" style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.ink }}>
          <span className="inline-flex items-center gap-1.5"><MessageSquare className="size-4" strokeWidth={2.4} />Contact support</span>
        </Link>
      </div>
    </Card>
  );
}

function Offline() {
  return (
    <Card>
      <div className="size-14 rounded-2xl grid place-items-center" style={{ background: `${t.warn}15`, color: t.warn }}>
        <WifiOff className="size-6" strokeWidth={2.2} />
      </div>
      <h2 className="mt-3 text-[18px] font-bold tracking-tight">You're offline</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: t.sub }}>
        Check your connection. Cached balances and recent orders are still available below.
      </p>
      <div className="mt-3 rounded-xl p-3" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Last synced</p>
        <p className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Today · 14:02</p>
      </div>
      <button className="mt-4 w-full h-11 rounded-2xl text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5"
        style={{ background: t.navy, color: "#fff" }}>
        <RefreshCw className="size-4" strokeWidth={2.6} /> Retry connection
      </button>
    </Card>
  );
}

function Maintenance() {
  return (
    <Card>
      <div className="size-14 rounded-2xl grid place-items-center" style={{ background: `${t.info}12`, color: t.info }}>
        <Wrench className="size-6" strokeWidth={2.2} />
      </div>
      <h2 className="mt-3 text-[18px] font-bold tracking-tight">Scheduled maintenance</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: t.sub }}>
        We're upgrading our payment rails. New transfers are paused. Existing escrows and balances are unaffected.
      </p>
      <div className="mt-3 rounded-xl p-3 space-y-1.5" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
        <Row label="Window" value="Sat 02:00 – 04:00 WAT" />
        <Row label="Affected" value="Send, FX, Deposits" />
        <Row label="Available" value="Wallet, Orders, Escrow read" />
      </div>
      <Link to="/help" className="mt-4 block h-11 rounded-2xl text-center leading-[44px] text-[12.5px] font-bold" style={{ background: t.navy, color: "#fff" }}>
        Status page
      </Link>
    </Card>
  );
}

function ForceUpdate() {
  return (
    <Card>
      <div className="size-14 rounded-2xl grid place-items-center" style={{ background: `${t.accent}15`, color: t.accent }}>
        <Download className="size-6" strokeWidth={2.2} />
      </div>
      <h2 className="mt-3 text-[18px] font-bold tracking-tight">Update required</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: t.sub }}>
        This version is no longer supported. Update MagnetPay to continue using your wallet, escrow, and shipments.
      </p>
      <div className="mt-3 rounded-xl p-3 space-y-1.5" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
        <Row label="Installed" value="v 2.4.1" />
        <Row label="Required" value="v 2.6.0" />
        <Row label="Size" value="38 MB" />
      </div>
      <button className="mt-4 w-full h-11 rounded-2xl text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5"
        style={{ background: t.navy, color: "#fff" }}>
        <Download className="size-4" strokeWidth={2.6} /> Update now
      </button>
    </Card>
  );
}

function SuccessReceipt() {
  const ref = "MP-RC-9921-3380";
  return (
    <Card>
      <div className="size-16 rounded-full grid place-items-center mx-auto" style={{ background: `${t.success}1a`, color: t.success }}>
        <CheckCircle2 className="size-9" strokeWidth={2.2} />
      </div>
      <h2 className="mt-3 text-[20px] font-bold tracking-tight text-center">Done</h2>
      <p className="mt-1 text-[12.5px] text-center" style={{ color: t.sub }}>Your action completed successfully.</p>

      <div className="mt-4 rounded-xl p-3 space-y-1.5" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
        <Row label="Reference" value={ref} mono />
        <Row label="Amount" value="¥ 12,400.00" mono />
        <Row label="When" value="Today · 14:08" />
        <Row label="Status" value="Settled" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="h-11 rounded-2xl text-[12px] font-bold" style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.ink }}>
          Share receipt
        </button>
        <Link to="/home" className="h-11 rounded-2xl text-[12px] font-bold inline-flex items-center justify-center" style={{ background: t.navy, color: "#fff" }}>
          Done
        </Link>
      </div>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: t.muted }}>{label}</span>
      <span className="text-[12.5px] font-bold" style={{ color: t.ink, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{value}</span>
    </div>
  );
}
