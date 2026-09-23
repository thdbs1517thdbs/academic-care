"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, isCurrentPath } from "@/lib/navigation";
import { serviceName, teamName, universityName } from "@/lib/site";
import { cn } from "@/lib/cn";

type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
};

export function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="sidebar"
      aria-hidden={collapsed}
      {...(collapsed ? { inert: true } : {})}
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5">
        <div>
          <p className="text-[17px] font-semibold tracking-tight text-navy-950">
            {serviceName}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {universityName} {teamName}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          onClick={onClose}
          aria-label="메뉴 닫기"
        >
          <CloseIcon />
        </button>
      </div>

      <nav aria-label="주 메뉴" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((entry) => {
            if (entry.type === "link") {
              return (
                <li key={entry.href}>
                  <NavAnchor
                    href={entry.href}
                    label={entry.label}
                    active={isCurrentPath(pathname, entry.href)}
                  />
                </li>
              );
            }

            const groupActive = entry.children.some((child) =>
              isCurrentPath(pathname, child.href),
            );

            return (
              <li key={entry.label} className="pt-2">
                <p
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium",
                    groupActive ? "text-navy-900" : "text-slate-700",
                  )}
                >
                  {entry.label}
                </p>
                <ul className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-4 pl-1.5">
                  {entry.children.map((child) => (
                    <li key={child.href}>
                      <NavAnchor
                        href={child.href}
                        label={child.label}
                        active={isCurrentPath(pathname, child.href)}
                        nested
                      />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function NavAnchor({
  href,
  label,
  active,
  nested = false,
}: {
  href: string;
  label: string;
  active: boolean;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
        nested && "py-1.5 text-[13px]",
        active
          ? "border-navy-900 bg-navy-50 font-semibold text-navy-900"
          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      {label}
    </Link>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5l9 9M13.5 4.5l-9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
