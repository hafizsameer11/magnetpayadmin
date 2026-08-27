import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Boxes, MessageCircle, Store, User } from "lucide-react";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

type Key = "home" | "catalog" | "add" | "storefront" | "profile";

export function SellerNav({ active }: { active: Key }) {
  const t = escrowTheme;
  const items = [
    { k: "home" as const, I: LayoutDashboard, l: "Home", to: "/seller" as const },
    { k: "catalog" as const, I: Boxes, l: "Catalog", to: "/seller/catalog" as const },
    { k: "add" as const, I: MessageCircle, l: "Chat", to: "/messages" as const, primary: true },
    { k: "storefront" as const, I: Store, l: "Shop", to: "/seller/storefront" as const },
    { k: "profile" as const, I: User, l: "You", to: "/me" as const },
  ];
  return (
    <div className="relative">
      <div className="h-8 -mb-1" style={{ background: `linear-gradient(to top, ${t.bg} 30%, ${t.bg}00 100%)` }} />
      <nav className="px-4 pb-5" style={{ background: t.bg }}>
        <div className="relative flex items-center justify-between rounded-full px-2 py-2"
          style={{ background: t.navy, boxShadow: `0 12px 30px -10px ${t.navy}80, 0 0 0 1px rgba(255,255,255,0.06) inset` }}>
          {items.map(({ k, I, l, to, primary }) => {
            const on = active === k;
            if (primary) {
              return (
                <Link key={k} to={to} className="grid place-items-center -my-3 size-12 rounded-full shrink-0"
                  style={{ background: t.accent, boxShadow: `0 12px 24px -8px ${t.accent}80` }}>
                  <I className="size-5 text-white" strokeWidth={2.6} />
                </Link>
              );
            }
            return (
              <Link key={k} to={to}
                className="flex-1 flex flex-col items-center gap-0.5 py-1"
                style={{ color: on ? "#fff" : "rgba(255,255,255,0.6)" }}>
                <I className="size-[18px]" strokeWidth={2.4} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{l}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
