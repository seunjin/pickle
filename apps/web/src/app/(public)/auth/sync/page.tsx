"use client";

import { useSessionContext } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthSyncPage() {
  const { user, isLoading } = useSessionContext();
  const router = useRouter();
  const [status, setStatus] = useState("Syncing...");

  // Force login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login, but with return_to this page
      const params = new URLSearchParams({
        next: "/auth/sync",
      });
      router.replace(`/?${params.toString()}`); // Assuming login button is on home page or we have a dedicated /login
    }
  }, [user, isLoading, router]);

  // Broadcast Session
  useEffect(() => {
    if (user && !isLoading) {
      // We need the actual session object (tokens), but useSessionContext only exposes user/profile.
      // We might need to fetch the session again or expose it from context.
      // However, `supabase.auth.getSession()` is async.
      // Let's do it here nicely.

      const broadcastSession = async () => {
        // We need to import createClient to get the session again?
        // Or better, let's just get it from supabase-js if we can, but simpler is to use the client lib.
        // Actually, let's just use the `supabase` instance if accessible, or create a new one.
        // Since this is client side, creating a browser client is cheap.

        const { createClient } = await import("@/shared/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          console.log("Broadcasting session...", session.user.email);
          window.postMessage({ type: "PICKLE_SYNC_SESSION", session }, "*");
          setStatus("Connected! You can close this tab.");

          // Optional: Auto close after a few seconds?
          // window.close() only works if opened by script.
        } else {
          setStatus("Failed to retrieve session.");
        }
      };

      broadcastSession();
    }
  }, [user, isLoading]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-2xl font-bold">Pickle Note Sync</h1>
      <p className="text-gray-600">{status}</p>
      {status === "Connected! You can close this tab." && (
        <div className="mt-8 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
          Browser Extension is now connected.
        </div>
      )}
    </div>
  );
}
