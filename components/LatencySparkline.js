import { useState, useMemo, useId } from "react";

/**
 * LatencySparkline
 *
 * Renders an interactive SVG sparkline displaying recent latency samples
 * with subtle gradient, hover interaction, min/avg/max telemetry, and status color mapping.
 */
export default function LatencySparkline({
  data = [],
  width = 120,
  height = 28,
  status = "operational",
  className = "",
  showLabels = false,
}) {
  const uniqueId = useId();
  const gradId = `sparkline-grad-${uniqueId.replace(/:/g, "")}`;
  const [hoverIndex, setHoverIndex] = useState(null);

  // Normalize data points
  const points = useMemo(() => {
    if (!data || data.length === 0) {
      // Fallback baseline points
      return [120, 115, 125, 130, 122, 118, 124, 128, 121, 126, 119, 122];
    }
    return data.map((d) => (typeof d === "number" ? d : d.responseTime || 100));
  }, [data]);

  const { min, max, avg, pathD, areaD, coordinates } = useMemo(() => {
    const validPoints = points.length ? points : [100];
    const minVal = Math.min(...validPoints);
    const maxVal = Math.max(...validPoints);
    const avgVal = Math.round(
      validPoints.reduce((acc, v) => acc + v, 0) / validPoints.length
    );

    const range = maxVal - minVal || 1;
    const paddingY = 4;
    const innerHeight = height - paddingY * 2;
    const stepX = points.length > 1 ? width / (points.length - 1) : width;

    const coords = points.map((val, idx) => {
      const x = Math.round(idx * stepX * 10) / 10;
      // Invert Y for SVG coordinates
      const normalized = (val - minVal) / range;
      const y = Math.round((height - paddingY - normalized * innerHeight) * 10) / 10;
      return { x, y, val };
    });

    if (coords.length === 0) return { min: 0, max: 0, avg: 0, pathD: "", areaD: "", coordinates: [] };

    let p = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      p += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const first = coords[0];
    const last = coords[coords.length - 1];
    const a = `${p} L ${last.x} ${height} L ${first.x} ${height} Z`;

    return { min: minVal, max: maxVal, avg: avgVal, pathD: p, areaD: a, coordinates: coords };
  }, [points, width, height]);

  // Color selection based on health
  const strokeColor =
    status === "outage"
      ? "#ef4444"
      : status === "degraded" || max > 600
      ? "#f59e0b"
      : "#00d4aa";

  const activePoint = hoverIndex !== null ? coordinates[hoverIndex] : null;

  return (
    <div
      className={`relative inline-flex items-center gap-2 group ${className}`}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="overflow-visible cursor-crosshair"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive invisible hit targets */}
          {coordinates.map((pt, i) => (
            <rect
              key={i}
              x={Math.max(0, pt.x - width / points.length / 2)}
              y={0}
              width={width / points.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {/* Active hover dot */}
          {activePoint && (
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="3.5"
              fill={strokeColor}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-75"
            />
          )}
        </svg>

        {/* Hover Tooltip */}
        {activePoint && (
          <div
            className="absolute bottom-full mb-1 z-30 pointer-events-none -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono whitespace-nowrap shadow-md border border-slate-700"
            style={{ left: `${activePoint.x}px` }}
          >
            {activePoint.val}ms
          </div>
        )}
      </div>

      {showLabels && (
        <div className="hidden sm:flex flex-col text-[10px] font-mono text-[var(--text-muted)] leading-tight text-right">
          <span>{points[points.length - 1]}ms</span>
          <span className="text-[9px] opacity-70">avg {avg}ms</span>
        </div>
      )}
    </div>
  );
}
