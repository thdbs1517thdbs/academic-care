/**
 * 이미 학적 처리가 끝난 학기의 미복학 제적 확정 통계.
 * 이후 Supabase의 학기별 스냅샷으로 교체한다.
 */
export type ConfirmedNonReturningTerm = {
  semester: string;
  totalCount: number;
  foreignCount: number;
};

export const confirmedNonReturningHistory: ConfirmedNonReturningTerm[] = [
  { semester: "2024-1", totalCount: 28, foreignCount: 8 },
  { semester: "2024-2", totalCount: 26, foreignCount: 9 },
  { semester: "2025-1", totalCount: 25, foreignCount: 8 },
  { semester: "2025-2", totalCount: 23, foreignCount: 7 },
  { semester: "2026-1", totalCount: 22, foreignCount: 7 },
];
