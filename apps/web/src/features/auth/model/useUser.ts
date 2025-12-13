import { useSessionContext } from "./SessionContext";

export const useUser = () => {
  const { user, profile, isLoading, refreshProfile } = useSessionContext();

  return {
    user,
    profile,
    isLoading,
    isGuest: !user,
    isAuthenticated: !!user,
    refreshProfile,
  };
};
