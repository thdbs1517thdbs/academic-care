import type { Metadata } from "next";
import { NonReturningStatsView } from "@/components/non-returning/NonReturningStatsView";
import { buildNonReturningStatistics } from "@/lib/non-returning/statistics";
import { referenceDate } from "@/lib/site";
import {
  getNonReturningHistory,
  getNonReturningStudents,
} from "@/lib/supabase/reads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "미복학 관리 통계",
};

export default async function NonReturningStatsPage() {
  const [students, history] = await Promise.all([
    getNonReturningStudents(),
    getNonReturningHistory(),
  ]);
  const statistics = buildNonReturningStatistics(students, history);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            미복학 관리 통계
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            학기별 미복학 제적 현황과 외국인 학생 현황을 확인합니다.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm">
          <span className="text-slate-500">기준일</span>
          <span className="font-medium tabular-nums text-slate-900">
            {referenceDate}
          </span>
        </p>
      </header>
      <NonReturningStatsView statistics={statistics} />
    </div>
  );
}
