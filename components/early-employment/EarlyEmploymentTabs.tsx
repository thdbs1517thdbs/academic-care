"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navigation } from "@/lib/navigation";

export function EarlyEmploymentTabs() {
  const pathname = usePathname();
  const group = navigation.find(
    (entry) => entry.type === "group" && entry.label === "조기취업 관리",
  );

  if (!group || group.type !== "group") {
    return null;
  }

  return (
    <nav
      aria-label="조기취업 관리 구분"
      className="flex gap-1 overflow-x-auto border-b border-slate-200"
    >
      {group.children.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors",
              active
                ? "border-navy-900 font-semibold text-navy-900"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
