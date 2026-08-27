import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

const STEPS = ["Basics", "Pricing", "Media", "Shipping"];

export function ProductStepper({ step }: { step: number }) {
  const t = escrowTheme;
  return (
    <section className="px-4 mt-2">
      <div className="flex items-center gap-1.5">
        {STEPS.map((label, i) => {
          const idx = i + 1;
          const done = idx < step;
          const active = idx === step;
          const c = done ? t.success : active ? t.accent : t.border;
          return (
            <div key={label} className="flex-1 flex flex-col gap-1">
              <div className="h-1 rounded-full" style={{ background: c }} />
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-center"
                style={{ color: active ? t.accent : done ? t.success : t.muted }}>{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
