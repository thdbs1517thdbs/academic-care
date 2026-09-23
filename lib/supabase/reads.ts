import "server-only";

import type { EarlyEmploymentRecord, SubmissionStatus } from "@/lib/early-employment/types";
import type { ConfirmedNonReturningTerm } from "@/lib/non-returning/history";
import type {
  AcademicStatus,
  ApplicationStatus,
  Department,
  ManagementStatus,
  NonReturningStudent,
} from "@/lib/non-returning/types";
import {
  academicStatuses,
  applicationStatuses,
  departments,
  managementStatuses,
} from "@/lib/non-returning/types";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

const pageSize = 1000;

type EarlyEmploymentRow = {
  student_name: string;
  home_department: string;
  student_id: string;
  application_date: string;
  course_name: string;
  offering_department: string;
  plan_submitted: boolean;
  report_submitted: boolean;
};

type NonReturningStudentRow = {
  student_name: string;
  department: string;
  student_id: string;
  email: string;
  nationality: string;
  return_semester: string;
  leave_end_date: string;
  application_status: string;
  academic_status: string;
  management_status: string;
  staff_memo: string | null;
};

type NonReturningHistoryRow = {
  semester: string;
  total_dismissals: number;
  foreign_dismissals: number;
};

async function selectAll<T>(
  table: string,
  columns: string,
  orderColumns: string[],
): Promise<T[]> {
  const supabase = getSupabaseAdmin();
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    let query = supabase.from(table).select(columns).range(from, from + pageSize - 1);

    for (const column of orderColumns) {
      query = query.order(column, { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to read public.${table}: ${error.message}`);
    }

    const page = (data ?? []) as T[];
    rows.push(...page);

    if (page.length < pageSize) {
      return rows;
    }
  }
}

function requireText(value: unknown, field: string, table: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Unexpected ${field} from public.${table}.`);
  }

  return value;
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  table: string,
) {
  if (typeof value === "string" && allowed.includes(value as T)) {
    return value as T;
  }

  throw new Error(`Unexpected ${field} from public.${table}.`);
}

function toSubmissionStatus(value: unknown, field: string): SubmissionStatus {
  if (typeof value !== "boolean") {
    throw new Error(`Unexpected ${field} from public.early_employment_records.`);
  }

  return value ? "제출" : "미제출";
}

function toEarlyEmploymentRecord(row: EarlyEmploymentRow): EarlyEmploymentRecord {
  return {
    studentName: requireText(row.student_name, "student_name", "early_employment_records"),
    homeDepartment: requireText(
      row.home_department,
      "home_department",
      "early_employment_records",
    ),
    studentId: requireText(row.student_id, "student_id", "early_employment_records"),
    absenceAppliedOn: requireText(
      row.application_date,
      "application_date",
      "early_employment_records",
    ),
    courseName: requireText(row.course_name, "course_name", "early_employment_records"),
    openingDepartment: requireText(
      row.offering_department,
      "offering_department",
      "early_employment_records",
    ),
    lessonPlanStatus: toSubmissionStatus(row.plan_submitted, "plan_submitted"),
    lessonReportStatus: toSubmissionStatus(row.report_submitted, "report_submitted"),
  };
}

function toNonReturningStudent(row: NonReturningStudentRow): NonReturningStudent {
  const studentId = requireText(row.student_id, "student_id", "non_returning_students");

  return {
    id: studentId,
    studentName: requireText(row.student_name, "student_name", "non_returning_students"),
    department: oneOf(row.department, departments, "department", "non_returning_students"),
    studentId,
    email: requireText(row.email, "email", "non_returning_students"),
    nationality: requireText(row.nationality, "nationality", "non_returning_students"),
    returnSemester: requireText(
      row.return_semester,
      "return_semester",
      "non_returning_students",
    ),
    leaveExpiresOn: requireText(
      row.leave_end_date,
      "leave_end_date",
      "non_returning_students",
    ),
    applicationStatus: oneOf(
      row.application_status,
      applicationStatuses,
      "application_status",
      "non_returning_students",
    ) satisfies ApplicationStatus,
    academicStatus: oneOf(
      row.academic_status,
      academicStatuses,
      "academic_status",
      "non_returning_students",
    ) satisfies AcademicStatus,
    managementStatus: oneOf(
      row.management_status,
      managementStatuses,
      "management_status",
      "non_returning_students",
    ) satisfies ManagementStatus,
    staffMemo:
      row.staff_memo == null
        ? ""
        : requireText(row.staff_memo, "staff_memo", "non_returning_students"),
  };
}

function toConfirmedTerm(row: NonReturningHistoryRow): ConfirmedNonReturningTerm {
  if (typeof row.total_dismissals !== "number" || typeof row.foreign_dismissals !== "number") {
    throw new Error(
      "Unexpected total_dismissals or foreign_dismissals from public.non_returning_history.",
    );
  }

  return {
    semester: requireText(row.semester, "semester", "non_returning_history"),
    totalCount: row.total_dismissals,
    foreignCount: row.foreign_dismissals,
  };
}

export async function getEarlyEmploymentRecords() {
  const rows = await selectAll<EarlyEmploymentRow>(
    "early_employment_records",
    "student_name, home_department, student_id, application_date, course_name, offering_department, plan_submitted, report_submitted",
    ["student_id", "course_name"],
  );

  return rows.map(toEarlyEmploymentRecord);
}

export async function getNonReturningStudents() {
  const rows = await selectAll<NonReturningStudentRow>(
    "non_returning_students",
    "student_name, department, student_id, email, nationality, return_semester, leave_end_date, application_status, academic_status, management_status, staff_memo",
    ["student_id"],
  );

  return rows.map(toNonReturningStudent);
}

export async function getNonReturningHistory() {
  const rows = await selectAll<NonReturningHistoryRow>(
    "non_returning_history",
    "semester, total_dismissals, foreign_dismissals",
    ["semester"],
  );

  return rows.map(toConfirmedTerm);
}
