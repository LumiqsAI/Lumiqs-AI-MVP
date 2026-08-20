"use client";

import { useMemo, useState } from "react";

interface PositioningEntry {
  name: string;
  x: number; // 0–100: price (low → high)
  y: number; // 0–100: automation/capability (low → high)
  isSelf?: boolean;
}

interface Props {
  businessName: string;
  competitors: { name: string; content?: Record<string, unknown> }[];
}

const PADDING = 44;
const SIZE = 340;
const INNER = SIZE - PADDING * 2;

function toSvg(val: number) {
  return PADDING + (val / 100) * INNER;
}

/** Rough heuristic: extract a 0-100 score from competitor content */
function scoreFromContent(
  content: Record<string, unknown> | undefined,
  field: "price" | "automation",
): number {
  if (!content) return 50;

  if (field === "price") {
    const raw = (content.pricing as string | undefined) ?? "";
    if (/free|open.?source/i.test(raw)) return 10;
    if (/enterprise|custom/i.test(raw)) return 85;
    // look for dollar amounts
    const match = raw.match(/\$(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      return Math.min(95, Math.max(5, n / 2));
    }
    return 50;
  }

  // automation: use strengths/features length as a proxy
  const features = (content.features as string[] | undefined) ?? [];
  const strengths = (content.strengths as string[] | undefined) ?? [];
  return Math.min(90, 20 + (features.length + strengths.length) * 6);
}

export function CompetitorPositioningMap({ businessName, competitors }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const points = useMemo<PositioningEntry[]>(() => {
    const entries: PositioningEntry[] = competitors.map((c) => ({
      name: c.name,
      x: scoreFromContent(c.content, "price"),
      y: scoreFromContent(c.content, "automation"),
    }));
    // Place the user's business at a slightly differentiated position
    entries.push({ name: businessName, x: 40, y: 70, isSelf: true });
    return entries;
  }, [competitors, businessName]);

  if (competitors.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ border: "1px solid var(--line)", background: "var(--card-bg)" }}
    >
      <p className="mb-1 text-sm font-medium" style={{ color: "var(--page-fg)" }}>
        Positioning Map
      </p>
      <p className="mb-4 text-xs" style={{ color: "var(--muted-fg)" }}>
        Price (x-axis) vs Capability / Automation (y-axis)
      </p>

      <div className="overflow-x-auto">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto block"
          style={{ maxWidth: "100%" }}
        >
          {/* Grid lines */}
          {[25, 50, 75].map((v) => (
            <g key={v}>
              <line
                x1={toSvg(v)} y1={PADDING} x2={toSvg(v)} y2={SIZE - PADDING}
                stroke="var(--line)" strokeWidth={1} strokeDasharray="4 4"
              />
              <line
                x1={PADDING} y1={toSvg(v)} x2={SIZE - PADDING} y2={toSvg(v)}
                stroke="var(--line)" strokeWidth={1} strokeDasharray="4 4"
              />
            </g>
          ))}

          {/* Axes */}
          <line x1={PADDING} y1={SIZE - PADDING} x2={SIZE - PADDING} y2={SIZE - PADDING} stroke="var(--line-strong)" strokeWidth={1.5} />
          <line x1={PADDING} y1={PADDING} x2={PADDING} y2={SIZE - PADDING} stroke="var(--line-strong)" strokeWidth={1.5} />

          {/* Axis labels */}
          <text x={SIZE / 2} y={SIZE - 6} textAnchor="middle" fontSize={10} fill="var(--subtle-fg)">Price →</text>
          <text x={10} y={SIZE / 2} textAnchor="middle" fontSize={10} fill="var(--subtle-fg)" transform={`rotate(-90, 10, ${SIZE / 2})`}>Capability →</text>
          <text x={PADDING} y={SIZE - PADDING + 14} textAnchor="middle" fontSize={9} fill="var(--subtle-fg)">Low</text>
          <text x={SIZE - PADDING} y={SIZE - PADDING + 14} textAnchor="middle" fontSize={9} fill="var(--subtle-fg)">High</text>
          <text x={PADDING - 8} y={SIZE - PADDING} textAnchor="end" fontSize={9} fill="var(--subtle-fg)">Low</text>
          <text x={PADDING - 8} y={PADDING} textAnchor="end" fontSize={9} fill="var(--subtle-fg)">High</text>

          {/* Points */}
          {points.map((p) => {
            const cx = toSvg(p.x);
            // SVG y is inverted — high capability = top
            const cy = toSvg(100 - p.y);
            const isHovered = hovered === p.name;
            const r = p.isSelf ? 9 : 7;

            return (
              <g
                key={p.name}
                onMouseEnter={() => setHovered(p.name)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r={r + 6} fill={p.isSelf ? "rgba(99,102,241,.2)" : "rgba(148,163,184,.15)"} />
                )}
                <circle
                  cx={cx} cy={cy} r={r}
                  fill={p.isSelf ? "#6366f1" : "var(--surface-raised)"}
                  stroke={p.isSelf ? "#818cf8" : "var(--line-strong)"}
                  strokeWidth={p.isSelf ? 2 : 1.5}
                />
                {p.isSelf && (
                  <text cx={cx} cy={cy} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="#fff" fontWeight="700">
                    <tspan x={cx} dy="0">Y</tspan>
                  </text>
                )}
                {/* Label */}
                <text
                  x={cx}
                  y={cy - r - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={p.isSelf ? "600" : "400"}
                  fill={p.isSelf ? "#a5b4fc" : "var(--muted-fg)"}
                >
                  {p.name.length > 14 ? p.name.slice(0, 13) + "…" : p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: "var(--muted-fg)" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" /> Your business
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--surface-raised)", border: "1.5px solid var(--line-strong)" }} /> Competitor
        </span>
        <span className="ml-auto opacity-60">Positions are AI-estimated</span>
      </div>
    </div>
  );
}
