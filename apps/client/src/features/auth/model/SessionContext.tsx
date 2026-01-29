import type { AppUser, Workspace } from "@pickle/contracts";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase";
import { getUser } from "../api/getUser";
import { getUserWorkspaces } from "../api/getUserWorkspaces";

interface SessionContextType {
  user: User | null;
  appUser: AppUser | null;
  workspace: Workspace | null;
  isLoading: boolean;
  refreshAppUser: () => Promise<void>;
  updateAppUser: (updates: Partial<AppUser>) => void;
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
      const data = await getUser(supabase, currentUser.id);
      if (mounted) {
        setAppUser(data);
      }
    }

    async function fetchWorkspace(currentUser: User) {
      if (!mounted) return;
      const workspaces = await getUserWorkspaces(supabase, currentUser.id);
      if (mounted && workspaces.length > 0) {
        setWorkspace(workspaces[0]);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        setIsLoading(true);
        await Promise.all([
          fetchAppUser(currentUser),
          fetchWorkspace(currentUser),
        ]);
        if (mounted) setIsLoading(false);
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
      const data = await getUser(supabase, user.id);
      setAppUser(data);
    }
  };

  const updateAppUser = (updates: Partial<AppUser>) => {
    setAppUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        appUser,
        workspace,
        isLoading,
        refreshAppUser,
        updateAppUser,
      }}
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
