import { lazy, Suspense, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { T } from "./AdminShell";

const LazyTrendArea = lazy(() => import("./AnalyticsCharts").then((m) => ({ default: m.TrendArea })));
const LazyBarBreakdown = lazy(() => import("./AnalyticsCharts").then((m) => ({ default: m.BarBreakdown })));

function ChartFallback({ height = 220 }: { height?: number }) {
  return (
    <div className="grid place-items-center" style={{ height, color: T.muted }}>
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

export function ClientTrendArea(props: ComponentProps<typeof LazyTrendArea>) {
  return (
    <Suspense fallback={<ChartFallback height={props.height} />}>
      <LazyTrendArea {...props} />
    </Suspense>
  );
}

const LazySparkline = lazy(() => import("./AnalyticsCharts").then((m) => ({ default: m.Sparkline })));

export function ClientSparkline(
  props: ComponentProps<typeof LazySparkline> & { linear?: boolean; normalize?: boolean },
) {
  return (
    <Suspense fallback={<ChartFallback height={props.height ?? 40} />}>
      <LazySparkline {...props} />
    </Suspense>
  );
}

export function ClientBarBreakdown(props: ComponentProps<typeof LazyBarBreakdown>) {
  return (
    <Suspense fallback={<ChartFallback height={props.height ?? 260} />}>
      <LazyBarBreakdown {...props} />
    </Suspense>
  );
}

export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <Suspense fallback={fallback ?? null}>{children}</Suspense>;
}
