"use client";

import { useMemo, useState } from "react";
import { Pagination } from "@/components/early-employment/Pagination";
import { KpiCard } from "@/components/home/KpiCard";
import { MemoDialog } from "@/components/non-returning/MemoDialog";
import { StudentDetailDialog } from "@/components/non-returning/StudentDetailDialog";
import {
  ApplicationBadge,
  ManagementBadge,
  NationalityBadge,
} from "@/components/non-returning/StatusBadges";
import { cn } from "@/lib/cn";
import {
  formatDotDate,
  isForeignStudent,
  summarizeNonReturning,
} from "@/lib/non-returning/summary";
import type {
  AcademicProcessType,
  ApplicationStatus,
  ManagementStatus,
  NonReturningStudent,
  NonReturningTab,
} from "@/lib/non-returning/types";
import {
  applicationStatuses,
  departments,
  domesticNationality,
  foreignNationalities,
  managementStatuses,
} from "@/lib/non-returning/types";
import {
  saveNonReturningAcademicProcess,
  saveNonReturningStaffMemo,
} from "@/lib/non-returning/actions";
import { applyAcademicProcess, applyStaffMemo } from "@/lib/non-returning/updates";

const pageSize = 18;

const tabs: { id: NonReturningTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "foreign", label: "외국인 학생" },
  { id: "needs-review", label: "확인 필요" },
  { id: "completed", label: "처리 완료" },
];

const columns = [
  "학생명",
  "학과",
  "학번",
  "이메일",
  "국적",
  "복학대상학기",
  "기존 휴학만료일",
  "신청여부",
  "현재학적",
  "관리상태",
  "담당자 메모",
  "관리",
] as const;

type Filters = {
  query: string;
  department: string;
  nationality: string;
  applicationStatus: "" | ApplicationStatus;
  managementStatus: "" | ManagementStatus;
};

const initialFilters: Filters = {
  query: "",
  department: "",
  nationality: "",
  applicationStatus: "",
  managementStatus: "",
};

const fieldClassName =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-navy-800";

