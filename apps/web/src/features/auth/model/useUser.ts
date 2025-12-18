import { useSessionContext } from "./SessionContext";

export const useUser = () => {
  const { user, appUser, isLoading, refreshAppUser } = useSessionContext();

  return {
    user,
    appUser,
    isLoading,
    isGuest: !user,
    isAuthenticated: !!user,
    refreshAppUser,
  };
};
