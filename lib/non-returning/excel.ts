import ExcelJS, { type Cell, type CellValue } from "exceljs";
import { formatDotDate } from "@/lib/non-returning/summary";
import {
  academicStatuses,
  applicationStatuses,
  departments,
  type AcademicStatus,
  type ApplicationStatus,
  type Department,
  type NonReturningStudent,
} from "@/lib/non-returning/types";

export const nonReturningTemplateFilename =
  "Academic_Care_미복학학생_업로드양식.xlsx";

export const nonReturningExportFilename = "Academic_Care_미복학학생.xlsx";

export const uploadHeaders = [
  "학생명",
  "학과",
  "학번",
  "이메일",
  "국적",
  "복학대상학기",
  "기존 휴학만료일",
  "신청여부",
  "현재학적",
] as const;

export const downloadHeaders = [
  ...uploadHeaders,
  "관리상태",
  "담당자메모",
] as const;

const maxUploadRows = 1000;

export type ValidUploadRow = {
  studentName: string;
  department: Department;
  studentId: string;
  email: string;
  nationality: string;
  returnSemester: string;
  leaveExpiresOn: string;
  applicationStatus: ApplicationStatus;
  academicStatus: AcademicStatus;
};

export type UploadDraftRow = {
  rowNumber: number;
  studentName: string;
  department: string;
  studentId: string;
  nationality: string;
  applicationStatus: string;
  errors: string[];
  value: ValidUploadRow | null;
};

export function isValidUploadRow(row: UploadDraftRow): row is UploadDraftRow & {
  value: ValidUploadRow;
} {
  return row.value !== null && row.errors.length === 0;
}

export async function buildNonReturningTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("미복학학생");
  writeHeader(sheet, uploadHeaders);
  return workbook.xlsx.writeBuffer();
}

export async function buildNonReturningWorkbook(students: NonReturningStudent[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("미복학학생");
  writeHeader(sheet, downloadHeaders);

  for (const student of students) {
    sheet.addRow([
      student.studentName,
      student.department,
      student.studentId,
      student.email,
      student.nationality,
      student.returnSemester,
      formatDotDate(student.leaveExpiresOn),
      student.applicationStatus,
      student.academicStatus,
      student.managementStatus,
      student.staffMemo,
    ]);
  }

  const studentIdColumn = downloadHeaders.indexOf("학번") + 1;
  sheet.getColumn(studentIdColumn).numFmt = "@";

  return workbook.xlsx.writeBuffer();
}

export async function parseNonReturningWorkbook(
  bytes: Uint8Array,
): Promise<{ ok: true; rows: UploadDraftRow[] } | { ok: false; message: string }> {
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(Buffer.from(bytes) as never);
  } catch {
    return {
      ok: false,
      message: "엑셀 파일을 읽지 못했습니다. xlsx 파일인지 확인해 주세요.",
    };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { ok: false, message: "시트가 없습니다." };
  }

  const headerRow = sheet.getRow(1);
  const headerIndex = new Map<string, number>();
  headerRow.eachCell({ includeEmpty: false }, (cell, column) => {
    const text = readText(cell.value);
    if (text) {
      headerIndex.set(text, column);
    }
  });

  const missing = uploadHeaders.filter((header) => !headerIndex.has(header));
  if (missing.length > 0) {
    return {
      ok: false,
      message: `컬럼명이 올바르지 않습니다. 필요한 컬럼: ${uploadHeaders.join(", ")}`,
    };
  }

  const rows: UploadDraftRow[] = [];
  let stopped = false;
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (stopped || rowNumber === 1) {
      return;
    }

    const values = uploadHeaders.map((header) => {
      const column = headerIndex.get(header);
      return column ? row.getCell(column) : null;
    });
    const texts = values.map((cell) => (cell ? readText(cell.value) : ""));
    if (texts.every((text) => text === "")) {
      return;
    }

    rows.push(buildDraft(rowNumber, texts, values[uploadHeaders.indexOf("기존 휴학만료일")]));
    if (rows.length > maxUploadRows) {
      stopped = true;
    }
  });

  if (stopped) {
    return { ok: false, message: "한 번에 1,000행까지만 업로드할 수 있습니다." };
  }

  const idCounts = new Map<string, number>();
  for (const row of rows) {
    if (!row.studentId) {
      continue;
    }
    idCounts.set(row.studentId, (idCounts.get(row.studentId) ?? 0) + 1);
  }

  for (const row of rows) {
    if (row.studentId && (idCounts.get(row.studentId) ?? 0) > 1) {
      row.errors.push("파일 안에 같은 학번이 있습니다.");
      row.value = null;
    }
  }

  return { ok: true, rows };
}

