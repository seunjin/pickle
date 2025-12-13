"use client";

import Image from "next/image";
import { LoginButton, SignOutButton, useUser } from "@/features/auth";
import { NoteList } from "@/features/note";

export default function DashboardPage() {
  const { user, profile, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-3xl">Dashboard</h1>

      {user ? (
        <div className="flex flex-col gap-8">
          <div className="rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {profile?.avatar_url && (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border">
                    <Image
                      src={profile.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {profile?.full_name || user.email}
                  </p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <p className="mt-1 text-gray-400 text-xs uppercase">
                    {profile?.authority || "Member"}
                  </p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>

          <div>
            <h2 className="mb-4 border-b pb-2 font-semibold text-xl">
              My Notes
            </h2>
            <NoteList />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">
            로그인이 필요합니다. 계속하려면 로그인해주세요.
          </p>
          <LoginButton />
        </div>
      )}
    </div>
  );
}
