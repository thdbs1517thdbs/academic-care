"use server";

import { revalidatePath } from "next/cache";
import {
  academicProcessTypes,
  academicStatuses,
  applicationStatuses,
  managementStatuses,
  type AcademicProcessType,
  type AcademicStatus,
  type ApplicationStatus,
  type ManagementStatus,
} from "@/lib/non-returning/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const memoMaxLength = 500;

export type NonReturningSaveResult =
  | { ok: true; staffMemo?: string }
  | { ok: false; message: string };

const saveError = "저장하지 못했습니다. 화면의 내용은 바꾸지 않았습니다.";

export async function saveNonReturningStaffMemo(
  studentId: string,
  staffMemo: string,
): Promise<NonReturningSaveResult> {
  const id = parseStudentId(studentId);
  if (!id) {
    return { ok: false, message: saveError };
  }

  if (typeof staffMemo !== "string" || staffMemo.trim().length > memoMaxLength) {
    return { ok: false, message: saveError };
  }

  const memo = staffMemo.trim();

  try {
    const updated = await updateStudent(id, {
      staff_memo: memo.length === 0 ? null : memo,
    });

    if (!updated) {
      return { ok: false, message: saveError };
    }
  } catch {
    return { ok: false, message: saveError };
  }

  revalidateNonReturning();
  return { ok: true, staffMemo: memo };
}

export async function saveNonReturningAcademicProcess(
  studentId: string,
  processType: AcademicProcessType,
): Promise<NonReturningSaveResult> {
  const id = parseStudentId(studentId);
  const changes = academicProcessChanges(processType);

  if (!id || !changes) {
    return { ok: false, message: saveError };
  }

  try {
    const updated = await updateStudent(id, changes);

    if (!updated) {
      return { ok: false, message: saveError };
    }
  } catch {
    return { ok: false, message: saveError };
  }

  revalidateNonReturning();
  return { ok: true };
}

function parseStudentId(studentId: unknown) {
  if (typeof studentId !== "string") {
    return null;
  }

  const id = studentId.trim();
  if (!/^\d{5,20}$/.test(id)) {
    return null;
  }

  return id;
}

function academicProcessChanges(processType: unknown): {
  application_status: ApplicationStatus;
  academic_status: AcademicStatus;
  management_status: ManagementStatus;
} | null {
  if (
    typeof processType !== "string" ||
    !academicProcessTypes.includes(processType as AcademicProcessType)
  ) {
    return null;
  }

  const applicationStatus = oneOf("신청", applicationStatuses);
  const managementStatus = oneOf("처리 완료", managementStatuses);
  const academicStatus = oneOf(
    processType === "복학 확인" ? "재학" : "휴학",
    academicStatuses,
  );

  if (!applicationStatus || !academicStatus || !managementStatus) {
    return null;
  }

  return {
    application_status: applicationStatus,
    academic_status: academicStatus,
    management_status: managementStatus,
  };
}

function oneOf<T extends string>(value: string, allowed: readonly T[]) {
  return allowed.includes(value as T) ? (value as T) : null;
}

async function updateStudent(
  studentId: string,
  changes:
    | { staff_memo: string | null }
    | {
        application_status: ApplicationStatus;
        academic_status: AcademicStatus;
        management_status: ManagementStatus;
      },
) {
  const supabase = getSupabaseAdmin();
  const existing = await supabase
    .from("non_returning_students")
    .select("student_id")
    .eq("student_id", studentId);

  if (existing.error || existing.data?.length !== 1) {
    return false;
  }

  const updated = await supabase
    .from("non_returning_students")
    .update(changes)
    .eq("student_id", studentId)
    .select("student_id");

  return !updated.error && updated.data?.length === 1;
}

function revalidateNonReturning() {
  revalidatePath("/non-returning");
  revalidatePath("/non-returning-stats");
}
