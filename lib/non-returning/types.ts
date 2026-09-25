export const departments = [
  "국어국문학과",
  "영어영문학과",
  "철학과",
  "행정학과",
  "사회복지학과",
  "미디어커뮤니케이션학과",
  "경영학과",
  "회계학과",
  "호텔관광학과",
  "컴퓨터공학과",
  "전자공학과",
  "AI빅데이터학과",
  "보건행정학과",
  "임상병리학과",
  "물리치료학과",
] as const;

export const domesticNationality = "대한민국";

export const foreignNationalities = [
  "베트남",
  "중국",
  "일본",
  "몽골",
  "인도",
  "대만",
  "네팔",
] as const;

export const applicationStatuses = ["신청", "미신청"] as const;
export const managementStatuses = ["확인 필요", "연락 완료", "처리 완료"] as const;
export const academicStatuses = ["휴학", "재학"] as const;
export const resolutionTypes = ["복학 확인", "연속휴학 확인"] as const;

export type Department = (typeof departments)[number];
export type ApplicationStatus = (typeof applicationStatuses)[number];
export type ManagementStatus = (typeof managementStatuses)[number];
export type AcademicStatus = (typeof academicStatuses)[number];
export type ResolutionType = (typeof resolutionTypes)[number];

/** 추후 Supabase 미복학 학생 행과 맞출 필드. */
export type NonReturningStudent = {
  id: string;
  studentName: string;
  department: Department;
  studentId: string;
  email: string;
  nationality: string;
  returnSemester: string;
  leaveExpiresOn: string;
  applicationStatus: ApplicationStatus;
  academicStatus: AcademicStatus;
  managementStatus: ManagementStatus;
  resolutionType: ResolutionType | null;
  staffMemo: string;
};

export type NonReturningTab = "all" | "foreign" | "needs-review" | "completed";
