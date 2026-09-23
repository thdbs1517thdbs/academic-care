export const earlyEmploymentPageSize = 20;

export type PageToken = number | "ellipsis";

export function getVisiblePages(page: number, pageCount: number): PageToken[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, "ellipsis", pageCount];
  }

  if (page >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount];
}
