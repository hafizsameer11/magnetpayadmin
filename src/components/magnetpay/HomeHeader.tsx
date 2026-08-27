import { Bell, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import avatarUrl from "@/assets/avatar.jpg";

export function HomeHeader() {
  return (
    <header className="flex items-center justify-between px-6 pt-8 pb-2 animate-[reveal_600ms_var(--ease-out-expo)_both]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-11 rounded-full overflow-hidden ring-4 ring-card shadow-sm shrink-0">
          <img
            src={avatarUrl}
            alt="Chidi Okoro"
            width={512}
            height={512}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted font-semibold tracking-wider uppercase">
            Good morning
          </p>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold leading-tight truncate">Chidi Okoro</h1>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-success/12 text-success text-[9px] font-bold uppercase tracking-wider shrink-0">
              <ShieldCheck className="size-2.5" strokeWidth={3} />
              KYC
            </span>
          </div>
        </div>
      </div>
      <Link
        to="/notifications"
        aria-label="Notifications"
        className="relative size-11 flex items-center justify-center rounded-2xl bg-card border border-border shadow-sm shrink-0"
      >
        <Bell className="size-5 text-foreground" strokeWidth={2.25} />
        <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full ring-2 ring-card" />
      </Link>
    </header>
  );
}

