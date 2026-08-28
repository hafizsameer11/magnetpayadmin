import { toast } from "sonner";

/**
 * Fire a toast for demo / not-yet-wired admin actions.
 * Every clickable element in /admin/* should call this (or do real work)
 * so the user gets visible feedback.
 */
export function demo(message: string, tone: "default" | "success" | "warning" | "destructive" | "info" = "default") {
  switch (tone) {
    case "success":     return toast.success(message);
    case "warning":     return toast.warning(message);
    case "destructive": return toast.error(message);
    case "info":        return toast.info(message);
    default:            return toast(message);
  }
}
