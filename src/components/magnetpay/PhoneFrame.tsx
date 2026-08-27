import type { ReactNode } from "react";

/**
 * Mobile phone frame — wraps a 390px-wide screen in a device bezel
 * with a dynamic island. The screen is a positioned context so children
 * using `absolute bottom-0` (e.g. bottom navs) anchor to the frame.
 */
export function PhoneFrame({
  children,
  bottomNav,
  overlay,
  background = "#0a0a0a",
}: {
  children: ReactNode;
  bottomNav?: ReactNode;
  overlay?: ReactNode;
  background?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-[#d8d6d1] flex items-start sm:items-center justify-center p-4 sm:p-8">
      <div
        className="relative shrink-0 rounded-[3rem] p-[10px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35),0_0_0_2px_rgba(255,255,255,0.05)_inset]"
        style={{ background }}
      >
        {/* Side buttons */}
        <span className="absolute -left-[3px] top-28 w-[3px] h-10 rounded-l bg-black/60" />
        <span className="absolute -left-[3px] top-44 w-[3px] h-16 rounded-l bg-black/60" />
        <span className="absolute -left-[3px] top-64 w-[3px] h-16 rounded-l bg-black/60" />
        <span className="absolute -right-[3px] top-40 w-[3px] h-24 rounded-r bg-black/60" />

        {/* Screen */}
        <div
          className="relative w-[390px] h-[844px] rounded-[2.5rem] overflow-hidden bg-white"
          style={{ isolation: "isolate" }}
        >
          {/* Dynamic island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[60] w-[110px] h-[30px] rounded-full bg-black pointer-events-none" />
          {/* Scrollable content */}
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
          {/* Fixed bottom nav layer (rendered above scroll) */}
          {bottomNav && (
            <div className="absolute bottom-0 inset-x-0 z-50 pointer-events-none">
              <div className="pointer-events-auto">{bottomNav}</div>
            </div>
          )}
          {overlay && (
            <div className="absolute inset-0 z-[70] pointer-events-none">
              {overlay}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
