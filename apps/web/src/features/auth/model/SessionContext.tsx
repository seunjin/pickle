"use client";

import type { Profile } from "@pickle/contracts";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { getUserProfile } from "../api/getUserProfile";

interface SessionContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;

    async function getProfile(currentUser: User) {
      if (!mounted) return;
      console.log("[SessionContext] Fetching profile...");
      const data = await getUserProfile(supabase, currentUser.id);
      if (mounted) {
        console.log("[SessionContext] Profile fetched.");
        setProfile(data);
      }
    }

    console.log("[SessionContext] Setting up auth listener...");

    // onAuthStateChange fires immediately with the current session (INITIAL_SESSION)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        `[SessionContext] Auth Event: ${event}`,
        session?.user?.email,
      );

      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoading(false); // Event fired, so we are not loading anymore

      if (currentUser) {
        getProfile(currentUser);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const refreshProfile = async () => {
    if (user) {
      await getUserProfile(supabase, user.id).then(setProfile);
    }
  };

  return (
    <SessionContext.Provider
      value={{ user, profile, isLoading, refreshProfile }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
};
