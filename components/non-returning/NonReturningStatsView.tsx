import { KpiCard } from "@/components/home/KpiCard";
import { NonReturningTrendChart } from "@/components/non-returning/NonReturningTrendChart";
import type { buildNonReturningStatistics } from "@/lib/non-returning/statistics";
import { currentSemesterLabel } from "@/lib/non-returning/statistics";

type Statistics = ReturnType<typeof buildNonReturningStatistics>;

export function NonReturningStatsView({ statistics }: { statistics: Statistics }) {
  const { latestConfirmed, semesters } = statistics;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiCard
            label="최근 확정 미복학 제적"
            value={latestConfirmed.totalCount}
            unit="명"
            note={`${latestConfirmed.semester}학기`}
          />
          <KpiCard
            label="최근 확정 외국인 미복학 제적"
            value={latestConfirmed.foreignCount}
            unit="명"
            note={`${latestConfirmed.semester}학기`}
          />
          <KpiCard
            label={`${currentSemesterLabel} 현재 신청 미확인`}
            value={statistics.currentUnconfirmed}
            unit="명"
            note="관리 중"
            attention
          />
          <KpiCard
            label={`${currentSemesterLabel} 외국인 신청 미확인`}
            value={statistics.currentForeignUnconfirmed}
            unit="명"
            note="관리 중"
            attention
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">학기별 추이</h2>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">
          2026-2는 현재 관리 중인 신청 미확인 인원으로, 과거 확정 미복학 제적
          통계와 직접 동일한 지표가 아닙니다.
        </p>
        <div className="mt-5">
          <NonReturningTrendChart semesters={semesters} />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">학기별 상세</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <caption className="sr-only">학기별 미복학 통계</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["학기", "전체", "외국인", "구분"].map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-5 py-2.5 text-xs font-medium text-slate-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {semesters.map((item) => {
                const current = item.kind === "관리 중";
                return (
                  <tr
                    key={item.semester}
                    className={
                      current
                        ? "border-b border-slate-100 bg-navy-50"
                        : "border-b border-slate-100 bg-white"
                    }
                  >
                    <th
                      scope="row"
                      className="px-5 py-3 text-sm font-medium whitespace-nowrap text-slate-900"
                    >
                      {item.semester}
                    </th>
                    <td className="px-5 py-3 text-sm text-slate-700 tabular-nums">
                      {item.total.toLocaleString("ko-KR")}명
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700 tabular-nums">
                      {item.foreign.toLocaleString("ko-KR")}명
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          current
                            ? "inline-flex rounded-md bg-white px-2 py-0.5 text-xs font-medium text-navy-900"
                            : "inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                        }
                      >
                        {item.kind}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
        <span className="w-1 shrink-0 bg-navy-900" aria-hidden="true" />
        <div className="px-4 py-3.5 sm:px-5">
          <p className="text-sm font-semibold text-slate-800">통계 활용 안내</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            과거 학기의 미복학 제적 현황과 현재 학기의 관리 대상을 함께 확인하여
            학사운영팀이 반복적으로 발생하는 미복학 현황을 파악하고, 사전 안내
            및 학생 연락 업무에 활용할 수 있습니다.
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            현재 학기의 신청 미확인 인원은 최종 제적 인원이 아니며, 학생의
            복학·연속휴학 신청 및 담당자 확인에 따라 변경될 수 있습니다.
          </p>
        </div>
      </aside>
    </div>
  );
}
