import { Loader2, CheckCircle2, Package, ShieldCheck } from "lucide-react";

const orders = [
  {
    title: "Industrial Pump Parts",
    route: "Guangzhou → Lagos · Sea",
    status: "In Escrow",
    progress: 35,
    amount: "¥12,400",
    tone: "primary" as const,
    icon: ShieldCheck,
  },
  {
    title: "Textile Batch #442",
    route: "Apapa Port · Cleared",
    status: "Released",
    progress: 95,
    amount: "$1,850",
    tone: "success" as const,
    icon: CheckCircle2,
  },
  {
    title: "Solar Inverters Lot 09",
    route: "Funded · Awaiting dispatch",
    status: "Funded",
    progress: 15,
    amount: "¥8,920",
    tone: "secondary" as const,
    icon: Loader2,
    spin: true,
  },
];

const toneStyles = {
  primary: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    badge: "bg-primary/10 text-primary",
    bar: "bg-primary",
  },
  secondary: {
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    badge: "bg-secondary/10 text-secondary",
    bar: "bg-secondary",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    badge: "bg-success/10 text-success",
    bar: "bg-success",
  },
} as const;

export function ActiveOrders() {
  return (
    <section className="px-6 mt-10 animate-[reveal_600ms_var(--ease-out-expo)_240ms_both]">
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-bold">Escrows & Trades</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            {orders.length} active
          </span>
        </div>
        <button className="text-primary text-xs font-bold">View All</button>
      </div>
      <div className="space-y-3">
        {orders.map((o) => {
          const s = toneStyles[o.tone];
          const Icon = o.icon;
          return (
            <div
              key={o.title}
              className="bg-card border border-border rounded-3xl p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${s.iconBg}`}
                >
                  <Icon
                    className={`size-5 ${s.iconColor} ${o.spin ? "animate-spin" : ""}`}
                    strokeWidth={2.25}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{o.title}</p>
                  <p className="text-xs text-muted truncate">{o.route}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase mb-1 ${s.badge}`}
                  >
                    {o.status}
                  </span>
                  <p className="font-mono text-xs font-bold">{o.amount}</p>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full overflow-hidden bg-accent">
                <div
                  className={`h-full rounded-full ${s.bar}`}
                  style={{ width: `${o.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

