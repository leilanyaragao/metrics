import React from "react";

// Custom dot shapes for different metrics
export const CircleDot = (props: any) => {
  const { cx, cy, fill, stroke, strokeWidth, r } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r || 5}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth || 2}
    />
  );
};

export const TriangleDot = (props: any) => {
  const { cx, cy, fill, stroke, strokeWidth, r } = props;
  const size = r || 5;
  const points = [
    [cx, cy - size],
    [cx - size, cy + size],
    [cx + size, cy + size],
  ];

  return (
    <polygon
      points={points.map((p) => p.join(",")).join(" ")}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth || 2}
    />
  );
};

export const SquareDot = (props: any) => {
  const { cx, cy, fill, stroke, strokeWidth, r } = props;
  const size = r || 5;

  return (
    <rect
      x={cx - size}
      y={cy - size}
      width={size * 2}
      height={size * 2}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth || 2}
    />
  );
};

// Custom legend content with shapes
export const CustomLegendContent = (props: any) => {
  const { payload } = props;

  const getShapeComponent = (dataKey: string) => {
    if (dataKey === "IAE") return CircleDot;
    if (dataKey === "TAP") return TriangleDot;
    if (dataKey === "TA-PROG") return SquareDot;
    return CircleDot;
  };

  const getShapeName = (dataKey: string) => {
    if (dataKey === "IAE") return "●";
    if (dataKey === "TAP") return "▲";
    if (dataKey === "TA-PROG") return "■";
    return "●";
  };

  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => {
        const ShapeComponent = getShapeComponent(entry.dataKey);
        const shapeName = getShapeName(entry.dataKey);

        return (
          <li key={index} className="flex items-center gap-2">
            <svg width="16" height="16" className="flex-shrink-0">
              <ShapeComponent
                cx={8}
                cy={8}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={1}
                r={4}
              />
            </svg>
            <span
              className="text-sm font-medium"
              style={{ color: entry.color }}
            >
              {shapeName} {entry.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

// Legend for periodic chart with point names
export const CustomPeriodicLegendContent = (props: any) => {
  const { payload } = props;

  const getShapeComponent = (dataKey: string) => {
    if (dataKey.includes("_IAE")) return CircleDot;
    if (dataKey.includes("_TAP")) return TriangleDot;
    if (dataKey.includes("_TAPROG")) return SquareDot;
    return CircleDot;
  };

  const getShapeName = (dataKey: string) => {
    if (dataKey.includes("_IAE")) return "●";
    if (dataKey.includes("_TAP")) return "▲";
    if (dataKey.includes("_TAPROG")) return "■";
    return "●";
  };

  return (
    <div className="max-h-48 overflow-y-auto pr-2">
      <ul className="space-y-1">
        {payload?.map((entry: any, index: number) => {
          const ShapeComponent = getShapeComponent(entry.dataKey);
          const shapeName = getShapeName(entry.dataKey);

          return (
            <li key={index} className="flex items-center gap-2 text-xs">
              <svg width="12" height="12" className="flex-shrink-0">
                <ShapeComponent
                  cx={6}
                  cy={6}
                  fill={entry.color}
                  stroke={entry.color}
                  strokeWidth={1}
                  r={3}
                />
              </svg>
              <span
                className="font-medium truncate"
                style={{ color: entry.color }}
              >
                {shapeName} {entry.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
