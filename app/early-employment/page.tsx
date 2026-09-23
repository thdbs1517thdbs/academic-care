import type { Metadata } from "next";
import { KpiCard } from "@/components/home/KpiCard";
import { EarlyEmploymentBoard } from "@/components/early-employment/EarlyEmploymentBoard";
import { summarizeEarlyEmployment } from "@/lib/early-employment/review";
import { referenceDate } from "@/lib/site";
import { getEarlyEmploymentRecords } from "@/lib/supabase/reads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "조기취업 관리",
};

export default async function EarlyEmploymentPage() {
  const records = await getEarlyEmploymentRecords();
  const summary = summarizeEarlyEmployment(records);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            조기취업 관리
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            조기취업 공결 신청 학생의 과목별 수업계획서 및 수업보고서 제출 현황을
            관리합니다.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm">
          <span className="text-slate-500">기준일</span>
          <span className="font-medium tabular-nums text-slate-900">
            {referenceDate}
          </span>
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiCard label="조기취업 학생" value={summary.studentCount} unit="명" />
          <KpiCard label="신청 과목" value={summary.courseCount} unit="건" />
          <KpiCard
            label="확인 필요 학생"
            value={summary.needsReviewStudentCount}
            unit="명"
            attention
          />
          <KpiCard
            label="계획서 확인 필요"
            value={summary.needsReviewCourseCount}
            unit="건"
            attention
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          공결 신청일로부터 28일 이상 경과했으나 수업계획서가 미제출인 과목을
          확인 대상으로 분류합니다. 수업보고서는 기말고사 이후 제출 대상이므로
          현재 확인 대상 판정에서 제외됩니다.
        </p>
      </section>

      <EarlyEmploymentBoard records={records} />
    </div>
  );
}
