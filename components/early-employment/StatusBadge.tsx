import { cn } from "@/lib/cn";
import type {
  ReviewStatus,
  SubmissionStatus,
} from "@/lib/early-employment/types";

export function SubmissionBadge({ status }: { status: SubmissionStatus }) {
  const submitted = status === "제출";

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        submitted ? "bg-navy-50 text-navy-900" : "bg-slate-100 text-slate-500",
      )}
    >
      {status}
    </span>
  );
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const needsReview = status === "확인 필요";

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        needsReview
          ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
          : "bg-slate-100 text-slate-600",
      )}
    >
      {status}
    </span>
  );
}
