"use client";

import { useEffect, useRef, useState } from "react";

type ConfirmationRequestDialogProps = {
  department: string | null;
  status: "loading" | "ready" | "error";
  text: string;
  onClose: () => void;
};

const failureMessage = "AI 문안 생성에 실패했습니다. 다시 시도해주세요.";

export function ConfirmationRequestDialog({
  department,
  status,
  text,
  onClose,
}: ConfirmationRequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const [copied, setCopied] = useState(false);
  const body =
    status === "ready"
      ? text
      : status === "error"
        ? failureMessage
        : "확인 요청 문안을 작성하고 있습니다.";

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !department) {
      return;
    }

    setCopied(false);
    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [department]);

  if (!department) {
    return null;
  }

  async function copyPreview() {
    if (status !== "ready" || !text) {
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(40rem,calc(100%-2rem))] rounded-xl border border-slate-200 p-0 text-slate-800 shadow-lg backdrop:bg-slate-900/40"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.close();
        }
      }}
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">확인요청 문구</h2>
        <p className="mt-1 text-sm text-slate-500">{department} · 문안 미리보기</p>
      </div>
      <pre
        role={status === "error" ? "alert" : undefined}
        className={`max-h-[60vh] overflow-y-auto px-5 py-4 text-sm leading-6 whitespace-pre-wrap ${
          status === "error" ? "text-red-700" : "text-slate-800"
        }`}
      >
        {body}
      </pre>
      <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <button
          type="button"
          onClick={copyPreview}
          disabled={status !== "ready"}
          className="rounded-md bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {copied ? "복사했습니다" : "복사하기"}
        </button>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          닫기
        </button>
      </div>
    </dialog>
  );
}
