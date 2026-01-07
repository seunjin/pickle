"use client";

import { Suspense } from "react";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper() {
  return (
    <Suspense
      fallback={
        <nav className="flex h-full flex-col gap-4 p-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-800" />
        </nav>
      }
    >
      <Sidebar />
    </Suspense>
  );
}
