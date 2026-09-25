"use client";

import { useEffect, useRef, useState } from "react";
import { ManagementBadge, NationalityBadge, ApplicationBadge } from "@/components/non-returning/StatusBadges";
import type { NonReturningSaveResult } from "@/lib/non-returning/actions";
import {
  completionRequiresResolutionMessage,
  isResolutionSaveAllowed,
  resolutionChoiceLabel,
  resolutionChoices,
  resolutionViewLabel,
} from "@/lib/non-returning/resolution";
import { formatDotDate } from "@/lib/non-returning/summary";
import type {
  ManagementStatus,
  NonReturningStudent,
  ResolutionType,
} from "@/lib/non-returning/types";
import { managementStatuses } from "@/lib/non-returning/types";

type StudentDetailDialogProps = {
  student: NonReturningStudent | null;
  onClose: () => void;
  onSaveResolution: (
    studentId: string,
    resolutionType: ResolutionType | null,
    managementStatus: ManagementStatus,
  ) => Promise<NonReturningSaveResult>;
};

export function StudentDetailDialog({
  student,
  onClose,
  onSaveResolution,
}: StudentDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const [editing, setEditing] = useState(false);
  const [draftResolution, setDraftResolution] = useState<ResolutionType | null>(null);
  const [draftManagement, setDraftManagement] = useState<ManagementStatus>("확인 필요");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setEditing(false);
    setDraftResolution(student?.resolutionType ?? null);
    setDraftManagement(student?.managementStatus ?? "확인 필요");
    setConfirming(false);
    setPending(false);
    setError("");
  }, [student?.id, student?.resolutionType, student?.managementStatus]);

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

  function beginEdit() {
    if (!student) {
      return;
    }

    setDraftResolution(student.resolutionType);
    setDraftManagement(student.managementStatus);
    setError("");
    setConfirming(false);
    setEditing(true);
  }

  function cancelEdit() {
    if (!student || pending) {
      return;
    }

    setDraftResolution(student.resolutionType);
    setDraftManagement(student.managementStatus);
    setError("");
    setConfirming(false);
    setEditing(false);
  }

  async function saveResolution() {
    if (!student || pending || !canSave) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const result = await onSaveResolution(
        student.studentId,
        draftResolution,
        draftManagement,
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirming(false);
      setEditing(false);
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
    if (pending) {
      return;
    }
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    onClose();
  }

  const allowed = isResolutionSaveAllowed(draftResolution, draftManagement);
  const dirty =
    draftResolution !== student.resolutionType ||
    draftManagement !== student.managementStatus;
  const canSave = editing && allowed && dirty && !pending;
  const currentResolutionLabel = resolutionViewLabel(
    student.resolutionType,
    student.managementStatus,
  );

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(44rem,calc(100%-2rem))] rounded-xl border border-slate-200 p-0 text-slate-800 shadow-lg backdrop:bg-slate-900/40"
      onClose={() => onCloseRef.current()}
      onClick={(event) => {
        if (event.target === event.currentTarget && !confirming && !pending) {
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
              처리 유형과 관리상태는 따로 저장합니다. 신청여부, 현재학적, 담당자
              메모는 이 저장에서 바뀌지 않습니다.
            </p>
            {editing ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <fieldset className="rounded-md border border-slate-200 bg-white p-3">
                  <legend className="px-1 text-sm font-medium text-slate-800">
                    처리 유형
                  </legend>
                  <div className="flex flex-col gap-2">
                    {resolutionChoices.map((choice) => {
                      const value = choice === "선택 안 함" ? null : choice;
                      return (
                        <label
                          key={choice}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="radio"
                            name="resolution-type"
                            value={choice}
                            checked={draftResolution === value}
                            disabled={pending}
                            onChange={() => setDraftResolution(value)}
                          />
                          {choice}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <fieldset className="rounded-md border border-slate-200 bg-white p-3">
                  <legend className="px-1 text-sm font-medium text-slate-800">
                    관리상태
                  </legend>
                  <div className="flex flex-col gap-2">
                    {managementStatuses.map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="radio"
                          name="management-status"
                          value={status}
                          checked={draftManagement === status}
                          disabled={pending}
                          onChange={() => setDraftManagement(status)}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : (
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-medium text-slate-500">처리 유형</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {currentResolutionLabel}
                  </dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-medium text-slate-500">관리상태</dt>
                  <dd className="mt-1">
                    <ManagementBadge status={student.managementStatus} />
                  </dd>
                </div>
              </dl>
            )}
            {editing && !allowed ? (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {completionRequiresResolutionMessage}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={pending}
                    className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={!canSave}
                    onClick={() => {
                      setError("");
                      setConfirming(true);
                    }}
                    className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    변경사항 저장
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={beginEdit}
                  className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800"
                >
                  처리 내용 수정
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={dismiss}
            disabled={pending}
            className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            닫기
          </button>
        </div>

        {confirming ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 p-4">
            <div
              role="alertdialog"
              aria-labelledby="resolution-confirm-title"
              className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
            >
              <h3
                id="resolution-confirm-title"
                className="text-base font-semibold text-slate-900"
              >
                {student.studentName} 학생의 처리 내용을 변경하시겠습니까?
              </h3>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
                <div>
                  <p className="font-medium text-slate-900">기존</p>
                  <p>처리 유형: {currentResolutionLabel}</p>
                  <p>관리상태: {student.managementStatus}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">변경</p>
                  <p>처리 유형: {resolutionChoiceLabel(draftResolution)}</p>
                  <p>관리상태: {draftManagement}</p>
                </div>
              </div>
              {error ? (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setError("");
                    setConfirming(false);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={pending || !canSave}
                  onClick={saveResolution}
                  className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  변경 저장
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
