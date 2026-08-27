const activity = [
  {
    name: "Wei Chen",
    initial: "W",
    detail: "Received • 10:42 AM",
    amount: "+¥2,500.00",
    positive: true,
  },
  {
    name: "Adebayo Logistics",
    initial: "A",
    detail: "Payment • Yesterday",
    amount: "-₦85,000",
    positive: false,
  },
  {
    name: "Magnet Marketplace",
    initial: "M",
    detail: "Purchase • Aug 14",
    amount: "-$42.00",
    positive: false,
  },
  {
    name: "Fang Industrial Co.",
    initial: "F",
    detail: "Escrow Release • Aug 12",
    amount: "+¥4,800.00",
    positive: true,
  },
  {
    name: "Currency Swap USD→CNY",
    initial: "$",
    detail: "Conversion • Aug 10",
    amount: "¥8,640",
    positive: null,
  },
];

export function RecentActivity() {
  return (
    <section className="px-6 mt-10 animate-[reveal_600ms_var(--ease-out-expo)_320ms_both]">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <button className="text-primary text-xs font-bold">View All</button>
      </div>
      <div className="space-y-5">
        {activity.map((a) => (
          <div key={a.name + a.detail} className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-accent flex items-center justify-center text-base font-bold text-muted-foreground shrink-0">
              {a.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{a.name}</p>
              <p className="text-[11px] text-muted uppercase font-semibold tracking-wider">
                {a.detail}
              </p>
            </div>
            <p
              className={`font-mono font-bold text-sm shrink-0 ${
                a.positive === true
                  ? "text-success"
                  : a.positive === false
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {a.amount}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
