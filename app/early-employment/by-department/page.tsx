import type { Metadata } from "next";
import { DepartmentReviewBoard } from "@/components/early-employment/DepartmentReviewBoard";
import { referenceDate } from "@/lib/site";
import { getEarlyEmploymentRecords } from "@/lib/supabase/reads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "개설학과별 확인 대상",
};

export default async function ByDepartmentPage() {
  const records = await getEarlyEmploymentRecords();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            조기취업 관리
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            확인 필요 과목을 학생 소속학과가 아닌 과목 개설학과 기준으로
            모았습니다.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm">
          <span className="text-slate-500">기준일</span>
          <span className="font-medium tabular-nums text-slate-900">
            {referenceDate}
          </span>
        </p>
      </header>
      <DepartmentReviewBoard records={records} />
    </div>
  );
}
