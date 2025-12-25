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
      className="cursor-pointer font-medium text-base-muted text-sm transition-colors hover:text-base-muted-foreground"
    >
      Sign out
    </button>
  );
}
