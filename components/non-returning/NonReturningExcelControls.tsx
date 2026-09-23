"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { UploadPreviewDialog } from "@/components/non-returning/UploadPreviewDialog";
import {
  applyNonReturningUpload,
  downloadNonReturningStudents,
  downloadNonReturningTemplate,
  previewNonReturningUpload,
  type NonReturningUploadPreview,
} from "@/lib/non-returning/import-actions";
import type { NonReturningStudent } from "@/lib/non-returning/types";

const buttonClassName =
  "inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium whitespace-nowrap text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400";

export function NonReturningExcelControls({
  onImported,
}: {
  onImported: (students: NonReturningStudent[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workbookRef = useRef<string | null>(null);
  const [pending, setPending] = useState<
    "upload" | "download" | "template" | "apply" | null
  >(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );
  const [preview, setPreview] = useState<NonReturningUploadPreview | null>(null);
  const [applyError, setApplyError] = useState("");

  async function downloadTemplate() {
    if (pending) {
      return;
    }
    setPending("template");
    setNotice(null);
    try {
      const file = await downloadNonReturningTemplate();
      saveWorkbook(file.filename, file.base64);
    } catch {
      setNotice({ tone: "error", message: "기본양식을 다운로드하지 못했습니다." });
    } finally {
      setPending(null);
    }
  }

  async function downloadStudents() {
    if (pending) {
      return;
    }
    setPending("download");
    setNotice(null);
    try {
      const file = await downloadNonReturningStudents();
      saveWorkbook(file.filename, file.base64);
    } catch {
      setNotice({ tone: "error", message: "엑셀 파일을 다운로드하지 못했습니다." });
    } finally {
      setPending(null);
    }
  }

  async function selectWorkbook(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || pending) {
      return;
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setNotice({ tone: "error", message: "xlsx 파일만 업로드할 수 있습니다." });
      return;
    }

    setPending("upload");
    setNotice(null);
    try {
      const base64 = await fileToBase64(file);
      const result = await previewNonReturningUpload(base64);
      if (!result.ok) {
        workbookRef.current = null;
        setNotice({ tone: "error", message: result.message });
        return;
      }
      workbookRef.current = base64;
      setApplyError("");
      setPreview(result.preview);
    } catch {
      workbookRef.current = null;
      setNotice({ tone: "error", message: "엑셀 파일을 확인하지 못했습니다." });
    } finally {
      setPending(null);
    }
  }

  async function applyUpload() {
    const base64 = workbookRef.current;
    if (!base64 || pending) {
      return;
    }

    setPending("apply");
    setApplyError("");
    try {
      const result = await applyNonReturningUpload(base64);
      if (!result.ok) {
        setApplyError(result.message);
        return;
      }
      onImported(result.students);
      workbookRef.current = null;
      setPreview(null);
      setNotice({ tone: "success", message: result.message });
    } catch {
      setApplyError("반영하지 못했습니다. 화면의 내용은 바꾸지 않았습니다.");
    } finally {
      setPending(null);
    }
  }

  function closePreview() {
    if (pending === "apply") {
      return;
    }
    workbookRef.current = null;
    setPreview(null);
    setApplyError("");
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2">
      <div className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending !== null}
          className={buttonClassName}
        >
          엑셀 업로드
        </button>
        <button
          type="button"
          onClick={downloadStudents}
          disabled={pending !== null}
          className={buttonClassName}
        >
          엑셀 다운로드
        </button>
        <button
          type="button"
          onClick={downloadTemplate}
          disabled={pending !== null}
          className={buttonClassName}
        >
          기본양식 다운로드
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={selectWorkbook}
        />
      </div>
      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={
            notice.tone === "error"
              ? "text-right text-sm text-red-700"
              : "text-right text-sm text-navy-900"
          }
        >
          {notice.message}
        </p>
      ) : null}
      <UploadPreviewDialog
        preview={preview}
        pending={pending === "apply"}
        error={applyError}
        onClose={closePreview}
        onApply={applyUpload}
      />
    </div>
  );
}

function saveWorkbook(filename: string, base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}
