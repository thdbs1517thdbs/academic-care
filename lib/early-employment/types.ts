export const submissionStatuses = ["제출", "미제출"] as const;
export const reviewStatuses = ["정상", "확인 필요"] as const;

export type SubmissionStatus = (typeof submissionStatuses)[number];
export type ReviewStatus = (typeof reviewStatuses)[number];

/** Excel/Supabase에 연결할 조기취업 수강과목 한 건. */
export type EarlyEmploymentRecord = {
  studentName: string;
  homeDepartment: string;
  studentId: string;
  absenceAppliedOn: string;
  courseName: string;
  openingDepartment: string;
  lessonPlanStatus: SubmissionStatus;
  lessonReportStatus: SubmissionStatus;
};
