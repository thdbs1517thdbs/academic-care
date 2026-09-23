import type { Metadata } from "next";
import { DashboardSection } from "@/components/home/DashboardSection";
import { RoleNotice } from "@/components/home/RoleNotice";
import { WorkflowSteps } from "@/components/home/WorkflowSteps";
import { summarizeEarlyEmployment } from "@/lib/early-employment/review";
import { summarizeNonReturning } from "@/lib/non-returning/summary";
import { referenceDate } from "@/lib/site";
import {
  getEarlyEmploymentRecords,
  getNonReturningStudents,
} from "@/lib/supabase/reads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "학사행정 사후관리 대시보드 · Academic Care",
  },
};

export default async function HomePage() {
  const [earlyEmploymentRecords, nonReturningStudents] = await Promise.all([
    getEarlyEmploymentRecords(),
    getNonReturningStudents(),
  ]);
  const earlyEmployment = summarizeEarlyEmployment(earlyEmploymentRecords);
  const nonReturning = summarizeNonReturning(nonReturningStudents);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            학사행정 사후관리 대시보드
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            조기취업 공결 및 미복학 학생의 후속 관리 현황을 확인합니다.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm">
          <span className="text-slate-500">기준일</span>
          <span className="font-medium tabular-nums text-slate-900">
            {referenceDate}
          </span>
        </p>
      </header>

      <DashboardSection
        title="조기취업 관리"
        description="공결 신청 후 28일이 경과했으나 수업계획서가 제출되지 않은 과목을 확인 대상으로 관리합니다."
        href="/early-employment"
        actionLabel="조기취업 관리 바로가기"
        kpis={[
          { label: "조기취업 학생", value: earlyEmployment.studentCount, unit: "명" },
          { label: "신청 과목", value: earlyEmployment.courseCount, unit: "건" },
          {
            label: "확인 필요 학생",
            value: earlyEmployment.needsReviewStudentCount,
            unit: "명",
            attention: true,
          },
          {
            label: "계획서 확인 필요",
            value: earlyEmployment.needsReviewCourseCount,
            unit: "건",
            attention: true,
          },
        ]}
      />

      <DashboardSection
        title="미복학 관리"
        description="복학 대상자의 신청 여부와 연락 현황을 확인하고 담당자 메모 및 학적 처리 상태를 관리합니다."
        href="/non-returning"
        actionLabel="미복학 관리 바로가기"
        kpis={[
          { label: "복학 대상 학생", value: nonReturning.targetCount, unit: "명" },
          { label: "외국인 학생", value: nonReturning.foreignCount, unit: "명" },
          {
            label: "신청 미확인",
            value: nonReturning.unconfirmedCount,
            unit: "명",
            attention: true,
          },
          { label: "신청 확인", value: nonReturning.confirmedCount, unit: "명" },
        ]}
      />

      <WorkflowSteps />
      <RoleNotice />
    </div>
  );
}
