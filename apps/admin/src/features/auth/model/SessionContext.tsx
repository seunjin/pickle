import type { AppUser, Workspace } from "@pickle/contracts";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const processingUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchUserData(currentUser: User, retryCount = 0) {
      if (!mounted) return;

      // 이미 같은 유저를 처리 중이면 중복 실행 방지
      if (processingUserIdRef.current === currentUser.id && retryCount === 0) {
        console.log("[SessionProvider] fetchUserData - already processing for:", currentUser.id);
        return;
      }

      processingUserIdRef.current = currentUser.id;
      console.log("[SessionProvider] fetchUserData started for:", currentUser.id, "retry:", retryCount);

      try {
        // 1. 프로필 정보 조회
        let userProfile = await getUser(supabase, currentUser.id);

        // 2. 프로필이 없는 경우 자동 생성(Atomic Signup) 시도
        if (!userProfile) {
          const meta = currentUser.user_metadata;
          const isTermsAgreed = String(meta?.is_terms_agreed) === "true";
          const isPrivacyAgreed = String(meta?.is_privacy_agreed) === "true";
          const isOver14Agreed = String(meta?.is_over_14) === "true";
          const isMarketingAgreed = String(meta?.is_marketing_agreed) === "true";

          if (isTermsAgreed && isPrivacyAgreed && isOver14Agreed) {
            console.log("[SessionProvider] Fulfilling automatic signup requirements. Calling complete_signup RPC...");
            try {
              const rpcPromise = supabase.rpc("complete_signup", {
                p_marketing_agreed: isMarketingAgreed,
                p_is_over_14: isOver14Agreed,
              });
              const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("RPC Timeout")), 3000));
              const { error: completeError } = await Promise.race([rpcPromise, timeoutPromise]) as any;

              if (!completeError) {
                console.log("[SessionProvider] Automatic signup successful. Re-fetching profile...");
                userProfile = await getUser(supabase, currentUser.id);
              } else {
                console.error("[SessionProvider] Failed to complete signup via RPC:", completeError);
              }
            } catch (err) {
              console.error("[SessionProvider] RPC call timed out or failed:", err);
            }
          }
        }

        if (mounted) {
          setAppUser(userProfile);
          if (userProfile) {
            const workspaces = await getUserWorkspaces(supabase, currentUser.id);
            if (workspaces.length > 0) setWorkspace(workspaces[0]);
          }
          setIsLoading(false);
        }
      } catch (e) {
        console.error("[SessionProvider] fetchUserData error:", e);
        if (mounted && retryCount < 2) {
          console.log(`[SessionProvider] Retrying fetchUserData... (${retryCount + 1}/2)`);
          setTimeout(() => fetchUserData(currentUser, retryCount + 1), 1000);
        } else if (mounted) {
          setIsLoading(false);
        }
      } finally {
        if (mounted && retryCount === 0) {
          processingUserIdRef.current = null;
        }
      }
    }

    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
      }
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      if (!currentUser) {
        setUser(null);
        setAppUser(null);
        setWorkspace(null);
        setIsLoading(false);
        clearTimeout(safetyTimer);
        return;
      }
      setUser(currentUser);
      fetchUserData(currentUser).then(() => {
        if (mounted) clearTimeout(safetyTimer);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
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
