import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getRole, type V8Role } from "./v8-role";

/**
 * Hard guard: if the current role isn't in `allowed`, redirect to /home.
 * Use on routes that are role-specific (e.g. buyer-only deposit/send flows).
 */
export function useRoleGuard(allowed: V8Role[], reason?: string) {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = getRole();
    if (!allowed.includes(r)) {
      toast.error(reason ?? "This screen isn't available for your account");
      navigate({ to: "/home" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Render `children` only when role matches; otherwise null. */
export function roleIs(allowed: V8Role[]) {
  if (typeof window === "undefined") return true;
  return allowed.includes(getRole());
}
