"use client";

import { useEffect, useRef } from "react";
import type { NonReturningUploadPreview } from "@/lib/non-returning/import-actions";

const counts = [
  { key: "totalCount", label: "전체 행 수" },
  { key: "validCount", label: "정상 행 수" },
  { key: "errorCount", label: "오류 행 수" },
  { key: "newCount", label: "신규 학생 수" },
  { key: "existingCount", label: "기존 학생 수" },
] as const;

export function UploadPreviewDialog({
  preview,
  pending,
  error,
  onClose,
  onApply,
}: {
  preview: NonReturningUploadPreview | null;
  pending: boolean;
  error: string;
  onClose: () => void;
  onApply: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !preview) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [preview]);

  if (!preview) {
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

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(56rem,calc(100%-2rem))] rounded-xl border border-slate-200 p-0 text-slate-800 shadow-lg backdrop:bg-slate-900/40"
      onClose={() => onCloseRef.current()}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          dismiss();
        }
      }}
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">업로드 미리보기</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          오류가 있는 행은 반영되지 않습니다. 기존 학생의 관리상태와 담당자메모는 유지됩니다.
        </p>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {counts.map((item) => (
            <div key={item.key} className="rounded-md border border-slate-200 px-3 py-2">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                {preview[item.key].toLocaleString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 max-h-80 overflow-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">업로드 검증 결과</caption>
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200">
                {["행", "학생명", "학과", "학번", "국적", "신청여부", "검증결과"].map(
                  (column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-3 py-2 text-xs font-medium whitespace-nowrap text-slate-500"
                    >
                      {column}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {preview.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                    반영할 학생 행이 없습니다.
                  </td>
                </tr>
              ) : (
                preview.rows.map((row) => (
                  <tr key={row.rowNumber} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-sm tabular-nums text-slate-500">
                      {row.rowNumber}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap text-slate-900">
                      {row.studentName || "—"}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap text-slate-700">
                      {row.department || "—"}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap text-slate-700 tabular-nums">
                      {row.studentId || "—"}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap text-slate-700">
                      {row.nationality || "—"}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap text-slate-700">
                      {row.applicationStatus || "—"}
                    </td>
                    <td
                      className={
                        row.valid
                          ? "px-3 py-2 text-sm whitespace-nowrap text-navy-900"
                          : "px-3 py-2 text-sm text-red-700"
                      }
                    >
                      {row.result}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <button
          type="button"
          onClick={onApply}
          disabled={pending || preview.validCount === 0}
          className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? "반영 중" : "반영"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          disabled={pending}
          className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          닫기
        </button>
      </div>
    </dialog>
  );
}
