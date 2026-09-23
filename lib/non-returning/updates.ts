import type {
  AcademicProcessType,
  NonReturningStudent,
} from "@/lib/non-returning/types";

/**
 * 담당자 메모 변경.
 * 지금은 메모리 상태를 바꾸고, 이후 이 함수의 저장만 Supabase update로 교체한다.
 */
export function applyStaffMemo(
  student: NonReturningStudent,
  staffMemo: string,
): NonReturningStudent {
  return {
    ...student,
    staffMemo: staffMemo.trim(),
  };
}

/**
 * 담당자가 신청 사실을 확인한 뒤 수행하는 학적 처리.
 * 제적 여부는 바꾸지 않는다.
 * 이후 이 함수의 저장만 Supabase update로 교체한다.
 */
export function applyAcademicProcess(
  student: NonReturningStudent,
  processType: AcademicProcessType,
): NonReturningStudent {
  if (processType === "복학 확인") {
    return {
      ...student,
      applicationStatus: "신청",
      academicStatus: "재학",
      managementStatus: "처리 완료",
    };
  }

  return {
    ...student,
    applicationStatus: "신청",
    academicStatus: "휴학",
    managementStatus: "처리 완료",
  };
}
