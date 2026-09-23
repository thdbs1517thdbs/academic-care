import type { Metadata } from "next";
import { NonReturningBoard } from "@/components/non-returning/NonReturningBoard";
import { referenceDate } from "@/lib/site";
import { getNonReturningStudents } from "@/lib/supabase/reads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "미복학 학생 관리",
};

export default async function NonReturningPage() {
  const students = await getNonReturningStudents();
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            미복학 학생 관리
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            2026-2학기 복학 대상자의 신청 여부와 연락·처리 현황을 관리합니다.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm">
          <span className="text-slate-500">기준일</span>
          <span className="font-medium tabular-nums text-slate-900">
            {referenceDate}
          </span>
        </p>
      </header>
      <NonReturningBoard students={students} />
    </div>
  );
}
