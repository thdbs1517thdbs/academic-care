import type {
  ManagementStatus,
  NonReturningStudent,
  ResolutionType,
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

export function applyResolution(
  student: NonReturningStudent,
  resolutionType: ResolutionType | null,
  managementStatus: ManagementStatus,
): NonReturningStudent {
  return {
    ...student,
    resolutionType,
    managementStatus,
  };
}
