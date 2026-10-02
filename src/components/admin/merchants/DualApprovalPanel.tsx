import { useState } from "react";
import { toast } from "sonner";
import { T } from "@/components/admin/AdminShell";

/** Dual-approval panel for reverse / float adjust. */
export function DualApprovalPanel({
  title = "Requires dual approval",
  actionLabel = "Submit for second approver",
  onSubmitted,
}: {
  title?: string;
  actionLabel?: string;
  onSubmitted?: (reason: string) => void | Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.warn }}>
        {title}
      </p>
      <label className="block text-[11px] font-semibold" style={{ color: T.sub }}>
        Reason (required)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Explain why this money-moving action is needed…"
          className="mt-1.5 w-full rounded-lg px-3 py-2 text-[12px] outline-none resize-y"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
        />
      </label>
      <button
        type="button"
        disabled={!reason.trim() || busy}
        onClick={async () => {
          if (!onSubmitted) {
            toast.message("Needs second approver", {
              description: "Request queued. A second admin must confirm before funds move.",
            });
            setReason("");
            return;
          }
          setBusy(true);
          try {
            await onSubmitted(reason.trim());
            setReason("");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Request failed");
          } finally {
            setBusy(false);
          }
        }}
        className="h-9 px-3 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
        style={{ background: T.navy }}
      >
        {busy ? "Submitting…" : actionLabel}
      </button>
    </div>
  );
}
