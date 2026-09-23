"use client";

import { useEffect, useRef, useState } from "react";
import {
  ApplicationBadge,
  ManagementBadge,
  NationalityBadge,
} from "@/components/non-returning/StatusBadges";
import type { NonReturningSaveResult } from "@/lib/non-returning/actions";
import { formatDotDate } from "@/lib/non-returning/summary";
import type {
  AcademicProcessType,
  NonReturningStudent,
} from "@/lib/non-returning/types";
import { academicProcessTypes } from "@/lib/non-returning/types";

type StudentDetailDialogProps = {
  student: NonReturningStudent | null;
  onClose: () => void;
  onConfirmProcess: (
    studentId: string,
    processType: AcademicProcessType,
  ) => Promise<NonReturningSaveResult>;
};

export function StudentDetailDialog({
  student,
  onClose,
  onConfirmProcess,
}: StudentDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const [processType, setProcessType] = useState<AcademicProcessType | "">("");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setProcessType("");
    setConfirming(false);
    setPending(false);
    setError("");
  }, [student?.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !student) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [student]);

  async function confirmProcess() {
    if (!student || !processType || pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const result = await onConfirmProcess(student.studentId, processType);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirming(false);
    } catch {
      setError("저장하지 못했습니다. 화면의 내용은 바꾸지 않았습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!student) {
    return null;
  }

  function dismiss() {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    onClose();
  }

  const completed = student.managementStatus === "처리 완료";

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(44rem,calc(100%-2rem))] rounded-xl border border-slate-200 p-0 text-slate-800 shadow-lg backdrop:bg-slate-900/40"
      onClose={() => onCloseRef.current()}
      onClick={(event) => {
        if (event.target === event.currentTarget && !confirming) {
          dismiss();
        }
      }}
    >
      <div className="relative">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">상세 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            {student.studentName} · {student.studentId}
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <DetailItem label="학생명" value={student.studentName} />
            <DetailItem label="학과" value={student.department} />
            <DetailItem label="학번" value={student.studentId} />
            <DetailItem label="이메일" value={student.email} />
            <div>
              <dt className="text-xs font-medium text-slate-500">국적</dt>
              <dd className="mt-1">
                <NationalityBadge nationality={student.nationality} />
              </dd>
            </div>
            <DetailItem label="복학대상학기" value={student.returnSemester} />
            <DetailItem
              label="기존 휴학만료일"
              value={formatDotDate(student.leaveExpiresOn)}
            />
            <div>
              <dt className="text-xs font-medium text-slate-500">신청여부</dt>
              <dd className="mt-1">
                <ApplicationBadge status={student.applicationStatus} />
              </dd>
            </div>
            <DetailItem label="현재학적" value={student.academicStatus} />
            <div>
              <dt className="text-xs font-medium text-slate-500">관리상태</dt>
              <dd className="mt-1">
                <ManagementBadge status={student.managementStatus} />
              </dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">담당자 메모</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {student.staffMemo || "등록된 메모가 없습니다."}
            </p>
          </div>

          <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">학적 처리</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              신청 사실을 확인한 뒤 복학 또는 연속휴학으로 처리합니다. 제적
              여부는 이 화면에서 결정하지 않습니다.
            </p>
            {completed ? (
              <p className="mt-3 text-sm text-slate-700">
                이미 처리가 완료된 학생입니다.
              </p>
            ) : (
              <fieldset className="mt-3">
                <legend className="text-sm font-medium text-slate-700">
                  처리 유형
                </legend>
                <div className="mt-2 flex flex-col gap-2">
                  {academicProcessTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        name="process-type"
                        value={type}
                        checked={processType === type}
                        onChange={() => setProcessType(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!processType}
                  onClick={() => setConfirming(true)}
                  className="mt-4 rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  처리 완료
                </button>
              </fieldset>
            )}
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        {confirming && processType && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 p-4">
            <div
              role="alertdialog"
              aria-labelledby="process-confirm-title"
              className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
            >
              <h3
                id="process-confirm-title"
                className="text-base font-semibold text-slate-900"
              >
                처리 확인
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {student.studentName} 학생을 {processType}으로 처리하시겠습니까?
              </p>
              {error ? (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={confirmProcess}
                  className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  확인
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm break-all text-slate-800">{value}</dd>
    </div>
  );
}
