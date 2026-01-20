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
  updateAppUser: (updates: Partial<AppUser>) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
  initialUser = null,
  initialAppUser = null,
  initialWorkspace = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialAppUser?: AppUser | null;
  initialWorkspace?: Workspace | null;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [appUser, setAppUser] = useState<AppUser | null>(initialAppUser);
  const [workspace, setWorkspace] = useState<Workspace | null>(
    initialWorkspace,
  );
  const [isLoading, setIsLoading] = useState(false);

  const [supabase] = useState(() => createClient());

  // ✅ 초기값 존재 여부를 ref로 캡처 (의존성 배열 문제 해결)
  const hasInitialAppUser = Boolean(initialAppUser);
  const hasInitialWorkspace = Boolean(initialWorkspace);

  useEffect(() => {
    let mounted = true;

    async function fetchAppUser(currentUser: User) {
      if (!mounted) return;

      const data = await getUser(supabase, currentUser.id);
      if (mounted) {
        setAppUser(data);
      }
    }

    // onAuthStateChange fires immediately with the current session (INITIAL_SESSION)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // ✅ 서버에서 전달받은 초기값이 있으면 API 호출 건너뛰기
        const shouldFetchAppUser = !hasInitialAppUser;
        const shouldFetchWorkspace = !hasInitialWorkspace;

        const fetchPromises: Promise<void>[] = [];

        if (shouldFetchAppUser) {
          fetchPromises.push(fetchAppUser(currentUser));
        }

        if (shouldFetchWorkspace) {
          fetchPromises.push(
            getUserWorkspaces(supabase, currentUser.id).then((workspaces) => {
              if (mounted && workspaces.length > 0) {
                setWorkspace(workspaces[0]);
              }
            }),
          );
        }

        if (fetchPromises.length > 0) {
          Promise.all(fetchPromises).finally(() => {
            if (mounted) setIsLoading(false);
          });
        } else {
          // 이미 모든 초기값이 있으면 로딩 완료
          if (mounted) setIsLoading(false);
        }
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
  }, [supabase, hasInitialAppUser, hasInitialWorkspace]);

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
