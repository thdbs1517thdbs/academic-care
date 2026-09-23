import { cn } from "@/lib/cn";

type KpiCardProps = {
  label: string;
  value: number;
  unit: string;
  attention?: boolean;
  note?: string;
};

export function KpiCard({
  label,
  value,
  unit,
  attention = false,
  note,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3.5",
        attention
          ? "border-navy-900/15 bg-navy-50"
          : "border-slate-200 bg-canvas",
      )}
    >
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-[1.75rem] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
        {value.toLocaleString("ko-KR")}
        <span className="ml-1 text-sm font-medium text-slate-500">{unit}</span>
      </p>
      {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}
