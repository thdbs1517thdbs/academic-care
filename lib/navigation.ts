export type NavLink = {
  label: string;
  href: string;
};

export type NavEntry =
  | ({ type: "link" } & NavLink)
  | {
      type: "group";
      label: string;
      children: NavLink[];
    };

export const navigation: NavEntry[] = [
  { type: "link", label: "HOME", href: "/" },
  {
    type: "group",
    label: "조기취업 관리",
    children: [
      { label: "전체", href: "/early-employment" },
      { label: "확인 필요", href: "/early-employment/needs-review" },
      {
        label: "개설학과별 확인 대상",
        href: "/early-employment/by-department",
      },
    ],
  },
  { type: "link", label: "미복학 관리", href: "/non-returning" },
  { type: "link", label: "미복학 통계", href: "/non-returning-stats" },
];

export function isCurrentPath(pathname: string, href: string) {
  return pathname === href;
}
