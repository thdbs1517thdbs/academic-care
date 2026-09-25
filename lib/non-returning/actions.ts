"use server";

import { revalidatePath } from "next/cache";
import {
  isResolutionSaveAllowed,
  parseManagementStatus,
  parseResolutionType,
  completionRequiresResolutionMessage,
} from "@/lib/non-returning/resolution";
import type { ManagementStatus, ResolutionType } from "@/lib/non-returning/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const memoMaxLength = 500;

export type NonReturningSaveResult =
  | {
      ok: true;
      staffMemo?: string;
      resolutionType?: ResolutionType | null;
      managementStatus?: ManagementStatus;
    }
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

export async function saveNonReturningResolution(
  studentId: string,
  resolutionType: ResolutionType | null,
  managementStatus: ManagementStatus,
): Promise<NonReturningSaveResult> {
  const id = parseStudentId(studentId);
  const resolution = parseResolutionType(resolutionType);
  const management = parseManagementStatus(managementStatus);

  if (!id || resolution === undefined || !management) {
    return { ok: false, message: saveError };
  }

  if (!isResolutionSaveAllowed(resolution, management)) {
    return { ok: false, message: completionRequiresResolutionMessage };
  }

  const changes = {
    resolution_type: resolution,
    management_status: management,
  };

  try {
    const updated = await updateStudent(id, changes);

    if (!updated) {
      return { ok: false, message: saveError };
    }
  } catch {
    return { ok: false, message: saveError };
  }

  revalidateNonReturning();
  return {
    ok: true,
    resolutionType: resolution,
    managementStatus: management,
  };
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

async function updateStudent(
  studentId: string,
  changes:
    | { staff_memo: string | null }
    | {
        resolution_type: ResolutionType | null;
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
