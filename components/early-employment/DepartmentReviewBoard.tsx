"use client";

import { useMemo, useRef, useState } from "react";
import { EarlyEmploymentTabs } from "@/components/early-employment/EarlyEmploymentTabs";
import { ConfirmationRequestDialog } from "@/components/early-employment/ConfirmationRequestDialog";
import { draftOpeningDepartmentConfirmation } from "@/lib/early-employment/confirmation-actions";
import { groupNeedsReviewByOpeningDepartment } from "@/lib/early-employment/confirmation-request";
import { formatDotDate, getNeedsReviewRecords } from "@/lib/early-employment/review";
import type { EarlyEmploymentRecord } from "@/lib/early-employment/types";

export function DepartmentReviewBoard({
  records,
}: {
  records: EarlyEmploymentRecord[];
}) {
  const groups = useMemo(
    () => groupNeedsReviewByOpeningDepartment(records),
    [records],
  );
  const needsReviewCount = getNeedsReviewRecords(records).length;
  const [expanded, setExpanded] = useState<string[]>([]);
  const [draft, setDraft] = useState<{
    department: string;
    status: "loading" | "ready" | "error";
    text: string;
  } | null>(null);
  const draftingRef = useRef(false);
  const drafting = draft?.status === "loading";

  function toggleDepartment(openingDepartment: string) {
    setExpanded((current) =>
      current.includes(openingDepartment)
        ? current.filter((department) => department !== openingDepartment)
        : [...current, openingDepartment],
    );
  }

  async function requestDraft(openingDepartment: string) {
    if (draftingRef.current) {
      return;
    }

    draftingRef.current = true;
    setDraft({ department: openingDepartment, status: "loading", text: "" });

    try {
      const result = await draftOpeningDepartmentConfirmation(openingDepartment);
      setDraft({
        department: openingDepartment,
        status: result.ok ? "ready" : "error",
        text: result.ok ? result.text : "",
      });
    } catch {
      setDraft({ department: openingDepartment, status: "error", text: "" });
    } finally {
      draftingRef.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-slate-200 bg-white px-4 pt-4 sm:px-5">
        <EarlyEmploymentTabs />
        <p className="py-4 text-sm text-slate-600">
          개설학과 {groups.length.toLocaleString("ko-KR")}곳 · 계획서 확인 필요{" "}
          {needsReviewCount.toLocaleString("ko-KR")}건
        </p>
      </section>

      {groups.map((group) => {
        const isOpen = expanded.includes(group.openingDepartment);

        return (
          <article
            key={group.openingDepartment}
            className="rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {group.openingDepartment}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  계획서 확인 필요 {group.courseCount.toLocaleString("ko-KR")}건
                </p>
                <p className="text-sm text-slate-600">
                  대상 학생 {group.studentCount.toLocaleString("ko-KR")}명
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleDepartment(group.openingDepartment)}
                  className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {isOpen ? "접기" : "대상 보기"}
                </button>
                <button
                  type="button"
                  disabled={drafting}
                  onClick={() => requestDraft(group.openingDepartment)}
                  className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  AI 확인요청 작성
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="overflow-x-auto border-t border-slate-200">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <caption className="sr-only">
                    {group.openingDepartment} 확인 필요 과목
                  </caption>
                  <thead>
                    <tr className="bg-slate-50">
                      {["신청과목", "학생명", "소속학과", "학번", "공결 신청일"].map(
                        (column) => (
                          <th
                            key={column}
                            scope="col"
                            className="px-4 py-2.5 text-xs font-medium whitespace-nowrap text-slate-500"
                          >
                            {column}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {group.records.map((record) => (
                      <tr
                        key={`${record.studentId}-${record.courseName}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-slate-900">
                          {record.courseName}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-800">
                          {record.studentName}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-700">
                          {record.homeDepartment}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                          {record.studentId}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                          {formatDotDate(record.absenceAppliedOn)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        );
      })}

      <ConfirmationRequestDialog
        department={draft?.department ?? null}
        status={draft?.status ?? "loading"}
        text={draft?.text ?? ""}
        onClose={() => setDraft(null)}
      />
    </div>
  );
}