function buildDraft(
  rowNumber: number,
  texts: string[],
  dateCell: Cell | null,
): UploadDraftRow {
  const [
    studentName = "",
    department = "",
    studentId = "",
    email = "",
    nationality = "",
    returnSemester = "",
    leaveText = "",
    applicationStatus = "",
    academicStatus = "",
  ] = texts;
  const errors: string[] = [];

  if (!studentName) {
    errors.push("학생명을 입력해 주세요.");
  } else if (studentName.length > 50) {
    errors.push("학생명이 너무 깁니다.");
  }

  if (!department) {
    errors.push("학과를 입력해 주세요.");
  } else if (!isDepartment(department)) {
    errors.push("등록된 학과명이 아닙니다.");
  }

  if (!studentId) {
    errors.push("학번을 입력해 주세요.");
  } else if (!/^\d{5,20}$/.test(studentId)) {
    errors.push("학번 형식이 올바르지 않습니다.");
  }

  if (email.length > 200) {
    errors.push("이메일이 너무 깁니다.");
  }

  if (!nationality) {
    errors.push("국적을 입력해 주세요.");
  } else if (nationality.length > 40) {
    errors.push("국적이 너무 깁니다.");
  }

  if (!returnSemester) {
    errors.push("복학대상학기를 입력해 주세요.");
  } else if (returnSemester.length > 40) {
    errors.push("복학대상학기가 너무 깁니다.");
  }

  const rawDate = dateCell?.value;
  const hasDateValue =
    leaveText !== "" ||
    rawDate instanceof Date ||
    (typeof rawDate === "number" && rawDate > 0);
  const leaveExpiresOn = hasDateValue ? readDate(rawDate, leaveText) : null;
  if (!hasDateValue) {
    errors.push("기존 휴학만료일을 입력해 주세요.");
  } else if (!leaveExpiresOn) {
    errors.push("기존 휴학만료일 형식이 올바르지 않습니다.");
  }

  if (!applicationStatus) {
    errors.push("신청여부를 입력해 주세요.");
  } else if (!isApplicationStatus(applicationStatus)) {
    errors.push("신청여부는 신청 또는 미신청만 입력할 수 있습니다.");
  }

  if (!academicStatus) {
    errors.push("현재학적을 입력해 주세요.");
  } else if (!isAcademicStatus(academicStatus)) {
    errors.push("현재학적은 휴학 또는 재학만 입력할 수 있습니다.");
  }

  const value =
    errors.length === 0 &&
    isDepartment(department) &&
    leaveExpiresOn &&
    isApplicationStatus(applicationStatus) &&
    isAcademicStatus(academicStatus)
      ? {
          studentName,
          department,
          studentId,
          email,
          nationality,
          returnSemester,
          leaveExpiresOn,
          applicationStatus,
          academicStatus,
        }
      : null;

  return {
    rowNumber,
    studentName,
    department,
    studentId,
    nationality,
    applicationStatus,
    errors,
    value,
  };
}

function writeHeader(sheet: ExcelJS.Worksheet, headers: readonly string[]) {
  const header = sheet.addRow([...headers]);
  header.font = { bold: true };
  header.alignment = { vertical: "middle" };
  headers.forEach((name, index) => {
    sheet.getColumn(index + 1).width = Math.max(name.length * 2 + 2, 14);
  });
  const studentIdColumn = headers.indexOf("학번");
  if (studentIdColumn >= 0) {
    sheet.getColumn(studentIdColumn + 1).numFmt = "@";
  }
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

function readText(value: CellValue): string {
  if (value == null) {
    return "";
  }
  if (value instanceof Date) {
    return readDate(value, "") ?? "";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : String(value);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "boolean") {
    return "";
  }
  if (typeof value === "object") {
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("").trim();
    }
    if ("text" in value && typeof value.text === "string") {
      return value.text.trim();
    }
    if ("result" in value) {
      return readText(value.result ?? null);
    }
  }
  return "";
}

function readDate(value: CellValue | undefined, text: string) {
  if (value instanceof Date) {
    return isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  if (typeof value === "number") {
    if (value >= 19000101 && value <= 21001231) {
      const year = Math.floor(value / 10000);
      const month = Math.floor((value % 10000) / 100);
      const day = value % 100;
      return isoDate(year, month, day);
    }
    if (value > 0 && value < 80000) {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000);
      return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }
  }

  if (value && typeof value === "object" && "result" in value) {
    return readDate(value.result ?? null, text);
  }

  const match = text.match(/^(\d{4})[./-](\d{2})[./-](\d{2})$/);
  if (!match) {
    return null;
  }

  return isoDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

function isoDate(year: number, month: number, day: number) {
  if (year < 1900 || year > 2100) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const monthText = String(month).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}

function isDepartment(value: string): value is Department {
  return (departments as readonly string[]).includes(value);
}

function isApplicationStatus(value: string): value is ApplicationStatus {
  return (applicationStatuses as readonly string[]).includes(value);
}

function isAcademicStatus(value: string): value is AcademicStatus {
  return (academicStatuses as readonly string[]).includes(value);
}
