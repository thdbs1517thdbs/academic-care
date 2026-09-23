"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { earlyEmploymentPageSize } from "@/lib/early-employment/pagination";
import {
  formatDotDate,
  getReviewStatus,
} from "@/lib/early-employment/review";
import type {
  EarlyEmploymentRecord,
  ReviewStatus,
  SubmissionStatus,
} from "@/lib/early-employment/types";
import { EarlyEmploymentTabs } from "@/components/early-employment/EarlyEmploymentTabs";
import { Pagination } from "@/components/early-employment/Pagination";
import { ReviewBadge, SubmissionBadge } from "@/components/early-employment/StatusBadge";

const columns = [
  "학생명",
  "소속학과",
  "학번",
  "공결 신청일",
  "신청과목",
  "개설학과",
  "수업계획서",
  "수업보고서",
  "확인상태",
] as const;

type Filters = {
  query: string;
  homeDepartment: string;
  openingDepartment: string;
  lessonPlanStatus: "" | SubmissionStatus;
  reviewStatus: "" | ReviewStatus;
};

const initialFilters: Filters = {
  query: "",
  homeDepartment: "",
  openingDepartment: "",
  lessonPlanStatus: "",
  reviewStatus: "",
};

const fieldClassName =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-navy-800";

export function EarlyEmploymentBoard({ records }: { records: EarlyEmploymentRecord[] }) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);

  const homeDepartments = useMemo(
    () => uniqueSorted(records.map((record) => record.homeDepartment)),
    [records],
  );
  const openingDepartments = useMemo(
    () => uniqueSorted(records.map((record) => record.openingDepartment)),
    [records],
  );

  const filtered = useMemo(
    () => records.filter((record) => matches(record, filters)),
    [records, filters],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / earlyEmploymentPageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * earlyEmploymentPageSize;
  const visible = filtered.slice(start, start + earlyEmploymentPageSize);
  const filtersActive = hasActiveFilters(filters);

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="px-4 pt-4 sm:px-5">
        <EarlyEmploymentTabs />
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
          label="소속학과"
          value={filters.homeDepartment}
          onChange={(value) => updateFilter("homeDepartment", value)}
          options={homeDepartments}
        />
        <FilterSelect
          label="개설학과"
          value={filters.openingDepartment}
          onChange={(value) => updateFilter("openingDepartment", value)}
          options={openingDepartments}
        />
        <FilterSelect
          label="수업계획서 제출여부"
          value={filters.lessonPlanStatus}
          onChange={(value) =>
            updateFilter("lessonPlanStatus", value as Filters["lessonPlanStatus"])
          }
          options={["제출", "미제출"]}
        />
        <FilterSelect
          label="확인상태"
          value={filters.reviewStatus}
          onChange={(value) =>
            updateFilter("reviewStatus", value as Filters["reviewStatus"])
          }
          options={["정상", "확인 필요"]}
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
        <table className="w-full min-w-[980px] border-collapse text-left">
          <caption className="sr-only">조기취업 공결 신청 과목 목록</caption>
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-3 py-2.5 text-xs font-medium whitespace-nowrap text-slate-500"
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
                  조건에 맞는 신청 과목이 없습니다.
                </td>
              </tr>
            ) : (
              visible.map((record) => {
                const reviewStatus = getReviewStatus(record);
                return (
                  <tr
                    key={rowKey(record)}
                    className={cn(
                      "border-b border-slate-100",
                      reviewStatus === "확인 필요" ? "bg-amber-50" : "bg-white",
                    )}
                  >
                    <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-slate-900">
                      {record.studentName}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700">
                      {record.homeDepartment}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                      {record.studentId}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                      {formatDotDate(record.absenceAppliedOn)}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-800">
                      {record.courseName}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-slate-700">
                      {record.openingDepartment}
                    </td>
                    <td className="px-3 py-3">
                      <SubmissionBadge status={record.lessonPlanStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <SubmissionBadge status={record.lessonReportStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <ReviewBadge status={reviewStatus} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-slate-500">
          {filtered.length === 0
            ? "0건"
            : `총 ${filtered.length.toLocaleString("ko-KR")}건 중 ${(start + 1).toLocaleString("ko-KR")}–${Math.min(start + earlyEmploymentPageSize, filtered.length).toLocaleString("ko-KR")}건`}
        </p>
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>
    </section>
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

function matches(record: EarlyEmploymentRecord, filters: Filters) {
  const query = filters.query.trim();
  if (
    query &&
    !record.studentName.includes(query) &&
    !record.studentId.includes(query)
  ) {
    return false;
  }
  if (filters.homeDepartment && record.homeDepartment !== filters.homeDepartment) {
    return false;
  }
  if (
    filters.openingDepartment &&
    record.openingDepartment !== filters.openingDepartment
  ) {
    return false;
  }
  if (
    filters.lessonPlanStatus &&
    record.lessonPlanStatus !== filters.lessonPlanStatus
  ) {
    return false;
  }
  if (filters.reviewStatus && getReviewStatus(record) !== filters.reviewStatus) {
    return false;
  }
  return true;
}

function hasActiveFilters(filters: Filters) {
  return Object.values(filters).some((value) => value !== "");
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "ko"));
}

function rowKey(record: EarlyEmploymentRecord) {
  return `${record.studentId}-${record.courseName}-${record.openingDepartment}`;
}