export function NonReturningBoard({
  students: initialStudents,
}: {
  students: NonReturningStudent[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [tab, setTab] = useState<NonReturningTab>("all");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [memoStudentId, setMemoStudentId] = useState<string | null>(null);
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  const summary = summarizeNonReturning(students);
  const nationalities = [domesticNationality, ...foreignNationalities];

  const filtered = useMemo(
    () => students.filter((student) => matches(student, filters, tab)),
    [students, filters, tab],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const filtersActive = Object.values(filters).some((value) => value !== "");
  const memoStudent = students.find((student) => student.id === memoStudentId) ?? null;
  const detailStudent =
    students.find((student) => student.id === detailStudentId) ?? null;

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  async function saveMemo(studentId: string, staffMemo: string) {
    const result = await saveNonReturningStaffMemo(studentId, staffMemo);
    if (!result.ok) {
      return result;
    }

    setStudents((current) =>
      current.map((student) =>
        student.studentId === studentId
          ? applyStaffMemo(student, result.staffMemo ?? staffMemo)
          : student,
      ),
    );
    return result;
  }

  async function confirmProcess(studentId: string, processType: AcademicProcessType) {
    const result = await saveNonReturningAcademicProcess(studentId, processType);
    if (!result.ok) {
      return result;
    }

    setStudents((current) =>
      current.map((student) =>
        student.studentId === studentId
          ? applyAcademicProcess(student, processType)
          : student,
      ),
    );
    return result;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiCard label="복학 대상 학생" value={summary.targetCount} unit="명" />
          <KpiCard label="외국인 학생" value={summary.foreignCount} unit="명" />
          <KpiCard
            label="신청 미확인"
            value={summary.unconfirmedCount}
            unit="명"
            attention
          />
          <KpiCard label="신청 확인" value={summary.confirmedCount} unit="명" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          신청이 확인되지 않은 학생은 확인 필요 또는 연락 완료로 관리합니다.
          제적 여부는 이 시스템에서 결정하지 않으며, 담당자가 신청 사실을 확인한
          뒤 복학 또는 연속휴학으로 처리합니다.
        </p>
      </section>

      <section className="min-w-0 rounded-xl border border-slate-200 bg-white">
        <div className="px-4 pt-4 sm:px-5">
          <div role="tablist" aria-label="미복학 학생 구분" className="flex gap-1 overflow-x-auto border-b border-slate-200">
            {tabs.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setTab(item.id);
                    setPage(1);
                  }}
                  className={cn(
                    "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "border-navy-900 font-semibold text-navy-900"
                      : "border-transparent text-slate-500 hover:text-slate-800",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:flex-wrap lg:items-end">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-500 lg:w-56">
            학생명 또는 학번
            <input
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="학생명 또는 학번"
              className={fieldClassName}
            />
          </label>
          <FilterSelect
            label="학과"
            value={filters.department}
            options={[...departments]}
            onChange={(value) => updateFilter("department", value)}
          />
          <FilterSelect
            label="국적"
            value={filters.nationality}
            options={nationalities}
            onChange={(value) => updateFilter("nationality", value)}
          />
          <FilterSelect
            label="신청 여부"
            value={filters.applicationStatus}
            options={[...applicationStatuses]}
            onChange={(value) =>
              updateFilter(
                "applicationStatus",
                value as Filters["applicationStatus"],
              )
            }
          />
          <FilterSelect
            label="관리상태"
            value={filters.managementStatus}
            options={[...managementStatuses]}
            onChange={(value) =>
              updateFilter(
                "managementStatus",
                value as Filters["managementStatus"],
              )
            }
          />
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setFilters(initialFilters);
                setPage(1);
              }}
              className="h-9 rounded-md px-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              초기화
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <caption className="sr-only">미복학 학생 목록</caption>
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      "px-3 py-2.5 text-xs font-medium whitespace-nowrap text-slate-500",
                      column === "관리" &&
                        "sticky right-0 z-10 w-[11.75rem] min-w-[11.75rem] border-l border-slate-200 bg-slate-50",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-10 text-center text-sm text-slate-500"
                  >
                    조건에 맞는 학생이 없습니다.
                  </td>
                </tr>
              ) : (
                visible.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 bg-white">
                    <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-slate-900">
                      {student.studentName}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700">
                      {student.department}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                      {student.studentId}
                    </td>
                    <td className="max-w-40 px-3 py-3 text-sm text-slate-600">
                      <span className="block truncate" title={student.email}>
                        {student.email}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <NationalityBadge nationality={student.nationality} />
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700">
                      {student.returnSemester}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                      {formatDotDate(student.leaveExpiresOn)}
                    </td>
                    <td className="px-3 py-3">
                      <ApplicationBadge status={student.applicationStatus} />
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700">
                      {student.academicStatus}
                    </td>
                    <td className="px-3 py-3">
                      <ManagementBadge status={student.managementStatus} />
                    </td>
                    <td className="max-w-44 px-3 py-3 text-sm text-slate-600">
                      <span className="block truncate" title={student.staffMemo}>
                        {student.staffMemo || "—"}
                      </span>
                    </td>
                    <td className="sticky right-0 w-[11.75rem] min-w-[11.75rem] border-l border-slate-100 bg-white px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setMemoStudentId(student.id)}
                          className="inline-flex h-7 w-[5.25rem] shrink-0 items-center justify-center rounded-md border border-slate-200 text-xs font-medium whitespace-nowrap text-slate-700 hover:bg-slate-50"
                        >
                          {student.staffMemo ? "수정" : "메모 작성"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailStudentId(student.id)}
                          className="inline-flex h-7 w-[5.25rem] shrink-0 items-center justify-center rounded-md bg-navy-900 text-xs font-medium whitespace-nowrap text-white hover:bg-navy-800"
                        >
                          상세 관리
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500">
            {filtered.length === 0
              ? "0명"
              : `총 ${filtered.length.toLocaleString("ko-KR")}명 중 ${(start + 1).toLocaleString("ko-KR")}–${Math.min(start + pageSize, filtered.length).toLocaleString("ko-KR")}명`}
          </p>
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </section>

      <MemoDialog
        student={memoStudent}
        onClose={() => setMemoStudentId(null)}
        onSave={saveMemo}
      />
      <StudentDetailDialog
        student={detailStudent}
        onClose={() => setDetailStudentId(null)}
        onConfirmProcess={confirmProcess}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[9.5rem] flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
      >
        <option value="">전체</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function matches(
  student: NonReturningStudent,
  filters: Filters,
  tab: NonReturningTab,
) {
  if (tab === "foreign" && !isForeignStudent(student)) {
    return false;
  }
  if (tab === "needs-review" && student.managementStatus !== "확인 필요") {
    return false;
  }
  if (tab === "completed" && student.managementStatus !== "처리 완료") {
    return false;
  }

  const query = filters.query.trim();
  if (
    query &&
    !student.studentName.includes(query) &&
    !student.studentId.includes(query)
  ) {
    return false;
  }
  if (filters.department && student.department !== filters.department) {
    return false;
  }
  if (filters.nationality && student.nationality !== filters.nationality) {
    return false;
  }
  if (
    filters.applicationStatus &&
    student.applicationStatus !== filters.applicationStatus
  ) {
    return false;
  }
  if (
    filters.managementStatus &&
    student.managementStatus !== filters.managementStatus
  ) {
    return false;
  }
  return true;
}
