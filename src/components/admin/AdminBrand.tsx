import { Link } from "@tanstack/react-router";

const BRAND_ORANGE = "#E45217";

export function AdminBrandMark({ className = "h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <img
      src="/brand/logo-mark.svg"
      alt=""
      aria-hidden
      className={className}
      style={{ display: "block" }}
      width={2848}
      height={1200}
    />
  );
}

export function AdminBrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="min-w-0">
      <p
        className={`font-bold leading-tight ${compact ? "text-[13px]" : "text-[15px]"}`}
        style={{ letterSpacing: "-0.01em" }}
      >
        <span className="text-white">Magnet</span>
        <span style={{ color: BRAND_ORANGE }}>Pay</span>
      </p>
      <p
        className={`font-semibold uppercase tracking-[0.18em] ${compact ? "text-[9px]" : "text-[9.5px]"}`}
        style={{ color: "#C8C2B0" }}
      >
        Admin
      </p>
    </div>
  );
}

export function AdminBrandLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
      <AdminBrandMark className={compact ? "h-7 w-auto shrink-0" : "h-8 w-auto shrink-0"} />
      <AdminBrandWordmark compact={compact} />
    </Link>
  );
}
