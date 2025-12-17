"use client";

import { useSessionContext } from "../auth/model/SessionContext";
import { SignOutButton } from "../auth/ui/SignOutButton";

export const Sidebar = () => {
  const { workspace, profile, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <nav className="flex h-full flex-col gap-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      </nav>
    );
  }

  return (
    <nav className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-6">
        {/* Workspace Header */}
        <div>
          <h2 className="font-bold text-gray-900 text-lg">
            {workspace?.name ?? "No Workspace"}
          </h2>
          <p className="text-gray-500 text-sm">Free Plan</p>
        </div>

        {/* Navigation Links (Placeholder) */}
        <ul className="flex flex-col gap-2">
          <li>
            <a
              href="/dashboard"
              className="block rounded px-2 py-1 text-gray-700 hover:bg-gray-100"
            >
              All Notes
            </a>
          </li>
          <li>
            <span className="block px-2 py-1 text-gray-400">Favorites</span>
          </li>
          <li>
            <span className="block px-2 py-1 text-gray-400">Archived</span>
          </li>
        </ul>
      </div>

      {/* User Profile / Footer */}
      <div className="border-t pt-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 text-center font-bold text-indigo-600 leading-8">
            {profile?.full_name?.[0] ?? "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-medium text-gray-900 text-sm">
              {profile?.full_name}
            </p>
            <p className="truncate text-gray-500 text-xs">{profile?.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </nav>
  );
};
