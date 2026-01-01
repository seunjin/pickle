import { extensionStorage } from "@shared/lib/extension-api";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useExtensionAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Load
    extensionStorage.get("supabaseSession", (result) => {
      if (result.supabaseSession) {
        setSession(result.supabaseSession as Session);
      }
      setLoading(false);
    });

    // 2. Listen for changes (e.g. re-sync)
    const handleStorageChange = (
      changes: { [key: string]: any },
      areaName: string,
    ) => {
      if (areaName === "local" && changes.supabaseSession) {
        const newSession = changes.supabaseSession.newValue as Session;
        setSession(newSession || null);
      }
    };

    extensionStorage.onChanged.addListener(handleStorageChange);
    return () => extensionStorage.onChanged.removeListener(handleStorageChange);
  }, []);

  const logout = () => {
    extensionStorage.remove("supabaseSession", () => {
      setSession(null);
    });
  };

  return { session, loading, logout };
}
