import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useExtensionAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Load
    chrome.storage.local.get("supabaseSession", (result) => {
      if (result.supabaseSession) {
        setSession(result.supabaseSession as Session);
      }
      setLoading(false);
    });

    // 2. Listen for changes (e.g. re-sync)
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes.supabaseSession) {
        const newSession = changes.supabaseSession.newValue as Session;
        setSession(newSession || null);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const logout = () => {
    chrome.storage.local.remove("supabaseSession", () => {
      setSession(null);
    });
  };

  return { session, loading, logout };
}
