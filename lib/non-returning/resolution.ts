import type { ManagementStatus, ResolutionType } from "@/lib/non-returning/types";
import { managementStatuses, resolutionTypes } from "@/lib/non-returning/types";

export const resolutionChoices = ["선택 안 함", ...resolutionTypes] as const;

export const completionRequiresResolutionMessage =
  "처리 완료로 저장하려면 복학 확인 또는 연속휴학 확인을 선택해주세요.";

export function resolutionViewLabel(
  resolutionType: ResolutionType | null,
  managementStatus: ManagementStatus,
) {
  if (resolutionType) {
    return resolutionType;
  }

  return managementStatus === "처리 완료" ? "미지정" : "선택 안 함";
}

export function resolutionChoiceLabel(resolutionType: ResolutionType | null) {
  return resolutionType ?? "선택 안 함";
}

export function isResolutionSaveAllowed(
  resolutionType: ResolutionType | null,
  managementStatus: ManagementStatus,
) {
  return !(managementStatus === "처리 완료" && resolutionType === null);
}

export function parseResolutionType(value: unknown): ResolutionType | null | undefined {
  if (value === null) {
    return null;
  }

  if (
    typeof value === "string" &&
    (resolutionTypes as readonly string[]).includes(value)
  ) {
    return value as ResolutionType;
  }

  return undefined;
}

export function parseManagementStatus(value: unknown): ManagementStatus | null {
  if (
    typeof value === "string" &&
    (managementStatuses as readonly string[]).includes(value)
  ) {
    return value as ManagementStatus;
  }

  return null;
}
