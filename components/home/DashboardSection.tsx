import Link from "next/link";
import { KpiCard } from "@/components/home/KpiCard";

export type KpiItem = {
  label: string;
  value: number;
  unit: string;
  attention?: boolean;
};

type DashboardSectionProps = {
  title: string;
  description: string;
  kpis: KpiItem[];
  href: string;
  actionLabel: string;
};

export function DashboardSection({
  title,
  description,
  kpis,
  href,
  actionLabel,
}: DashboardSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-800"
        >
          {actionLabel}
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9.5 4.5 13 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
