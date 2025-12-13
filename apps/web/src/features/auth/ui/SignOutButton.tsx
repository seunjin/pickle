"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-md bg-white px-3 py-2 font-medium text-gray-700 text-sm shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
    >
      Sign out
    </button>
  );
}
