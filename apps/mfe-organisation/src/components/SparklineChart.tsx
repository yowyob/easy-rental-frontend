'use client';

import React, { useId, useMemo, useState } from 'react';

type SparklineChartProps = {
  values: number[];
  labels?: string[];
  /** CSS color for the stroke / gradient */
  color?: string;
  /** Unit suffix in tooltip (e.g. XAF) */
  unit?: string;
  height?: number;
  emptyLabel?: string;
};

/**
 * Smooth area/line chart (trading-style) — pure SVG, no extra deps.
 */
export function SparklineChart({
  values,
  labels = [],
  color = '#0528d6',
  unit = '',
  height = 192,
  emptyLabel = 'Aucune donnée pour le moment.',
}: SparklineChartProps) {
  const reactId = useId();
  const gradientId = `spark-${reactId.replace(/:/g, '')}`;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    if (!values.length) return null;

    const w = 100;
    const h = 100;
    const padX = 2;
    const padY = 8;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);
    const step = values.length === 1 ? 0 : (w - padX * 2) / (values.length - 1);

    const points = values.map((v, i) => {
      const x = padX + i * step;
      const y = padY + (1 - (v - min) / range) * (h - padY * 2);
      return { x, y, v, i };
    });

    // Catmull-Rom → cubic bezier for smooth trading-like curve
    const pathD = buildSmoothPath(points);
    const areaD = `${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

    return { points, pathD, areaD, max, min };
  }, [values]);

  if (!chart) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-xs text-slate-400 italic">{emptyLabel}</p>
      </div>
    );
  }

  const active = hoverIndex != null ? chart.points[hoverIndex] : null;

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Subtle grid */}
        {[25, 50, 75].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={chart.areaD} fill={`url(#${gradientId})`} />
        <path
          d={chart.pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hit areas for tooltips */}
        {chart.points.map((pt) => (
          <rect
            key={pt.i}
            x={pt.x - (chart.points.length > 1 ? (100 / (chart.points.length * 2)) : 10)}
            y="0"
            width={chart.points.length > 1 ? 100 / chart.points.length : 20}
            height="100"
            fill="transparent"
            onMouseEnter={() => setHoverIndex(pt.i)}
          />
        ))}

        {active && (
          <>
            <line
              x1={active.x}
              y1="0"
              x2={active.x}
              y2="100"
              stroke={color}
              strokeOpacity="0.35"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r="1.8"
              fill="#fff"
              stroke={color}
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg"
          style={{
            left: `${active.x}%`,
            top: `${Math.max(active.y - 4, 8)}%`,
            backgroundColor: color,
          }}
        >
          {active.v.toLocaleString()}{unit ? ` ${unit}` : ''}
          {labels[active.i] ? (
            <span className="block text-[8px] font-semibold opacity-80 normal-case">
              {labels[active.i]}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
