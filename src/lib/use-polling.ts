import { useEffect, useRef } from "react";

/** Browser polling stand-in for websockets (admin). Pauses when the tab is hidden. */
export function usePolling(tick: () => void | Promise<void>, intervalMs: number, enabled = true) {
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let timer: number | null = null;

    const run = () => {
      void tickRef.current();
    };

    const start = () => {
      if (timer != null) return;
      timer = window.setInterval(run, intervalMs);
    };

    const stop = () => {
      if (timer != null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    start();

    const onVis = () => {
      if (document.visibilityState === "visible") {
        run();
        start();
      } else {
        stop();
      }
    };

    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [intervalMs, enabled]);
}
