"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { NonReturningSaveResult } from "@/lib/non-returning/actions";
import type { NonReturningStudent } from "@/lib/non-returning/types";

type MemoDialogProps = {
  student: NonReturningStudent | null;
  onClose: () => void;
  onSave: (studentId: string, staffMemo: string) => Promise<NonReturningSaveResult>;
};

export function MemoDialog({ student, onClose, onSave }: MemoDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !student) {
      return;
    }

    setDraft(student.staffMemo);
    setError("");
    setPending(false);
    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [student]);

  function dismiss() {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student || pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const result = await onSave(student.studentId, draft);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      dismiss();
    } catch {
      setError("저장하지 못했습니다. 화면의 내용은 바꾸지 않았습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!student) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-xl border border-slate-200 p-0 text-slate-800 shadow-lg backdrop:bg-slate-900/40"
      onClose={() => onCloseRef.current()}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          dismiss();
        }
      }}
    >
      <form onSubmit={submit}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">담당자 메모</h2>
          <p className="mt-1 text-sm text-slate-500">
            {student.studentName} · {student.studentId}
          </p>
        </div>
        <div className="px-5 py-4">
          <label className="block text-sm text-slate-600" htmlFor="staff-memo">
            메모
          </label>
          <textarea
            id="staff-memo"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            maxLength={500}
            placeholder="이메일 안내 완료. 학생 회신 대기 중."
            className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-800 outline-none focus:border-navy-800"
          />
          {error ? (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            저장
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
      </form>
    </dialog>
  );
}
