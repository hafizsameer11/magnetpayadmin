export const escrowTheme = {
  navy: "#0E3B2E",
  bg: "#F6F1E7",
  surface: "#FFFFFF",
  border: "#E7DFCE",
  ink: "#1B1A17",
  sub: "#5B5749",
  muted: "#8A8472",
  accent: "#C2410C",
  success: "#0F766E",
  warn: "#B45309",
  danger: "#B91C1C",
  info: "#1D4ED8",
};

const STEPS = ["Party", "Terms", "Milestones", "Inspect", "Fees", "Review"];

export function EscrowStepper({ step }: { step: number }) {
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
            <div key={label} className="flex-1 flex flex-col items-stretch gap-1">
              <div className="h-1 rounded-full" style={{ background: c }} />
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-center"
                style={{ color: active ? t.accent : done ? t.success : t.muted }}>
                {label}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[10px] font-mono" style={{ color: t.muted }}>
        Step {step} of {STEPS.length}
      </p>
    </section>
  );
}
