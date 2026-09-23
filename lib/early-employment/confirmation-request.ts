import { getNeedsReviewRecords } from "@/lib/early-employment/review";
import type { EarlyEmploymentRecord } from "@/lib/early-employment/types";
import { teamName } from "@/lib/site";

export type OpeningDepartmentReviewGroup = {
  openingDepartment: string;
  records: EarlyEmploymentRecord[];
  courseCount: number;
  studentCount: number;
};

/** 확인 필요 과목을 학생 소속학과가 아닌 과목 개설학과로 묶는다. */
export function groupNeedsReviewByOpeningDepartment(
  records: EarlyEmploymentRecord[],
): OpeningDepartmentReviewGroup[] {
  const grouped = new Map<string, EarlyEmploymentRecord[]>();

  for (const record of getNeedsReviewRecords(records)) {
    const current = grouped.get(record.openingDepartment) ?? [];
    current.push(record);
    grouped.set(record.openingDepartment, current);
  }

  return [...grouped.entries()]
    .map(([openingDepartment, departmentRecords]) => ({
      openingDepartment,
      records: departmentRecords,
      courseCount: departmentRecords.length,
      studentCount: new Set(departmentRecords.map((record) => record.studentId)).size,
    }))
    .sort(
      (left, right) =>
        right.courseCount - left.courseCount ||
        left.openingDepartment.localeCompare(right.openingDepartment, "ko"),
    );
}

/**
 * 확인요청 문구 미리보기.
 * Gemini를 호출하지 않고, 선택한 개설학과의 확인 필요 데이터로 템플릿을 채운다.
 * 나중에 문장을 만드는 이 함수만 API 호출로 바꾸면 된다.
 */
export function buildConfirmationRequestPreview(
  group: OpeningDepartmentReviewGroup,
) {
  const courseLines = group.records.map(
    (record) =>
      `- [${record.courseName}] ${record.studentName} / ${record.homeDepartment} / ${record.studentId}`,
  );

  return [
    "안녕하세요.",
    `${teamName} ○○○입니다.`,
    "",
    "조기취업 공결 신청 후 4주가 경과하였으나,",
    `${group.openingDepartment} 개설 수업 중 수업계획서 제출이 확인되지 않은 과목이 ${group.courseCount}건 있습니다.`,
    "아래 과목의 수업계획서 제출 여부를 확인하여 주시기 바랍니다.",
    "",
    ...courseLines,
    "",
    "감사합니다.",
  ].join("\n");
}
