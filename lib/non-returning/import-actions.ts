"use server";

import { revalidatePath } from "next/cache";
import {
  buildNonReturningTemplate,
  buildNonReturningWorkbook,
  isValidUploadRow,
  nonReturningExportFilename,
  nonReturningTemplateFilename,
  parseNonReturningWorkbook,
  type UploadDraftRow,
  type ValidUploadRow,
} from "@/lib/non-returning/excel";
import type { NonReturningStudent } from "@/lib/non-returning/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getNonReturningStudents } from "@/lib/supabase/reads";

const saveError = "반영하지 못했습니다. 화면의 내용은 바꾸지 않았습니다.";
const permissionError =
  "반영 권한이 없습니다. 학생 정보 추가와 기초정보 수정 권한이 필요합니다.";

export type NonReturningUploadPreviewRow = {
  rowNumber: number;
  studentName: string;
  department: string;
  studentId: string;
  nationality: string;
  applicationStatus: string;
  valid: boolean;
  result: string;
};

export type NonReturningUploadPreview = {
  totalCount: number;
  validCount: number;
  errorCount: number;
  newCount: number;
  existingCount: number;
  rows: NonReturningUploadPreviewRow[];
};

export type NonReturningFileResult = {
  filename: string;
  base64: string;
};

export type NonReturningUploadPreviewResult =
  | { ok: true; preview: NonReturningUploadPreview }
  | { ok: false; message: string };

export type NonReturningUploadApplyResult =
  | { ok: true; message: string; students: NonReturningStudent[] }
  | { ok: false; message: string };

type ExcelApplyCount = {
  total: number;
  inserted: number;
  updated: number;
};

export async function downloadNonReturningTemplate(): Promise<NonReturningFileResult> {
  const buffer = await buildNonReturningTemplate();
  return {
    filename: nonReturningTemplateFilename,
    base64: Buffer.from(buffer).toString("base64"),
  };
}

export async function downloadNonReturningStudents(): Promise<NonReturningFileResult> {
  const students = await getNonReturningStudents();
  const buffer = await buildNonReturningWorkbook(students);
  return {
    filename: nonReturningExportFilename,
    base64: Buffer.from(buffer).toString("base64"),
  };
}

export async function previewNonReturningUpload(
  fileBase64: string,
): Promise<NonReturningUploadPreviewResult> {
  const parsed = await readUpload(fileBase64);
  if (!parsed.ok) {
    return parsed;
  }

  try {
    const existing = await existingStudentIds(
      parsed.rows.filter(isValidUploadRow).map((row) => row.value.studentId),
    );
    const rows = parsed.rows.map((row) => toPreviewRow(row, existing));
    return {
      ok: true,
      preview: {
        totalCount: rows.length,
        validCount: rows.filter((row) => row.valid).length,
        errorCount: rows.filter((row) => !row.valid).length,
        newCount: rows.filter((row) => row.result === "신규").length,
        existingCount: rows.filter((row) => row.result === "기존").length,
        rows,
      },
    };
  } catch (error) {
    return { ok: false, message: messageForError(error) };
  }
}

export async function applyNonReturningUpload(
  fileBase64: string,
): Promise<NonReturningUploadApplyResult> {
  const parsed = await readUpload(fileBase64);
  if (!parsed.ok) {
    return parsed;
  }

  const validRows = parsed.rows.filter(isValidUploadRow).map((row) => row.value);
  if (validRows.length === 0) {
    return { ok: false, message: "반영할 정상 행이 없습니다." };
  }

  try {
    const applied = await getSupabaseAdmin().rpc("apply_non_returning_excel", {
      rows: validRows.map(excelApplyRow),
    });
    const count = applied.error ? null : readApplyCount(applied.data);

    if (!count || count.total !== validRows.length) {
      return { ok: false, message: messageForError(applied.error) };
    }

    const students = await getNonReturningStudents();
    revalidatePath("/non-returning");
    revalidatePath("/non-returning-stats");
    revalidatePath("/");

    return {
      ok: true,
      message: `정상 ${count.total.toLocaleString("ko-KR")}건을 반영했습니다. 신규 ${count.inserted.toLocaleString("ko-KR")}명, 기존 ${count.updated.toLocaleString("ko-KR")}명입니다.`,
      students,
    };
  } catch (error) {
    return { ok: false, message: messageForError(error) };
  }
}

async function readUpload(fileBase64: string) {
  if (typeof fileBase64 !== "string" || fileBase64.length === 0 || fileBase64.length > 1_400_000) {
    return { ok: false as const, message: "엑셀 파일을 읽지 못했습니다." };
  }

  const bytes = Buffer.from(fileBase64, "base64");
  if (
    bytes.length < 4 ||
    bytes.length > 1_000_000 ||
    bytes[0] !== 0x50 ||
    bytes[1] !== 0x4b
  ) {
    return { ok: false as const, message: "xlsx 파일만 업로드할 수 있습니다." };
  }

  return parseNonReturningWorkbook(bytes);
}

function toPreviewRow(row: UploadDraftRow, existing: Set<string>): NonReturningUploadPreviewRow {
  const valid = isValidUploadRow(row);
  const result = !valid
    ? row.errors.join(" ")
    : existing.has(row.value.studentId)
      ? "기존"
      : "신규";

  return {
    rowNumber: row.rowNumber,
    studentName: row.studentName,
    department: row.department,
    studentId: row.studentId,
    nationality: row.nationality,
    applicationStatus: row.applicationStatus,
    valid,
    result,
  };
}

function excelApplyRow(row: ValidUploadRow) {
  return {
    student_name: row.studentName,
    department: row.department,
    student_id: row.studentId,
    email: row.email,
    nationality: row.nationality,
    return_semester: row.returnSemester,
    leave_end_date: row.leaveExpiresOn,
    application_status: row.applicationStatus,
    academic_status: row.academicStatus,
  };
}

function readApplyCount(value: unknown): ExcelApplyCount | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.total !== "number" ||
    typeof record.inserted !== "number" ||
    typeof record.updated !== "number" ||
    record.inserted + record.updated !== record.total
  ) {
    return null;
  }

  return {
    total: record.total,
    inserted: record.inserted,
    updated: record.updated,
  };
}

async function existingStudentIds(studentIds: string[]) {
  const uniqueIds = [...new Set(studentIds)];
  const existing = new Set<string>();
  if (uniqueIds.length === 0) {
    return existing;
  }

  const supabase = getSupabaseAdmin();
  for (let index = 0; index < uniqueIds.length; index += 100) {
    const chunk = uniqueIds.slice(index, index + 100);
    const result = await supabase
      .from("non_returning_students")
      .select("student_id")
      .in("student_id", chunk);

    if (result.error) {
      throw result.error;
    }

    for (const row of result.data ?? []) {
      if (typeof row.student_id === "string") {
        existing.add(row.student_id);
      }
    }
  }

  return existing;
}

function messageForError(error: unknown) {
  if (!error || typeof error !== "object") {
    return saveError;
  }

  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  if (code === "42501" || /permission denied/i.test(message)) {
    return permissionError;
  }

  return saveError;
}
