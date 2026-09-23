import { cn } from "@/lib/cn";
import type {
  ApplicationStatus,
  ManagementStatus,
} from "@/lib/non-returning/types";

export function NationalityBadge({
  nationality,
}: {
  nationality: string;
}) {
  const foreign = nationality !== "대한민국";

  if (!foreign) {
    return (
    <span className="text-sm whitespace-nowrap text-slate-700">{nationality}</span>
  );
  }

  return (
    <span className="inline-flex rounded-md bg-navy-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-navy-900">
      {nationality}
    </span>
  );
}

export function ApplicationBadge({ status }: { status: ApplicationStatus }) {
  const applied = status === "신청";

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        applied ? "bg-navy-50 text-navy-900" : "bg-slate-100 text-slate-600",
      )}
    >
      {status}
    </span>
  );
}

export function ManagementBadge({ status }: { status: ManagementStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        status === "확인 필요" &&
          "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
        status === "연락 완료" && "bg-slate-100 text-slate-700",
        status === "처리 완료" && "bg-navy-50 text-navy-900",
      )}
    >
      {status}
    </span>
  );
}
