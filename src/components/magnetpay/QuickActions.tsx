import { Plus, ArrowUpRight, Store, Ship } from "lucide-react";

const actions = [
  { label: "Fund", icon: Plus, primary: true },
  { label: "Send", icon: ArrowUpRight },
  { label: "Market", icon: Store },
  { label: "Ship", icon: Ship },
];

export function QuickActions() {
  return (
    <section className="grid grid-cols-4 gap-4 px-6 mt-8 animate-[reveal_600ms_var(--ease-out-expo)_160ms_both]">
      {actions.map(({ label, icon: Icon, primary }) => (
        <button key={label} className="flex flex-col items-center gap-2 group">
          <div
            className={`size-14 rounded-3xl flex items-center justify-center transition-transform group-active:scale-95 ${
              primary
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-card border border-border text-foreground"
            }`}
          >
            <Icon className="size-5" strokeWidth={2.4} />
          </div>
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</span>
        </button>
      ))}
    </section>
  );
}
