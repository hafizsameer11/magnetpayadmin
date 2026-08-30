import { T } from "./AdminShell";
import type { SeriesPoint } from "./Analytics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const axisProps = {
  tick: { fill: T.muted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
  axisLine: { stroke: T.border },
  tickLine: { stroke: T.border },
};

export function TrendArea({
  data,
  color = T.info,
  label = "Value",
  height = 220,
  format,
}: {
  data: SeriesPoint[];
  color?: string;
  label?: string;
  height?: number;
  format?: (n: number) => string;
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="d" {...axisProps} />
          <YAxis {...axisProps} width={56} tickFormatter={(n) => fmt(n)} />
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [fmt(v), label]}
          />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#g-${label})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendCompare({
  data,
  label = "Current",
  labelPrev = "Previous",
  color = T.info,
  colorPrev = T.muted,
  height = 240,
  format,
}: {
  data: SeriesPoint[];
  label?: string;
  labelPrev?: string;
  color?: string;
  colorPrev?: string;
  height?: number;
  format?: (n: number) => string;
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="d" {...axisProps} />
          <YAxis {...axisProps} width={56} tickFormatter={(n) => fmt(n)} />
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number, name) => [fmt(v as number), name === "v" ? label : labelPrev]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" formatter={(name) => (name === "v" ? label : labelPrev)} />
          <Line type="monotone" dataKey="v2" stroke={colorPrev} strokeWidth={1.6} strokeDasharray="4 4" dot={false} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.4} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarBreakdown({
  data,
  color = T.navy,
  height = 260,
  format,
}: {
  data: { k: string; v: number }[];
  color?: string;
  height?: number;
  format?: (n: number) => string;
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" {...axisProps} tickFormatter={(n) => fmt(n)} />
          <YAxis type="category" dataKey="k" {...axisProps} width={150} />
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [fmt(v), "Value"]}
          />
          <Bar dataKey="v" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({
  data,
  color = T.info,
  height = 40,
  linear = false,
  normalize = false,
}: {
  data: { value: number }[];
  color?: string;
  height?: number;
  linear?: boolean;
  normalize?: boolean;
}) {
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;
  let plot = data;
  if (normalize && data.length > 1) {
    const vals = data.map((d) => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    plot = data.map((d) => ({ value: 8 + ((d.value - min) / range) * 92 }));
  }
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={plot} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type={linear ? "linear" : "monotone"}
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  height = 220,
  format,
}: {
  data: { k: string; v: number; c?: string }[];
  height?: number;
  format?: (n: number) => string;
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  const palette = [T.navy, T.info, T.success, T.warn, T.accent, T.muted];
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="v" nameKey="k" innerRadius="58%" outerRadius="88%" paddingAngle={1.5}>
            {data.map((d, i) => (
              <Cell key={d.k} fill={d.c ?? palette[i % palette.length]} stroke={T.surface} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number, name) => [fmt(v as number), name as string]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
