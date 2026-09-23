import type { NonReturningStudent } from "@/lib/non-returning/types";
import { domesticNationality } from "@/lib/non-returning/types";

export function isForeignStudent(student: NonReturningStudent) {
  return student.nationality !== domesticNationality;
}

export function summarizeNonReturning(students: NonReturningStudent[]) {
  return {
    targetCount: students.length,
    foreignCount: students.filter(isForeignStudent).length,
    unconfirmedCount: students.filter(
      (student) => student.applicationStatus === "미신청",
    ).length,
    unconfirmedForeignCount: students.filter(
      (student) =>
        student.applicationStatus === "미신청" && isForeignStudent(student),
    ).length,
    confirmedCount: students.filter(
      (student) => student.applicationStatus === "신청",
    ).length,
  };
}

export function formatDotDate(isoDate: string) {
  return isoDate.replaceAll("-", ".");
}
