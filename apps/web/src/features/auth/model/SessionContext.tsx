"use client";

import type { AppUser, Workspace } from "@pickle/contracts";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { getUser } from "../api/getUser";
import { getUserWorkspaces } from "../api/getUserWorkspaces";

interface SessionContextType {
  user: User | null;
  appUser: AppUser | null;
  workspace: Workspace | null;
  isLoading: boolean;
  refreshAppUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;

    async function fetchAppUser(currentUser: User) {
      if (!mounted) return;
      console.log("[SessionContext] Fetching app user...");
      const data = await getUser(supabase, currentUser.id);
      if (mounted) {
        console.log("[SessionContext] App user fetched.");
        setAppUser(data);
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

      if (currentUser) {
        // Fetch App User & Workspaces in parallel
        Promise.all([
          fetchAppUser(currentUser),
          getUserWorkspaces(supabase, currentUser.id).then((workspaces) => {
            if (mounted && workspaces.length > 0) {
              console.log(
                "[SessionContext] Workspaces fetched:",
                workspaces.length,
              );
              // Default to the first workspace for now (Logic can be improved later to store 'last_used')
              setWorkspace(workspaces[0]);
            }
          }),
        ]).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setAppUser(null);
        setWorkspace(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const refreshAppUser = async () => {
    if (user) {
      await getUser(supabase, user.id).then(setAppUser);
    }
  };

  return (
    <SessionContext.Provider
      value={{ user, appUser, workspace, isLoading, refreshAppUser }}
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
