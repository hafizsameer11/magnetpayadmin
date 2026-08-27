import { Link } from "@tanstack/react-router";
import { Home, Ship, Store, ShieldCheck, User } from "lucide-react";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

const items = [
  { key: "home", label: "Home", icon: Home, to: "/home" as const },
  { key: "logistics", label: "Logistics", icon: Ship, to: "/logistics" as const },
  { key: "market", label: "Market", icon: Store, to: "/market" as const },
  { key: "escrow", label: "Escrow", icon: ShieldCheck, to: "/escrow" as const },
  { key: "profile", label: "You", icon: User, to: "/me" as const },
] as const;

export function BottomNav({ active = "home" }: { active?: (typeof items)[number]["key"] }) {
  const t = escrowTheme;
  return (
    <div className="relative">
      <div
        className="h-8 -mb-1"
        style={{ background: `linear-gradient(to top, ${t.bg} 30%, ${t.bg}00 100%)` }}
      />
      <nav className="px-4 pb-5" style={{ background: t.bg }}>
        <div
          className="relative flex items-center justify-between rounded-full px-2 py-2"
          style={{
            background: t.navy,
            boxShadow: `0 12px 30px -10px ${t.navy}80, 0 0 0 1px rgba(255,255,255,0.06) inset`,
          }}
        >
          {items.map(({ key, label, icon: Icon, to }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                to={to}
                className="relative flex items-center gap-1.5 rounded-full transition-all"
                style={{
                  padding: on ? "8px 14px" : "8px 10px",
                  background: on ? "#FFFFFF" : "transparent",
                  color: on ? t.navy : "rgba(255,255,255,0.65)",
                }}
              >
                <Icon className="size-[18px]" strokeWidth={2.4} />
                {on && <span className="text-[11px] font-bold tracking-tight">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
