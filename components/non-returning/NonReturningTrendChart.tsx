import type { SemesterFigure } from "@/lib/non-returning/statistics";

const totalColor = "#16325c";
const foreignColor = "#5c7394";

const width = 720;
const height = 292;
const pad = { top: 36, right: 20, bottom: 36, left: 40 };
const yMax = 40;
const yTicks = [0, 10, 20, 30, 40];

type NonReturningTrendChartProps = {
  semesters: SemesterFigure[];
};

export function NonReturningTrendChart({
  semesters,
}: NonReturningTrendChartProps) {
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / semesters.length;

  function xAt(index: number) {
    return pad.left + (index + 0.5) * slot;
  }

  function yAt(value: number) {
    return pad.top + innerH - (value / yMax) * innerH;
  }

  const currentIndex = semesters.findIndex((item) => item.kind === "관리 중");
  const bandX =
    currentIndex > 0
      ? (xAt(currentIndex - 1) + xAt(currentIndex)) / 2
      : xAt(currentIndex) - slot / 2;

  const totalPoints = semesters
    .map((item, index) => `${xAt(index)},${yAt(item.total)}`)
    .join(" ");
  const foreignPoints = semesters
    .map((item, index) => `${xAt(index)},${yAt(item.foreign)}`)
    .join(" ");

  return (
    <figure>
      <figcaption className="sr-only">
        2024-1부터 2026-1까지는 확정 미복학 제적 인원이고, 2026-2는 현재 신청
        미확인 인원입니다. 수치는 아래 표와 같습니다.
      </figcaption>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
        <LegendSwatch color={totalColor} marker="circle" label="전체 · 확정" />
        <LegendSwatch
          color={foreignColor}
          marker="circle"
          label="외국인 · 확정"
        />
        <LegendSwatch color={totalColor} marker="square" label="2026-2 · 관리 중" />
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="학기별 전체 및 외국인 추이"
        className="h-auto w-full font-sans"
      >
        <rect
          x={bandX}
          y={pad.top}
          width={pad.left + innerW - bandX}
          height={innerH}
          fill="#eef3f9"
        />
        <text
          x={bandX + 10}
          y={pad.top + 16}
          fill={totalColor}
          fontSize="12"
          fontWeight="600"
        >
          관리 중
        </text>
        {yTicks.map((tick) => {
          const y = yAt(tick);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={pad.left + innerW}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="11"
              >
                {tick}
              </text>
            </g>
          );
        })}
        <polyline
          points={totalPoints}
          fill="none"
          stroke={totalColor}
          strokeWidth="2"
        />
        <polyline
          points={foreignPoints}
          fill="none"
          stroke={foreignColor}
          strokeWidth="2"
        />
        {semesters.map((item, index) => {
          const current = item.kind === "관리 중";
          return (
            <g key={item.semester}>
              <Point
                x={xAt(index)}
                y={yAt(item.total)}
                color={totalColor}
                current={current}
              />
              <Point
                x={xAt(index)}
                y={yAt(item.foreign)}
                color={foreignColor}
                current={current}
              />
              <text
                x={xAt(index)}
                y={height - 12}
                textAnchor="middle"
                fill={current ? totalColor : "#64748b"}
                fontSize="12"
                fontWeight={current ? 600 : 400}
              >
                {item.semester}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function Point({
  x,
  y,
  color,
  current,
}: {
  x: number;
  y: number;
  color: string;
  current: boolean;
}) {
  if (current) {
    return (
      <rect
        x={x - 4.5}
        y={y - 4.5}
        width="9"
        height="9"
        fill="#ffffff"
        stroke={color}
        strokeWidth="2"
      />
    );
  }

  return <circle cx={x} cy={y} r="4" fill={color} />;
}

function LegendSwatch({
  color,
  marker,
  label,
}: {
  color: string;
  marker: "circle" | "square";
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="12" aria-hidden="true" className="shrink-0">
        <line x1="2" y1="6" x2="26" y2="6" stroke={color} strokeWidth="2" />
        {marker === "circle" ? (
          <circle cx="14" cy="6" r="3.5" fill={color} />
        ) : (
          <rect
            x="10"
            y="2"
            width="8"
            height="8"
            fill="#ffffff"
            stroke={color}
            strokeWidth="2"
          />
        )}
      </svg>
      {label}
    </span>
  );
}
