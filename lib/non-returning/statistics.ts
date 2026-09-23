import type { ConfirmedNonReturningTerm } from "@/lib/non-returning/history";
import { summarizeNonReturning } from "@/lib/non-returning/summary";
import type { NonReturningStudent } from "@/lib/non-returning/types";

/** 통계 화면의 현재 학기. 인원은 미복학 학생 목록에서 계산한다. */
export const currentReturnSemester = "2026-2학기";
export const currentSemesterLabel = "2026-2";

export type SemesterFigureKind = "확정" | "관리 중";

export type SemesterFigure = {
  semester: string;
  total: number;
  foreign: number;
  kind: SemesterFigureKind;
};

export function buildNonReturningStatistics(
  students: NonReturningStudent[],
  history: readonly ConfirmedNonReturningTerm[],
) {
  const currentStudents = students.filter(
    (student) => student.returnSemester === currentReturnSemester,
  );
  const summary = summarizeNonReturning(currentStudents);
  const latestConfirmed = history.at(-1);

  if (!latestConfirmed) {
    throw new Error("확정된 미복학 통계가 없습니다.");
  }

  const semesters: SemesterFigure[] = [
    ...history.map((term) => ({
      semester: term.semester,
      total: term.totalCount,
      foreign: term.foreignCount,
      kind: "확정" as const,
    })),
    {
      semester: currentSemesterLabel,
      total: summary.unconfirmedCount,
      foreign: summary.unconfirmedForeignCount,
      kind: "관리 중" as const,
    },
  ];

  return {
    latestConfirmed,
    currentUnconfirmed: summary.unconfirmedCount,
    currentForeignUnconfirmed: summary.unconfirmedForeignCount,
    semesters,
  };
}
