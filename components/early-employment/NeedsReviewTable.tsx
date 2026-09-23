import { EarlyEmploymentTabs } from "@/components/early-employment/EarlyEmploymentTabs";
import { SubmissionBadge } from "@/components/early-employment/StatusBadge";
import {
  formatDotDate,
  getNeedsReviewRecords,
  getReviewStatus,
  needsReviewNote,
} from "@/lib/early-employment/review";
import type { EarlyEmploymentRecord } from "@/lib/early-employment/types";

const columns = [
  "학생명",
  "소속학과",
  "학번",
  "공결 신청일",
  "신청과목",
  "개설학과",
  "수업계획서",
  "확인사항",
] as const;

export function NeedsReviewTable({ records }: { records: EarlyEmploymentRecord[] }) {
  const needsReview = getNeedsReviewRecords(records);
  const studentCount = new Set(needsReview.map((record) => record.studentId)).size;

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="px-4 pt-4 sm:px-5">
        <EarlyEmploymentTabs />
      </div>
      <p className="px-4 py-4 text-sm text-slate-600 sm:px-5">
        확인 필요 학생 {studentCount.toLocaleString("ko-KR")}명 · 계획서 확인 필요{" "}
        {needsReview.length.toLocaleString("ko-KR")}건
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">수업계획서 확인 필요 과목</caption>
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-3 py-2.5 text-xs font-medium whitespace-nowrap text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {needsReview.map((record) => (
              <tr
                key={`${record.studentId}-${record.courseName}-${record.openingDepartment}`}
                className="border-b border-slate-100 bg-amber-50"
              >
                <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-slate-900">
                  {record.studentName}
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700">
                  {record.homeDepartment}
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                  {record.studentId}
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                  {formatDotDate(record.absenceAppliedOn)}
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-800">
                  {record.courseName}
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700">
                  {record.openingDepartment}
                </td>
                <td className="px-3 py-3">
                  <SubmissionBadge status={record.lessonPlanStatus} />
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap text-amber-800">
                  {getReviewStatus(record) === "확인 필요" ? needsReviewNote : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
