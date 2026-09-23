import { referenceDate } from "@/lib/site";
import type { EarlyEmploymentRecord, ReviewStatus } from "@/lib/early-employment/types";

export const reviewThresholdDays = 28;

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function toIsoDate(value: string) {
  return value.replaceAll(".", "-");
}

export function formatDotDate(isoDate: string) {
  return isoDate.replaceAll("-", ".");
}

export function elapsedDays(absenceAppliedOn: string, baseline = referenceDate) {
  const from = parseIsoDate(absenceAppliedOn);
  const to = parseIsoDate(toIsoDate(baseline));
  return Math.round((to - from) / 86_400_000);
}

/** 확인 필요 행에 표시하는 시스템 판정 문구. */
export const needsReviewNote = "신청 후 4주 경과 · 계획서 미제출";

/**
 * 확인 필요는 공결 신청일로부터 28일 이상 경과하고 수업계획서가 미제출인 경우만 해당한다.
 * 수업보고서는 기말고사 이후 자료라 이 판정에 사용하지 않는다.
 */
export function getReviewStatus(record: EarlyEmploymentRecord): ReviewStatus {
  const planMissing = record.lessonPlanStatus === "미제출";
  const overdue = elapsedDays(record.absenceAppliedOn) >= reviewThresholdDays;
  return planMissing && overdue ? "확인 필요" : "정상";
}

export function getNeedsReviewRecords(records: EarlyEmploymentRecord[]) {
  return records.filter((record) => getReviewStatus(record) === "확인 필요");
}

export function summarizeEarlyEmployment(records: EarlyEmploymentRecord[]) {
  const needsReview = getNeedsReviewRecords(records);

  return {
    studentCount: new Set(records.map((record) => record.studentId)).size,
    courseCount: records.length,
    needsReviewStudentCount: new Set(
      needsReview.map((record) => record.studentId),
    ).size,
    needsReviewCourseCount: needsReview.length,
  };
}
