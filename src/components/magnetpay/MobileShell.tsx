import type { ReactNode } from "react";
import { PhoneFrame } from "./PhoneFrame";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame>
      <div className="relative min-h-full bg-background pb-28">{children}</div>
    </PhoneFrame>
  );
}
